/**
 * Asks the running application to refresh its cached pages. Jobs run in their own worker, outside
 * Next.js, so they call the app's /api/revalidate with the shared secret.
 */
export async function refreshSite(reason: string) {
  const site = process.env.SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!site || !secret)
    return console.log(`${reason}; set SITE_URL and REVALIDATE_SECRET to refresh pages at once`);
  // The dashboard shows the address without its scheme; accept it as copied from there.
  const base = /^https?:\/\//.test(site) ? site : `https://${site}`;
  const res = await fetch(new URL("/api/revalidate", base), {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });
  console.log(`${reason}; pages refreshed (HTTP ${res.status})`);
}
