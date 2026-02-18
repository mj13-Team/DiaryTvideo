"use client";

import { ApiResponse, PaginatedPaymentHistoryResponse } from "@repo/types";
import { api } from "./api";

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
