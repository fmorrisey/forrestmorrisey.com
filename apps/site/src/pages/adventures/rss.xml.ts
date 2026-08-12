import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { FEEDS, feedItems } from "../../lib/feeds";

export const GET: APIRoute = async ({ site }) => {
  // See the writing feed: `site` absent means astro.config.mjs lost it, and a
  // feed of relative links is worse than a failed build.
  if (!site) throw new Error("`site` must be set in astro.config.mjs to build the adventures feed.");

  const { title, description } = FEEDS.adventures;

  return rss({
    title,
    description,
    site,
    items: feedItems("adventures", await getCollection("adventures")),
  });
};
