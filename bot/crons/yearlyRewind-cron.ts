import { EmbedBuilder, TextChannel } from "discord.js";
import { Cron } from "../structures/Cron.ts";

let lastRunYear: number | null = null;
const servers = [{ guild: "1371154945700794489", channel: "1371154946162032701" }, { "guild": "704765614627094589", channel: "821405506370273291" }]

export default class YearlyRewindCron extends Cron {
    public constructor() {
        super({
            name: "YearlyRewindCron",
            description: "Posts yearly rewind of the server",
            enabled: true,
            repeatTime: 1000 * 60 * 60 * 12, // 12 hours
            excludeRunOnStart: true,

        })
    }

    public async cronExecute(): Promise<void> {
        const day = new Date().getDay()
        const month = new Date().getMonth() + 1
        const year = new Date().getFullYear();


        if (day == 31 && month == 12) {
            if (lastRunYear === year) return; // prevent second run
            lastRunYear = year;


            for (const server of servers) {
                const channel = this.client.guilds.cache.get(server.guild)?.channels.cache.get(server.channel) as TextChannel
                
            }

        }

    }
}