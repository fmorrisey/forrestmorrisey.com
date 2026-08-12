# Infrastructure

forrestmorrisey.com is served from a single origin — Rainier — reached over a
Cloudflare Tunnel.

```
Browser → Cloudflare → Tunnel → cloudflared (host) → :8090 Caddy → /srv/www/forrestmorrisey.com
```

| Path | What it is |
|---|---|
| `docker-compose.yml` | The Caddy container serving the deployed site on `127.0.0.1:8090`. |
| `caddy/Caddyfile` | Static file serving, cache headers, and the legacy Squarespace redirects. |
| `fallback/` | Static page shown when Rainier is unreachable. See below. |
| `worker/` | Cloudflare Worker implementing the failover. See below. |

Caddy serves `/srv/www/forrestmorrisey.com`, written by the self-hosted runner —
deliberately not a local build, so production never depends on someone's working
copy.

---

# Static Fallback & Social Redirect

Tracks [issue #5](https://github.com/fmorrisey/forrestmorrisey.com/issues/5).

When Rainier is down, Cloudflare serves its own error page (1033, or a 52x).
This replaces that with a branded page pointing visitors at GitHub and LinkedIn,
and gets out of the way the moment the origin returns.

This is graceful failure, not uptime. Nothing here makes the site more
available; it makes the unavailable case presentable.

```
Browser → Worker ──try──→ Rainier via Tunnel      (healthy: response passes through)
                 └─fail─→ Pages: fallback page     (unhealthy: 503 + branded page)
                          └─fail─→ inline page in the Worker
```

| Piece | Lives in | What it is |
|---|---|---|
| Fallback page | `fallback/index.html` | One self-contained HTML file. No build, no external requests. |
| Failover Worker | `worker/src/index.js` | Routes traffic; swaps in the fallback on origin failure. |
| Route config | `worker/wrangler.toml` | Puts the Worker in front of every path on the zone. |
| Tests | `worker/test/` | `cd worker && npm test`. No dependencies. |

## One deliberate departure from the issue

The issue specified a `HEAD` health check before forwarding each request. The
implementation instead sends the real request and treats its outcome as the
health signal.

Two round trips to the origin on every request would be paid by 100% of traffic
to change the handling of a rare case. And a preflight is already stale by the
time you act on it — the origin can drop between the `HEAD` and the request it
vouched for, so the failure path has to exist anyway. Given that, the preflight
buys nothing the catch block does not already cover.

Everything else follows the issue as written.

## What counts as failure

Only 5xx. That covers the tunnel-specific codes (530 for a 1033, and 521/522/523
for an unreachable origin) along with ordinary gateway errors.

A 404 explicitly does **not** trigger the fallback — that is Caddy correctly
reporting a missing page. Widening the check to "any non-2xx" would bury every
broken link on the site behind a message claiming the server is offline.

## Two details that are easy to get wrong

**The fallback returns 503, not 200.** Visitors cannot see a status code, but
crawlers can. A 503 with `Retry-After` reads as "come back later" and preserves
the site's existing rankings; a 200 invites Google to index the outage page as
the homepage. The page also carries `noindex`.

**The fallback is `no-store`.** If an edge or a browser cached it, the outage
would outlive the outage — visitors would keep seeing the offline page after
Rainier came back.

## Deploying

Neither step is automated: both need Cloudflare account access.

### 1. Fallback page → Cloudflare Pages

Create a Pages project serving `infra/fallback/` as the output directory, with
no build command. Direct upload works fine; there is nothing to compile.

**The project name matters.** It determines the `*.pages.dev` hostname, and the
Worker has that hostname hardcoded as `FALLBACK_ORIGIN`. Naming the project
`forrestmorrisey-fallback` matches what is already in the code. Any other name
means updating `worker/src/index.js` to match.

Do **not** put the fallback on a subdomain of `forrestmorrisey.com`. The Worker
route covers the whole zone, so fetching the fallback through that zone would
loop back through the failover path it is meant to escape.

### 2. Worker → Cloudflare Workers

```bash
cd infra/worker
npx wrangler deploy
```

`wrangler.toml` binds the Worker to `forrestmorrisey.com/*` and
`www.forrestmorrisey.com/*`. Confirm the `www` route matches how the zone is
actually set up — if `www` is a redirect rather than a served hostname, that
second route is harmless but pointless.

## Verifying it works

The honest test is an actual outage, which you can stage safely:

1. With the site healthy, confirm normal browsing is unchanged and responses
   carry no `x-fallback` header.
2. Stop the origin: `docker compose -f infra/docker-compose.yml stop site` on
   Rainier (or stop `cloudflared`, which exercises the 1033 path specifically).
3. Load the site. Expect the branded page, HTTP 503, and
   `x-fallback: origin-unreachable`:
   ```bash
   curl -sI https://forrestmorrisey.com/ | head -20
   ```
4. Start the origin again. The next request should reach the real site with no
   intervention — no cache purge, no redeploy. If it does not, the `no-store`
   header is not doing its job.

Check a deep path too (`/writing/`), not just the root — the route pattern
covers `/*` and a mistake there would only show up below the homepage.

## Rollback

Delete the Worker route in the Cloudflare dashboard. Traffic goes straight to
the origin again and behaviour returns to exactly what it was before this
feature, Cloudflare error pages included. The Pages project can stay; it costs
nothing and serves no traffic on its own.

## Deliberately not done

From the issue's own out-of-scope list: automatic redirect after a timeout,
resume download link, contact CTA, analytics on fallback hits, and Pages as a
hot standby for the full site.
