"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DiaryCard, DiaryCardSkeleton } from "./diary-card";
import { ViewToggle } from "./view-toggle";
import { DiaryFilter } from "./diary-filter";
import { DiaryCalendar } from "./diary-calendar";
import { DiaryModal } from "./diary-modal";
import { DeleteModal } from "./delete-modal";
import {
  getEntries,
  getMonthlyEntries,
  deleteEntry,
  retryVideoGeneration,
} from "@/lib/diary-store";
import { getUsage } from "@/lib/subscription-store";
import { useVideoStatusUpdates } from "@/lib/socket";
import { DiaryData, Language } from "@repo/types";
import { ApiError } from "@/lib/api";
import { BookOpen, AlertCircle } from "lucide-react";
import { translations } from "@/lib/translations";

const SEEN_JOBS_KEY = "diary_seen_video_jobs";

export function DiaryList({ language = "en" }: { language?: Language }) {
  const [entries, setEntries] = useState<DiaryData[]>([]);
  const [monthlyEntries, setMonthlyEntries] = useState<DiaryData[]>([]);
  const [view, setView] = useState<"video" | "text">("text");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [selectedEntry, setSelectedEntry] = useState<DiaryData | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [seenJobIds, setSeenJobIds] = useState<Set<string>>(new Set());
  // FREE 플랜 + 잔여 0일 때만 비디오 UI 완전 숨김 (PRO→FREE 전환 후 잔여 있으면 표시 유지)
  const [hideVideoUI, setHideVideoUI] = useState(false);

  const t = translations[language];

  useEffect(() => {
    getUsage().then((res) => {
      if (res.success && res.data) {
        console.log(res.data.videoConversionRemaining);
        setHideVideoUI(
          res.data.plan === "FREE" && res.data.videoConversionRemaining === 0,
        );
      }
    });
  }, []);

  // 실시간 비디오 상태 업데이트 구독
  useVideoStatusUpdates(setEntries);

  // Load seen job IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEEN_JOBS_KEY);
      if (stored) {
        setSeenJobIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // 월별 일기 조회 (달력 표시용)
  useEffect(() => {
    let cancelled = false;

    async function fetchMonthlyEntries() {
      setIsLoadingMonthly(true);
      try {
        const response = await getMonthlyEntries(
          currentMonth.year,
          currentMonth.month,
        );
        if (!cancelled && response.data) {
          setMonthlyEntries(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch monthly entries:", err);
          setMonthlyEntries([]);
        }
      } finally {
        if (!cancelled) setIsLoadingMonthly(false);
      }
    }

    fetchMonthlyEntries();
    return () => {
      cancelled = true;
    };
  }, [currentMonth]);

  useEffect(() => {
    async function fetchEntries() {
      const targetDate = selectedDate || new Date();

      // 로컬 시간 기준으로 YYYY-MM-DD 생성
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      const day = String(targetDate.getDate()).padStart(2, "0");
      const filterDate = `${year}-${month}-${day}`;

      setIsLoading(true);
      setError(null);

      try {
        const response = await getEntries(filterDate);
        if (response.data) {
          setEntries(response.data);
        }
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntries();
  }, [selectedDate]);

  const handleDelete = (id: string) => {
    setEntryToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;

    try {
      await deleteEntry(entryToDelete);

      // 목록에서 삭제된 일기 제거
      setEntries((prev) => prev.filter((e) => e.id !== entryToDelete));
      setMonthlyEntries((prev) => prev.filter((e) => e.id !== entryToDelete));

      // 모달이 열려있으면 닫기
      if (selectedEntry?.id === entryToDelete) {
        setSelectedEntry(null);
      }
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.message);
    } finally {
      setEntryToDelete(null);
    }
  };

  const handleView = (entry: DiaryData) => {
    setSelectedEntry(entry);
  };

  const handleRetry = async (entryId: string) => {
    try {
      const response = await retryVideoGeneration(entryId);

      if (response.data) {
        // 목록에서 해당 일기 업데이트
        setEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.id === entryId ? response.data : entry,
          ),
        );

        // 월별 목록도 업데이트 (달력용)
        setMonthlyEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.id === entryId ? response.data : entry,
          ),
        );

        // 모달의 선택된 entry도 업데이트
        setSelectedEntry((prev) =>
          prev?.id === entryId ? response.data : prev,
        );
      }
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.message);
      console.error("Failed to retry video generation:", apiError);
    }
  };

  // Get IDs of entries with pending/processing status
  const pendingJobIds = useMemo(() => {
    return entries
      .filter(
        (entry) =>
          entry.videoConversionEnabled &&
          (entry.videoStatus === "PENDING" ||
            entry.videoStatus === "PROCESSING"),
      )
      .map((entry) => entry.id);
  }, [entries]);

  // Check if there are unseen jobs
  const hasUnseenJob = useMemo(() => {
    return pendingJobIds.some((id) => !seenJobIds.has(id));
  }, [pendingJobIds, seenJobIds]);

  // Handle view change - mark jobs as seen when switching to video view
  const handleViewChange = useCallback(
    (newView: "video" | "text") => {
      if (newView === "video" && pendingJobIds.length > 0) {
        const newSeenIds = new Set([...seenJobIds, ...pendingJobIds]);
        setSeenJobIds(newSeenIds);
        try {
          localStorage.setItem(SEEN_JOBS_KEY, JSON.stringify([...newSeenIds]));
        } catch {
          // Ignore localStorage errors
        }
      }
      setView(newView);
    },
    [pendingJobIds, seenJobIds],
  );

  const entryDates = useMemo(() => {
    // monthlyEntries 사용 (기존 entries 대신)
    return monthlyEntries.map((entry) => {
      // localDate는 "YYYY-MM-DD" 형식 문자열 (사용자가 작성한 날짜)
      // createdAt 대신 localDate를 사용하여 시간대 차이로 인한 날짜 불일치 방지
      const [year, month, day] = entry.localDate.split("-").map(Number);
      // 로컬 시간대 기준으로 Date 생성 (00:00:00)
      return new Date(year, month - 1, day);
    });
  }, [monthlyEntries]);

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCurrentMonth({ year, month });
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // AI 비디오 탭에서는 videoConversionEnabled가 true인 항목만 표시
      if (view === "video" && !entry.videoConversionEnabled) return false;

      const matchesSearch =
        searchQuery === "" ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [entries, searchQuery, view]);

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-8 space-y-4">
            <DiaryCalendar
              entryDates={[]}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onMonthChange={handleMonthChange}
              isLoading={isLoadingMonthly}
              language={language}
            />
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <div
            className={
              view === "video"
                ? "grid gap-5 sm:grid-cols-2"
                : "flex flex-col gap-4"
            }
          >
            {[1, 2, 3].map((i) => (
              <DiaryCardSkeleton key={i} view={view} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-8 space-y-4">
            <DiaryCalendar
              entryDates={entryDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onMonthChange={handleMonthChange}
              isLoading={isLoadingMonthly}
              language={language}
            />
          </div>
        </aside>
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
            {t.failedToLoadEntries}
          </h3>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="mt-4 text-sm text-primary hover:underline"
          >
            {t.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-8 space-y-4">
            <DiaryCalendar
              entryDates={entryDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onMonthChange={handleMonthChange}
              isLoading={isLoadingMonthly}
              language={language}
            />
          </div>
        </aside>
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-secondary p-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
            {t.noEntriesYet}
          </h3>
          <p className="mt-2 text-muted-foreground">{t.startWritingFirst}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar with calendar */}
        <aside className="lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-8 space-y-4">
            <DiaryCalendar
              entryDates={entryDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onMonthChange={handleMonthChange}
              isLoading={isLoadingMonthly}
              language={language}
            />
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <DiaryFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                language={language}
              />
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                {filteredEntries.length}{" "}
                {filteredEntries.length === 1 ? t.entry : t.entries}
                {(searchQuery || selectedDate) && ` (${t.filtered})`}
              </p>
              <ViewToggle
                view={view}
                onViewChange={handleViewChange}
                language={language}
                hasNewJob={hideVideoUI ? false : hasUnseenJob}
              />
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">{t.noEntriesMatch}</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDate(null);
                }}
                className="mt-2 text-sm text-primary hover:underline"
              >
                {t.clearAllFilters}
              </button>
            </div>
          ) : (
            <div
              className={
                view === "video"
                  ? "grid gap-5 sm:grid-cols-2"
                  : "flex flex-col gap-4"
              }
            >
              {filteredEntries.map((entry) => (
                <DiaryCard
                  key={entry.id}
                  entry={entry}
                  view={view}
                  onDelete={handleDelete}
                  onView={handleView}
                  language={language}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for viewing entries */}
      <DiaryModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        language={language}
        view={view}
        onRetry={handleRetry}
      />

      {/* Delete confirmation modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEntryToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={t.deleteEntryTitle}
        message={t.deleteEntryMessage}
        cancelText={t.cancel}
        confirmText={t.deleteConfirm}
      />
    </>
  );
}
