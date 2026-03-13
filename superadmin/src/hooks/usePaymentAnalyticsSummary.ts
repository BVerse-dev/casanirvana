"use client";

import { useMemo } from "react";

import { useListPaymentObligations, useListPayments } from "@/hooks/usePayments";

type PaymentRecord = Record<string, any>;
type ObligationRecord = Record<string, any>;

type TimeFilter = "week" | "month" | "year";

type StatusCounts = {
  completed: number;
  inFlight: number;
  failed: number;
  open: number;
};

export type PaymentCategoryMetric = {
  key: string;
  label: string;
  amount: number;
  percentage: number;
};

export type PaymentTrendPoint = {
  label: string;
  collected: number;
  outstanding: number;
};

export type PaymentAnalyticsSummary = {
  payments: PaymentRecord[];
  obligations: ObligationRecord[];
  isLoading: boolean;
  error: Error | null;
  statusCounts: StatusCounts;
  totalRevenue: number;
  totalTransactions: number;
  completedTransactions: number;
  inFlightTransactions: number;
  failedTransactions: number;
  averageCompletedPayment: number;
  collectionRateByCount: number;
  collectionRateByAmount: number;
  currentMonthCollected: number;
  currentMonthOutstanding: number;
  currentMonthDueTotal: number;
  currentMonthProgress: number;
  monthlyTrend: PaymentTrendPoint[];
  weeklyTrend: PaymentTrendPoint[];
  yearlyTrend: PaymentTrendPoint[];
  currentMonthGrowthRate: number | null;
  categories: PaymentCategoryMetric[];
  recentTransactions: PaymentRecord[];
};

const COMPLETED_STATUSES = new Set(["completed", "paid", "success", "successful"]);
const FAILED_STATUSES = new Set(["failed", "cancelled", "canceled", "expired", "rejected"]);
const IN_FLIGHT_STATUSES = new Set(["initiated", "processing", "pending"]);
const OPEN_OBLIGATION_STATUSES = new Set(["unpaid", "partially_paid", "overdue"]);

const asNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const startOfDay = (value: Date) => {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
};

const sameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const sameMonth = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

const getRecordDate = (record: PaymentRecord | ObligationRecord) => {
  const raw =
    record.payment_date ||
    record.paid_at ||
    record.completed_at ||
    record.initiated_at ||
    record.due_date ||
    record.created_at;

  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizePaymentStatus = (status?: string | null) => {
  const normalized = String(status || "").trim().toLowerCase();

  if (COMPLETED_STATUSES.has(normalized)) return "completed" as const;
  if (FAILED_STATUSES.has(normalized)) return "failed" as const;
  if (IN_FLIGHT_STATUSES.has(normalized)) return "inFlight" as const;
  return "open" as const;
};

const normalizeObligationStatus = (status?: string | null) =>
  OPEN_OBLIGATION_STATUSES.has(String(status || "").trim().toLowerCase());

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short" });

const formatYearLabel = (date: Date) => date.getFullYear().toString();

const getMonthlyTrend = (payments: PaymentRecord[], obligations: ObligationRecord[]) => {
  const now = new Date();
  const monthlyTrend: PaymentTrendPoint[] = [];

  for (let offset = 11; offset >= 0; offset -= 1) {
    const bucketDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const collected = payments.reduce((sum, payment) => {
      const paymentDate = getRecordDate(payment);
      if (!paymentDate || !sameMonth(paymentDate, bucketDate)) return sum;
      return normalizePaymentStatus(payment.status) === "completed" ? sum + asNumber(payment.amount) : sum;
    }, 0);

    const outstanding = obligations.reduce((sum, obligation) => {
      const dueDate = getRecordDate(obligation);
      if (!dueDate || !sameMonth(dueDate, bucketDate)) return sum;
      return normalizeObligationStatus(obligation.status) ? sum + asNumber(obligation.amount) : sum;
    }, 0);

    monthlyTrend.push({
      label: formatMonthLabel(bucketDate),
      collected,
      outstanding,
    });
  }

  return monthlyTrend;
};

const getWeeklyTrend = (payments: PaymentRecord[], obligations: ObligationRecord[]) => {
  const today = startOfDay(new Date());
  const weeklyTrend: PaymentTrendPoint[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const bucketDate = new Date(today);
    bucketDate.setDate(today.getDate() - offset);

    const collected = payments.reduce((sum, payment) => {
      const paymentDate = getRecordDate(payment);
      if (!paymentDate || !sameDay(startOfDay(paymentDate), bucketDate)) return sum;
      return normalizePaymentStatus(payment.status) === "completed" ? sum + asNumber(payment.amount) : sum;
    }, 0);

    const outstanding = obligations.reduce((sum, obligation) => {
      const dueDate = getRecordDate(obligation);
      if (!dueDate || !sameDay(startOfDay(dueDate), bucketDate)) return sum;
      return normalizeObligationStatus(obligation.status) ? sum + asNumber(obligation.amount) : sum;
    }, 0);

    weeklyTrend.push({
      label: bucketDate.toLocaleDateString("en-US", { weekday: "short" }),
      collected,
      outstanding,
    });
  }

  return weeklyTrend;
};

const getYearlyTrend = (payments: PaymentRecord[], obligations: ObligationRecord[]) => {
  const currentYear = new Date().getFullYear();
  const yearlyTrend: PaymentTrendPoint[] = [];

  for (let offset = 2; offset >= 0; offset -= 1) {
    const year = currentYear - offset;
    const bucketDate = new Date(year, 0, 1);

    const collected = payments.reduce((sum, payment) => {
      const paymentDate = getRecordDate(payment);
      if (!paymentDate || paymentDate.getFullYear() !== year) return sum;
      return normalizePaymentStatus(payment.status) === "completed" ? sum + asNumber(payment.amount) : sum;
    }, 0);

    const outstanding = obligations.reduce((sum, obligation) => {
      const dueDate = getRecordDate(obligation);
      if (!dueDate || dueDate.getFullYear() !== year) return sum;
      return normalizeObligationStatus(obligation.status) ? sum + asNumber(obligation.amount) : sum;
    }, 0);

    yearlyTrend.push({
      label: formatYearLabel(bucketDate),
      collected,
      outstanding,
    });
  }

  return yearlyTrend;
};

const getCurrentTrend = (timeFilter: TimeFilter, summary: PaymentAnalyticsSummary) => {
  if (timeFilter === "week") return summary.weeklyTrend;
  if (timeFilter === "year") return summary.yearlyTrend;
  return summary.monthlyTrend;
};

const CATEGORY_RULES: Array<{ key: string; label: string; test: (value: string) => boolean }> = [
  {
    key: "maintenance",
    label: "Maintenance",
    test: (value) => value.includes("maintenance") || value.includes("repair"),
  },
  {
    key: "rent",
    label: "Rent",
    test: (value) => value.includes("rent") || value.includes("lease"),
  },
  {
    key: "utilities",
    label: "Utilities",
    test: (value) =>
      value.includes("utility") ||
      value.includes("electric") ||
      value.includes("water") ||
      value.includes("gas") ||
      value.includes("internet"),
  },
  {
    key: "security",
    label: "Security",
    test: (value) => value.includes("security") || value.includes("guard"),
  },
  {
    key: "amenity",
    label: "Amenities",
    test: (value) => value.includes("amenity") || value.includes("booking"),
  },
];

const normalizeCategory = (payment: PaymentRecord) => {
  const haystack = [
    payment.payment_type,
    payment.title,
    payment.description,
    payment.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const match = CATEGORY_RULES.find((rule) => rule.test(haystack));
  return match || { key: "other", label: "Other" };
};

const buildCategories = (payments: PaymentRecord[]) => {
  const completedPayments = payments.filter(
    (payment) => normalizePaymentStatus(payment.status) === "completed"
  );
  const totalCompletedAmount = completedPayments.reduce(
    (sum, payment) => sum + asNumber(payment.amount),
    0
  );

  const grouped = completedPayments.reduce<Record<string, PaymentCategoryMetric>>((acc, payment) => {
    const category = normalizeCategory(payment);
    const current = acc[category.key] || {
      key: category.key,
      label: category.label,
      amount: 0,
      percentage: 0,
    };

    current.amount += asNumber(payment.amount);
    acc[category.key] = current;
    return acc;
  }, {});

  return Object.values(grouped)
    .map((category) => ({
      ...category,
      percentage:
        totalCompletedAmount > 0 ? (category.amount / totalCompletedAmount) * 100 : 0,
    }))
    .sort((left, right) => right.amount - left.amount);
};

export const usePaymentAnalyticsSummary = (): PaymentAnalyticsSummary => {
  const paymentsQuery = useListPayments();
  const obligationsQuery = useListPaymentObligations();

  const payments = paymentsQuery.data || [];
  const obligations = obligationsQuery.data || [];

  return useMemo(() => {
    const queryError =
      paymentsQuery.error instanceof Error
        ? paymentsQuery.error
        : obligationsQuery.error instanceof Error
          ? obligationsQuery.error
          : paymentsQuery.error || obligationsQuery.error
            ? new Error("Failed to load payment analytics")
            : null;

    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const statusCounts = payments.reduce<StatusCounts>(
      (acc, payment) => {
        const normalizedStatus = normalizePaymentStatus(payment.status);
        acc[normalizedStatus] += 1;
        return acc;
      },
      {
        completed: 0,
        inFlight: 0,
        failed: 0,
        open: 0,
      }
    );

    const totalRevenue = payments.reduce((sum, payment) => {
      return normalizePaymentStatus(payment.status) === "completed"
        ? sum + asNumber(payment.amount)
        : sum;
    }, 0);

    const completedTransactions = statusCounts.completed;
    const totalTransactions = payments.length;
    const inFlightTransactions = statusCounts.inFlight + statusCounts.open;
    const failedTransactions = statusCounts.failed;
    const averageCompletedPayment =
      completedTransactions > 0 ? totalRevenue / completedTransactions : 0;

    const totalAmount = payments.reduce((sum, payment) => sum + asNumber(payment.amount), 0);
    const collectionRateByCount =
      totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;
    const collectionRateByAmount =
      totalAmount > 0 ? (totalRevenue / totalAmount) * 100 : 0;

    const currentMonthCollected = payments.reduce((sum, payment) => {
      const paymentDate = getRecordDate(payment);
      if (!paymentDate || !sameMonth(paymentDate, now)) return sum;
      return normalizePaymentStatus(payment.status) === "completed"
        ? sum + asNumber(payment.amount)
        : sum;
    }, 0);

    const currentMonthOutstanding = obligations.reduce((sum, obligation) => {
      const dueDate = getRecordDate(obligation);
      if (!dueDate || !sameMonth(dueDate, now)) return sum;
      return normalizeObligationStatus(obligation.status)
        ? sum + asNumber(obligation.amount)
        : sum;
    }, 0);

    const currentMonthDueTotal =
      currentMonthOutstanding > 0 ? currentMonthCollected + currentMonthOutstanding : currentMonthCollected;
    const currentMonthProgress =
      currentMonthDueTotal > 0 ? (currentMonthCollected / currentMonthDueTotal) * 100 : 0;

    const previousMonthCollected = payments.reduce((sum, payment) => {
      const paymentDate = getRecordDate(payment);
      if (!paymentDate || !sameMonth(paymentDate, previousMonth)) return sum;
      return normalizePaymentStatus(payment.status) === "completed"
        ? sum + asNumber(payment.amount)
        : sum;
    }, 0);

    const currentMonthGrowthRate =
      previousMonthCollected > 0
        ? ((currentMonthCollected - previousMonthCollected) / previousMonthCollected) * 100
        : null;

    const monthlyTrend = getMonthlyTrend(payments, obligations);
    const weeklyTrend = getWeeklyTrend(payments, obligations);
    const yearlyTrend = getYearlyTrend(payments, obligations);
    const categories = buildCategories(payments);

    const recentTransactions = [...payments]
      .sort((left, right) => {
        const leftDate = getRecordDate(left)?.getTime() || 0;
        const rightDate = getRecordDate(right)?.getTime() || 0;
        return rightDate - leftDate;
      })
      .slice(0, 8);

    return {
      payments,
      obligations,
      isLoading: paymentsQuery.isLoading || obligationsQuery.isLoading,
      error: queryError,
      statusCounts,
      totalRevenue,
      totalTransactions,
      completedTransactions,
      inFlightTransactions,
      failedTransactions,
      averageCompletedPayment,
      collectionRateByCount,
      collectionRateByAmount,
      currentMonthCollected,
      currentMonthOutstanding,
      currentMonthDueTotal,
      currentMonthProgress,
      monthlyTrend,
      weeklyTrend,
      yearlyTrend,
      currentMonthGrowthRate,
      categories,
      recentTransactions,
    };
  }, [
    obligations,
    obligationsQuery.isLoading,
    obligationsQuery.error,
    payments,
    paymentsQuery.isLoading,
    paymentsQuery.error,
  ]);
};

export const usePaymentTrend = (timeFilter: TimeFilter) => {
  const summary = usePaymentAnalyticsSummary();
  const trend = getCurrentTrend(timeFilter, summary);

  return {
    ...summary,
    trend,
  };
};
