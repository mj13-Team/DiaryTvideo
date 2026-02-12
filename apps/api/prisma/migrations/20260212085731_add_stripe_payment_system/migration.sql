/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

-- AlterTable
ALTER TABLE "diary_entries" ADD COLUMN     "customStyle" TEXT,
ADD COLUMN     "videoConversionEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "subscriptionCancelledAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
ADD COLUMN     "videoConversionRemaining" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "videoConversionResetDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "planType" "PlanType" NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "nextBillingDate" TIMESTAMP(3),
    "status" "SubscriptionStatus" NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "stripeChargeId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "planType" "PlanType" NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "paymentMethod" TEXT,
    "cardBrand" TEXT,
    "cardLast4" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_diary_limits" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "localDate" TEXT NOT NULL,
    "diaryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_diary_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_status_idx" ON "subscriptions"("userId", "status");

-- CreateIndex
CREATE INDEX "subscriptions_endDate_idx" ON "subscriptions"("endDate");

-- CreateIndex
CREATE INDEX "subscriptions_nextBillingDate_idx" ON "subscriptions"("nextBillingDate");

-- CreateIndex
CREATE INDEX "subscriptions_stripeSubscriptionId_idx" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripePaymentIntentId_key" ON "payments"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeChargeId_key" ON "payments"("stripeChargeId");

-- CreateIndex
CREATE INDEX "payments_userId_createdAt_idx" ON "payments"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_stripePaymentIntentId_idx" ON "payments"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "daily_diary_limits_userId_localDate_idx" ON "daily_diary_limits"("userId", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "daily_diary_limits_userId_localDate_key" ON "daily_diary_limits"("userId", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "users_plan_idx" ON "users"("plan");

-- CreateIndex
CREATE INDEX "users_subscriptionStatus_idx" ON "users"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "users_subscriptionEndDate_idx" ON "users"("subscriptionEndDate");

-- CreateIndex
CREATE INDEX "users_stripeCustomerId_idx" ON "users"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
