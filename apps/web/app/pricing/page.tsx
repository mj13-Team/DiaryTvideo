"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/components/language-toggle";
import { translations } from "@/lib/translations";
import { useAuth } from "@/components/auth-provider";
import {
  preparePayment,
  completePayment,
  cancelPayment,
  getPricing,
} from "@/lib/payment-store";
import { getSubscription } from "@/lib/subscription-store";
import { ApiError } from "@/lib/api";
import * as PortOne from "@portone/browser-sdk/v2";

export default function PricingPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { user } = useAuth();
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState(29000);
  const [yearlyPrice, setYearlyPrice] = useState(290000);
  const [portoneCurrency, setPortoneCurrency] = useState("CURRENCY_KRW");
  const [isAlreadyPro, setIsAlreadyPro] = useState(false);

  useEffect(() => {
    getPricing().then((res) => {
      if (res.success && res.data) {
        setMonthlyPrice(res.data.proMonthlyPrice);
        setYearlyPrice(res.data.proYearlyPrice);
        setPortoneCurrency(`CURRENCY_${res.data.currency}`);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    getSubscription().then((res) => {
      if (res.success && res.data) {
        setIsAlreadyPro(
          res.data.plan === "PRO" && res.data.status === "ACTIVE",
        );
      }
    });
  }, [user]);

  const yearlyMonthlyEquiv = Math.round(yearlyPrice / 12);
  const savePercent = Math.round(
    ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100,
  );

  const freePlanFeatures = [
    t.featureDiaryEntries,
    t.featureTextView,
    t.featureCloudBackup,
  ];

  const proPlanFeatures = [
    t.featureDiaryEntries,
    t.featureTextView,
    t.featureVideosPerMonth.replace("{count}", "40"),
    t.featurePriorityProcessing,
    t.featureCloudBackup,
    t.featureExportData,
  ];

  const faqs = [
    { q: t.faqQ1, a: t.faqA1 },
    { q: t.faqQ2, a: t.faqA2 },
    { q: t.faqQ3, a: t.faqA3 },
  ];

  async function handleUpgradeToPro() {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    try {
      const res = await preparePayment({
        planType: "PRO",
        billingCycle: isYearly ? "YEARLY" : "MONTHLY",
      });

      if (!res.success || !res.data) {
        throw new Error(t.paymentFailed);
      }

      const paymentRes = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        paymentId: res.data.paymentId,
        orderName: res.data.orderName,
        totalAmount: res.data.amount,
        currency: portoneCurrency as Parameters<
          typeof PortOne.requestPayment
        >[0]["currency"],
        payMethod: "CARD",
        customer: {
          fullName: user.name,
          email: user.email,
          phoneNumber: "01000000000",
        },
      });

      if (paymentRes?.code != null) {
        await cancelPayment({ paymentId: res.data.paymentId });
        throw new Error(paymentRes.message ?? t.paymentFailed);
      }

      await completePayment({ paymentId: res.data.paymentId });

      router.push("/diary/account");
    } catch (err) {
      const apiError = err as ApiError;
      setPaymentError(apiError.message || t.paymentFailed);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-8 sm:px-6 lg:px-8 text-center">
        <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
          {t.choosePlan}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.choosePlanDesc}
        </p>

        {/* Billing Toggle */}
        <div className="relative mt-8 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
          >
            {t.monthly}
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isYearly ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                isYearly ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
          >
            {t.yearly}
          </span>
          {isYearly && (
            <span className="absolute left-[calc(50%+4.5rem)] rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {t.savePercent.replace("{percent}", String(savePercent))}
            </span>
          )}
        </div>
      </section>

      {/* Plan Cards */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Free Plan */}
          <Card className="relative border-border">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-2xl">{t.free}</CardTitle>
              <CardDescription>
                {language === "en"
                  ? "Perfect for getting started"
                  : "시작하기에 완벽합니다"}
              </CardDescription>
              <div className="mt-4">
                <span className="font-serif text-4xl font-bold text-foreground">
                  ₩0
                </span>
                <span className="text-muted-foreground">{t.perMonth}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/register")}
              >
                {t.getStartedFree}
              </Button>
              <ul className="space-y-3 pt-2">
                {freePlanFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-2xl">{t.pro}</CardTitle>
              <CardDescription>
                {language === "en"
                  ? "For power users who want it all"
                  : "모든 기능을 원하는 사용자를 위해"}
              </CardDescription>
              <div className="mt-4">
                <span className="font-serif text-4xl font-bold text-foreground">
                  ₩
                  {(isYearly ? yearlyPrice : monthlyPrice).toLocaleString(
                    "ko-KR",
                  )}
                </span>
                <span className="text-muted-foreground">
                  {isYearly ? t.perYear : t.perMonth}
                </span>
                {isYearly && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {language === "en"
                      ? `₩${yearlyMonthlyEquiv.toLocaleString("ko-KR")} / month`
                      : `월 ₩${yearlyMonthlyEquiv.toLocaleString("ko-KR")} 상당`}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAlreadyPro ? (
                <Button variant="outline" className="w-full" disabled>
                  {t.currentPlan}
                </Button>
              ) : (
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleUpgradeToPro}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      {t.paymentProcessing}
                    </span>
                  ) : (
                    t.upgradeToPro
                  )}
                </Button>
              )}
              {paymentError && (
                <p className="text-sm text-destructive text-center">
                  {paymentError}
                </p>
              )}
              <ul className="space-y-3 pt-2">
                {proPlanFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-secondary/30 border-y border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-semibold text-foreground text-center mb-8">
            {t.faqTitle}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-medium text-foreground">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
}
