import type { CollectionEntry } from "astro:content";

/**
 * Collections that publish a feed, and the channel metadata for each.
 *
 * Kept here rather than inline in the endpoints because three places need to
 * agree: the endpoint that renders the XML, the `<link rel="alternate">` tags
 * in `BaseLayout`, and the human-facing links in the footer. A feed advertised
 * at a path nothing generates is a 404 in a subscriber's reader -- and unlike a
 * broken page, nobody sees it happen.
 *
 * `description` mirrors the hero subtitle on each collection's index page, so a
 * reader's channel blurb reads the same as the page it came from.
 */
export const FEEDS = {
  writing: {
    path: "/writing/rss.xml",
    title: "Forrest Morrisey — Writing",
    description: "Thoughts, essays, and reflections",
  },
  adventures: {
    path: "/adventures/rss.xml",
    title: "Forrest Morrisey — Adventures",
    description: "Every journey begins with a choice",
  },
} as const;

export type FeedCollection = keyof typeof FEEDS;

/**
 * Turn collection entries into RSS items: published only, newest first.
 *
 * The filter and sort deliberately match the collection's index page. A feed
 * that disagreed with the page it mirrors -- carrying a draft, or ordering by
 * something else -- would be a subtler bug than a missing feed, because it
 * still looks like it works.
 *
 * Links carry a trailing slash to match the canonical URLs `BaseLayout` emits
 * under Astro's directory build format. Without it, a post shared from a reader
 * would compete with its own canonical in search results.
 */
export function feedItems<C extends FeedCollection>(
  collection: C,
  entries: CollectionEntry<C>[]
) {
  return entries
    .filter((entry) => entry.data.published)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      // Same precedence as the index pages: the hand-written summary wins over
      // the terser SEO description.
      description: entry.data.summary || entry.data.description || "",
      link: `/${collection}/${entry.slug}/`,
      categories: entry.data.tags,
    }));
}
