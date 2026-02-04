import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.resend = new Resend(
      this.configService.get<string>("email.resendApiKey"),
    );
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    code: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .code-box {
              background-color: #f3f4f6;
              border: 2px solid #4F46E5;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #4F46E5;
              font-family: 'Courier New', monospace;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to DiaryTVideo, ${name}!</h1>
            <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
            <p>Enter the verification code below in the app:</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.configService.get<string>("email.from") as string,
        to: email,
        subject: "Verify Your Email - DiaryTVideo",
        html,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get<string>("frontend.url") || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button-box {
              text-align: center;
              margin: 30px 0;
            }
            .reset-button {
              display: inline-block;
              background-color: #4F46E5;
              color: white !important;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
            }
            .reset-button:hover {
              background-color: #4338CA;
            }
            .expiry-notice {
              text-align: center;
              color: #666;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Hello, ${name}!</h1>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div class="button-box">
              <a href="${resetLink}" class="reset-button">Reset Password</a>
            </div>
            <p class="expiry-notice">This link will expire in 1 hour.</p>
            <div class="footer">
              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.configService.get<string>("email.from") as string,
        to: email,
        subject: "Reset Your Password - DiaryTVideo",
        html,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      throw error;
    }
  }
}
