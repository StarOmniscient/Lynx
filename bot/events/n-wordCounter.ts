import { ChatInputCommandInteraction, Events, Message } from "discord.js";
import { LynxClient } from "../client/client.ts";
import { Event } from "../structures/Event.ts";

const variations = ["nigger", "nigga", "neger", "negger"]


export default class NwordCounterEvent extends Event {
    constructor(client: LynxClient) {
        super(client, {
            name: "NWordCounterEvent",
            type: Events.MessageCreate,
            once: false,
            enabled: true,
            description: "Counts n-words send by user",
        });
    }

    public async eventExecute(message: Message) {
        const msg = message.content.toLowerCase()
        const year = new Date(message.createdTimestamp).getFullYear()
        const month = new Date(message.createdTimestamp).getMonth()

        let count = 0;
        for (const word of variations) {
            const regex = new RegExp(`\\b${word}\\b`, "gi"); // word boundaries + case insensitive
            count += (msg.match(regex) || []).length;
        }

        if (count > 0) {
            await this.client.prisma.nwordCount.upsert({
                where: {
                    userID_guildID_year_month: {
                        userID: message.author.id,
                        guildID: message.guild!.id,
                        year: year,
                        month: month
                    }
                },
                update: { count: { increment: count } },
                create: {
                    guildID: message.guild?.id!,
                    count: count,
                    userID: message.author.id,
                    year: year,
                    month: month
                }
            })
        }
    }

}