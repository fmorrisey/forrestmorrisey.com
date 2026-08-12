import { defineCollection, z } from "astro:content";

const base = {
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
  // New fields for Squarespace-style layouts
  heroImage: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  coverImage: z.string().optional(),
  featured: z.boolean().default(false),
  summary: z.string().optional(),
  ctaLabel: z.string().default("Read"),
};

const writing = defineCollection({
  type: "content",
  schema: z.object({ ...base })
});

const adventures = defineCollection({
  type: "content",
  schema: z.object({
    ...base,
    location: z.string().optional(),
    // `caption` is the author's own prose from the original post, shown under
    // the image. `alt` stays a plain description for screen readers.
    //
    // `thumb` is the grid-sized copy. Optional and explicit rather than derived
    // from `src`, so galleries without generated thumbnails keep working
    // instead of requesting paths that do not exist.
    gallery: z
      .array(
        z.object({
          src: z.string(),
          thumb: z.string().optional(),
          alt: z.string().optional(),
          caption: z.string().optional()
        })
      )
      .default([])
  })
});

const photography = defineCollection({
  type: "content",
  schema: z.object({
    ...base,
    gallery: z.array(z.object({ src: z.string(), alt: z.string().optional() })).default([])
  })
});

const software = defineCollection({
  type: "content",
  schema: z.object({
    ...base,
    // Splits the index into "Professional Work" and "Personal Projects".
    // Defaults to personal so an entry has to opt in to claiming employment --
    // the direction where a wrong default would misrepresent something.
    category: z.enum(["professional", "personal"]).default("personal"),
    role: z.string().optional(),
    tech: z.array(z.string()).default([]),
    // `download` is for things you install rather than visit -- a .deb, a
    // release page. Kept separate from `live` so a CLI tool is not advertised
    // with a "View Live" button that leads somewhere there is nothing to see.
    links: z
      .object({
        repo: z.string().url().optional(),
        live: z.string().url().optional(),
        download: z.string().url().optional()
      })
      .default({}),
    gallery: z.array(z.object({ src: z.string(), alt: z.string().optional() })).default([])
  })
});

const music = defineCollection({
  type: "content",
  schema: z.object({
    ...base,
    soundcloudUrl: z.string().url().optional(),
    bandcampUrl: z.string().url().optional(),
    spotifyUrl: z.string().url().optional(),
    embedCode: z.string().optional(),
  })
});

const youtube = defineCollection({
  type: "content",
  schema: z.object({
    ...base,
    videoId: z.string().optional(),
    playlistId: z.string().optional(),
    channelUrl: z.string().url().optional(),
  })
});

export const collections = { writing, adventures, photography, software, music, youtube };
