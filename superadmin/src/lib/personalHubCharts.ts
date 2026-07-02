import { PersonalHubReportTransaction, PersonalHubReportsPeriod } from '@/hooks/usePersonalHubReports';

type BucketUnit = 'day' | 'week' | 'month';

type Bucket = {
  key: string;
  label: string;
  date: Date;
};

const PERIOD_CONFIG: Record<PersonalHubReportsPeriod, { count: number; unit: BucketUnit }> = {
  '7': { count: 7, unit: 'day' },
  '30': { count: 30, unit: 'day' },
  '90': { count: 13, unit: 'week' },
  '365': { count: 12, unit: 'month' },
};

const startOfDay = (value: Date) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfWeek = (value: Date) => {
  const date = startOfDay(value);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);
  return date;
};

const startOfMonth = (value: Date) => new Date(value.getFullYear(), value.getMonth(), 1);

const addUnit = (value: Date, unit: BucketUnit, amount: number) => {
  const date = new Date(value);

  if (unit === 'day') {
    date.setDate(date.getDate() + amount);
    return date;
  }

  if (unit === 'week') {
    date.setDate(date.getDate() + amount * 7);
    return date;
  }

  date.setMonth(date.getMonth() + amount);
  return date;
};

const formatBucketLabel = (value: Date, unit: BucketUnit) => {
  if (unit === 'month') {
    return value.toLocaleString('en-GH', { month: 'short' });
  }

  return value.toLocaleDateString('en-GH', {
    month: 'short',
    day: 'numeric',
  });
};

const normalizeBucketDate = (value: Date, unit: BucketUnit) => {
  if (unit === 'day') {
    return startOfDay(value);
  }

  if (unit === 'week') {
    return startOfWeek(value);
  }

  return startOfMonth(value);
};

export const buildPeriodBuckets = (period: PersonalHubReportsPeriod): Bucket[] => {
  const { count, unit } = PERIOD_CONFIG[period];
  const now = new Date();
  const end = normalizeBucketDate(now, unit);
  const start = addUnit(end, unit, -(count - 1));

  return Array.from({ length: count }, (_, index) => {
    const date = addUnit(start, unit, index);
    return {
      key: date.toISOString().slice(0, 10),
      label: formatBucketLabel(date, unit),
      date,
    };
  });
};

export const getBucketKey = (value: string | null, period: PersonalHubReportsPeriod) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const normalized = normalizeBucketDate(parsed, PERIOD_CONFIG[period].unit);
  return normalized.toISOString().slice(0, 10);
};

export const buildSeriesByBucket = <T extends string>({
  transactions,
  period,
  groups,
  getGroupKey,
  getValue = () => 1,
}: {
  transactions: PersonalHubReportTransaction[];
  period: PersonalHubReportsPeriod;
  groups: T[];
  getGroupKey: (transaction: PersonalHubReportTransaction) => T | null;
  getValue?: (transaction: PersonalHubReportTransaction) => number;
}) => {
  const buckets = buildPeriodBuckets(period);
  const bucketIndex = new Map(buckets.map((bucket, index) => [bucket.key, index]));
  const seriesMap = new Map<T, number[]>(groups.map((group) => [group, Array(buckets.length).fill(0)]));

  for (const transaction of transactions) {
    const bucketKey = getBucketKey(transaction.created_at, period);
    const groupKey = getGroupKey(transaction);
    if (!bucketKey || !groupKey) {
      continue;
    }

    const index = bucketIndex.get(bucketKey);
    const series = seriesMap.get(groupKey);
    if (typeof index !== 'number' || !series) {
      continue;
    }

    series[index] += getValue(transaction);
  }

  return {
    categories: buckets.map((bucket) => bucket.label),
    series: groups.map((group) => ({
      name: group,
      data: seriesMap.get(group) || Array(buckets.length).fill(0),
    })),
  };
};

export const groupTransactions = <T extends string>({
  transactions,
  groups,
  getGroupKey,
  getValue = () => 1,
}: {
  transactions: PersonalHubReportTransaction[];
  groups: T[];
  getGroupKey: (transaction: PersonalHubReportTransaction) => T | null;
  getValue?: (transaction: PersonalHubReportTransaction) => number;
}) => {
  const totals = new Map<T, number>(groups.map((group) => [group, 0]));

  for (const transaction of transactions) {
    const groupKey = getGroupKey(transaction);
    if (!groupKey || !totals.has(groupKey)) {
      continue;
    }

    totals.set(groupKey, (totals.get(groupKey) || 0) + getValue(transaction));
  }

  return groups.map((group) => ({
    key: group,
    value: totals.get(group) || 0,
  }));
};

export const formatCurrencyCompact = (value: number) => {
  if (value >= 1_000_000) {
    return `GH₵${(value / 1_000_000).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `GH₵${(value / 1_000).toFixed(1)}K`;
  }

  return `GH₵${value.toLocaleString('en-GH', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;
