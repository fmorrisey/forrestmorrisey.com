import type { APIRoute } from 'astro';

// Generated rather than a static public/robots.txt so the Sitemap line always
// matches whatever `site` is configured as, including a SITE_URL override.
// A hardcoded file would silently drift on cutover.
export const GET: APIRoute = ({ site }) => {
  const body = `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap-index.xml', site).href}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
