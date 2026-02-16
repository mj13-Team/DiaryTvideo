import { Injectable } from "@nestjs/common";
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
          Authorization: `PortOne ${this.apiSecret}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PortOne API error: ${response.status} ${error}`);
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
    if (!webhookSecret) return false;

    // PortOne webhook signature: HMAC SHA256
    const message = `${webhookId}.${webhookTimestamp}.${body}`;
    const expectedSignature = createHmac("sha256", webhookSecret)
      .update(message)
      .digest("base64");

    return `v1,${expectedSignature}` === webhookSignature;
  }
}
