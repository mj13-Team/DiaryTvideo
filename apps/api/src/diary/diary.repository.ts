import { Injectable } from "@nestjs/common";
import { VideoStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DiaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 일기 목록 조회 (날짜 필터링)
  async findByUserId(userId: number, localDate: string) {
    return this.prisma.diaryEntry.findMany({
      where: {
        userId,
        localDate,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 월별 일기 목록 조회
  async findByUserIdAndMonth(userId: number, year: number, month: number) {
    // 해당 월의 첫날과 마지막 날 계산
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

    // 해당 월의 마지막 날 계산 (다음 달 0일 = 이번 달 마지막 날)
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    return this.prisma.diaryEntry.findMany({
      where: {
        userId,
        localDate: {
          gte: startDate, // greater than or equal
          lte: endDate, // less than or equal
        },
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 일기 단건 조회
  async findById(id: string) {
    return this.prisma.diaryEntry.findUnique({
      where: { id, deletedAt: null },
    });
  }

  // 일기 생성
  async create(data: {
    userId: number;
    title: string;
    content: string;
    localDate: string;
    videoConversionEnabled?: boolean;
    customStyle?: string;
  }) {
    return this.prisma.diaryEntry.create({ data });
  }

  // 사용자 조회 (영상 변환 쿼터 확인용)
  async findUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        plan: true,
        videoConversionRemaining: true,
      },
    });
  }

  // 영상 변환 잔여 횟수 차감
  async decrementVideoConversion(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        videoConversionRemaining: { decrement: 1 },
      },
    });
  }

  // 일기 삭제 (soft delete)
  async softDelete(id: string) {
    return this.prisma.diaryEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // 비디오 상태 업데이트
  async updateVideoStatus(id: string, status: VideoStatus, error?: string) {
    return this.prisma.diaryEntry.update({
      where: { id },
      data: {
        videoStatus: status,
        videoError: error ?? null,
      },
    });
  }

  // 비디오 URL 업데이트
  async updateVideoUrls(
    id: string,
    urls: {
      videoUrl: string;
      thumbnailUrl: string;
      subtitleUrl: string;
    },
  ) {
    return this.prisma.diaryEntry.update({
      where: { id },
      data: urls,
    });
  }

  // 비디오 재시도 상태 업데이트
  async resetVideoForRetry(id: string) {
    return this.prisma.diaryEntry.update({
      where: { id },
      data: {
        videoStatus: VideoStatus.PENDING,
        videoError: null,
        videoRetryCount: { increment: 1 },
      },
    });
  }

  async completeVideo(
    id: string,
    urls: { videoUrl: string; thumbnailUrl: string; subtitleUrl: string },
  ) {
    return this.prisma.diaryEntry.update({
      where: { id },
      data: {
        ...urls,
        videoStatus: VideoStatus.COMPLETED,
        videoError: null,
      },
    });
  }
}
