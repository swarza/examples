/**
 * A scheduled job (`scheduledJobs` in swarza.json). swarza runs it on its schedule with the app's
 * variables; what it logs shows on the application's Logs tab.
 */
export default async function heartbeat(controller) {
  console.log(`heartbeat (${controller.cron}) at ${new Date(controller.scheduledTime).toISOString()}`);
}
