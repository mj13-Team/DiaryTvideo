import {
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { SubscriptionService } from "./subscription.service";
import {
  ApiResponse,
  JwtAccessPayload,
  SubscriptionResponse,
  UsageResponse,
  CancelSubscriptionResponse,
} from "@repo/types";

@Controller("subscriptions")
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get("me")
  async getCurrentSubscription(
    @CurrentUser() user: JwtAccessPayload,
  ): Promise<ApiResponse<SubscriptionResponse>> {
    return this.subscriptionService.getCurrentSubscription(user.sub);
  }

  @Get("usage")
  async getUsage(
    @CurrentUser() user: JwtAccessPayload,
  ): Promise<ApiResponse<UsageResponse>> {
    return this.subscriptionService.getUsage(user.sub);
  }

  @Post("cancel")
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(
    @CurrentUser() user: JwtAccessPayload,
  ): Promise<ApiResponse<CancelSubscriptionResponse>> {
    return this.subscriptionService.cancelSubscription(user.sub);
  }
}
