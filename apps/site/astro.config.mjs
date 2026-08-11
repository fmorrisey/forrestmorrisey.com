// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The canonical home of this site. Squarespace still serves this domain until
// the cutover, and that is deliberate: canonical URLs and the sitemap should
// describe the site's final home, not the staging origin it happens to be
// served from today. Pointing canonicals at forrestmorrisey.com also keeps the
// staging host from competing with the live site in search results, and means
// nothing here has to change on cutover day.
//
// Override for a build that should describe a different origin:
//   SITE_URL=https://forrest.rainierserver.com npm run build
const SITE_URL = process.env.SITE_URL ?? 'https://forrestmorrisey.com';

export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
});
