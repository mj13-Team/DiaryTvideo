import { Injectable, Logger } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { Scene } from "./scene-splitter.service";

export interface GeneratedImage {
  scene: number;
  url: string;
}

const MAX_RETRIES = 3;

@Injectable()
export class ImageGeneratorService {
  private readonly logger = new Logger(ImageGeneratorService.name);

  constructor(private readonly openaiService: OpenAIService) {}

  async generateImages(scenes: Scene[]): Promise<GeneratedImage[]> {
    if (!scenes || scenes.length === 0) {
      throw new Error("이미지 생성 실패: 장면 데이터가 없습니다");
    }

    const images = await Promise.all(
      scenes.map((scene) => this.generateSingleImageWithRetry(scene)),
    );

    return images;
  }

  private async generateSingleImageWithRetry(
    scene: Scene,
  ): Promise<GeneratedImage> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.generateSingleImage(scene);
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (this.isContentFilterError(error)) {
          this.logger.warn(
            `장면 ${scene.scene} 콘텐츠 필터 (시도 ${attempt}/${MAX_RETRIES}): ${lastError.message}`,
          );

          if (attempt < MAX_RETRIES) {
            continue; // 재시도
          }
        } else {
          // 콘텐츠 필터가 아닌 에러는 즉시 throw
          throw lastError;
        }
      }
    }

    throw new Error(
      `이미지 생성 실패 (장면 ${scene.scene}): ${MAX_RETRIES}회 재시도 후 실패 - ${lastError?.message}`,
    );
  }

  private async generateSingleImage(scene: Scene): Promise<GeneratedImage> {
    const client = this.openaiService.getClient();
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: `Scene: ${scene.visual}. Style: cinematic still life, warm lighting, atmospheric, no people, no faces, no human figures, objects and environment only.`,
      n: 1,
      size: "1792x1024",
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error(`이미지 URL이 비어있습니다`);
    }

    return {
      scene: scene.scene,
      url: imageUrl,
    };
  }

  private isContentFilterError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return (
      message.includes("content_policy") ||
      message.includes("safety") ||
      message.includes("content filter") ||
      message.includes("content_filter")
    );
  }
}
