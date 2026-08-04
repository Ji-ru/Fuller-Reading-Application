export function toDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`; // YYYYMMDD (lexicographically sortable)
  }

  export function parseDateKey(key: string): Date {
    const y = Number(key.slice(0, 4));
    const m = Number(key.slice(4, 6)) - 1;
    const d = Number(key.slice(6, 8));
    return new Date(y, m, d);
  }

  export function displayDateFromKey(key: string): string {
    const date = parseDateKey(key);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  