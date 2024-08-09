import moment from "moment-timezone";
import { getTranslator } from "./getTranslator.js";
import { Webhook, WebhookMessageCreateOptions } from "#src/structures/Webhook.js";
import { getActiveUpdates } from "#src/database/getGuildDBValues.js";
import getShardsEmbed from "./getShardsEmbed.js";
import { getTimesEmbed } from "./getTimesEmbed.js";
import { GuildSchema } from "#src/types.js";
import { logger } from "#src/structures/Logger.js";

/**
 * Updates Shards/Times Embeds
 * @param type Type of the event
 * @param client The bot client
 */
export async function eventSchedules(type: "shard" | "times"): Promise<void> {
  const currentDate = moment().tz("America/Los_Angeles");
  switch (type) {
    case "times": {
      const response = async (_t: ReturnType<typeof getTranslator>): Promise<WebhookMessageCreateOptions> => {
        const embed = await getTimesEmbed(_t);
        return { embeds: [embed] };
      };
      const data = await getActiveUpdates("times");
      await update(data, "autoTimes", response);
      break;
    }
    case "shard": {
      const response = async (t: ReturnType<typeof getTranslator>): Promise<WebhookMessageCreateOptions> =>
        getShardsEmbed(currentDate, t, t("shards-embed.FOOTER"), true);
      const data = await getActiveUpdates("shard");
      await update(data, "autoShard", response);
    }
  }
}

/**
 * Updates the message
 * @param data Arrray of Guild Documents from database
 * @param type Type of the event
 * @param client The bot client
 * @param response Response to send
 */
const update = async (
  data: GuildSchema[],
  type: "autoShard" | "autoTimes",
  response: (t: ReturnType<typeof getTranslator>) => Promise<WebhookMessageCreateOptions>,
): Promise<void> => {
  data.forEach(async (guild) => {
    const event = guild[type];
    if (!event.webhook.id) return;
    const webhook = new Webhook({ token: event.webhook.token || undefined, id: event.webhook.id });
    const t = getTranslator(guild.language?.value ?? "en-US");
    const now = moment();
    webhook
      .editMessage(event.messageId, {
        content: t("shards-embed.CONTENT", { TIME: `<t:${now.unix()}:R>` }),
        ...(await response(t)),
      })
      .catch((e) => {
        if (e.message === "Unknown Message" || e.message === "Unknown Webhook") {
          if (e.code === 10008) {
            webhook.delete().catch(() => {});
            logger.error(`Live ${type} disabled for ${guild.data.name}, message found deleted!`);
          }
          if (e.code === 10015) {
            logger.error(`Live ${type} disabled for ${guild.data.name}, webhook not found!`);
          }
          guild[type].webhook.id = null;
          guild[type].active = false;
          guild[type].messageId = "";
          guild[type].webhook.token = null;
          guild.save().catch((er) => logger.error("Error Saving to Database" + ` ${type}[Guild: ${guild.data.name}]`, er));
        }
      });
  });
};
