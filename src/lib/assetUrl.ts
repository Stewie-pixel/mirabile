/**
 * Resolves a public-folder asset path using Vite's configured base URL.
 *
 * In development  → import.meta.env.BASE_URL is "/"
 * In production   → import.meta.env.BASE_URL is "/mirabile/" (from vite.config.ts)
 *
 * Usage:
 *   assetUrl('images/logo.png')        → "/images/logo.png"  (dev)
 *                                       → "/mirabile/images/logo.png"  (prod)
 *   assetUrl('icons/google.png')       → "/icons/google.png"  (dev)
 *                                       → "/mirabile/icons/google.png"  (prod)
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  // Strip leading slash from path to avoid double slashes
  return `${base}${path.replace(/^\//, '')}`;
}
