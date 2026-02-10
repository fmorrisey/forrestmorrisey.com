import { defineCollection, z } from "astro:content";

const base = {
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true)
};

const writing = defineCollection({
  type: "content",
  schema: z.object({ ...base })
});

const adventures = defineCollection({
  type: "content",
  schema: z.object({ ...base, location: z.string().optional() })
});

const photography = defineCollection({
  type: "content",
  schema: z.object({
    ...base,
    coverImage: z.string().optional(),
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
