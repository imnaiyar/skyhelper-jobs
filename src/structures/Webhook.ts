import { APIAllowedMentions, APIEmbed, APIMessage, APIMessageComponent, APIWebhook, Routes } from "discord-api-types/v10";
import { makeURLSearchParams, REST } from "@discordjs/rest";
const api = new REST().setToken(process.env.TOKEN);
class Webhook {
  private id: string;
  private token: string | undefined;
  constructor(data: WebhookData) {
    this.id = data.id;
    this.token = data.token;
  }
  async send(options: WebhookMessageCreateOptions): Promise<APIMessage> {
    if (this.token) this.token = (await this.getWebhook(this.id)).token;
    const query = makeURLSearchParams({ wait: true });
    return (await api.post(Routes.webhook(this.id, this.token), { body: { ...options }, query })) as APIMessage;
  }

  /**
   * Edits a message sent by this webhook
   * @param messageId The id of the message to edit
   * @param options Edit options
   * @returns The edited message
   */
  async editMessage(messageId: string, options: WebhookEditMessageOptions) {
    if (!this.token) this.token = (await this.getWebhook(this.id)).token!;
    if (!messageId) throw new Error("Yout must provide message id to edit");
    return await api.patch(Routes.webhookMessage(this.id, this.token, messageId), { body: { ...options } });
  }

  /**
   * Deletes a message sent by this webhook
   * @param messageId The id of the message to delete
   * @returns
   */
  async deleteMessage(messageId: string) {
    if (!this.token) this.token = (await this.getWebhook(this.id)).token!;
    if (!messageId) throw new Error("Yout must provide message id to delete");
    return await api.delete(Routes.webhookMessage(this.id, this.token, messageId));
  }

  async getWebhook(id: string, token?: string): Promise<APIWebhook> {
    return (await api.get(Routes.webhook(id, token))) as APIWebhook;
  }

  async delete() {
    api.delete(Routes.webhook(this.id, this.token));
  }
}

export { Webhook };
type WebhookData = {
  id: string;
  token?: string;
};

/* Only adding options that'll be using, this is not all o fthe options that can be passed,*/
export type WebhookMessageCreateOptions = {
  content?: string;
  embeds?: APIEmbed[];
  components?: APIMessageComponent[];
  username?: string;
  avatar_url?: string;
  allowed_mentions?: APIAllowedMentions;
};

export type WebhookEditMessageOptions = Omit<WebhookMessageCreateOptions, "username" | "avatar_url">;
