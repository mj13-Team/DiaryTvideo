"use client";

import {
  ApiResponse,
  SubscriptionResponse,
  UsageResponse,
  CancelSubscriptionResponse,
} from "@repo/types";
import { api } from "./api";

export async function getSubscription(): Promise<
  ApiResponse<SubscriptionResponse>
> {
  return api.get<ApiResponse<SubscriptionResponse>>("/subscriptions/me", {
    withAuth: true,
  });
}

export async function getUsage(): Promise<ApiResponse<UsageResponse>> {
  return api.get<ApiResponse<UsageResponse>>("/subscriptions/usage", {
    withAuth: true,
  });
}

export async function cancelSubscription(): Promise<
  ApiResponse<CancelSubscriptionResponse>
> {
  return api.post<ApiResponse<CancelSubscriptionResponse>>(
    "/subscriptions/cancel",
    {},
    { withAuth: true },
  );
}
