/**
 * Failover behaviour for the origin Worker.
 *
 * Worth having despite the Worker's size: every branch here runs only while
 * production is already broken. There is no natural moment to notice that the
 * fallback path regressed -- the first person to find out would be a visitor
 * during an outage, which is the exact audience this feature exists to protect.
 *
 * Run with `npm test` (node --test, no dependencies).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import worker from "../src/index.js";

const FALLBACK = "https://forrestmorrisey-fallback.pages.dev";

const pagesOk = () => new Response("<html>FALLBACK PAGE</html>", { status: 200 });
const pagesDead = () => {
  throw new Error("pages unreachable");
};

/** Drive the Worker with a stubbed network: one behaviour for the origin, one
 *  for the Pages host it falls back to. */
async function run(originBehavior, pagesBehavior = pagesOk) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (req) => {
    const url = typeof req === "string" ? req : req.url;
    return url.startsWith(FALLBACK) ? pagesBehavior() : originBehavior();
  };
  try {
    return await worker.fetch(
      new Request("https://forrest.rainierserver.com/writing/")
    );
  } finally {
    globalThis.fetch = realFetch;
  }
}

test("a healthy origin passes through untouched", async () => {
  const res = await run(() => new Response("real site", { status: 200 }));
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "real site");
});

test("a 404 is the origin working, not failing", async () => {
  // The regression this guards against: widening the failure check to any
  // non-2xx, which would hide every broken link behind "we're offline".
  const res = await run(() => new Response("not found", { status: 404 }));
  assert.equal(res.status, 404);
});

test("redirects pass through", async () => {
  const res = await run(() => new Response(null, { status: 301 }));
  assert.equal(res.status, 301);
});

test("a downed tunnel (530) serves the fallback", async () => {
  const res = await run(() => new Response("err", { status: 530 }));
  assert.equal(res.status, 503);
  assert.match(await res.text(), /FALLBACK PAGE/);
});

test("a 502 serves the fallback", async () => {
  const res = await run(() => new Response("bad gateway", { status: 502 }));
  assert.equal(res.status, 503);
  assert.match(await res.text(), /FALLBACK PAGE/);
});

test("an origin that never responds serves the fallback", async () => {
  const res = await run(() => {
    throw new Error("ECONNREFUSED");
  });
  assert.equal(res.status, 503);
  assert.match(await res.text(), /FALLBACK PAGE/);
});

test("the fallback tells clients to come back, and is never cached", async () => {
  const res = await run(() => new Response("err", { status: 530 }));
  assert.equal(res.headers.get("retry-after"), "120");
  // A cached fallback would outlive the outage that caused it.
  assert.match(res.headers.get("cache-control"), /no-store/);
});

test("losing both the origin and Pages still yields a usable page", async () => {
  const res = await run(() => {
    throw new Error("ECONNREFUSED");
  }, pagesDead);
  const body = await res.text();
  assert.equal(res.status, 503);
  assert.match(body, /github\.com\/fmorrisey/);
  assert.match(body, /linkedin\.com\/in\/forrestmorrisey/);
});

test("a Pages project that 404s does not leak its error body", async () => {
  const res = await run(
    () => new Response("err", { status: 530 }),
    () => new Response("nope", { status: 404 })
  );
  const body = await res.text();
  assert.equal(res.status, 503);
  assert.match(body, /short break/);
  assert.doesNotMatch(body, /nope/);
});
