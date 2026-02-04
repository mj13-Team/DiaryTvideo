"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DiaryList } from "@/components/diary-list";
import { Button } from "@/components/ui/button";
import {
  PenLine,
  LogOut,
  BookOpen,
  UserCircle,
  Menu,
  Moon,
  Sun,
  Languages,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle, useTheme } from "@/components/theme-toggle";
import { LanguageToggle, useLanguage } from "@/components/language-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { translations } from "@/lib/translations";

export default function DiaryPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

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
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/diary" className="flex items-center gap-2">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <h1 className="font-serif text-3xl font-bold text-foreground">
                    {t.project_name}
                  </h1>
                </div>
                <p className="mt-1 text-muted-foreground">
                  {t.welcomeBack}, {user.name}
                </p>
              </div>
            </Link>
          </div>
          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/diary/account">
              <Button variant="ghost" size="icon" title={t.account}>
                <UserCircle className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/diary/new">
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <PenLine className="h-4 w-4" />
                {t.newEntry}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title={t.logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile */}
          <div className="flex sm:hidden items-center gap-2">
            <Link href="/diary/new">
              <Button
                size="icon"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <PenLine className="h-4 w-4" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setLanguage(language === "en" ? "ko" : "en")}
                >
                  <Languages className="h-4 w-4" />
                  {language === "en" ? "한국어" : "English"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setTheme(theme === "dark" ? "light" : "dark")
                  }
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/diary/account">
                    <UserCircle className="h-4 w-4" />
                    {t.account}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  {t.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <DiaryList language={language} />
      </div>
    </main>
  );
}
