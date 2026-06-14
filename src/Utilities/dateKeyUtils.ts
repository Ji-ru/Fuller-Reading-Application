export function displayDateFromKey(dateKey: string): string {
  if (!/^\d{8}$/.test(dateKey)) return dateKey;
  const year = dateKey.slice(0, 4);
  const month = dateKey.slice(4, 6);
  const day = dateKey.slice(6, 8);

  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
}
