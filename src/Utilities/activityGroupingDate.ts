import { getDateRangeForTimeFilter } from './dateRange';

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
  