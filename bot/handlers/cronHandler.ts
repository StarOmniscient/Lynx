import { glob } from "glob";
import { LynxClient } from "../client/client.ts"
import path from "path";
import { pathToFileURL } from "url";
import { Cron } from "../structures/Cron.ts";

export class CronHandler {
    public client: LynxClient

    constructor(client: LynxClient) {
        this.client = client
    }

    public async runCrons() {
        const files = (await glob("bot/crons/**/*.{js,ts}")).map(filepath => path.resolve(filepath));

        files.map(async (file: string) => {
            const { default: CronClass } = await import(pathToFileURL(file).href);
            const cron: Cron = new CronClass(this.client);

            if (!cron.enabled) return

            if (!cron.name) {
                this.client.logger.error(`Cron: ${file.split(path.sep).pop()} does not have a name`)
                return
            }

            if (!cron.repeatTime) {
                this.client.logger.error(`Cron: ${file.split(path.sep).pop()} does not have a repeat time)`)
                return
            }
            this.client.crons.set(cron.name, cron);

            if (!cron.excludeRunOnStart) {
                await cron.cronExecute()
            }
            
            this.client.logger.info(`Loaded cron: ${cron.name}`);
            
            setInterval(a => {
                this.client.logger.info(`Running cron: ${cron.name}`)
                cron.cronExecute()
            }, cron.repeatTime)

        })
    }
}