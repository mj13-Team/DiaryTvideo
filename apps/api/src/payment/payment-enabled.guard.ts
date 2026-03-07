import { Injectable, CanActivate, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PaymentEnabledGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(): boolean {
    const isEnabled = this.configService.get<boolean>("payment.enabled");
    if (!isEnabled) {
      throw new ForbiddenException("결제 서비스가 현재 준비 중입니다.");
    }
    return true;
  }
}
