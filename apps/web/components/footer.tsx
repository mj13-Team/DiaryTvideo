"use client";

import { useLanguage } from "@/components/language-toggle";
import { translations } from "@/lib/translations";

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="mt-auto border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center text-sm text-muted-foreground md:text-left">
            <p>© 2026 My Diary. {t.allRightsReserved}</p>
          </div>

          <div className="text-center text-sm text-muted-foreground md:text-right">
            <p>
              {t.developedBy} v0 Team • {t.contact}:{" "}
              <a
                href="mailto:contact@diarytvideo.com"
                className="text-foreground underline-offset-4 hover:underline"
              >
                contact@diarytvideo.com
              </a>
            </p>
            <p className="mt-1">{t.poweredBy} Next.js & React</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
