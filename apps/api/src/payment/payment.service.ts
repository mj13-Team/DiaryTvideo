import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { PortOneService } from "./portone.service";
import { SubscriptionService } from "../subscription/subscription.service";
import {
  PlanType,
  BillingCycle,
  PaymentStatus as PaymentStatusType,
  PaymentErrors,
  ApiResponse,
  PreparePaymentResponse,
  PaginatedPaymentHistoryResponse,
  PricingResponse,
} from "@repo/types";
import {
  PlanType as PrismaPlanType,
  BillingCycle as PrismaBillingCycle,
  PaymentStatus as PrismaPaymentStatus,
  SubscriptionStatus as PrismaSubscriptionStatus,
} from "@prisma/client";
import { randomUUID } from "crypto";

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private portoneService: PortOneService,
    private subscriptionService: SubscriptionService,
    private configService: ConfigService,
  ) {}

  /**
   * 결제 준비: paymentId + 금액을 생성하여 프론트에 전달
   * 프론트는 이 정보로 PortOne 결제창을 엶
   */
  async preparePayment(
    userId: number,
    planType: PlanType,
    billingCycle: BillingCycle,
  ): Promise<ApiResponse<PreparePaymentResponse>> {
    // 만료 체크 먼저 실행
    await this.subscriptionService.checkAndExpireIfNeeded(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        plan: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      throw new BadRequestException(PaymentErrors.USER_NOT_FOUND);
    }

    // 이미 활성 구독 중인 경우 중복 결제 방지
    if (
      user.plan === PrismaPlanType.PRO &&
      user.subscriptionStatus === PrismaSubscriptionStatus.ACTIVE
    ) {
      throw new BadRequestException(PaymentErrors.SUBSCRIPTION_ALREADY_ACTIVE);
    }

    const amount = this.getAmount(planType, billingCycle);
    const paymentId = `payment-${randomUUID().replace(/-/g, "")}`;
    const orderName =
      billingCycle === "MONTHLY"
        ? "DiaryTvideo Pro Monthly"
        : "DiaryTvideo Pro Yearly";

    // PENDING 상태로 Payment 레코드 생성
    await this.prisma.payment.create({
      data: {
        userId,
        portonePaymentId: paymentId,
        amount: amount,
        currency: this.configService.get<string>("payment.currency") ?? "KRW",
        planType: planType as PrismaPlanType,
        billingCycle: billingCycle as PrismaBillingCycle,
        status: PrismaPaymentStatus.PENDING,
      },
    });

    return {
      success: true,
      data: {
        paymentId,
        orderName,
        amount,
        currency: this.configService.get<string>("payment.currency") ?? "KRW",
      },
    };
  }

  /**
   * 결제 완료: 프론트에서 결제 후 paymentId를 전달하면
   * PortOne API로 결제 상태를 검증하고 구독을 활성화
   */
  async completePayment(
    userId: number,
    paymentId: string,
  ): Promise<ApiResponse> {
    const payment = await this.prisma.payment.findUnique({
      where: { portonePaymentId: paymentId },
    });

    if (!payment || payment.userId !== userId) {
      throw new BadRequestException(PaymentErrors.PAYMENT_RECORD_NOT_FOUND);
    }

    if (payment.status !== PrismaPaymentStatus.PENDING) {
      throw new BadRequestException(PaymentErrors.PAYMENT_ALREADY_PROCESSED);
    }

    // PortOne API로 결제 상태 검증
    const portonePayment = await this.portoneService.getPayment(paymentId);

    if (portonePayment.status !== "PAID") {
      await this.prisma.payment.update({
        where: { portonePaymentId: paymentId },
        data: {
          status: PrismaPaymentStatus.FAILED,
          failedAt: new Date(),
          failureReason: `PortOne status: ${portonePayment.status}`,
        },
      });
      throw new BadRequestException(PaymentErrors.PAYMENT_NOT_COMPLETED);
    }

    // 금액 검증
    const expectedAmount = this.getAmount(
      payment.planType as PlanType,
      payment.billingCycle as BillingCycle,
    );
    if (portonePayment.amount.total !== expectedAmount) {
      await this.prisma.payment.update({
        where: { portonePaymentId: paymentId },
        data: {
          status: PrismaPaymentStatus.FAILED,
          failedAt: new Date(),
          failureReason: `Amount mismatch: expected ${expectedAmount}, got ${portonePayment.amount.total}`,
        },
      });
      throw new BadRequestException(PaymentErrors.PAYMENT_AMOUNT_MISMATCH);
    }

    // Payment 레코드 업데이트
    await this.prisma.payment.update({
      where: { portonePaymentId: paymentId },
      data: {
        status: PrismaPaymentStatus.PAID,
        paidAt: new Date(),
        paymentMethod: portonePayment.method?.type ?? null,
        cardBrand: portonePayment.method?.card?.name ?? null,
        cardLast4: portonePayment.method?.card?.number?.slice(-4) ?? null,
      },
    });

    // 구독 활성화
    await this.subscriptionService.activateSubscription(
      userId,
      payment.planType,
      payment.billingCycle,
    );

    return {
      success: true,
      message: "Payment confirmed and subscription activated",
    };
  }

  async getPaymentHistory(
    userId: number,
    options?: { year?: number; cursor?: string; limit?: number },
  ): Promise<ApiResponse<PaginatedPaymentHistoryResponse>> {
    const limit = options?.limit || 5;

    const where: Record<string, unknown> = {
      userId,
      // PENDING(결제창만 열었다가 닫힌 것) 제외
      status: { not: PrismaPaymentStatus.PENDING },
    };

    if (options?.year) {
      const startDate = new Date(`${options.year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${options.year + 1}-01-01T00:00:00.000Z`);
      where.createdAt = { gte: startDate, lt: endDate };
    }

    const total = await this.prisma.payment.count({ where });

    const findOptions: Record<string, unknown> = {
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    };

    if (options?.cursor) {
      findOptions.cursor = { id: options.cursor };
      findOptions.skip = 1;
    }

    const payments = await this.prisma.payment.findMany(findOptions as never);

    const hasMore = payments.length > limit;
    const items = hasMore ? payments.slice(0, limit) : payments;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      success: true,
      data: {
        items: items.map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          planType: payment.planType as PlanType,
          billingCycle: payment.billingCycle as BillingCycle,
          status: payment.status as PaymentStatusType,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
        })),
        nextCursor,
        total,
      },
    };
  }

  /**
   * PortOne 웹훅 처리 (백업 검증용)
   * 프론트에서 completePayment 호출이 실패해도 웹훅으로 처리 가능
   */
  async handleWebhook(body: {
    type: string;
    data: { paymentId: string };
  }): Promise<void> {
    const { paymentId } = body.data;

    if (body.type === "Transaction.Paid") {
      const payment = await this.prisma.payment.findUnique({
        where: { portonePaymentId: paymentId },
      });

      if (!payment || payment.status !== PrismaPaymentStatus.PENDING) return;

      const portonePayment = await this.portoneService.getPayment(paymentId);

      if (portonePayment.status !== "PAID") return;

      // 금액 검증
      const expectedAmount = this.getAmount(
        payment.planType as PlanType,
        payment.billingCycle as BillingCycle,
      );
      if (portonePayment.amount.total !== expectedAmount) {
        await this.prisma.payment.update({
          where: { portonePaymentId: paymentId },
          data: {
            status: PrismaPaymentStatus.FAILED,
            failedAt: new Date(),
            failureReason: `Webhook amount mismatch: expected ${expectedAmount}, got ${portonePayment.amount.total}`,
          },
        });
        return;
      }

      await this.prisma.payment.update({
        where: { portonePaymentId: paymentId },
        data: {
          status: PrismaPaymentStatus.PAID,
          paidAt: new Date(),
          paymentMethod: portonePayment.method?.type ?? null,
          cardBrand: portonePayment.method?.card?.name ?? null,
          cardLast4: portonePayment.method?.card?.number?.slice(-4) ?? null,
        },
      });

      await this.subscriptionService.activateSubscription(
        payment.userId,
        payment.planType,
        payment.billingCycle,
      );
    }

    if (
      body.type === "Transaction.Failed" ||
      body.type === "Transaction.Cancelled"
    ) {
      const payment = await this.prisma.payment.findUnique({
        where: { portonePaymentId: paymentId },
      });

      if (!payment || payment.status !== PrismaPaymentStatus.PENDING) return;

      await this.prisma.payment.update({
        where: { portonePaymentId: paymentId },
        data: {
          status:
            body.type === "Transaction.Cancelled"
              ? PrismaPaymentStatus.CANCELLED
              : PrismaPaymentStatus.FAILED,
          failedAt: new Date(),
          failureReason: `Webhook: ${body.type}`,
        },
      });
    }
  }

  getPricing(): ApiResponse<PricingResponse> {
    return {
      success: true,
      data: {
        proMonthlyPrice:
          this.configService.get<number>("payment.proMonthlyPrice") ?? 29000,
        proYearlyPrice:
          this.configService.get<number>("payment.proYearlyPrice") ?? 290000,
        currency: this.configService.get<string>("payment.currency") ?? "KRW",
      },
    };
  }

  async cancelPayment(userId: number, paymentId: string): Promise<ApiResponse> {
    const payment = await this.prisma.payment.findUnique({
      where: { portonePaymentId: paymentId },
    });

    if (!payment || payment.userId !== userId) {
      throw new BadRequestException(PaymentErrors.PAYMENT_RECORD_NOT_FOUND);
    }

    if (payment.status !== PrismaPaymentStatus.PENDING) {
      return { success: true };
    }

    await this.prisma.payment.update({
      where: { portonePaymentId: paymentId },
      data: {
        status: PrismaPaymentStatus.CANCELLED,
        failedAt: new Date(),
        failureReason: "User cancelled",
      },
    });

    return { success: true };
  }

  private getAmount(planType: PlanType, billingCycle: BillingCycle): number {
    if (planType === "FREE") return 0;
    if (billingCycle === "MONTHLY") {
      return this.configService.get<number>("payment.proMonthlyPrice") ?? 0;
    }
    return this.configService.get<number>("payment.proYearlyPrice") ?? 0;
  }
}
