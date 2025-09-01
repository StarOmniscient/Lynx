import { Cron } from "../structures/Cron.ts";


export default class ClearExpiredEventsCron extends Cron {
    public constructor() {
        super({
            name: "ClearExpiredEventsCron",
            description: "Checks and removes expired discord events every hour",
            enabled: true,
            repeatTime: 1000 * 60 * 60,
            excludeRunOnStart: false
        })
    }

    public async cronExecute(): Promise<void> {
        const guild = this.client.guilds.cache.get(this.client.mode == "development" ? "1371154945700794489" : "704765614627094589")!

        const events = await guild.scheduledEvents.fetch();

        const now = new Date();

        const expiredEvents = events.filter(event => {
            return event.scheduledStartAt && event.scheduledStartAt < now;
        });

        for (const event of expiredEvents.values()) {
            try {
                await event.delete();
                this.client.logger.cron(`Deleted expired event: ${event.name}`, this.name);
            } catch (err) {
               this.client.logger.error(`Failed to delete event ${event.name}: ${err}`, this.name);
            }
        }



    }
}