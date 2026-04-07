import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { VideoJobData, VideoStatusMessages } from "@repo/types";
import * as fs from "fs";
import { DiaryRepository } from "../diary/diary.repository";
import { S3Service } from "../storage/s3.service";
import { VideoGateway } from "./video.gateway";
import { SceneSplitterService } from "./services/scene-splitter.service";
import { ImageGeneratorService } from "./services/image-generator.service";
import { TtsService } from "./services/tts.service";
import { WhisperService } from "./services/whisper.service";
import { SubtitleService } from "./services/subtitle.service";
import { FfmpegService } from "./services/ffmpeg.service";
import { VideoStatus } from "@prisma/client";

@Processor("video-generation", {
  concurrency: 2, // 동시 처리 가능한 작업 수
  lockDuration: 20 * 60 * 1000, // 20분 - 긴 영상 처리를 위한 lock 유지
})
export class VideoProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoProcessor.name);

  constructor(
    private readonly videoGateway: VideoGateway,
    private readonly diaryRepository: DiaryRepository,
    private readonly s3Service: S3Service,
    private readonly sceneSplitter: SceneSplitterService,
    private readonly imageGenerator: ImageGeneratorService,
    private readonly ttsService: TtsService,
    private readonly whisperService: WhisperService,
    private readonly subtitleService: SubtitleService,
    private readonly ffmpegService: FfmpegService,
  ) {
    super();
  }

  async process(job: Job<VideoJobData>): Promise<void> {
    const { diaryId, userId, title, content } = job.data;
    this.logger.log(`Processing video generation for diary: ${diaryId}`);

    let failedMessage = VideoStatusMessages.FAILED;

    try {
      // 장면 분석 + 캐릭터 프로필 - GPT
      failedMessage = VideoStatusMessages.FAILED_AT_SCENE_ANALYSIS;
      await this.diaryRepository.updateVideoStatus(
        diaryId,
        VideoStatus.PROCESSING,
      );
      this.videoGateway.sendVideoStatus(userId, {
        diaryId,
        status: VideoStatus.PROCESSING,
        message: VideoStatusMessages.SCENE_ANALYSIS,
      });

      const { voice, scenes } = await this.sceneSplitter.splitIntoScenes(
        title,
        content,
      );

      // TTS + 이미지 생성 (병렬 실행)
      failedMessage = VideoStatusMessages.FAILED_AT_AUDIO_IMAGE;
      this.videoGateway.sendVideoStatus(userId, {
        diaryId,
        status: VideoStatus.PROCESSING,
        message: VideoStatusMessages.AUDIO_IMAGE_GENERATION,
      });

      const [audios, images] = await Promise.all([
        this.ttsService.generateAudio(scenes, voice),
        this.imageGenerator.generateImages(scenes),
      ]);

      // Whisper 타임스탬프 추출
      failedMessage = VideoStatusMessages.FAILED_AT_AUDIO_ANALYSIS;
      this.videoGateway.sendVideoStatus(userId, {
        diaryId,
        status: VideoStatus.PROCESSING,
        message: VideoStatusMessages.AUDIO_ANALYSIS,
      });

      const whisperResults = await this.whisperService.transcribeAll(audios);

      // 자막 생성 (Whisper 기반)
      failedMessage = VideoStatusMessages.FAILED_AT_SUBTITLE;
      this.videoGateway.sendVideoStatus(userId, {
        diaryId,
        status: VideoStatus.PROCESSING,
        message: VideoStatusMessages.SUBTITLE_GENERATION,
      });

      const vtt = this.subtitleService.generateVttFromWhisper(whisperResults);

      // 영상 합성 - FFmpeg
      failedMessage = VideoStatusMessages.FAILED_AT_VIDEO_COMPOSING;
      this.videoGateway.sendVideoStatus(userId, {
        diaryId,
        status: VideoStatus.PROCESSING,
        message: VideoStatusMessages.VIDEO_COMPOSING,
      });

      const durations = whisperResults.map((w) => w.duration);
      const { videoPath, subtitlePath, thumbnailPath } =
        await this.ffmpegService.composeVideo(
          diaryId,
          images,
          audios,
          vtt,
          durations,
        );

      // S3 업로드
      failedMessage = VideoStatusMessages.FAILED_AT_FILE_UPLOAD;
      this.videoGateway.sendVideoStatus(userId, {
        diaryId,
        status: VideoStatus.PROCESSING,
        message: VideoStatusMessages.FILE_UPLOAD,
      });

      const [videoUrl, thumbnailUrl, subtitleUrl] = await Promise.all([
        this.s3Service.upload(
          `videos/${diaryId}/video.mp4`,
          fs.readFileSync(videoPath),
          "video/mp4",
        ),
        this.s3Service.upload(
          `videos/${diaryId}/thumbnail.png`,
          fs.readFileSync(thumbnailPath),
          "image/png",
        ),
        this.s3Service.upload(
          `videos/${diaryId}/subtitle.vtt`,
          fs.readFileSync(subtitlePath),
          "text/vtt",
        ),
      ]);

      this.logger.log(`S3 업로드 완료: ${videoUrl}`);

      await this.diaryRepository.completeVideo(diaryId, {
        videoUrl,
        thumbnailUrl,
        subtitleUrl,
      });

      this.videoGateway.sendVideoStatus(userId, {
        diaryId,
        status: VideoStatus.COMPLETED,
        message: VideoStatusMessages.COMPLETED,
        videoUrl,
        thumbnailUrl,
        subtitleUrl,
      });
      this.logger.log(`Video generation completed for diary: ${diaryId}`);
    } catch (error) {
      this.logger.error(`Video generation failed for diary: ${diaryId}`, error);

      await this.diaryRepository.updateVideoStatus(
        diaryId,
        VideoStatus.FAILED,
        failedMessage,
      );
      this.videoGateway.sendVideoStatus(userId, {
        diaryId,
        status: VideoStatus.FAILED,
        message: failedMessage,
      });

      throw error;
    } finally {
      // 임시 파일 정리
      this.ffmpegService.cleanupTempDir(diaryId);
    }
  }
}
