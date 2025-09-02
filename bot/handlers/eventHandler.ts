import { glob } from "glob";
import { LynxClient } from "../client/client.ts"
import path from "path";
import { Event } from "../structures/Event.ts";
import { pathToFileURL } from "url";

export class EventHandler {
    public client: LynxClient

    constructor(client: LynxClient) {
        this.client = client
    }

    public async loadEvents() {
        const files = (await glob("bot/events/**/*.{js,ts}")).map(filepath => path.resolve(filepath));

        files.map(async (file: string) => {
            try {
                const { default: EventClass } = await import(pathToFileURL(file).href);
                const event: Event = new EventClass(this.client);
                this.client.events.set(event.name, event as Event)
                if (!event.enabled) return

                if (!event.name) {
                    this.client.logger.error(`Event: ${file.split(path.sep).pop()} does not have a name`, event.name)
                    return
                }
                const execute = (...args: any) => event.eventExecute(...args)
                if (event.once) this.client.once(event.type as string, execute)
                else this.client.on(event.type as string, execute)
                
                
                this.client.logger.info(`Loaded event: ${event.name}`, event.name);
                return 

            } catch (err) {
                this.client.logger.error(`Error loading ${file}: ${err}`)
            }
        })
    }

}