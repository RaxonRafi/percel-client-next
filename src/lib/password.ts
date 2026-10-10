/** Shown wherever a password is chosen. Mirrors the API's rule. */
export const PASSWORD_RULES =
  'Use at least 8 characters, with an uppercase letter, a lowercase letter and a number.';

/**
 * Why the API would reject this as a new password, or null if it would not.
 * Checked here only to answer sooner — the API enforces it either way.
 */
export function passwordProblem(value: string): string | null {
  if (value.length < 8) return 'Use at least 8 characters';
  if (value.length > 72) return 'Use at most 72 characters';
  if (!/[a-z]/.test(value)) return 'Add a lowercase letter';
  if (!/[A-Z]/.test(value)) return 'Add an uppercase letter';
  if (!/\d/.test(value)) return 'Add a number';
  return null;
}
