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
                console.log(`Cron: ${file.split(path.sep).pop()} does not have a name`)
                return
            }

            if (!cron.repeatTime) {
                console.log(`Cron: ${file.split(path.sep).pop()} does not have a repeat time)`)
                return
            }
            this.client.crons.set(cron.name, cron);
            cron.cronExecute()
            console.log(`Loaded cron: ${cron.name}`);
            
            setInterval(a => {
                cron.cronExecute()
            }, cron.repeatTime * 1000)

        })
    }
}