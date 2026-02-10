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
    gallery: z.array(z.object({ src: z.string(), alt: z.string().optional() })).default([])
  })
});

const photography = defineCollection({
  type: "content",
  schema: z.object({
    ...base,
    gallery: z.array(z.object({ src: z.string(), alt: z.string().optional() })).default([])
  })
});

const portfolio = defineCollection({
  type: "content",
  schema: z.object({
    ...base,
    role: z.string().optional(),
    tech: z.array(z.string()).default([]),
    links: z
      .object({
        repo: z.string().url().optional(),
        live: z.string().url().optional()
      })
      .default({})
  })
});

export const collections = { writing, adventures, photography, portfolio };
