# Squarespace Migration Feature Plan — forrestmorrisey.com → Astro (Content + Theme)

This doc captures (1) the content/IA on the current Squarespace site and (2) the core visual theme (especially the green accent) so an LLM can copy/paste and migrate it into your Astro repo.

Sources: current site pages and nav.

---

## 1) Site Information Architecture (Current Squarespace)

### Primary nav groups (as displayed)
- **Home**
- **Development**
  - Projects
  - GitHub (redirect)
- **About**
- **Contact**
- **Blog**
- **Galleries**
  - Photos Home
  - Browse
  - Highlights
  - Climate Strike
  - Portraits
- **Adventures**
  - Explore
  - IAT 2020
- Footer links include "Social" (Social Feeds page).

### Shared site-wide blocks (appear across pages)
- **Subscribe** block ("Be the first to hear about the latest", email input, "no spam, no junk").
- "Based in Milwaukee, Wisconsin." + "Every journey begins with a choice."
- Social icons: Instagram + LinkedIn + GitHub.
- Site title/tagline: "Forrest Morrisey — Innovating in Tech and Design."

---

## 2) Content Inventory (What must be migrated)

### Home (`/`)
Key elements:
- Top navigation groups (above)
- Calls-to-sections: "Code Projects", "Photography", "Adventures / Galleries" style entry points
- Footer nav row: "Home | Blog | Code | Photos | Adventures | Social | About | Contact"

Migration target:
- Astro `/` page with 3–6 tiles: Portfolio, Adventures, Photography, Writing/Blog, Social, About/Contact.

---

### Projects (`/projects`)
Content to migrate (structured):
- Title: "Projects"
- Subtitle: "Front End Developer and Designer"
- "Hi, I'm Forrest Morrisey" bullet list:
  - focused on front end, learning full stack
  - self-taught + devCodeCamp graduate
  - Milwaukee, cat, bikes
  - rediscovered programming/design while teaching screen printing + Python
  - turning concepts into dynamic functional design
- Skills blocks:
  - Professional experience in: JS/React/Angular/Node; HTML5/CSS3/SASS/Responsive Flexbox
  - Familiarity with: C#/Typescript/Python/Express/Mongoose/Docker; MongoDB + SQL
- Experience:
  - UI Developer @ GE Healthcare (MRI tech / application migration)
  - Jr. Web Developer @ SeventySeven Creative (brands list)
- Buttons/links: Download Resume, About Me, GitHub Repo
- "Bootcamp Projects" section with **Spoker** screenshots (multiple images)

Migration target:
- Astro `portfolio` collection:
  - `spoker-v2` entry (already present in your repo structure screenshot)
  - Add "Experience" as a separate "About/Resume" area or as part of `/portfolio` landing.

---

### About (`/about`)
Content to migrate:
- Header: "Forrest Morrisey"
- Subtitle: "Based in Milwaukee, Wisconsin"
- Short paragraph inviting contact/collaboration + "Contact Here" link
- Sections:
  - Experiences (Front End Developer/Designer; educator; ultra-endurance cycling; nature/adventure photographer)
  - Education: devCodeCamp (full list of stacks + tools), UW-Milwaukee BA Anthropology (areas), RIT (Graphic Arts/Photography, IT)
  - Accomplishments: Ride Across Wisconsin (2019 233 mi, 2018 175 mi), 140 lbs weight loss

Migration target:
- Astro `/about` as a static page; optionally duplicate into content collection `about` for easier edits.

---

### Contact / Services (`/services`)
Current "Contact" nav resolves to "Services and Contact".
Content to migrate:
- Title: "Services and Contact"
- Message: open to questions/inquiries/collaboration; sliding-scale; "Nothing is too small or too big" tone

Migration target:
- Astro `/contact` with:
  - email link
  - short form (optional later)
  - this text as the main copy block.

---

### Blog (`/blog`)
Current posts listed:
- "print("Hello World")" (Sep 11)
- "The Journey Begins" (May 15) with category "Transition"

Migration target:
- Map Squarespace Blog → Astro `writing` collection entries:
  - preserve titles + dates
  - preserve category/tag.

---

### Adventures (`/explore` + `/iat-2020`)
Adventures landing (`/explore`) content to migrate:
- Title: "Adventures"
- Subtitle: "Every Journey Begins With a Choice"
- Tiles:
  - ICE AGE TRAIL — "August 2020 Thru Hike" + short description + Read button
  - PDX 2019 — Coming Soon
  - The Great American West — Coming Soon
- CTA: "Browse Galleries"

Adventure detail (`/iat-2020`) content to migrate:
- Hero: "Ice Age Trail" + "August 2020"
- Article title: "Backpacking in the Kettle Moraine State Forest - Northern Unit"
- Narrative paragraphs + day-by-day structure (Day 1, Day 2)
- Embedded images with captions (example: Osprey Atmos 65 caption)

Migration target:
- Astro `adventures` collection:
  - `iat-2020` entry (new)
  - optionally keep "mt-rainier-prep" as separate entry (already present in your repo screenshot)
- Frontmatter fields for editorial layout: `heroImage`, `coverImage`, `date`, `summary`, and optional `gallery[]`.

---

### Photography (Galleries)
Galleries landing (`/browse`) content to migrate:
- Title: "Photo Galleries"
- Tiles:
  - Portraits (short description)
  - Highlights (short description)
  - Climate Strike (short description + date context)
- CTA: "Join my Adventures"

Highlights (`/latest`):
- A gallery page of images (no long-form text)

Climate Strike (`/climatestrike`):
- Title: "Milwaukee Climate Strike!"
- Date: September 20th, 2019
- Image gallery (multiple images)

Portraits (`/portraits`):
- Image gallery (multiple images)

Photos Home (`/photos`):
- Minimal page with "Every Journey Begins With A Choice"

Migration target:
- Astro `photography` collection:
  - `highlights`
  - `climate-strike`
  - `portraits`
  - `winter-ice-gallery` (already present in your repo screenshot)
- Each entry supports `gallery[]` images and optional intro text.

---

### Social (`/social-feeds`)
Content to migrate:
- Title: "Social Feeds"
- Blocks for:
  - Instagram @forrestmorrisey (personal + photography)
  - Instagram @CodeForrestCode (full-stack + UX/UI journey) + GitHub repo link
  - Instagram @BikeForrestBike (cycling account + meaning)
  - Instagram @Joy_of_Inking (screen printing/art/design)

Migration target:
- Astro `/social` static page with cards + outbound links.

---

## 3) Theme + Color Migration (Squarespace → Astro)

### Primary accent color (the green underline you like)
- **Accent green (sampled from the provided Squarespace screenshots):** `#00FF71`

This is the "signature" color to carry forward for:
- underline under site title
- active nav states
- buttons (outline + hover)
- link hover states
- subtle separators

### Suggested supporting palette (close to Squarespace feel)
Use these as CSS variables; tweak later by eye:
- `--bg`: `#0B0D10` (near-black charcoal)
- `--surface`: `#141824` (cards/sections)
- `--text`: `#E7EAF0` (off-white)
- `--muted`: `#A6ADBB` (secondary text)
- `--border`: `#232A3A` (subtle border)
- `--accent`: `#00FF71` (the green)

### Typography + layout cues to mimic
- Dark theme, high-contrast white headings
- Big hero banners with centered title + subtitle
- Multi-column editorial blocks (text + image)
- 3-up tile grids with overlay CTA ("Read", "See More")

---

## 4) Migration Mechanics (LLM-friendly instructions)

### A) Create new content entries (Astro Content Collections)
Create these files (Markdown) and populate from Squarespace:

```text
src/content/adventures/iat-2020.md
src/content/writing/print-hello-world.md
src/content/writing/the-journey-begins.md
src/content/photography/highlights.md
src/content/photography/climate-strike.md
src/content/photography/portraits.md
src/content/social/social-feeds.md   (or keep as a page)
```

### B) Frontmatter template (consistent across sections)

```yaml
title: "..."
date: "YYYY-MM-DD"
summary: "One-paragraph teaser used for tiles."
coverImage: "/assets/images/.../tile.jpg"
heroImage: "/assets/images/.../hero.jpg"
heroSubtitle: "Short subtitle (e.g., 'August 2020')"
featured: true
tags: ["..."]
ctaLabel: "Read"   # or "See More"
gallery:
  - src: "/assets/images/.../001.jpg"
    alt: "..."
    caption: "..."
```

### C) Asset pull plan (Squarespace → public/assets)

* Download all images referenced on:
  * `/iat-2020` ([Forrest Morrisey][1])
  * `/projects` (Spoker screenshots) ([Forrest Morrisey][2])
  * `/latest`, `/portraits`, `/climatestrike` ([Forrest Morrisey][3])
* Store them in:

```text
public/assets/images/adventures/iat-2020/
public/assets/images/portfolio/spoker/
public/assets/images/photography/highlights/
public/assets/images/photography/climate-strike/
public/assets/images/photography/portraits/
```

### D) CSS token drop-in (Astro)

Add to your global CSS:

```css
:root {
  --bg: #0B0D10;
  --surface: #141824;
  --text: #E7EAF0;
  --muted: #A6ADBB;
  --border: #232A3A;
  --accent: #00FF71;
}
```

Then enforce the "Squarespace signature":

* Title underline: `border-bottom: 2px solid var(--accent);`
* Nav hover/active: `color: var(--accent);`
* Buttons (outline):
  * border: `1px solid color-mix(in srgb, var(--text), transparent 55%)`
  * hover background: `color-mix(in srgb, var(--accent), transparent 85%)`

---

## 5) "Pseudo-Ready Today" Acceptance Criteria (Migration scope)

* All top-level routes exist and render: `/`, `/portfolio`, `/adventures`, `/photography`, `/writing`, `/about`, `/contact`, `/resume`, `/social`
* Home shows section tiles and at least one featured item per section
* Adventures landing has 3-up tile grid like Squarespace (Ice Age Trail + "coming soon" placeholders)
* Photography landing has 3-up "See More" gallery tiles (Portraits / Highlights / Climate Strike)
* The accent green is visually present in the header underline + buttons + link hover states
* Content is fully markdown-driven from `src/content/*`

---

[1]: https://www.forrestmorrisey.com/iat-2020 "IAT 2020 - Forrest Morrisey"
[2]: https://www.forrestmorrisey.com/projects "Projects — Forrest Morrisey"
[3]: https://www.forrestmorrisey.com/latest "Highlights - Forrest Morrisey"
