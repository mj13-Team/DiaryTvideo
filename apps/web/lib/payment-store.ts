"use client";

import {
  ApiResponse,
  PaginatedPaymentHistoryResponse,
  PreparePaymentRequest,
  PreparePaymentResponse,
  CompletePaymentRequest,
  PricingResponse,
} from "@repo/types";
import { api } from "./api";

export async function getPricing(): Promise<ApiResponse<PricingResponse>> {
  return api.get<ApiResponse<PricingResponse>>("/payments/pricing");
}

export async function getPaymentHistory(params?: {
  year?: number;
  cursor?: string;
  limit?: number;
}): Promise<ApiResponse<PaginatedPaymentHistoryResponse>> {
  const query = new URLSearchParams();
  if (params?.year) query.set("year", String(params.year));
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return api.get<ApiResponse<PaginatedPaymentHistoryResponse>>(
    `/payments/history${qs ? `?${qs}` : ""}`,
    { withAuth: true },
  );
}

export async function preparePayment(
  data: PreparePaymentRequest,
): Promise<ApiResponse<PreparePaymentResponse>> {
  return api.post<ApiResponse<PreparePaymentResponse>>(
    "/payments/prepare",
    data,
    { withAuth: true },
  );
}

export async function cancelPayment(
  data: CompletePaymentRequest,
): Promise<ApiResponse> {
  return api.post<ApiResponse>("/payments/cancel", data, { withAuth: true });
}

export async function completePayment(
  data: CompletePaymentRequest,
): Promise<ApiResponse> {
  return api.post<ApiResponse>("/payments/complete", data, {
    withAuth: true,
  });
}
