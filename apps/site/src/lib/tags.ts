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
 * Group tags from many entries by slug. Keeps the first label seen for display,
 * so "Full Stack" still reads as written rather than as "full-stack".
 */
export function groupByTagSlug<T>(
  items: Array<{ tag: string; value: T }>
): Map<string, { label: string; values: T[] }> {
  const out = new Map<string, { label: string; values: T[] }>();
  for (const { tag, value } of items) {
    const slug = tagSlug(tag);
    if (!slug) continue;
    const existing = out.get(slug);
    if (existing) existing.values.push(value);
    else out.set(slug, { label: tag, values: [value] });
  }
  return out;
}
