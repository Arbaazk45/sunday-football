export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function toSundayId(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Next Sunday from today (includes today if today is Sunday). */
export function getUpcomingSunday(from: Date = new Date()): Date {
  const result = new Date(from);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  if (day !== 0) {
    result.setDate(result.getDate() + daysUntilSunday);
  }
  return result;
}