import { Cron } from "../structures/Cron.ts";
import { Edupage } from "edupage-api";
import { AttachmentBuilder, TextChannel } from "discord.js";
import { EmbedBuilder } from "@discordjs/builders";
import fetch from "node-fetch";
import "dotenv/config";
import client from "../index.ts";
import config from "../../config.ts";

const edupage = new Edupage()

export default class EduTimeLineCron extends Cron {
    public constructor() {
        super({
            name: "EduTimelineCron",
            description: "Checks timeline in edupage",
            enabled: true,
            repeatTime: 10 * 1000, // 10 sec
            excludeRunOnStart: false
        })
    }

    public async cronExecute() {

        if (!edupage.user) {
            await edupage.login(process.env.EDU_NAME!, process.env.EDU_PASS!)
        }
        edupage.refreshTimeline(true)
        const timeline = edupage.timeline
        const table = await this.client.prisma.timeline.findMany({

        }).catch(
            (err) => {
                return this.client.logger.error(`Error fetching timeline: ${err}`, this.name)
            }
        )
        if (!table) return;

        const seenItems = new Set<string>();

        const removeType = ["h_chatlist", "payments", "vcelicka", "znamka", "ospravedlnenka", "student_absent", "h_contest", "contest", "h_homework", "h_znamky", "interest", "settings", "znamkydoc", "testvysledok"]

        // Prepare a Set from DB
        const existingTextKeys = new Set(table.map(t => `${t.text}|${t.timeLineDate?.toISOString()}`));

        const newTimeline: typeof timeline = [];

        for (const item of timeline) {
            if (!item || removeType.includes(item.type)) continue;
            
            if (item.recipientUserString.includes("Ucitel")) continue;
            if (item.recipientUserString.includes("StudentOnly408089")) continue;
            
            const key = `${item.text}|${item.timelineDate?.toISOString()}`;

            // Skip if exists in DB or already processed in this run
            if (existingTextKeys.has(key) || seenItems.has(key)) continue;

            this.client.logger.debug({
                title: item.title,
                text: item.text,
                type: item.type
            })

            seenItems.add(key);        // Mark as processed
            existingTextKeys.add(key); // Optional: mark in DB tracking as well

            // Save to DB
            await this.client.prisma.timeline.create({
                data: {
                    timeLineID: item.id,
                    title: item.title,
                    type: item.type,
                    text: item.text,
                    timeLineDate: item.timelineDate
                }
            }).catch(err => this.client.logger.error(`Error creating timeline: ${err}`, this.name));

            newTimeline.push({
                id: item.id,
                title: item.title,
                type: item.type,
                text: item.text,
                attachments: item.attachments.map((att: { name: string, src: string }) => ({ name: att.name, src: att.src })),
            });
        }


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


        for (const item of newTimeline.reverse()) { // reverse array first
            if (!item) continue;
            const embed = new EmbedBuilder()
                .setColor(colors[item.type])
                .setTimestamp()

            if (item.text.length > 4096) {
                embed.setDescription(item.text.slice(0, 4096))
            } else {
                embed.setDescription(item.text || "No text")
            }

            embed.setTitle(item.title.length > 256
                ? item.title.slice(0, 256).replace(process.env.SKIP_NAME, "----")
                : item.title.replace(process.env.SKIP_NAME, "----")
            )

            if (item.attachments.length > 0) {
                const response = await fetch(item.attachments[0].src)
                const buffer = await response.buffer()
                const attachment = new AttachmentBuilder(buffer, { name: item.attachments[0].name })
                await channel.send({ embeds: [embed], files: [attachment] })
            } else {
                await channel.send({ embeds: [embed] })
            }
        }

    }
}