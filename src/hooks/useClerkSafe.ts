/**
 * Check if Clerk is configured (publishable key provided).
 */
export function isClerkEnabled(): boolean {
  return !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
}
