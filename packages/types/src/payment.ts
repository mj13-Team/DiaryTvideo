import { z } from "zod";
import { PlanTypeSchema, BillingCycleSchema } from "./subscription";

// Payment Status Enum
export const PaymentStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
]);

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// Request DTOs
export const PreparePaymentRequestSchema = z.object({
  planType: PlanTypeSchema,
  billingCycle: BillingCycleSchema,
});

export const CompletePaymentRequestSchema = z.object({
  paymentId: z.string().min(1),
});

export interface PaymentHistoryQuery {
  year?: string;
  cursor?: string;
  limit?: string;
}

export type PreparePaymentRequest = z.infer<typeof PreparePaymentRequestSchema>;
export type CompletePaymentRequest = z.infer<
  typeof CompletePaymentRequestSchema
>;

// Pricing Response
export interface PricingResponse {
  proMonthlyPrice: number;
  proYearlyPrice: number;
  currency: string;
}

// Response DTOs
export const PreparePaymentResponseSchema = z.object({
  paymentId: z.string(),
  orderName: z.string(),
  amount: z.number(),
  currency: z.string(),
});

export const PaymentHistoryItemSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  planType: PlanTypeSchema,
  billingCycle: BillingCycleSchema,
  status: PaymentStatusSchema,
  paidAt: z.date().nullable(),
  createdAt: z.date(),
});

export const PaymentHistoryResponseSchema = z.array(PaymentHistoryItemSchema);

export const PaginatedPaymentHistoryResponseSchema = z.object({
  items: z.array(PaymentHistoryItemSchema),
  nextCursor: z.string().nullable(),
  total: z.number().int().min(0),
});

export type PreparePaymentResponse = z.infer<
  typeof PreparePaymentResponseSchema
>;
export type PaymentHistoryItem = z.infer<typeof PaymentHistoryItemSchema>;
export type PaymentHistoryResponse = z.infer<
  typeof PaymentHistoryResponseSchema
>;
export type PaginatedPaymentHistoryResponse = z.infer<
  typeof PaginatedPaymentHistoryResponseSchema
>;
