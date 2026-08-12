import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { FEEDS, feedItems } from "../../lib/feeds";

export const GET: APIRoute = async ({ site }) => {
  // `site` is set in astro.config.mjs and only absent if that is removed, which
  // would also break canonicals and the sitemap. Fail the build loudly rather
  // than emit a feed with relative links no reader can resolve.
  if (!site) throw new Error("`site` must be set in astro.config.mjs to build the writing feed.");

  const { title, description } = FEEDS.writing;

  return rss({
    title,
    description,
    site,
    items: feedItems("writing", await getCollection("writing")),
  });
};
