/**
 * Safe Navigation Utilities
 * Prevents open redirect and injection attacks via window.location.href
 *
 * Security notes:
 * - All functions validate input before navigation
 * - Protocol-relative URLs (//) are blocked
 * - Only whitelisted protocols (tel:, mailto:, http:, https:) are allowed
 */

// Allowed URL protocols for external navigation
const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'file:', 'vbscript:', 'blob:'];

/**
 * Check if a path is a protocol-relative URL (starts with // or \\)
 * These are dangerous as they can redirect to external domains
 */
const isProtocolRelativeUrl = (path: string): boolean => {
  return path.startsWith('//') || path.startsWith('\\\\');
};

// Phone number validation: digits, +, spaces, -, ., (), /
const PHONE_REGEX = /^[+\d\s\-.()/]+$/;

// Simple email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Safely opens a tel: link
 * Validates that the input contains only valid phone characters
 * @returns true if navigation succeeded, false if blocked
 */
export const safeOpenTel = (input: string): boolean => {
  if (!input || typeof input !== 'string') {
    console.warn('[safeNavigation] safeOpenTel: invalid input');
    return false;
  }

  // Extract phone number (remove tel: prefix if present)
  const phoneNumber = input.startsWith('tel:') ? input.slice(4) : input;

  // Clean the phone number (keep only valid chars)
  const cleaned = phoneNumber.trim();

  if (!cleaned || !PHONE_REGEX.test(cleaned)) {
    console.warn('[safeNavigation] safeOpenTel: invalid phone format');
    return false;
  }

  // Build safe tel: href - validated phone number only
  // nosemgrep: javascript.browser.security.open-redirect.open-redirect
  window.location.href = `tel:${cleaned}`;
  return true;
};

/**
 * Safely opens an external URL
 * Only allows http/https protocols or relative paths starting with /
 * @param allowSameOriginOnly - if true, only allow same-origin URLs (default: false)
 * @returns true if navigation succeeded, false if blocked
 */
export const safeOpenExternalUrl = (
  input: string,
  options: { allowSameOriginOnly?: boolean } = {}
): boolean => {
  if (!input || typeof input !== 'string') {
    console.warn('[safeNavigation] safeOpenExternalUrl: invalid input');
    return false;
  }

  const trimmed = input.trim();

  // Check for blocked protocols first
  const lowerInput = trimmed.toLowerCase();
  for (const blocked of BLOCKED_PROTOCOLS) {
    if (lowerInput.startsWith(blocked)) {
      console.warn(`[safeNavigation] safeOpenExternalUrl: blocked protocol "${blocked}"`);
      return false;
    }
  }

  // Allow relative paths starting with / (but block protocol-relative //)
  if (trimmed.startsWith('/')) {
    // Security: block protocol-relative URLs that could redirect externally
    if (isProtocolRelativeUrl(trimmed)) {
      console.warn('[safeNavigation] safeOpenExternalUrl: protocol-relative URL blocked');
      return false;
    }
    // nosemgrep: javascript.browser.security.open-redirect.open-redirect
    window.location.href = trimmed;
    return true;
  }

  // Parse URL to validate protocol
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    console.warn('[safeNavigation] safeOpenExternalUrl: invalid URL format');
    return false;
  }

  // Check protocol is allowed
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    console.warn(`[safeNavigation] safeOpenExternalUrl: protocol not allowed "${url.protocol}"`);
    return false;
  }

  // Optional: same-origin check
  if (options.allowSameOriginOnly && url.origin !== window.location.origin) {
    console.warn('[safeNavigation] safeOpenExternalUrl: cross-origin blocked');
    return false;
  }

  // URL validated: protocol is http/https, optionally same-origin
  // nosemgrep: javascript.browser.security.open-redirect.open-redirect
  window.location.href = trimmed;
  return true;
};

/**
 * Safely opens a mailto: link
 * Validates the email format and properly encodes subject/body
 * @returns true if navigation succeeded, false if blocked
 */
export const safeOpenMailto = (params: {
  to?: string;
  subject?: string;
  body?: string;
}): boolean => {
  const { to, subject, body } = params;

  // If 'to' is provided, validate it looks like an email
  if (to && !EMAIL_REGEX.test(to)) {
    console.warn('[safeNavigation] safeOpenMailto: invalid email format');
    return false;
  }

  // Build mailto URL with proper encoding
  const parts: string[] = [];

  if (subject) {
    parts.push(`subject=${encodeURIComponent(subject)}`);
  }

  if (body) {
    parts.push(`body=${encodeURIComponent(body)}`);
  }

  const query = parts.length > 0 ? `?${parts.join('&')}` : '';
  const mailtoUrl = `mailto:${to || ''}${query}`;

  // mailto: URL with validated email and encoded params
  // nosemgrep: javascript.browser.security.open-redirect.open-redirect
  window.location.href = mailtoUrl;
  return true;
};

/**
 * Safely opens an email link (convenience wrapper)
 * @returns true if navigation succeeded, false if blocked
 */
export const safeOpenEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    console.warn('[safeNavigation] safeOpenEmail: invalid input');
    return false;
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    console.warn('[safeNavigation] safeOpenEmail: invalid email format');
    return false;
  }

  // mailto: with validated email address
  // nosemgrep: javascript.browser.security.open-redirect.open-redirect
  window.location.href = `mailto:${email.trim()}`;
  return true;
};
