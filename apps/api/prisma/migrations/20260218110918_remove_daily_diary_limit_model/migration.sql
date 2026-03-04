/*
  Warnings:

  - You are about to drop the column `stripeChargeId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentIntentId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `daily_diary_limits` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[portonePaymentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `portonePaymentId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "payments_stripeChargeId_key";

-- DropIndex
DROP INDEX "payments_stripePaymentIntentId_idx";

-- DropIndex
DROP INDEX "payments_stripePaymentIntentId_key";

-- DropIndex
DROP INDEX "subscriptions_stripeSubscriptionId_idx";

-- DropIndex
DROP INDEX "subscriptions_stripeSubscriptionId_key";

-- DropIndex
DROP INDEX "users_stripeCustomerId_idx";

-- DropIndex
DROP INDEX "users_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "stripeChargeId",
DROP COLUMN "stripePaymentIntentId",
ADD COLUMN     "portonePaymentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "stripePriceId",
DROP COLUMN "stripeSubscriptionId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "stripeCustomerId";

-- DropTable
DROP TABLE "daily_diary_limits";

-- CreateIndex
CREATE UNIQUE INDEX "payments_portonePaymentId_key" ON "payments"("portonePaymentId");

-- CreateIndex
CREATE INDEX "payments_portonePaymentId_idx" ON "payments"("portonePaymentId");
