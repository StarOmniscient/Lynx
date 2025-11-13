import { Cron } from "../structures/Cron.ts";

export default class DeleteChatMessagesCron extends Cron {
  public constructor() {
    super({
      name: "DeleteChatMessagesCron",
      description: "Deletes messages older than 1 day from DB",
      enabled: true,
      repeatTime: 1000 * 60 * 60 * 24, // 24 hours
      excludeRunOnStart: false,
    });
  }

  public async cronExecute() {
    const oneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);
    this.client.logger.cron("Deleting messages", this.name)
    await this.client.prisma.chatMessages.deleteMany({
      where: {
        timestamp: { lt: oneDayAgo },
      },
    });
  }
}
