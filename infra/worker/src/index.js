/**
 * Origin failover for forrestmorrisey.com.
 *
 * The site is served from a single origin (Rainier) over a Cloudflare Tunnel.
 * When that origin is unreachable, Cloudflare's own error page (1033 / 52x) is
 * what a visitor sees -- often a recruiter following a link from a resume. This
 * Worker replaces that with the branded fallback page in `infra/fallback`.
 *
 * ## Why there is no health check
 *
 * The original plan called for a `HEAD` preflight to the origin before
 * forwarding each request. This does the same job with one round trip instead
 * of two, by treating the real request as its own health check.
 *
 * That matters for more than latency. A preflight is also a lie by the time you
 * act on it: the origin can drop between the `HEAD` and the request it was
 * meant to vouch for, so the failure path has to exist regardless -- at which
 * point the preflight is pure cost, paid on 100% of traffic to change the
 * handling of a rare one.
 */

/** Where the static fallback lives. Must be a hostname this Worker does not
 *  serve, or fetching it would loop back through this same failover path. */
const FALLBACK_ORIGIN = "https://forrestmorrisey-fallback.pages.dev";

/** Give up on a silent origin. Cloudflare itself waits ~100s before a 524,
 *  which is far past the point a visitor has already left. A static site that
 *  has not answered in 8s is not healthy. */
const ORIGIN_TIMEOUT_MS = 8000;

/** How long to tell clients and crawlers to wait before retrying, in seconds. */
const RETRY_AFTER_S = 120;

/**
 * Is this response the origin failing, or the origin doing its job?
 *
 * Only 5xx counts. A 404 is Caddy correctly reporting a missing page and must
 * pass through untouched -- swallowing those behind a fallback would hide real
 * broken links behind a message that says everything is fine. Tunnel-specific
 * failures (530 for 1033, 521/522/523 for an unreachable origin) all land in
 * the same 5xx band.
 */
function isOriginFailure(response) {
  return response.status >= 500;
}

/**
 * Serve the fallback, or -- if even that fails -- a last-resort inline notice.
 *
 * Returned as 503 rather than 200 so the outage stays honest to machines:
 * crawlers treat 503 + Retry-After as "come back later" and keep the real
 * rankings, where a 200 would invite them to index this page as the site.
 * The status is invisible to a human, who just sees the page.
 */
async function serveFallback() {
  const headers = {
    "content-type": "text/html; charset=utf-8",
    // Never let the edge or a browser hold onto this. The moment Rainier is
    // back, the next request must reach it -- an outage that outlives itself
    // in a cache is worse than the outage.
    "cache-control": "no-store, must-revalidate",
    "retry-after": String(RETRY_AFTER_S),
    "x-fallback": "origin-unreachable",
  };

  try {
    const page = await fetch(FALLBACK_ORIGIN, {
      signal: AbortSignal.timeout(ORIGIN_TIMEOUT_MS),
    });

    if (page.ok) {
      return new Response(page.body, { status: 503, headers });
    }
  } catch {
    // Fall through to the inline copy below.
  }

  // Both the origin and Pages are unreachable. Rare, but this is the one code
  // path with nothing left to fall back to, so it carries no dependencies.
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<meta name="robots" content="noindex,nofollow">` +
      `<title>Forrest Morrisey — Temporarily Offline</title></head>` +
      `<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;` +
      `background:#0b0d10;color:#e7eaf0;font-family:system-ui,sans-serif;text-align:center;padding:24px">` +
      `<main><h1 style="font-size:1.5rem">The site is taking a short break</h1>` +
      `<p style="color:#a6adbb">Find me on ` +
      `<a href="https://github.com/fmorrisey" style="color:#00ff71">GitHub</a> or ` +
      `<a href="https://linkedin.com/in/forrestmorrisey" style="color:#00ff71">LinkedIn</a>.</p>` +
      `</main></body></html>`,
    { status: 503, headers }
  );
}

export default {
  async fetch(request) {
    try {
      const response = await fetch(request, {
        signal: AbortSignal.timeout(ORIGIN_TIMEOUT_MS),
      });

      return isOriginFailure(response) ? await serveFallback() : response;
    } catch {
      // Timeout, DNS failure, tunnel down -- anything that means no response.
      return await serveFallback();
    }
  },
};
