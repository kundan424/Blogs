/**
 * Converts a human-readable title into a clean, URL-safe, SEO-friendly slug.
 * Strips special characters, handles accents, converts spaces and underscores to hyphens.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except spaces & hyphens
    .replace(/[\s_]+/g, '-') // Convert spaces and underscores to hyphens
    .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
    .replace(/-{2,}/g, '-'); // Collapse consecutive hyphens
}

/**
 * Converts a slug into a formatted title (e.g. 'database-internals-storage' -> 'Database Internals Storage')
 */
export function titleCaseFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
