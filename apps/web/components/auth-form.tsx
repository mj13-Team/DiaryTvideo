"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  verifyEmail,
  resendVerification,
  forgotPassword,
  signup,
  signin,
} from "@/lib/auth-store";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "./language-toggle";
import { translations } from "@/lib/translations";
import { AuthErrorCodes, SignupRequestSchema } from "@repo/types";
import { parseI18nMessage, ApiError } from "@/lib/api";

interface AuthFormProps {
  mode: "login" | "register" | "verify" | "forgot-password";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { language } = useLanguage();

  // Forgot password states
  const [emailSent, setEmailSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const t = translations[language];

  // Get email from URL params for verify mode
  useEffect(() => {
    if (mode === "verify") {
      const emailParam = searchParams.get("email");
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, [mode, searchParams]);

  // Timer for forgot password resend button
  useEffect(() => {
    if (mode === "forgot-password" && emailSent && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [mode, emailSent, resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (mode === "verify") {
      const code = verificationCode.join("");
      try {
        const response = await verifyEmail({ email, code });
        if (response.data) {
          setUser(response.data.user);
        }
        router.push("/diary");
      } catch (error) {
        const apiError = error as ApiError;
        setError(apiError.message);
      }
    } else if (mode === "register") {
      const result = SignupRequestSchema.safeParse({ email, password, name });
      if (!result.success) {
        const firstError = result.error.issues[0];
        setError(parseI18nMessage(firstError.message, language));
        setIsLoading(false);
        return;
      }
      try {
        await signup({ email, password, name });
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } catch (error) {
        const apiError = error as ApiError;
        setError(apiError.message);
      }
    } else if (mode === "login") {
      try {
        const response = await signin({ email, password });
        if (response.data) {
          setUser(response.data.user);
        }
        router.push("/diary");
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.errorCode === AuthErrorCodes.EMAIL_NOT_VERIFIED) {
          alert(t.emailVerificationRequired);
          router.push(`/verify?email=${encodeURIComponent(email)}`);
        } else {
          setError(apiError.message);
        }
      }
    }

    setIsLoading(false);
  };

  const handleVerificationCodeChange = (index: number, value: string) => {
    // Only allow single alphanumeric character
    if (value && !/^[a-zA-Z0-9]$/.test(value)) return;

    const newCode = [...verificationCode];
    // Convert to uppercase
    newCode[index] = value.toUpperCase();
    setVerificationCode(newCode);

    // Auto-focus next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerificationCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError("");
    try {
      await resendVerification(email);
      alert(t.verificationCodeResent);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message);
    }
    setIsResending(false);
  };

  const handleSendPasswordResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setEmailSent(true);
      setResendTimer(60);
      setCanResend(false);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message);
    }

    setIsLoading(false);
  };

  const handleResendPasswordResetEmail = async () => {
    if (!canResend) return;

    setIsResending(true);
    try {
      await forgotPassword(email);
      setResendTimer(60);
      setCanResend(false);
      alert(t.passwordResetEmailResent);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message);
    }
    setIsResending(false);
  };

  const isVerificationComplete = verificationCode.every(
    (digit) => digit !== "",
  );

  if (mode === "forgot-password") {
    if (!emailSent) {
      // State 1: Email Input
      return (
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h1 className="font-serif text-3xl font-semibold text-foreground text-center mb-2">
              {t.resetPassword}
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              {t.enterEmailForReset}
            </p>

            <form onSubmit={handleSendPasswordResetEmail} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : t.sendResetLink}
              </Button>
            </form>

            <p className="text-center text-muted-foreground mt-6">
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                {t.goToLogin}
              </Link>
            </p>
          </div>
        </div>
      );
    }

    // State 2: Email Sent Confirmation
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="font-serif text-3xl font-semibold text-foreground text-center mb-2">
            {t.resetPassword}
          </h1>
          <p className="text-muted-foreground text-center mb-2">
            {t.passwordResetEmailSentTo}
          </p>
          <p className="text-primary text-center mb-6 font-medium">{email}</p>

          {resendTimer > 0 ? (
            <p className="text-center text-muted-foreground">
              {t.resendAvailableIn.replace("{seconds}", resendTimer.toString())}
            </p>
          ) : (
            <p className="text-center text-muted-foreground">
              {t.didntReceiveEmail}{" "}
              <button
                type="button"
                onClick={handleResendPasswordResetEmail}
                disabled={isResending || !canResend}
                className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? "Please wait..." : t.resendEmail}
              </button>
            </p>
          )}

          <p className="text-center text-muted-foreground mt-6">
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              {t.goToLogin}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (mode === "verify") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="font-serif text-3xl font-semibold text-foreground text-center mb-2">
            {t.verifyEmail}
          </h1>
          <p className="text-muted-foreground text-center mb-2">
            {t.verificationCodeSent}
          </p>
          {email && (
            <p className="text-primary text-center mb-6 font-medium">{email}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-center block">
                {t.enterVerificationCode}
              </Label>
              <div className="flex justify-center gap-3">
                {verificationCode.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleVerificationCodeChange(index, e.target.value)
                    }
                    onKeyDown={(e) => handleVerificationCodeKeyDown(index, e)}
                    className="w-12 h-12 text-center text-2xl font-semibold"
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90"
              disabled={isLoading || !isVerificationComplete}
            >
              {isLoading ? "Please wait..." : t.verifyAndContinue}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            {t.didntReceiveCode}{" "}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? "Please wait..." : t.resendCode}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-serif text-3xl font-semibold text-foreground text-center mb-2">
          {mode === "login" ? t.welcomeBack : t.createAccount}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          {mode === "login" ? t.signInToContinue : t.startYourDiaryToday}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading
              ? "Please wait..."
              : mode === "login"
                ? t.signIn
                : t.createAccount}
          </Button>
        </form>

        <p className="text-center text-muted-foreground mt-6">
          {mode === "login" ? (
            <>
              {t.notyetAccount}{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              {t.alreayAccount}{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </>
          )}
        </p>

        {mode === "login" && (
          <p className="text-center text-muted-foreground mt-4">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline font-medium"
            >
              {t.forgotPassword}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
