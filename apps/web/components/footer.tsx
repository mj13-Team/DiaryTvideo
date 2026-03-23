"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-toggle";
import { translations } from "@/lib/translations";

const BUSINESS_INFO = {
  companyName: "엠제이13(MJ13)",
  businessNumber: "535-46-01309",
  contact: "contact@diarytvideo.com",
  address: "대구광역시 서구 중리동 1099-13",
  representative: "김민재",
  ecommerceNumber: "2026-대구서구-0117",
  isSimpleTaxpayer: false,
};

const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE;

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="mt-auto border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center text-sm text-muted-foreground md:text-left">
            <p>
              © 2026 {t.project_name}. {t.allRightsReserved}
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground md:text-right">
            <p>
              <Link
                href="/refund"
                className="text-muted-foreground underline-offset-4 hover:underline"
              >
                {t.refundPolicyLink}
              </Link>
            </p>
            {CONTACT_PHONE && (
              <p className="mt-1">
                {t.phoneLabel}:{" "}
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {CONTACT_PHONE}
                </a>
              </p>
            )}
            <p className="mt-1">
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

        <div className="mt-4 border-t border-border/40 pt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t.businessInfoTitle}
          </p>
          <div className="flex flex-col gap-y-1 text-xs text-muted-foreground/80 sm:flex-row sm:flex-wrap sm:gap-x-0 sm:gap-y-1">
            {[
              {
                label: t.companyNameLabel,
                value: BUSINESS_INFO.companyName,
                extra: BUSINESS_INFO.isSimpleTaxpayer ? (
                  <span className="ml-1 rounded border border-border px-1 py-0.5 text-[10px]">
                    {t.simpleTaxpayer}
                  </span>
                ) : null,
              },
              {
                label: t.businessNumberLabel,
                value: BUSINESS_INFO.businessNumber,
              },
              {
                label: t.representativeLabel,
                value: BUSINESS_INFO.representative,
              },
              { label: t.contact, value: BUSINESS_INFO.contact },
              { label: t.addressLabel, value: BUSINESS_INFO.address },
              {
                label: t.ecommerceNumberLabel,
                value: BUSINESS_INFO.ecommerceNumber,
              },
            ].map((item, i) => (
              <span key={item.label} className="flex items-center">
                {i !== 0 && (
                  <span className="mx-2 hidden text-border sm:inline">|</span>
                )}
                <span className="font-medium text-muted-foreground">
                  {item.label}
                </span>
                <span className="ml-1">{item.value}</span>
                {item.extra}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
