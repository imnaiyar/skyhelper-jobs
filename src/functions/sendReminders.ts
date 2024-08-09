import { getActiveReminders } from "#src/database/getGuildDBValues.js";
import { Webhook } from "#src/structures/Webhook.js";
import { roleMention } from "@discordjs/builders";
import { getTranslator, langKeys } from "./getTranslator.js";
import { logger } from "#src/structures/Logger.js";
import { getDailyEventTimes } from "./getTimesEmbed.js";

type events = "geyser" | "grandma" | "turtle" | "eden" | "reset";

/**
 * Sends the reminder to the each active guilds
 * @param client The bot client
 * @param type Type of the event
 */
export async function reminderSchedules(type: events): Promise<void> {
  const activeGuilds = await getActiveReminders();
  activeGuilds.forEach(async (guild) => {
    const t = getTranslator(guild.language?.value ?? "en-US");
    try {
      const rmd = guild?.reminders;
      if (!rmd) return;
      const event = rmd[type];
      const { webhook, default_role } = rmd;
      if (!event?.active) return;
      if (!webhook.id || !webhook.token) return;
      const wb = new Webhook({ token: webhook.token, id: webhook.id });

      const roleid = event?.role ?? default_role ?? "";
      const role = roleid && t("reminders.ROLE_MENTION", { ROLE: roleMention(roleid) });

      let response = null;
      if (type === "eden") {
        response = { content: `${role} ${t("reminders.EDEN_RESET")}` };
      } else if (type === "reset") {
        response = { content: `${role}${t("reminders.DAILY_RESET")}` };
      } else {
        response = { content: getResponse(type, t, role) };
      }
      if (!response) return;
      wb.send({
        // @ts-expect-error
        username: t("reminders.TITLE", { TYPE: t("times-embed." + (type === "reset" ? "DAILY" : type.toUpperCase())) }),
        avatar_url: "https://skyhelper.xyz/assets/img/boticon.png",
        ...response,
      })
        .then((msg) => {
          guild.reminders[type].last_messageId = msg?.id || undefined;
          guild.save().catch((err) => logger.error(guild.data.name + " Error saving Last Message Id: ", err));
        })
        .catch((err) => {
          if (err.message === "Unknown Webhook") {
            guild.reminders.webhook.id = null;
            guild.reminders.active = false;
            guild.reminders.webhook.token = null;
            guild
              .save()
              .then(() => logger.error(`Reminders disabled for ${guild.data.name}, webhook not found!`))
              .catch((er) => logger.error("Error Saving to Database" + ` ${type}[Guild: ${guild.data.name}]`, er));
          }
          logger.error(guild.data.name + " Reminder Error: ", err);
        });
      if (event.last_messageId) wb.deleteMessage(event.last_messageId).catch(() => {});
    } catch (err) {
      logger.error(err);
    }
  });
}

/**
 * Get the response to send
 * @param type Type of the event
 * @param role Role mention, if any
 * @returns The response to send
 */
function getResponse(type: events, t: (key: langKeys, options?: {}) => string, role: string) {
  let skytime;
  let offset = 0;
  switch (type) {
    case "grandma":
      skytime = "Grandma";
      offset = 30;
      break;
    case "geyser":
      skytime = "Geyser";
      offset = 0;
      break;
    case "turtle":
      skytime = "Turtle";
      offset = 50;
      break;
  }
  const { startTime, endTime, active } = getDailyEventTimes(offset);
  if (!active) return t("reminders.ERROR");
  return `${role}\n${t("reminders.COMMON", {
    // @ts-expect-error
    TYPE: t("times-embed." + skytime?.toUpperCase()),
    TIME: `<t:${startTime.unix()}:t>`,
    "TIME-END": `<t:${endTime.unix()}:t>`,
    "TIME-END-R": `<t:${endTime.unix()}:R>`,
  })}`;
}
