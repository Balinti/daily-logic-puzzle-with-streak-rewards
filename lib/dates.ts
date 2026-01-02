/**
 * Date utilities for RuleGrid
 */

/**
 * Get today's date in YYYY-MM-DD format for a given timezone
 */
export function getTodayInTimezone(timezone: string = 'UTC'): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(now); // Returns YYYY-MM-DD
}

/**
 * Get today's date in UTC (YYYY-MM-DD)
 */
export function getTodayUTC(): string {
  return getTodayInTimezone('UTC');
}

/**
 * Parse YYYY-MM-DD string to Date object
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z');
}

/**
 * Format Date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get date N days ago
 */
export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
}

/**
 * Check if date is within last N days
 */
export function isWithinDays(dateStr: string, days: number): boolean {
  const date = parseDate(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);

  return date >= cutoff;
}

/**
 * Get date range for archive queries
 */
export function getArchiveDateRange(
  days: number
): { from: string; to: string } {
  const to = getTodayUTC();
  const from = getDaysAgo(days - 1);
  return { from, to };
}
