import { Cron } from "../structures/Cron.ts";


export default class PruneLogsCron extends Cron {
    public constructor() {
        super({
            name: "PruneLogsCron",
            description: "Removes logs every 48 hours",
            enabled: true,
            repeatTime: 1000 * 60 * 60 * 24 * 2,
            excludeRunOnStart: true
        })
    }

    public async cronExecute(): Promise<void> {
        const count = await this.client.prisma.log.count();


        
        await this.client.prisma.log.deleteMany({
        });
        this.client.logger.cron(`Pruned ${count} old logs`, this.name);

    }
}