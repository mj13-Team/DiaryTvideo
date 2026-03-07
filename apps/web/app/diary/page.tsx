"use client";

import { DiaryList } from "@/components/diary-list";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-toggle";
import { translations } from "@/lib/translations";

export default function DiaryPage() {
  const { user, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="mb-8 text-muted-foreground">
          {t.welcomeBack}, {user.name}
        </p>
        <DiaryList language={language} />
      </div>
    </main>
  );
}
