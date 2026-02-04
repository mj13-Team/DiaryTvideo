"use client";

import type React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  PenLine,
  Lock,
  Sparkles,
  Menu,
  Moon,
  Sun,
  Languages,
} from "lucide-react";
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

export default function IntroPage() {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const t = translations[language];

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-semibold text-foreground">
              {t.project_name}
            </span>
          </div>
          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
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

          {/* Mobile */}
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
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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
                  <Link href="/login">{t.signIn}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/register">{t.getStarted}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl text-balance">
            {t.heroTitle}
            <span className="text-primary block mt-2">{t.heroSubtitle}</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t.heroDescription}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base"
              >
                {t.startWritingToday}
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base bg-transparent"
              >
                {t.alreadyHaveAccount}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/30 border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-semibold text-foreground text-center mb-12">
            {t.whyDigitalDiary}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<PenLine className="h-6 w-6" />}
              title={t.easyWriting}
              description={t.easyWritingDesc}
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6" />}
              title={t.privateSecure}
              description={t.privateSecureDesc}
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title={t.aiVideoView}
              description={t.aiVideoViewDesc}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
          {t.readyToStart}
        </h2>
        <p className="text-muted-foreground mb-8">{t.joinThousands}</p>
        <Link href="/register">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t.createFreeDiary}
          </Button>
        </Link>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
