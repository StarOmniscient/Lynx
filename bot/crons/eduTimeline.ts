import { Cron } from "../structures/Cron.ts";
import { Edupage } from "edupage-api"
import { AttachmentBuilder, Guild, GuildChannel, TextChannel } from "discord.js"
import { EmbedBuilder } from "@discordjs/builders"
import fetch from "node-fetch";
import "dotenv/config"
import client from "../index.ts"
import config from "../../config.ts" 

const edupage = new Edupage()

export default class eduTimelineCron extends Cron {
    public constructor() {
        super({
            name: "eduTimeline",
            description: "",
            enabled: true,
            repeatTime: 10000
        })
    }

    public async cronExecute() {

        if (!edupage.user) {
            await edupage.login(process.env.EDU_NAME!, process.env.EDU_PASS!)
        }

        const timeline = edupage.timeline
        const table = await this.client.prisma.timeline.findMany({
            select: {
                timeLineID: true
            }
        })
        //console.log(table)
        const removeType = ["h_chatlist", "payments", "vcelicka", "znamka", "ospravedlnenka", "student_absent", "h_contest", "contest", "h_homework", "h_znamky", "interest", "settings", "znamkydoc", "testvysledok"]

        //console.log(timeline)
        const newTimeline = await Promise.all(timeline.map(async item => {
            
            if (table.includes(item.id)) return
            if (removeType.includes(item.type)) return;
            if (item.recipientUserString.includes("Ucitel")) return;
            if (item.recipientUserString.includes("StudentOnly408089")) return;
            
            try {
                await this.client.prisma.timeline.create({
                    data: {
                        timeLineID: item.id,
                        title: item.title,
                        type: item.type,
                        text: item.text
                    }
                })
                
            } catch (error: Error | any) {
                this.client.logger.error(error)
            }


            return {
                id: item.id,
                title: item.title,
                type: item.type,
                text: item.text,
                attachments: await item.attachments.map((attachment: { name: string; src: string; }) => {
                    return {
                        name: attachment.name,
                        src: attachment.src
                    }
                })
            };
        }));

        let channel: TextChannel, guild

        switch (client.mode) {
            case "development": {
                guild = await client.guilds.fetch(config.eduTimeline.dev_guildID)
                channel = await guild.channels.cache.get(config.eduTimeline.dev_channelID) as TextChannel
                break
            }
            case "production": {
                guild = await client.guilds.fetch(config.eduTimeline.guildID)
                channel = await guild.channels.cache.get(config.eduTimeline.channelID) as TextChannel
                break
            }
        }

        const colors: Record<string, number> = {
            "event": 0x1abc9c,          // teal
            "genotif": 0x3498db,        // blue
            "homework": 0xf39c12,       // orange
            "news": 0x9b59b6,           // purple
            "sprava": 0xe74c3c,         // red
            "substitution": 0xe67e22,   // dark orange
            "testpridelenie": 0x2ecc71, // green
            "timetable": 0x95a5a6       // gray
        };


        await newTimeline.map(async item => {
            if (!item) return;
            const embed = new EmbedBuilder()
                .setColor(colors[item.type])
                .setTimestamp()

            if (item.text.length > 4096) {
                embed.setDescription(item.text.slice(0, 4096))
            } else {

                if (item.text.length < 1) {
                    embed.setTitle(item.title.replace("Sebastián Savary", "----"))
                    embed.setDescription(`No text`)
                } else {
                    embed.setDescription(item.text)
                }
            }

            if (item.title.length > 256) {
                embed.setTitle(item.title.slice(0, 256).replace("Sebastián Savary", "----"))
            } else {
                embed.setTitle(item.title.replace("Sebastián Savary", "----"))
            }

            if (item.attachments.length > 0) {
                const url = item.attachments[0].src;
                const filename = item.attachments[0].name;
                // Download the image
                const response = await fetch(url);
                const buffer = await response.buffer();

                // Create a Discord attachment
                const attachment = new AttachmentBuilder(buffer, { name: filename });

                await channel.send({ embeds: [embed], files: [attachment] })
                return
            }

            await channel.send({ embeds: [embed] })

        })
    }
}