import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "crypto";
import { PaymentErrors } from "@repo/types";

export interface PortOnePayment {
  id: string;
  status:
    | "READY"
    | "PAID"
    | "VIRTUAL_ACCOUNT_ISSUED"
    | "PARTIAL_CANCELLED"
    | "CANCELLED"
    | "FAILED";
  amount: {
    total: number;
    paid: number;
    cancelled: number;
  };
  currency: string;
  method?: {
    type: string;
    card?: {
      name?: string;
      number?: string; // 마스킹된 카드번호
    };
  };
  channel?: {
    pgProvider: string;
  };
  requestedAt: string;
  paidAt?: string;
  failedAt?: string;
  cancelledAt?: string;
}

@Injectable()
export class PortOneService {
  private readonly apiSecret: string;
  private readonly baseUrl = "https://api.portone.io";

  constructor(private configService: ConfigService) {
    const apiSecret = this.configService.get<string>("PORTONE_API_SECRET");
    if (!apiSecret) {
      throw new Error(PaymentErrors.PG_NOT_CONFIGURED);
    }
    this.apiSecret = apiSecret;
  }

  async getPayment(paymentId: string): Promise<PortOnePayment> {
    const response = await fetch(
      `${this.baseUrl}/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `PortOne ${this.apiSecret.trim()}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      const msg = `PortOne API error: ${response.status} ${error}`;
      console.error(msg);
      throw new BadRequestException(
        response.status === 401
          ? "PortOne API 인증 실패 - API Secret을 확인하세요"
          : response.status === 404
            ? "결제 정보를 찾을 수 없습니다"
            : msg,
      );
    }

    return response.json() as Promise<PortOnePayment>;
  }

  verifyWebhookSignature(
    body: string,
    webhookId: string,
    webhookTimestamp: string,
    webhookSignature: string,
  ): boolean {
    const webhookSecret = this.configService.get<string>(
      "PORTONE_WEBHOOK_SECRET",
    );
    // 개발 환경에서 시크릿 미설정 시 서명 검증 스킵
    if (!webhookSecret) return true;

    // PortOne webhook signature: HMAC SHA256
    const message = `${webhookId}.${webhookTimestamp}.${body}`;
    const expectedSignature = createHmac("sha256", webhookSecret)
      .update(message)
      .digest("base64");

    return `v1,${expectedSignature}` === webhookSignature;
  }
}
