/**
 * A scheduled job (`scheduledJobs` in swarza.json). Every evening it logs tomorrow's opening hours,
 * for whoever opens up. swarza runs it on its schedule, in UTC, with the app's variables in `env`;
 * what it logs shows on the application's Logs tab, and "Run now" on the Scheduled jobs tab runs it
 * at once.
 */
import { hours, settings } from "../data.mjs";
import { localTime } from "../clock.mjs";

export default async function tomorrow(controller, env) {
  const shop = settings(env);
  const today = localTime(shop.timeZone, new Date(controller.scheduledTime));
  const next = hours[(today.day + 1) % 7];
  const line = next.open
    ? `opens at ${next.open} and closes at ${next.close}`
    : `is closed${next.note ? ` (${next.note.toLowerCase()})` : ""}`;
  console.log(`${shop.shopName} ${line} tomorrow, ${next.day} (${shop.timeZone}; job ${controller.cron})`);
}
