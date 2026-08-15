/**
 * Application configuration for the React Native app.
 *
 * Values prefixed with EXPO_PUBLIC_ are provided through
 * Expo environment variables.
 */

export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  currency: 'GBP',
  locale: 'en-GB',
  hotelName: 'Royal Crest Hotel',
  taxRate: 0.12,
} as const;