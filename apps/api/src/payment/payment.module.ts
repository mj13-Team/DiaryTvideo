import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { PortOneService } from "./portone.service";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionModule } from "../subscription/subscription.module";

@Module({
  imports: [SubscriptionModule],
  controllers: [PaymentController],
  providers: [PaymentService, PortOneService, PrismaService],
  exports: [PaymentService, PortOneService],
})
export class PaymentModule {}
