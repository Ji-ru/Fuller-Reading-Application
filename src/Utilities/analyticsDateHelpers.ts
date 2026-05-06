export type TimeFilterType = 'week' | 'month' | 'year';

export function getDateRange(
  filter: TimeFilterType,
  offset: number,
): { start: Date; end: Date } {
  const now = new Date();

  if (filter === 'week') {
    // Current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const currentDayStr = now.getDay();
    // Calculate difference to Monday (if Sunday, treating it as day 7 of previous week)
    const diffToMonday = currentDayStr === 0 ? 6 : currentDayStr - 1;
    
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday - (offset * 7));
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  if (filter === 'month') {
    const ref = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return {
      start: new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0),
      end: new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }

  // Academic year: Jun 1 – Mar 31
  let sy = now.getFullYear();
  if (now.getMonth() < 5) sy--;
  sy -= offset;
  return {
    start: new Date(sy, 5, 1, 0, 0, 0, 0),
    end: new Date(sy + 1, 2, 31, 23, 59, 59, 999),
  };
}

export function getRangeLabel(filter: TimeFilterType, offset: number): string {
  const { start, end } = getDateRange(filter, offset);

  if (filter === 'week') {
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
  }

  if (filter === 'month') {
    return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  return `SY ${start.getFullYear()}–${end.getFullYear()}`;
}
