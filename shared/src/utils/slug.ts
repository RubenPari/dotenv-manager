/**
 * Slug utilities
 * @module shared/utils/slug
 * @description Helpers to generate stable URL-friendly slugs.
 */
/**
 * Generate a URL-friendly slug from a name.
 * Falls back to a timestamp-based value if the input contains no usable characters.
 * @param name - The input string.
 * @returns A slug suitable for URLs/identifiers.
 */
export function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `project-${Date.now()}`
  );
}
