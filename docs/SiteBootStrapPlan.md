# Feature Plan — “Pseudo-Ready” v0 (Mimic Squarespace Layout)

Goal for today: make the Astro site feel like a *real* portfolio platform (not a dev scaffold) while staying lightweight and content-driven.

Success criteria:
- No 404s from top-nav
- Home + Adventures + Photography + Portfolio pages look intentional
- One “hero banner” template supports pages like **IAT 2020**
- Image tiles + overlay text mimic current Squarespace vibe
- Typography + spacing + accents feel close enough to “Forrest Morrisey — Innovating in Tech and Design”

---

## 0) Visual Targets to Mimic (from screenshots)

### Global “Squarespace DNA”
- Dark charcoal background
- Centered site title with small caps / tracking
- Thin **green underline accent**
- Social icons at top-right
- Big hero banners (image + overlay title/subtitle)
- Multi-column editorial layouts (text blocks + big images)
- Cards/tiles with hover/overlay + “Read” button patterns
- Gallery landing grid: 3-up with “See More” overlay button

---

## 1) IA / Routing (Hard Requirements)

### Routes
- `/` (Home)
- `/portfolio` (index + detail)
- `/adventures` (index + detail)
- `/photography` (index + detail)
- `/writing` (index + detail)
- `/about`
- `/contact`
- `/resume`

### Slug parity (nice-to-have today)
- Keep old Squarespace slugs where possible (example: `/iat-2020`)
  - Add alias routing later via redirects (Cloudflare or static `redirects` page), not required today.

---

## 2) Layout System (Pages should share a “Squarespace-like” skeleton)

### New shared components (Astro)
- `src/components/SiteHeader.astro`
- `src/components/SiteFooter.astro`
- `src/components/HeroBanner.astro`
- `src/components/SectionTitle.astro`
- `src/components/CardGrid.astro`
- `src/components/ImageTile.astro`
- `src/components/QuoteBlock.astro`

### Base layout updates
- Header becomes:
  - Left: hamburger icon (non-functional today; placeholder)
  - Center: site title + accent underline
  - Right: social icons (Instagram, LinkedIn, GitHub)
- Main container remains fixed width, but hero sections go “full-bleed” inside a max-width frame.

---

## 3) Styling Plan (Minimal CSS, Maximum Perceived Polish)

### Theme tokens
- Background: near-black charcoal
- Foreground: warm white
- Muted: soft gray
- Accent: `#2ee59d`-ish green (close enough)
- Borders: subtle, low-contrast

### Typography
- Headings: bold, large, with tracking
- Body: readable serif or serif-like feel for editorial sections (optional today)
- Uppercase label style for “FORREST MORRISEY  INNOVATING IN TECH AND DESIGN”

### Components style rules
- Hero banner:
  - background image
  - dark overlay gradient
  - centered title + subtitle
- Tile overlays:
  - title centered
  - optional subtitle
  - hover reveal “See More” / “Read”
- Editorial grid:
  - two-column on desktop
  - stacked on mobile
  - generous whitespace

---

## 4) Content Model Additions (Support Squarespace-style pages)

Update content schemas (content collections) to support:
- `heroImage` (string url)
- `heroTitle` (optional override)
- `heroSubtitle` (optional)
- `coverImage` (for tiles)
- `featured` (boolean for homepage / landing grids)
- `summary` (short blurb for card display)
- `ctaLabel` (default “Read”)

### Proposed frontmatter (Adventures + Photography + Writing + Portfolio)
```yaml
heroImage: "/assets/images/adventures/iat/hero.jpg"
heroSubtitle: "August 2020"
summary: "Backpacking in the Kettle Moraine..."
coverImage: "/assets/images/adventures/iat/tile.jpg"
featured: true
ctaLabel: "Read"
```

This lets landing pages mimic Squarespace grids without hardcoding.

---

## 5) Page-by-Page: What “Pseudo-Ready” Means

### A) Home (`/`)

Purpose: simple, beautiful entry point with section tiles.

* Top header matches Squarespace feel
* Hero strip (optional today)
* 2–4 section tiles:

  * Portfolio
  * Adventures
  * Photography
  * Writing
* Featured items row:

  * pull `featured: true` from each collection, show 3-up tiles
* Footer minimal

### B) Adventures Index (`/adventures`)

Mimic screenshot:

* Hero banner: “Adventures” + subtitle (“Every Journey Begins With a Choice”)
* 3-up grid of adventure tiles

  * overlay title (ICE AGE TRAIL)
  * subtitle (August 2020 Thru Hike)
  * CTA button “Read”
* Below grid:

  * small italic line (“Enjoying the photos…”) + pill button linking to Photography

### C) Adventure Detail (`/adventures/[slug]`)

Mimic IAT page:

* Full hero banner with overlay title + subtitle (date)
* Editorial layout blocks:

  * Left column: narrative paragraphs
  * Right column: large image
  * Interleave image + text blocks (simple pattern today)
* Keep it markdown-driven:

  * Use markdown content for text
  * Add a `gallery` array in frontmatter for images
  * Render gallery images into editorial blocks (algorithmic layout, not manual)

### D) Photography Index (`/photography`)

Mimic “Photo Galleries” screenshot:

* Hero title: “Photo Galleries”
* 3-up gallery tiles:

  * Portraits
  * Highlights
  * Climate Strike
* Each tile:

  * image background
  * overlay “See More” button
  * title + short description underneath

### E) Photography Detail (`/photography/[slug]`)

* Hero banner with title
* Grid gallery (3–4 columns desktop)
* Lightbox optional; pseudo-ready = open image in new tab

### F) Portfolio Index (`/portfolio`)

Mimic “Projects” screenshot:

* Hero banner: “Projects”
* Centered intro block:

  * “Front End Developer and Designer”
  * bullet list “Hi, I’m Forrest…” style
* Below: project cards (title + tech + links)

### G) Portfolio Detail (`/portfolio/[slug]`)

* Hero banner (project cover)
* Summary, role, tech, links
* Screenshots row (optional today)

---

## 6) Implementation Tasks (Today Scope, Ordered)

### P0 — Must ship today

1. **Header & Nav**

   * New `SiteHeader.astro` with centered title + green underline + social icons
2. **HeroBanner component**

   * Can be reused across Adventures/Photography/Portfolio
3. **Landing grids**

   * Adventures index grid (3-up)
   * Photography index grid (3-up)
4. **Collection list/detail pages**

   * Confirm all list + detail pages render without 404
5. **Content schema updates**

   * Add `heroImage`, `coverImage`, `summary`, `featured`, `ctaLabel`
6. **Basic image tiles**

   * Hover overlay text + button

### P1 — Strong polish if time permits

7. Editorial layout renderer for Adventure detail

   * render `gallery` into alternating layout blocks
8. Button component + pill style
9. Better typography (headings + body)
10. Footer polish + small “signature line”

### P2 — Later (not needed today)

* Lightbox
* RSS feeds
* Redirect mapping from old Squarespace slugs
* Image optimization pipeline (webp/avif)
* Newsletter integration

---

## 7) Deliverables (Concrete Outputs)

### Code deliverables

* `src/components/*` listed above
* Updated `BaseLayout.astro`
* Updated `global.css` theme + components
* Updated `content.config.ts`
* Updated index pages:

  * `/adventures`, `/photography`, `/portfolio` landing designs

### Content deliverables (minimum)

* Add hero/cover images placeholders into `public/assets/images/...`
* Ensure at least 1 “featured” entry per section:

  * adventures: `mt-rainier-prep` (or `iat-2020` if you add it today)
  * photography: `winter-ice-gallery`
  * portfolio: `spoker-v2`
  * writing: `building-rainier`

---

## 8) Notes on Mimicking Without Rebuilding Squarespace

Squarespace layouts look “designed” because:

* big hero banners
* consistent spacing scale
* repeatable tile patterns
* strong typographic hierarchy

You can get 80% of that with:

* 2–3 reusable components + better CSS tokens
* content frontmatter that feeds those components

No CMS. No heavy framework. Just disciplined structure.