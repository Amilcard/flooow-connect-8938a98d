/**
 * Timezone-safe date utilities
 *
 * Problem: toISOString() converts to UTC, causing date shifts in local timezones
 * Example: 2026-01-07 00:00 in UTC+1 → "2026-01-06T23:00:00.000Z" → wrong date!
 *
 * Solution: Use local date methods to avoid timezone conversion issues
 */

/**
 * Format a Date to YYYY-MM-DD string using LOCAL timezone
 * (Not UTC - avoids date shifting issues)
 */
export const toLocalISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parse a YYYY-MM-DD string as LOCAL midnight
 * (Not UTC - avoids date shifting issues)
 */
export const parseLocalDate = (dateString: string): Date => {
  return new Date(`${dateString}T00:00:00`);
};
