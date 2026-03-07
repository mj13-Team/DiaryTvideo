"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { ResetPasswordError } from "@/components/reset-password-error";
import { verifyResetToken } from "@/lib/auth-store";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState<
    "no-token" | "expired" | "invalid" | "already-used" | null
  >(null);

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setErrorType("no-token");
        setIsLoading(false);
        return;
      }

      try {
        const response = await verifyResetToken(token);
        if (!response.data?.valid) {
          setErrorType("invalid");
        }
      } catch {
        setErrorType("invalid");
      }
      setIsLoading(false);
    }

    validateToken();
  }, [token]);

  if (isLoading) {
    return (
      <div className="w-full max-w-md text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (errorType) {
    return <ResetPasswordError type={errorType} />;
  }

  return <ResetPasswordForm token={token!} />;
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md text-center text-muted-foreground">
              Loading...
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </div>
    </main>
  );
}
