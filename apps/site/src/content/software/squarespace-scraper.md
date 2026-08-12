---
title: "Squarespace Scraper"
date: 2026-04-02
published: true
category: personal
description: "A Squarespace-aware site scraper and a repeatable workflow for migrating to self-hosted Astro."
summary: Squarespace's export is lossy, so this captures what actually exists on the live site — HTML, CSS, JS, images, fonts — and makes the rebuild repeatable.
heroSubtitle: Getting your site back out of Squarespace
role: Author & Maintainer
tech: ["Python", "Web Scraping", "HTML/CSS"]
tags: ["Python", "Tooling", "Migration"]
links:
  repo: "https://github.com/fmorrisey/squarespacescaper"
featured: false
ctaLabel: View Project
---

Squarespace's export tools are incomplete and lossy. This takes the other
approach: snapshot what is actually being served — HTML, CSS, JS, images, fonts
— so a rebuild works from evidence instead of guesswork.

## What it is, and isn't

It is a **full-site snapshot tool and a migration workflow**, not a one-click
clone. You end up with saved pages, assets, and crawl metadata, organised so the
whole thing can be dropped into a migration repo and referenced later.

It is explicitly not a perfect HTML-to-Markdown converter, not a pixel-accurate
DOM clone, and not a CMS replacement. What you rebuild from it is **patterns and
intent** — the content, the colours, the layout decisions — rather than
Squarespace's markup.

That distinction is the useful part. Aiming at a pixel-perfect clone of a
platform you are trying to leave means inheriting its markup and its
constraints; capturing intent means you get to keep the design and drop the
scaffolding.

## Where it has been used

This site. The Squarespace snapshot it produced is what the Astro rebuild was
written against, and it is still the reference for recovering original assets —
including the hero image on this section, which came out of that mirror rather
than from anything Squarespace would have handed over.
