/**
 * Tag values in frontmatter are inconsistent by history: content migrated from
 * Squarespace kept its capitalised tags ("Career", "Journey", "Transition"),
 * newer content is lowercase, and portfolio entries use tech labels with spaces
 * and punctuation (".NET", "Full Stack", "E-Commerce").
 *
 * Slugging on the way into a URL keeps that mess out of the address bar and
 * collapses "design"/"Design" into one page instead of two half-empty ones.
 */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Collections whose entries carry tags. Exported so the tag index and the tag
 * page cannot drift: if only one of them learned about a new collection, the
 * index would link to pages `getStaticPaths` never generated -- a clean build
 * and a 404 in production.
 */
export const TAGGED_COLLECTIONS = [
  "writing",
  "adventures",
  "photography",
  "portfolio",
  "music",
  "youtube",
] as const;

/**
 * Group tags from many entries by slug. Keeps the first label seen for display,
 * so "Full Stack" still reads as written rather than as "full-stack".
 *
 * `key` identifies an entry so it is listed once per tag page even when it
 * carries several tags that slug the same -- exactly the mixed history this
 * module exists for, where one entry could be tagged both "Full Stack" and
 * "full-stack" and would otherwise render twice and be counted twice.
 */
export function groupByTagSlug<T>(
  items: Array<{ tag: string; value: T; key: string }>
): Map<string, { label: string; values: T[] }> {
  const out = new Map<string, { label: string; values: T[] }>();
  const seen = new Map<string, Set<string>>();

  for (const { tag, value, key } of items) {
    const slug = tagSlug(tag);
    if (!slug) continue;

    const keys = seen.get(slug) ?? new Set<string>();
    if (keys.has(key)) continue;
    keys.add(key);
    seen.set(slug, keys);

    const existing = out.get(slug);
    if (existing) existing.values.push(value);
    else out.set(slug, { label: tag, values: [value] });
  }
  return out;
}
