/**
 * Date utility functions
 */

/**
 * Calculate age from date of birth
 * Takes into account month and day to determine if birthday has passed
 *
 * @param dob - Date of birth in ISO format (YYYY-MM-DD) or parseable date string
 * @returns Age in years
 *
 * @example
 * calculateAge("2010-05-15") // Returns current age considering exact birthday
 */
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // If birthday hasn't occurred yet this year, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
