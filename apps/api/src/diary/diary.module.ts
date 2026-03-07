import { Module } from "@nestjs/common";
import { DiaryController } from "./diary.controller";
import { DiaryService } from "./diary.service";
import { DiaryRepository } from "./diary.repository";
import { VideoModule } from "src/video/video.module";
import { SubscriptionModule } from "src/subscription/subscription.module";

@Module({
  imports: [VideoModule, SubscriptionModule],
  controllers: [DiaryController],
  providers: [DiaryService, DiaryRepository],
})
export class DiaryModule {}
