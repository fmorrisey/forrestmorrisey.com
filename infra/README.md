# Infrastructure

The Astro site is built and served by **Cloudflare Pages**, connected directly
to this GitHub repository. A push to `main` triggers a Cloudflare build; nothing
in this repository deploys it.

```
push to main → Cloudflare Pages build → forrest.rainierserver.com
```

**forrestmorrisey.com is still served by Squarespace** and stays that way until
cutover, which is deliberately the last step of the migration. Nothing here
should route, link to, or depend on the Squarespace site.

## Build configuration

Set in the Pages project, not in this repo. Recorded here because the settings
live in a dashboard where nobody will find them later:

| Setting | Value |
|---|---|
| Root directory | `apps/site` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Production branch | `main` |
| `NODE_VERSION` | `20` |

The root directory matters: this is a monorepo and there is no `package.json` at
the top level, so a build from the default root fails immediately.

## Domain and canonical host

**The apex is canonical.** `forrestmorrisey.com` serves the site;
`www.forrestmorrisey.com` 301s to it.

This is not arbitrary and should not be flipped casually. `site` in
`apps/site/astro.config.mjs` has described the apex since long before the domain
served this site, so every canonical tag, every `<loc>` in the sitemap, and the
`Sitemap:` line in `robots.txt` already name it. Changing the canonical host
means rebuilding all of that, and asking search engines to re-consolidate a
second time.

Squarespace published `www` for years, so inbound links and existing search
results point there. The `www` -> apex redirect is what carries them over, and
it has to keep working indefinitely -- it is not a transitional step.

| Setting | Value |
|---|---|
| Pages custom domain | `forrestmorrisey.com` |
| Pages custom domain | `www.forrestmorrisey.com` |
| Redirect Rule | hostname `www.forrestmorrisey.com` -> `https://forrestmorrisey.com` + path, 301 |
| SSL/TLS mode | Full (strict) |

The redirect is a zone-level Redirect Rule rather than a line in `_redirects`,
because Pages redirect rules match on path only -- they cannot see the hostname,
so they cannot express "www to apex".

## What controls behaviour, and where

Routing and caching are **not** configured here any more. They are files in the
site's `public/`, copied into `dist` by the build and read by Pages:

| File | What it does |
|---|---|
| `apps/site/public/_redirects` | Legacy Squarespace URLs, and `/portfolio/*` → `/software/*` |
| `apps/site/public/_headers` | Cache policy for `/_astro/*` and `/assets/*` |

Both fail **silently**. If they do not reach `dist`, every legacy URL 404s and
no cache header is set, behind a deploy that reports success. The CI workflow
asserts their presence for that reason.

## Retired

Everything below served the site when it ran from Rainier behind a Cloudflare
Tunnel. That arrangement is gone: Rainier hosted both the web server and the CI
runner that deployed to it, so an offline Rainier took down serving *and* the
ability to ship a fix. A physical move made that untenable.

| Path | Was | Status |
|---|---|---|
| `docker-compose.yml` | Caddy container on `127.0.0.1:8090` | Retired |
| `caddy/Caddyfile` | Static serving, cache headers, redirects | Retired — rules live in `_redirects` / `_headers` |
| `setup-runner.sh` | One-time host setup for the self-hosted runner | Retired |
| `worker/` | Failover Worker: served a fallback when the origin was down | **Obsolete** — Pages is the host; there is no origin to fail over from |
| `fallback/` | The branded offline page that Worker served | **Obsolete** for the same reason |

These are kept as the record of how the site used to run, and because the Caddy
redirect list is the origin of what is now in `_redirects`. Nothing here is
deployed, and the Worker was never deployed at all.

**They can be deleted.** Retaining infrastructure that no longer runs is how a
repository starts lying about itself. Left in place only because removing a
directory someone might still want is not a call to make silently.
