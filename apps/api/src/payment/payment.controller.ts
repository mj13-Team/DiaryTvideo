import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Headers,
  Req,
  UnauthorizedException,
  RawBodyRequest,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { PaymentEnabledGuard } from "./payment-enabled.guard";
import { PaymentService } from "./payment.service";
import { PortOneService } from "./portone.service";
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
  constructor(
    private readonly paymentService: PaymentService,
    private readonly portOneService: PortOneService,
  ) {}

  @Get("pricing")
  getPricing() {
    return this.paymentService.getPricing();
  }

  @Post("prepare")
  @UseGuards(PaymentEnabledGuard, JwtAuthGuard)
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

  @Post("cancel")
  @UseGuards(PaymentEnabledGuard, JwtAuthGuard)
  async cancelPayment(
    @CurrentUser() user: JwtAccessPayload,
    @Body(new ZodValidationPipe(CompletePaymentRequestSchema))
    body: CompletePaymentRequest,
  ) {
    return this.paymentService.cancelPayment(user.sub, body.paymentId);
  }

  @Post("complete")
  @UseGuards(PaymentEnabledGuard, JwtAuthGuard)
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
    @Headers("webhook-id") webhookId: string,
    @Headers("webhook-timestamp") webhookTimestamp: string,
    @Headers("webhook-signature") webhookSignature: string,
    @Req() req: RawBodyRequest<Request>,
    @Body() body: { type: string; data: { paymentId: string } },
  ) {
    const rawBody = req.rawBody?.toString() ?? "";
    const isValid = this.portOneService.verifyWebhookSignature(
      rawBody,
      webhookId,
      webhookTimestamp,
      webhookSignature,
    );

    if (!isValid) {
      throw new UnauthorizedException("Invalid webhook signature");
    }

    await this.paymentService.handleWebhook(body);
    return { received: true };
  }
}
