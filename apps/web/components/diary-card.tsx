"use client";

import { memo } from "react";
import { Trash2, Calendar, Eye } from "lucide-react";
import { useFormattedDate } from "@/lib/formattedDate";
import { DiaryData, Language } from "@repo/types";
import { VideoStatusIndicator } from "./video-status-indicator";

interface DiaryCardProps {
  entry: DiaryData;
  view: "video" | "text";
  onDelete: (id: string) => void;
  onView: (entry: DiaryData) => void;
  language: Language;
}

export const DiaryCard = memo(function DiaryCard({
  entry,
  view,
  onDelete,
  onView,
  language,
}: DiaryCardProps) {
  const formattedDate = useFormattedDate({ entry, language });

  if (view === "video") {
    return (
      <div className="group relative overflow-hidden rounded-lg bg-card shadow-sm transition-shadow hover:shadow-md">
        <button
          onClick={() => onView(entry)}
          className="relative aspect-video w-full overflow-hidden"
        >
          {/* Thumbnail or gradient background */}
          {entry.thumbnailUrl ? (
            <img
              src={entry.thumbnailUrl}
              alt={entry.title}
              className="w-full h-full object-cover blur-sm"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/30" />
          )}

          {/* Status overlay */}
          {entry.videoConversionEnabled && (
            <VideoStatusIndicator
              status={entry.videoStatus}
              variant="overlay"
              language={language}
              message={entry.videoMessage ?? undefined}
            />
          )}

          {/* Status badge */}
          {entry.videoConversionEnabled && (
            <VideoStatusIndicator
              status={entry.videoStatus}
              variant="badge"
              language={language}
              message={entry.videoMessage ?? undefined}
              className="absolute bottom-2 right-2"
            />
          )}
        </button>
        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1">
            {entry.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {entry.content}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onView(entry)}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                aria-label="View entry"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                aria-label="Delete entry"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-xl font-semibold text-foreground">
            {entry.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onView(entry)}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            aria-label="View entry"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
            aria-label="Delete entry"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-3 text-foreground/80 leading-relaxed whitespace-pre-wrap line-clamp-4">
        {entry.content}
      </p>
      <button
        onClick={() => onView(entry)}
        className="mt-3 text-sm text-primary hover:underline"
      >
        {language === "ko" ? "더보기" : "Read more"}
      </button>
    </div>
  );
});

export function DiaryCardSkeleton({ view }: { view: "video" | "text" }) {
  if (view === "video") {
    return (
      <div className="overflow-hidden rounded-lg bg-card shadow-sm">
        <div className="aspect-video w-full animate-pulse bg-muted" />
        <div className="p-4 space-y-2">
          <div className="h-5 w-32 animate-pulse bg-muted rounded" />
          <div className="h-4 w-full animate-pulse bg-muted rounded" />
          <div className="h-4 w-2/3 animate-pulse bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="h-6 w-48 animate-pulse bg-muted rounded" />
      <div className="mt-2 h-4 w-24 animate-pulse bg-muted rounded" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full animate-pulse bg-muted rounded" />
        <div className="h-4 w-3/4 animate-pulse bg-muted rounded" />
        <div className="h-4 w-1/2 animate-pulse bg-muted rounded" />
      </div>
    </div>
  );
}
