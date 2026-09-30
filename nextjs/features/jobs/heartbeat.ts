/**
 * A scheduled job (swarza.json `scheduledJobs`, D34): swarza calls this function on its
 * schedule, in its own worker with the site's variables and databases. There is no URL to call.
 */
import { client } from "@/lib/db";

type Controller = { cron: string; scheduledTime: number };

export default async function heartbeat(controller: Controller) {
  const at = new Date(controller.scheduledTime).toISOString();
  if (!process.env.DATABASE_URL)
    return console.log(`heartbeat (${controller.cron}) for ${at}: no database bound`);
  const { rows } = await client().execute("select count(*) as n from entries");
  console.log(`heartbeat (${controller.cron}) for ${at}: ${rows[0]?.n} guestbook entries`);
}
