"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  PenLine,
  LogOut,
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

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const t = translations[language];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href={user ? "/diary" : "/"} className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-semibold text-foreground">
            {t.project_name}
          </span>
        </Link>

        {user ? (
          <>
            {/* 로그인 - Desktop */}
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

            {/* 로그인 - Mobile */}
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
          </>
        ) : (
          <>
            {/* 비로그인 - Desktop */}
            <div className="hidden sm:flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
              <Link href="/pricing">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t.pricing}
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t.signIn}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t.getStarted}
                </Button>
              </Link>
            </div>

            {/* 비로그인 - Mobile */}
            <div className="flex sm:hidden items-center gap-2">
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
                    <Link href="/pricing">{t.pricing}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login">{t.signIn}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register">{t.getStarted}</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
