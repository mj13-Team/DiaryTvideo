"use client";

import { useLanguage } from "@/components/language-toggle";
import { translations } from "@/lib/translations";

export default function RefundPage() {
  const { language } = useLanguage();
  const t = translations[language];

  const sections = [
    {
      title: t.refundSection1Title,
      items: [t.refundSection1Item1, t.refundSection1Item2],
    },
    {
      title: t.refundSection2Title,
      items: [t.refundSection2Item1],
    },
    {
      title: t.refundSection3Title,
      items: [
        t.refundSection3Item1,
        t.refundSection3Item2,
        t.refundSection3Item3,
      ],
    },
    {
      title: t.refundSection4Title,
      items: [t.refundSection4Item1],
    },
    {
      title: t.refundSection5Title,
      items: [t.refundSection5Item1, t.refundSection5Item2],
    },
    {
      title: t.refundSection6Title,
      items: [t.refundSection6Item1],
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
          {t.refundPolicyTitle}
        </h1>
        <p className="mt-4 text-muted-foreground">{t.refundPolicyIntro}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-muted-foreground"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
