import { Injectable, BadRequestException } from "@nestjs/common";
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
} from "@repo/types";
import {
  PlanType as PrismaPlanType,
  BillingCycle as PrismaBillingCycle,
  PaymentStatus as PrismaPaymentStatus,
} from "@prisma/client";
import { randomUUID } from "crypto";

// 플랜별 가격 (USD, cents 단위)
const PLAN_PRICES: Record<string, Record<string, number>> = {
  PRO: {
    MONTHLY: 2000, // $20.00
    YEARLY: 20000, // $200.00
  },
};

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private portoneService: PortOneService,
    private subscriptionService: SubscriptionService,
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new BadRequestException(PaymentErrors.USER_NOT_FOUND);
    }

    const amount = this.getAmount(planType, billingCycle);
    const paymentId = `payment-${randomUUID()}`;
    const orderName =
      billingCycle === "MONTHLY"
        ? "DiaryTvideo Pro Monthly"
        : "DiaryTvideo Pro Yearly";

    // PENDING 상태로 Payment 레코드 생성
    await this.prisma.payment.create({
      data: {
        userId,
        portonePaymentId: paymentId,
        amount: amount / 100,
        currency: "USD",
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
        currency: "USD",
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
    // DB에서 Payment 레코드 확인
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

    const where: Record<string, unknown> = { userId };

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

      // 이미 처리된 결제는 무시
      if (!payment || payment.status !== PrismaPaymentStatus.PENDING) return;

      // PortOne API로 결제 상태 재확인
      const portonePayment = await this.portoneService.getPayment(paymentId);

      if (portonePayment.status === "PAID") {
        await this.prisma.payment.update({
          where: { portonePaymentId: paymentId },
          data: {
            status: PrismaPaymentStatus.PAID,
            paidAt: new Date(),
          },
        });

        await this.subscriptionService.activateSubscription(
          payment.userId,
          payment.planType,
          payment.billingCycle,
        );
      }
    }
  }

  private getAmount(planType: PlanType, billingCycle: BillingCycle): number {
    if (planType === "FREE") return 0;
    return PLAN_PRICES[planType]?.[billingCycle] ?? 0;
  }
}
