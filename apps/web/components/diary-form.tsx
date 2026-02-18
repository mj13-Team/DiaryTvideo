"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEntry } from "@/lib/diary-store";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Video } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./language-toggle";
import { translations } from "@/lib/translations";

export function DiaryForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [enableVideo, setEnableVideo] = useState(false);
  const [videoStyle, setVideoStyle] = useState("");
  const { language } = useLanguage();

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setError("");
    setIsSubmitting(true);

    try {
      // 사용자의 로컬 시간대 기준으로 현재 날짜 생성 (예: KST 기준)
      // new Date()는 브라우저의 시간대를 사용하며,
      // getFullYear(), getMonth(), getDate()는 로컬 시간대 기준 값을 반환합니다.
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      await createEntry({
        title: title.trim(),
        content: content.trim(),
        localDate,
      });
      router.push("/diary");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/diary"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          {t.newEntry}
        </h1>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            {t.newEntryTitle}
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.newEntryTitlePlaceholder}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            {t.newEntryDescription}
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.newEntryDescriptionPlaceholder}
            rows={12}
            className="w-full resize-none rounded-lg border border-border bg-card px-4 py-3 text-foreground leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        {/* Video Conversion Toggle */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              <Label
                htmlFor="enableVideo"
                className="text-sm font-medium cursor-pointer"
              >
                {t.enableVideoConversion}
              </Label>
            </div>
            <Switch
              id="enableVideo"
              checked={enableVideo}
              onCheckedChange={setEnableVideo}
            />
          </div>
          {enableVideo && (
            <div className="space-y-2 pt-1">
              <Label
                htmlFor="videoStyle"
                className="text-sm text-muted-foreground"
              >
                {t.videoStyleLabel}
              </Label>
              <input
                id="videoStyle"
                type="text"
                value={videoStyle}
                onChange={(e) => setVideoStyle(e.target.value)}
                placeholder={t.videoStylePlaceholder}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/diary")}
          className="border-border text-foreground hover:bg-secondary"
        >
          {t.cancel}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? "Saving..." : t.saveEntry}
        </Button>
      </div>
    </form>
  );
}
