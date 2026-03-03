"use client";

import { useEffect, useState } from "react";
import { X, Calendar } from "lucide-react";
import { useFormattedDate } from "@/lib/formattedDate";
import { VideoPlayer } from "./video-player";
import { VideoStatusPlaceholder } from "./video-status-placeholder";
import { DiaryData, Language } from "@repo/types";

interface DiaryModalProps {
  entry: DiaryData | null;
  onClose: () => void;
  language: Language;
  view: "video" | "text";
  onRetry?: (entryId: string) => void;
}

export function DiaryModal({
  entry,
  onClose,
  language,
  view,
  onRetry,
}: DiaryModalProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const formattedDate = useFormattedDate({
    entry,
    language,
    includeTime: true,
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (entry) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [entry, onClose]);

  if (!entry) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-xl bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formattedDate}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto p-6"
          style={{ maxHeight: "calc(85vh - 73px)" }}
        >
          {/* Video Player or Status Placeholder */}
          {view === "video" && entry.videoConversionEnabled && (
            <div className="mb-6">
              {entry.videoStatus === "COMPLETED" && entry.videoUrl ? (
                <VideoPlayer
                  videoUrl={entry.videoUrl}
                  thumbnailUrl={entry.thumbnailUrl ?? undefined}
                  subtitleUrl={entry.subtitleUrl ?? undefined}
                  language={language}
                />
              ) : (
                <VideoStatusPlaceholder
                  status={entry.videoStatus}
                  language={language}
                  message={entry.videoMessage ?? undefined}
                  retryCount={entry.videoRetryCount} // 이 줄 추가
                  onRetry={
                    entry.videoStatus === "FAILED" && onRetry
                      ? () => onRetry(entry.id)
                      : undefined
                  }
                />
              )}
            </div>
          )}

          <h2 className="font-serif text-2xl font-semibold text-foreground">
            {entry.title}
          </h2>
          {view === "video" ? (
            <>
              {showFullContent ? (
                <div className="mt-6 text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </div>
              ) : (
                <div className="mt-6 text-foreground/80 leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {entry.content}
                </div>
              )}
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="mt-3 text-sm text-primary hover:underline"
              >
                {showFullContent
                  ? language === "ko"
                    ? "내용 숨기기"
                    : "Hide content"
                  : language === "ko"
                    ? "내용 더보기"
                    : "Show more"}
              </button>
            </>
          ) : (
            <div className="mt-6 text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
