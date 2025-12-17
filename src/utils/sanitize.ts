/**
 * Security sanitization utilities for user input
 *
 * Protects against:
 * - SQL/PostgREST injection
 * - LIKE wildcard abuse
 * - XSS (when needed beyond React's auto-escaping)
 * - Sensitive data exposure in logs (JS-A1004)
 */

/**
 * List of sensitive field names that should be redacted in logs
 */
const SENSITIVE_FIELDS = [
  'email',
  'password',
  'mot_de_passe',
  'token',
  'access_token',
  'refresh_token',
  'phone',
  'telephone',
  'mobile',
  'dob',
  'date_naissance',
  'birthdate',
  'ssn',
  'numero_secu',
  'address',
  'adresse',
  'iban',
  'carte',
  'card_number',
  'cvv',
  'secret',
  'api_key',
  'apikey',
  'authorization',
  'cookie',
  'session',
] as const;

/**
 * Redact sensitive data from objects before logging
 *
 * Prevents exposure of PII and sensitive information in logs (JS-A1004).
 * Recursively processes nested objects and arrays.
 *
 * @param data - The data to redact
 * @param maxDepth - Maximum recursion depth (default: 5)
 * @returns Redacted copy of the data safe for logging
 *
 * @example
 * ```ts
 * const user = { email: 'test@example.com', name: 'John' };
 * console.log(redactSensitiveData(user));
 * // Output: { email: '[REDACTED]', name: 'John' }
 *
 * const error = new Error('Auth failed');
 * console.error('Error:', redactSensitiveData({ error, user }));
 * ```
 */
export function redactSensitiveData(data: unknown, maxDepth = 5): unknown {
  if (maxDepth <= 0) {
    return '[MAX_DEPTH_REACHED]';
  }

  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle primitives
  if (typeof data !== 'object') {
    return data;
  }

  // Handle Error objects specially
  if (data instanceof Error) {
    return {
      name: data.name,
      message: data.message,
      // Don't include stack trace in production as it may leak file paths
    };
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item, maxDepth - 1));
  }

  // Handle objects
  const result: Record<string, unknown> = {};
  const record = data as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));

    if (isSensitive) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = redactSensitiveData(record[key], maxDepth - 1);
    }
  }

  return result;
}

/**
 * Create a safe error message for logging
 *
 * Extracts error information without exposing sensitive details.
 *
 * @param error - The error to process
 * @param context - Optional context string (will be sanitized)
 * @returns Safe string for logging
 *
 * @example
 * ```ts
 * try {
 *   await login(credentials);
 * } catch (error) {
 *   console.error(safeErrorMessage(error, 'Login attempt'));
 * }
 * ```
 */
export function safeErrorMessage(error: unknown, context?: string): string {
  const prefix = context ? `[${context}] ` : '';

  if (error instanceof Error) {
    return `${prefix}${error.name}: ${error.message}`;
  }

  if (typeof error === 'string') {
    return `${prefix}Error: ${error}`;
  }

  return `${prefix}Unknown error occurred`;
}

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
export function sanitizeSearchQuery(query: string, maxLength = 200): string {
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
    !Number.isNaN(lat) &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90;

  const isLngValid =
    typeof lng === 'number' &&
    !Number.isNaN(lng) &&
    Number.isFinite(lng) &&
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
