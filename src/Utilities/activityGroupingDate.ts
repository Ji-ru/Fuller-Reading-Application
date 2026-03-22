import { getDateRangeForTimeFilter } from './dateRange';
import { FilterOptions } from '../Interfaces/miscue';

export function getLabelForDate(
  date: Date,
  range: 'week' | 'month' | 'year',
): string {
  if (range === 'week') {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  if (range === 'month') {
    const day = date.getDate();
    const weekOfMonth = Math.ceil(day / 7);
    return `Week ${weekOfMonth}`;
  }

  // year: use "Mon 'YY" for unique labels across 12-month range
  const short = date.toLocaleDateString('en-US', { month: 'short' });
  const yr = String(date.getFullYear()).slice(-2);
  return `${short} '${yr}`;
}

export function getPeriods(range: 'week' | 'month' | 'year'): number {
  if (range === 'week') return 7;
  if (range === 'month') return 5; // months can span up to 5 weeks
  return 15; // school year: Jun through Aug next year (15 months)
}

/** Returns all period labels for the given time range (for filling charts with empty data) */
export function getPeriodLabels(timeRange: 'week' | 'month' | 'year'): string[] {
  if (timeRange === 'week') {
    const { start, end } = getDateRangeForTimeFilter('week');
    const labels: string[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      labels.push(curr.toLocaleDateString('en-US', { weekday: 'short' }));
      curr.setDate(curr.getDate() + 1);
    }
    return labels;
  }

  if (timeRange === 'month') {
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
  }

  // year: iterate from start to end by month (last 12 months)
  const { start, end } = getDateRangeForTimeFilter('year');
  const labels: string[] = [];
  const curr = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (curr <= endMonth) {
    const short = curr.toLocaleDateString('en-US', { month: 'short' });
    const yr = String(curr.getFullYear()).slice(-2); // e.g. "24"
    labels.push(`${short} '${yr}`);
    curr.setMonth(curr.getMonth() + 1);
  }
  return labels;
}

/**
 * Converts an acadYear string like "2025-2026" into a Date range.
 * School year runs June 1 (start year) → May 31 (end year).
 * Returns null if the string is missing or malformed.
 */
export const getDateRangeForAcadYear = (
  acadYear?: string,
): { start: Date; end: Date } | null => {
  if (!acadYear) return null;

  const match = acadYear.match(/^(\d{4})-(\d{4})$/);
  if (!match) return null;

  const startYear = parseInt(match[1], 10);
  const endYear   = parseInt(match[2], 10);

  return {
    start: new Date(startYear, 5, 1, 0, 0, 0, 0),          // June 1
    end:   new Date(endYear,   4, 31, 23, 59, 59, 999),     // May 31
  };
};

/**
 * Resolves the effective date range from a FilterOptions object.
 * Explicit startDate/endDate take priority over acadYear.
 */
export const resolveDateRange = (
  filter?: FilterOptions,
): { start: Date; end: Date } | null => {
  if (filter?.startDate && filter?.endDate) {
    return { start: filter.startDate, end: filter.endDate };
  }
  return getDateRangeForAcadYear(filter?.acadYear);
};

/**
 * Filters an array of reports to those whose createdAt falls within the range.
 * If no range is provided every report passes through.
 */
export const filterReportsByDateRange = <T extends { createdAt: any }>(
  reports: T[],
  range: { start: Date; end: Date } | null,
): T[] => {
  if (!range) return reports;

  return reports.filter(report => {
    try {
      let date: Date;
      if (report.createdAt?.toDate)            date = report.createdAt.toDate();
      else if (report.createdAt?.seconds)      date = new Date(report.createdAt.seconds * 1000);
      else if (report.createdAt instanceof Date) date = report.createdAt;
      else                                     return false;

      return date >= range.start && date <= range.end;
    } catch {
      return false;
    }
  });
};
  