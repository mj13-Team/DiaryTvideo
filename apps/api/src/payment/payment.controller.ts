import { Controller, Post, Get, Body, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { PaymentService } from "./payment.service";
import {
  JwtAccessPayload,
  PreparePaymentRequest,
  PreparePaymentRequestSchema,
  CompletePaymentRequest,
  CompletePaymentRequestSchema,
  PaymentHistoryQuery,
} from "@repo/types";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

@Controller("payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("prepare")
  @UseGuards(JwtAuthGuard)
  async preparePayment(
    @CurrentUser() user: JwtAccessPayload,
    @Body(new ZodValidationPipe(PreparePaymentRequestSchema))
    body: PreparePaymentRequest,
  ) {
    return this.paymentService.preparePayment(
      user.sub,
      body.planType,
      body.billingCycle,
    );
  }

  @Post("complete")
  @UseGuards(JwtAuthGuard)
  async completePayment(
    @CurrentUser() user: JwtAccessPayload,
    @Body(new ZodValidationPipe(CompletePaymentRequestSchema))
    body: CompletePaymentRequest,
  ) {
    return this.paymentService.completePayment(user.sub, body.paymentId);
  }

  @Get("history")
  @UseGuards(JwtAuthGuard)
  async getPaymentHistory(
    @CurrentUser() user: JwtAccessPayload,
    @Query() query: PaymentHistoryQuery,
  ) {
    return this.paymentService.getPaymentHistory(user.sub, {
      year: query.year ? Number(query.year) : undefined,
      cursor: query.cursor || undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    });
  }

  @Post("webhook")
  async handleWebhook(
    @Body() body: { type: string; data: { paymentId: string } },
  ) {
    await this.paymentService.handleWebhook(body);
    return { received: true };
  }
}
