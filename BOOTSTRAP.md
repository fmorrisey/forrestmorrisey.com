# BOOTSTRAP.md — forrestmorrisey.com

This repo will become a self-hosted personal platform (portfolio + writing + adventures + photography) with low-friction updates:
- content = markdown + folders
- deploy = boring + repeatable
- infra = explicit and reviewable

---

## 1) Target Repo Layout
.
├─ apps/
│ └─ site/
│ ├─ public/
│ │ ├─ assets/
│ │ │ ├─ images/
│ │ │ └─ resume/
│ │ └─ robots.txt
│ ├─ src/
│ │ ├─ content/
│ │ │ ├─ adventures/
│ │ │ ├─ photography/
│ │ │ ├─ portfolio/
│ │ │ └─ writing/
│ │ ├─ layouts/
│ │ ├─ pages/
│ │ │ ├─ index.astro
│ │ │ ├─ about.astro
│ │ │ ├─ contact.astro
│ │ │ ├─ resume.astro
│ │ │ ├─ portfolio/[slug].astro
│ │ │ ├─ portfolio/index.astro
│ │ │ ├─ writing/[slug].astro
│ │ │ ├─ writing/index.astro
│ │ │ ├─ adventures/[slug].astro
│ │ │ ├─ adventures/index.astro
│ │ │ ├─ photography/[slug].astro
│ │ │ └─ photography/index.astro
│ │ ├─ styles/
│ │ └─ content.config.ts
│ ├─ astro.config.mjs
│ ├─ package.json
│ └─ tsconfig.json
├─ infra/
│ ├─ caddy/
│ │ └─ Caddyfile
│ ├─ cloudflared/
│ │ └─ config.yml
│ └─ docker-compose.yml
├─ docs/
│ ├─ architecture.md
│ └─ decisions.md
├─ .github/workflows/ci.yml
├─ .editorconfig
├─ .gitignore
└─ README.md


---

## 2) Create the Astro App

From repo root:

```bash
mkdir -p apps
cd apps
npm create astro@latest site
```

