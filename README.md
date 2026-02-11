# forrestmorrisey.com

Self-hosted personal portfolio and content platform.

## Overview

A low-friction publishing platform for portfolio projects, adventures, photography, music, YouTube content, and writing. Built with intentional design and full infrastructure ownership.

## Stack

- **Frontend**: [Astro](https://astro.build/) (static site generator)
- **Styling**: Custom CSS with design tokens
- **Server**: Caddy (reverse proxy)
- **Tunnel**: Cloudflare Tunnel (secure exposure)
- **Containers**: Docker Compose

## Local Development

```bash
cd apps/site
npm install
npm run dev
```

Site runs at `http://localhost:4321`

## Content Workflow

Content lives in `apps/site/src/content/` as Markdown files with YAML frontmatter:

- `adventures/` - Trail journals and outdoor stories
- `photography/` - Photo galleries
- `portfolio/` - Project case studies
- `writing/` - Essays and articles
- `music/` - Music releases and embeds
- `youtube/` - Video content

## Deployment

```bash
cd apps/site && npm run build
cd ../../Infra && docker compose up -d
```

Caddy serves the static `dist/` folder. Cloudflare Tunnel exposes it securely.

## Live

Comming Soon: ~~[forrest.rainierserver.com]([forrest.rainierserver.com](https://forrest.rainierserver.com/))~~

Coming Soon
~~[forrestmorrisey.com](https://forrestmorrisey.com)~~

---

© 2026 Forrest Morrisey. All rights reserved.