import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  ApiResponse,
  SubscriptionResponse,
  UsageResponse,
  CancelSubscriptionResponse,
  SubscriptionErrors,
} from "@repo/types";
import {
  PlanType as PrismaPlanType,
  SubscriptionStatus as PrismaSubscriptionStatus,
  BillingCycle as PrismaBillingCycle,
} from "@prisma/client";

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getCurrentSubscription(
    userId: number,
  ): Promise<ApiResponse<SubscriptionResponse>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        subscriptionCancelledAt: true,
        videoConversionRemaining: true,
        videoConversionResetDate: true,
      },
    });

    if (!user) {
      throw new NotFoundException(SubscriptionErrors.USER_NOT_FOUND);
    }

    return {
      success: true,
      data: {
        plan: user.plan,
        status: user.subscriptionStatus,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        cancelledAt: user.subscriptionCancelledAt,
        videoConversionRemaining: user.videoConversionRemaining,
        videoConversionResetDate: user.videoConversionResetDate,
      },
    };
  }

  async getUsage(userId: number): Promise<ApiResponse<UsageResponse>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        videoConversionRemaining: true,
        videoConversionResetDate: true,
      },
    });

    if (!user) {
      throw new NotFoundException(SubscriptionErrors.USER_NOT_FOUND);
    }

    return {
      success: true,
      data: {
        plan: user.plan,
        videoConversionRemaining: user.videoConversionRemaining,
        videoConversionResetDate: user.videoConversionResetDate,
        limit: user.plan === "PRO" ? 40 : 0,
      },
    };
  }

  async cancelSubscription(
    userId: number,
  ): Promise<ApiResponse<CancelSubscriptionResponse>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    });

    if (!user) {
      throw new NotFoundException(SubscriptionErrors.USER_NOT_FOUND);
    }

    if (user.plan === "FREE") {
      throw new BadRequestException(SubscriptionErrors.NO_ACTIVE_SUBSCRIPTION);
    }

    if (user.subscriptionStatus === "CANCELLED") {
      throw new BadRequestException(
        SubscriptionErrors.SUBSCRIPTION_ALREADY_CANCELLED,
      );
    }

    // 구독 상태를 CANCELLED로 변경 (기간 만료까지 Pro 유지)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "CANCELLED",
        subscriptionCancelledAt: new Date(),
      },
    });

    return {
      success: true,
      data: {
        message: "Subscription cancelled successfully",
        endDate: user.subscriptionEndDate,
      },
    };
  }

  async activateSubscription(
    userId: number,
    planType: PrismaPlanType,
    billingCycle: PrismaBillingCycle,
  ) {
    const now = new Date();
    const endDate = new Date(now);

    // 구독 종료일 계산
    if (billingCycle === PrismaBillingCycle.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // 영상 변환 리셋 날짜 설정 (다음 달 같은 날)
    const resetDate = new Date(now);
    resetDate.setMonth(resetDate.getMonth() + 1);

    // User 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        plan: planType,
        subscriptionStatus: PrismaSubscriptionStatus.ACTIVE,
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        subscriptionCancelledAt: null,
        videoConversionRemaining: 40,
        videoConversionResetDate: resetDate,
      },
    });

    // Subscription 레코드 생성
    await this.prisma.subscription.create({
      data: {
        userId,
        planType,
        billingCycle,
        startDate: now,
        endDate: endDate,
        nextBillingDate: endDate,
        status: PrismaSubscriptionStatus.ACTIVE,
        price: billingCycle === PrismaBillingCycle.MONTHLY ? 20 : 200,
        currency: "USD",
      },
    });

    return { success: true };
  }

  async deactivateSubscription(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        plan: PrismaPlanType.FREE,
        subscriptionStatus: PrismaSubscriptionStatus.EXPIRED,
        videoConversionRemaining: 0,
      },
    });
  }
}
