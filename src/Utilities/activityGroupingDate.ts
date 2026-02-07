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
  
    // year
    return date.toLocaleDateString('en-US', { month: 'short' });
  }
  
  export function getPeriods(range: 'week' | 'month' | 'year'): number {
    if (range === 'week') return 7;
    if (range === 'month') return 4; // average reporting weeks
    return 12;
  }
  