/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth in ISO format (YYYY-MM-DD)
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format date of birth for display
 * @param dateOfBirth - Date of birth in ISO format (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "January 15, 2010")
 */
export function formatDateOfBirth(dateOfBirth: string): string {
  const date = new Date(dateOfBirth);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Get age category from date of birth
 * @param dateOfBirth - Date of birth in ISO format (YYYY-MM-DD)
 * @returns Age category string
 */
export function getAgeCategory(dateOfBirth: string): string {
  const age = calculateAge(dateOfBirth);
  
  if (age >= 6 && age <= 10) return 'Children';
  if (age >= 11 && age <= 14) return 'JHS';
  if (age >= 15 && age <= 18) return 'SHS';
  if (age >= 19) return 'Adult';
  
  return 'Unknown';
}

/**
 * Validate date of birth (must be in the past and not too old)
 * @param dateOfBirth - Date of birth in ISO format (YYYY-MM-DD)
 * @returns True if valid, false otherwise
 */
export function isValidDateOfBirth(dateOfBirth: string): boolean {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  
  // Must be in the past but not more than 120 years ago
  return birthDate < today && birthDate > minDate;
}
