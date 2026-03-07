import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense>
          <AuthForm mode="forgot-password" />
        </Suspense>
      </div>
    </main>
  );
}
