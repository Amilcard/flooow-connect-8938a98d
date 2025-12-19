/**
 * Constant-time string comparison to prevent timing attacks.
 *
 * Unlike the standard === operator, this function always takes the same
 * amount of time regardless of where the strings differ, preventing
 * attackers from inferring information about the comparison through timing.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are identical, false otherwise
 */
export function constantTimeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let result = a.length ^ b.length;

  for (let i = 0; i < len; i++) {
    const charA = a.charCodeAt(i) || 0;
    const charB = b.charCodeAt(i) || 0;
    result |= charA ^ charB;
  }

  return result === 0;
}
