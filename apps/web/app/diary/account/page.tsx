"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  User,
  Lock,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Crown,
  Receipt,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-toggle";
import { translations } from "@/lib/translations";
import {
  getMe,
  updateName,
  updatePassword,
  deleteAccount,
} from "@/lib/user-store";
import { getSubscription, cancelSubscription } from "@/lib/subscription-store";
import { getPaymentHistory } from "@/lib/payment-store";
import { ApiError } from "@/lib/api";
import {
  UserData,
  SubscriptionResponse,
  PaymentHistoryItem,
} from "@repo/types";

export default function AccountPage() {
  const { user, isLoading, logout, setUser } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();

  // Profile state
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Payment history filter state
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  // Name change state
  const [newName, setNewName] = useState("");
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Subscription state
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(
    null,
  );
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Cancel subscription state
  const [showCancelSubConfirm, setShowCancelSubConfirm] = useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] =
    useState(false);
  const [cancelSubError, setCancelSubError] = useState("");
  const [cancelSubSuccess, setCancelSubSuccess] = useState(false);

  // Payment history state
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [paymentNextCursor, setPaymentNextCursor] = useState<string | null>(
    null,
  );
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const t = translations[language];

  // Fetch user profile and subscription on mount
  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      try {
        const response = await getMe();
        if (response.data) {
          setUserProfile(response.data);
        }
      } catch (error) {
        const apiError = error as ApiError;
        console.error("Failed to fetch profile:", apiError.message);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    async function fetchSubscription() {
      setIsLoadingSubscription(true);
      try {
        const res = await getSubscription();
        if (res.success && res.data) {
          setSubscription(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      } finally {
        setIsLoadingSubscription(false);
      }
    }

    fetchProfile();
    fetchSubscription();
  }, [user]);

  // Fetch payment history when year changes
  useEffect(() => {
    if (!user) return;

    async function fetchPayments() {
      setIsLoadingPayments(true);
      setPayments([]);
      setPaymentNextCursor(null);
      try {
        const res = await getPaymentHistory({ year: selectedYear });
        if (res.success && res.data) {
          setPayments(res.data.items);
          setPaymentNextCursor(res.data.nextCursor);
        }
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setIsLoadingPayments(false);
      }
    }

    fetchPayments();
  }, [user, selectedYear]);

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setNameSuccess(false);

    if (!user || !newName.trim()) return;

    setIsUpdatingName(true);
    try {
      const response = await updateName({ name: newName.trim() });
      if (response.success && response.data) {
        setNameSuccess(true);
        setNewName("");
        setUserProfile(response.data);
        setUser({ ...user, name: response.data.name });
        setTimeout(() => setNameSuccess(false), 3000);
      }
    } catch (error) {
      const apiError = error as ApiError;
      setNameError(apiError.message);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!user) return;

    if (newPasswordValue !== confirmPassword) {
      setPasswordError(t.passwordsDoNotMatch);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await updatePassword({
        currentPassword,
        newPassword: newPasswordValue,
      });
      if (response.success) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPasswordValue("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (error) {
      const apiError = error as ApiError;
      setPasswordError(apiError.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError("");

    if (!user) return;

    setIsDeletingAccount(true);
    try {
      const response = await deleteAccount({ password: deletePassword });
      if (response.success) {
        await logout();
        router.push("/");
      }
    } catch (error) {
      const apiError = error as ApiError;
      setDeleteError(apiError.message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancellingSubscription(true);
    setCancelSubError("");
    try {
      const res = await cancelSubscription();
      if (res.success) {
        setCancelSubSuccess(true);
        setShowCancelSubConfirm(false);
        const updated = await getSubscription();
        if (updated.success && updated.data) {
          setSubscription(updated.data);
        }
      }
    } catch (err) {
      const apiError = err as ApiError;
      setCancelSubError(apiError.message);
    } finally {
      setIsCancellingSubscription(false);
    }
  };

  const handleLoadMore = async () => {
    if (!paymentNextCursor) return;
    setIsLoadingMore(true);
    try {
      const res = await getPaymentHistory({
        year: selectedYear,
        cursor: paymentNextCursor,
      });
      if (res.success && res.data) {
        setPayments((prev) => [...prev, ...res.data!.items]);
        setPaymentNextCursor(res.data.nextCursor);
      }
    } catch (error) {
      console.error("Failed to load more payments:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

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

  // Format date
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString(language === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Year options for filter
  const currentYear = new Date().getFullYear();
  const memberYear = userProfile?.createdAt
    ? new Date(userProfile.createdAt).getFullYear()
    : currentYear;
  const yearOptions: number[] = [];
  for (let y = currentYear; y >= memberYear; y--) {
    yearOptions.push(y);
  }

  const getStatusLabel = (
    status: SubscriptionResponse["status"] | undefined,
  ) => {
    if (!status) return t.statusNone;
    switch (status) {
      case "ACTIVE":
        return t.statusActive;
      case "CANCELLED":
        return t.statusCancelled;
      case "EXPIRED":
        return t.statusExpired;
      case "INACTIVE":
        return t.statusInactive;
      default:
        return t.statusNone;
    }
  };

  const getStatusBadgeClass = (
    status: SubscriptionResponse["status"] | undefined,
  ) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "CANCELLED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "EXPIRED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPaymentStatusLabel = (status: PaymentHistoryItem["status"]) => {
    switch (status) {
      case "PAID":
        return t.paymentStatusPaid;
      case "PENDING":
        return t.paymentStatusPending;
      case "FAILED":
        return t.paymentStatusFailed;
      case "CANCELLED":
        return t.paymentStatusCancelled;
      case "REFUNDED":
        return t.paymentStatusRefunded;
      default:
        return status;
    }
  };

  const getPaymentStatusClass = (status: PaymentHistoryItem["status"]) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const isPro = subscription?.plan === "PRO";
  const isActiveSubscription = subscription?.status === "ACTIVE";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/diary"
          className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t.backToDiary}</span>
        </Link>

        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">
          {t.accountSettings}
        </h1>

        <div className="space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t.userInformation}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t.name}</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.email}</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">
                    {t.memberSince}
                  </p>
                  {isLoadingProfile ? (
                    <div className="h-5 w-24 animate-pulse bg-muted rounded" />
                  ) : (
                    <p className="font-medium">
                      {userProfile?.createdAt
                        ? formatDate(userProfile.createdAt)
                        : "-"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Name */}
          <Card>
            <CardHeader>
              <CardTitle>{t.changeName}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNameChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newName">{t.newName}</Label>
                  <Input
                    id="newName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={user.name}
                    required
                  />
                </div>
                {nameError && (
                  <p className="text-sm text-destructive">{nameError}</p>
                )}
                {nameSuccess && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {t.nameUpdated}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={isUpdatingName}
                  className="flex items-center gap-2"
                >
                  {isUpdatingName && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                  {isUpdatingName ? "Updating..." : t.updateName}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t.changePassword}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t.newPassword}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">
                    {t.confirmNewPassword}
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {t.passwordUpdated}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex items-center gap-2"
                >
                  {isUpdatingPassword && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                  {isUpdatingPassword ? "Updating..." : t.updatePassword}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                {t.currentSubscription}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t.plan}</p>
                  {isLoadingSubscription ? (
                    <div className="h-5 w-16 animate-pulse bg-muted rounded mt-1" />
                  ) : (
                    <p className="font-medium">{isPro ? t.pro : t.free}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.status}</p>
                  {isLoadingSubscription ? (
                    <div className="h-5 w-20 animate-pulse bg-muted rounded mt-1" />
                  ) : (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(subscription?.status)}`}
                    >
                      {getStatusLabel(subscription?.status)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.expiresOn}</p>
                  {isLoadingSubscription ? (
                    <div className="h-5 w-24 animate-pulse bg-muted rounded mt-1" />
                  ) : (
                    <p className="font-medium text-muted-foreground">
                      {subscription?.endDate
                        ? formatDate(subscription.endDate)
                        : "-"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.videoConversionsLeft}
                  </p>
                  {isLoadingSubscription ? (
                    <div className="h-5 w-12 animate-pulse bg-muted rounded mt-1" />
                  ) : (
                    <p className="font-medium text-muted-foreground">
                      {subscription?.videoConversionRemaining ?? "-"}
                    </p>
                  )}
                </div>
              </div>

              {cancelSubSuccess && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {t.subscriptionCancelled}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                {(!isPro || (isPro && !isActiveSubscription)) && (
                  <Link href="/pricing">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      {t.upgradePlan}
                    </Button>
                  </Link>
                )}

                {isPro && isActiveSubscription && !showCancelSubConfirm && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelSubConfirm(true)}
                  >
                    {t.cancelSubscription}
                  </Button>
                )}
              </div>

              {showCancelSubConfirm && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      {t.cancelSubscriptionWarning}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.confirmCancelSubscription}
                  </p>
                  {cancelSubError && (
                    <p className="text-sm text-destructive">{cancelSubError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isCancellingSubscription}
                      onClick={() => {
                        setShowCancelSubConfirm(false);
                        setCancelSubError("");
                      }}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={isCancellingSubscription}
                      onClick={handleCancelSubscription}
                      className="flex items-center gap-2"
                    >
                      {isCancellingSubscription && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      )}
                      {t.cancelSubscription}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  {t.paymentHistory}
                </CardTitle>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="appearance-none rounded-md border border-border bg-background px-3 py-1.5 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <div className="grid grid-cols-3 gap-4 border-b border-border bg-muted/50 px-4 py-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.date}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.amount}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.paymentStatus}
                  </p>
                </div>

                {isLoadingPayments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">
                      {t.noPaymentHistory}
                    </p>
                  </div>
                ) : (
                  <>
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="grid grid-cols-3 gap-4 border-b border-border px-4 py-3 last:border-0"
                      >
                        <p className="text-sm">
                          {formatDate(payment.paidAt ?? payment.createdAt)}
                        </p>
                        <p className="text-sm">
                          ₩{payment.amount.toLocaleString("ko-KR")}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium w-fit ${getPaymentStatusClass(payment.status)}`}
                        >
                          {getPaymentStatusLabel(payment.status)}
                        </span>
                      </div>
                    ))}
                    {paymentNextCursor && (
                      <div className="flex justify-center py-3 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          className="flex items-center gap-2"
                        >
                          {isLoadingMore && (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          )}
                          {t.loadMore}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cancel Membership */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                {t.cancelMembership}
              </CardTitle>
              <CardDescription className="text-destructive/80">
                {t.cancelMembershipWarning}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  {t.deleteAccount}
                </Button>
              ) : (
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <p className="text-sm text-destructive">
                      {t.cancelMembershipWarning}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deletePassword">{t.confirmPassword}</Label>
                    <Input
                      id="deletePassword"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      required
                    />
                  </div>
                  {deleteError && (
                    <p className="text-sm text-destructive">{deleteError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isDeletingAccount}
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword("");
                        setDeleteError("");
                      }}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={isDeletingAccount}
                      className="flex items-center gap-2"
                    >
                      {isDeletingAccount && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      )}
                      {isDeletingAccount ? "Deleting..." : t.deleteAccount}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
