import { Cron } from "../structures/Cron.ts";


export default class PruneLogs extends Cron {
    public constructor() {
        super({
            name: "pruneLogs",
            description: "Removes logs every 24 hours",
            enabled: true,
            repeatTime: 1000 * 60 * 60 * 24,
            excludeRunOnStart: true
        })
    }

    public async cronExecute(): Promise<void> {
        const count = await this.client.prisma.log.count();


        
        await this.client.prisma.log.deleteMany({
        });
        this.client.logger.cron(`Pruned ${count} old logs`);

    }
}