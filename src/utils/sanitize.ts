/**
 * Security sanitization utilities for user input
 *
 * Protects against:
 * - SQL/PostgREST injection
 * - LIKE wildcard abuse
 * - XSS (when needed beyond React's auto-escaping)
 */

/**
 * Escape LIKE wildcard characters in search queries
 *
 * Prevents users from abusing % and _ wildcards in LIKE/ILIKE queries
 * which could cause performance issues or unintended matches.
 *
 * @param input - Raw search query from user
 * @returns Sanitized query with escaped wildcards
 *
 * @example
 * ```ts
 * escapeLikeWildcards("test%") // => "test\\%"
 * escapeLikeWildcards("foo_bar") // => "foo\\_bar"
 * ```
 */
export function escapeLikeWildcards(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/%/g, '\\%')     // Escape % wildcard
    .replace(/_/g, '\\_');    // Escape _ wildcard
}

/**
 * Sanitize search query for safe use in database queries
 *
 * - Trims whitespace
 * - Limits length to prevent DoS
 * - Escapes LIKE wildcards
 * - Removes null bytes and control characters
 *
 * @param query - Raw search query
 * @param maxLength - Maximum allowed length (default: 200)
 * @returns Sanitized query safe for database use
 *
 * @example
 * ```ts
 * sanitizeSearchQuery("  test%   ") // => "test\\%"
 * sanitizeSearchQuery("a".repeat(300)) // => "a".repeat(200)
 * ```
 */
export function sanitizeSearchQuery(query: string, maxLength: number = 200): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  return escapeLikeWildcards(
    query
      .trim()
      .slice(0, maxLength)
      // Remove null bytes and control characters (security best practice)
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1F\x7F]/g, '')
  );
}

/**
 * Validate and sanitize coordinates (lat/lng)
 *
 * Ensures coordinates are valid numbers within acceptable ranges.
 * Prevents NaN, Infinity, and out-of-range values.
 *
 * @param lat - Latitude value
 * @param lng - Longitude value
 * @returns Object with isValid flag and sanitized coordinates
 *
 * @example
 * ```ts
 * validateCoordinates(48.8566, 2.3522) // => { isValid: true, lat: 48.8566, lng: 2.3522 }
 * validateCoordinates(NaN, 100) // => { isValid: false, lat: 0, lng: 0 }
 * validateCoordinates(999, 999) // => { isValid: false, lat: 0, lng: 0 }
 * ```
 */
export function validateCoordinates(
  lat: number,
  lng: number
): { isValid: boolean; lat: number; lng: number } {
  const isLatValid =
    typeof lat === 'number' &&
    !isNaN(lat) &&
    isFinite(lat) &&
    lat >= -90 &&
    lat <= 90;

  const isLngValid =
    typeof lng === 'number' &&
    !isNaN(lng) &&
    isFinite(lng) &&
    lng >= -180 &&
    lng <= 180;

  return {
    isValid: isLatValid && isLngValid,
    lat: isLatValid ? lat : 0,
    lng: isLngValid ? lng : 0,
  };
}

/**
 * Sanitize URL for safe external navigation
 *
 * Ensures URLs are safe before opening in new window/tab.
 * Prevents javascript: and data: URI schemes.
 *
 * @param url - URL to sanitize
 * @param allowedProtocols - Allowed protocols (default: ['http:', 'https:'])
 * @returns Sanitized URL or null if unsafe
 *
 * @example
 * ```ts
 * sanitizeUrl("https://google.com") // => "https://google.com"
 * sanitizeUrl("javascript:alert(1)") // => null
 * sanitizeUrl("data:text/html,<script>") // => null
 * ```
 */
export function sanitizeUrl(
  url: string,
  allowedProtocols: string[] = ['http:', 'https:']
): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url.trim());

    // Check if protocol is allowed
    if (!allowedProtocols.includes(parsed.protocol)) {
      console.warn(`Blocked unsafe URL protocol: ${parsed.protocol}`);
      return null;
    }

    return parsed.toString();
  } catch (e) {
    console.warn('Invalid URL provided:', url);
    return null;
  }
}
