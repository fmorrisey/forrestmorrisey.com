---
title: "Astral Relay"
date: 2026-08-12
published: true
category: personal
description: "A self-hosted, mobile-friendly publishing system that exports straight into Astro content collections."
summary: Write and publish to an Astro site from any device — a write-first CMS with a deliberate one-way import.
heroSubtitle: Publishing for Astro, from any device
role: Author & Maintainer
tech: ["JavaScript", "Node.js", "Astro", "Markdown"]
tags: ["JavaScript", "Astro", "Self-Hosted", "Tooling"]
links:
  repo: "https://github.com/fmorrisey/Astral-Relay"
featured: false
ctaLabel: View Project
---

Astral Relay is a self-hosted publishing system for Astro sites. Write and
manage content from any device, hit publish, and it exports `.md` files directly
in Astro's content collections format for the next build to pick up.

## Write-first, by design

It is deliberately **not** a two-way sync. You can import existing content once,
but it does not watch the workspace — files edited outside Astral Relay after an
import are not picked up until you re-run the import.

That constraint is what keeps it honest. Two-way sync between a database and a
git working tree is where this class of tool usually goes wrong, quietly
overwriting whichever side it decided was newer.

## Decisions that follow from it

- **The import never writes to the workspace.** It only reads.
- **It is idempotent**, matching on collection and slug, so re-running updates
  rather than duplicating.
- **The slug comes from the filename, not the title**, so page URLs survive a
  rename of the heading.
- **Frontmatter keys it does not model are left in the file** rather than copied
  into the database — the file remains their source of truth, and publishing
  merges them back in.
- **Entries it cannot map are reported, not silently skipped.**

There is a `--dry-run` that reports exactly what an import would do and changes
nothing, which is the flag I reach for first on anything that touches content I
care about.
