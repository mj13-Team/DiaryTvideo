"use client";

import { DiaryForm } from "@/components/diary-form";
import { useAuth } from "@/components/auth-provider";

export default function NewEntryPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <DiaryForm />
      </div>
    </main>
  );
}
