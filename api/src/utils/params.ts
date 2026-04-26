/**
 * Route params utilities
 * @module api/utils/params
 * @description Helpers to safely normalize values coming from `req.params`.
 */
/**
 * Normalize an Express route param to a string.
 * @param value - The raw route param value (string, string[] or undefined).
 * @returns The normalized string value (empty string if missing).
 */
export function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}
