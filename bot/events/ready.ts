import { Events } from "discord.js";
import { LynxClient } from "../client/client.ts";
import { Event } from "../structures/Event.ts";

export default class ReadyEvent extends Event {
    constructor(client: LynxClient) {
        super(client, {
            name: "ReadyEvent",
            type: Events.ClientReady,
            once: true,
            enabled: true,
            description: "Ready event",
        });
    }

    public async eventExecute() {
        this.client.logger.info(`${this.client.user?.username} is online`, this.name);
        await this.client.cronHandler.runCrons()
        
    }

}