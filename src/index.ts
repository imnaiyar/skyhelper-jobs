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
      logger.info("Ran SkyTimes Job");
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
      logger.info("Ran Shards Job");
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

for (const { name, interval } of RemindersToSchedule) {
  const nameFormat = name.charAt(0).toUpperCase() + name.slice(1);
  cron.schedule(
    interval,
    async () => {
      try {
        await reminderSchedules(name);
        logger.info(`Ran ${nameFormat} Reminder Job`);
      } catch (err) {
        logger.error(`${nameFormat} R Error: `, err);
      }
    },
    { ...options, name: nameFormat + " Reminder" },
  );
}
logger.info("Logged in and Jobs have been started");

// Catch any unknown errors
process.on("uncaughtException", logger.error);
process.on("unhandledRejection", logger.error);