/**
 * Hosted privacy policy URL shown in Settings and required for store listings.
 * Replace with your production policy page before Play submission.
 */
export const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim() ||
  'https://github.com/mirulkhanal/fitnessTracker/blob/master/PRIVACY.md';

export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || '';
