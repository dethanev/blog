import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    displayTitle: z.string().optional(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    variant: z.enum(["paper", "pink", "yellow", "lime", "violet", "blue"]).default("paper"),
    /** Project id from src/data/projects.ts. */
    project: z.string().optional(),
  }),
});

export const collections = { posts };
