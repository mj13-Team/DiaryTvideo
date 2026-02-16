import { z } from "zod";

// Enums (DB에 사용된 값과 일치해야 함)
export const PlanTypeSchema = z.enum(["FREE", "PRO"]);
export const SubscriptionStatusSchema = z.enum([
  "INACTIVE",
  "ACTIVE",
  "CANCELLED",
  "EXPIRED",
]);
export const BillingCycleSchema = z.enum(["MONTHLY", "YEARLY"]);

export type PlanType = z.infer<typeof PlanTypeSchema>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type BillingCycle = z.infer<typeof BillingCycleSchema>;

// Response DTOs
export const SubscriptionResponseSchema = z.object({
  plan: PlanTypeSchema,
  status: SubscriptionStatusSchema,
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  cancelledAt: z.date().nullable(),
  videoConversionRemaining: z.number().int().min(0),
  videoConversionResetDate: z.date().nullable(),
});

export const UsageResponseSchema = z.object({
  plan: PlanTypeSchema,
  videoConversionRemaining: z.number().int().min(0),
  videoConversionResetDate: z.date().nullable(),
  limit: z.number().int().min(0),
});

export const CancelSubscriptionResponseSchema = z.object({
  message: z.string(),
  endDate: z.date().nullable(),
});

export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;
export type UsageResponse = z.infer<typeof UsageResponseSchema>;
export type CancelSubscriptionResponse = z.infer<
  typeof CancelSubscriptionResponseSchema
>;
