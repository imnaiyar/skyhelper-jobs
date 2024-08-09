import { initializeMongoose } from "./database/connect.js";
import { reminderSchedules } from "./functions/sendReminders.js";
import { eventSchedules } from "./functions/updateShardOrTimes.js";
import { logger } from "./structures/Logger.js";
import cron from "node-cron";
await initializeMongoose();
// SkyTimes
cron.schedule(
  "*/2 * * * *",
  async () => {
    try {
      await eventSchedules("times");
    } catch (err) {
      logger.error("SkyTimes Job Error: ", err);
    }
  },
  { name: "SkyTImes Job" },
);

// Shards job
cron.schedule(
  "*/5 * * * *",
  async () => {
    try {
      await eventSchedules("shard");
    } catch (err) {
      logger.error("Shards Job Error: ", err);
    }
  },
  { name: "Shards Job" },
);
const options = { timezone: "America/Los_Angeles" };
const RemindersToSchedule = [
  {
    name: "turtle",
    interval: "50 */2 * * *",
  },
  {
    name: "grandma",
    interval: "30 */2 * * *",
  },
  {
    name: "geyser",
    interval: "0 */2 * * *",
  },
  {
    name: "reset",
    interval: "0 0 * * *",
  },
  {
    name: "eden",
    interval: "0 0 * * 0",
  },
] as const;

for (const job of RemindersToSchedule) {
  cron.schedule(
    job.interval,
    async () => {
      try {
        await reminderSchedules(job.name);
      } catch (err) {
        logger.error(`${job.name.charAt(0).toUpperCase() + job.name.slice(1)} R Error: `, err);
      }
    },
    { ...options, name: job.name.charAt(0).toUpperCase() + job.name.slice(1) },
  );
}
logger.info("Logged in and Jobs have been started");
