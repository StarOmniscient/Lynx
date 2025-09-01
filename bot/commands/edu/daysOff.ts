import { ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, MessageFlags, VoiceChannel } from "discord.js";
import { Command } from "../../structures/Command.ts";
import client from "../../index.ts";
import { firefox } from "playwright"

const webLink: string = "https://www.zones.sk/kalendar-udalosti/skolske-prazdniny/"

export default class DaysOffCommand extends Command {
    constructor() {
        super({
            name: "daysoff",
            description: "Adds events to guild with day off dates",
            category: "Edu",
            cooldown: 5,
            nsfw: false,
            clientPermissions: [],
            userPermissions: [],
            dev: client.mode,
            enabled: true,
            cooldownFilteredUsers: [],
            serverOnly: [],
            options: [
                {
                    name: "channel",
                    description: "Channel where events should appear (required by discord ty) Must be VOICE CHANNEL",
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ],
            allowDm: false,
        });
    }

    async slashCommandExecute(interaction: ChatInputCommandInteraction) {

        if (interaction.user.id != "655856108350603267") {
            return interaction.reply({content: "For safety you cant use this shit bye", flags: MessageFlags.Ephemeral})
        }

        const browser = await firefox.launch({ headless: true });
        const page = await browser.newPage();
        const eventChannel = interaction.options.getChannel("channel")! as VoiceChannel

        if (!eventChannel || eventChannel.type !== ChannelType.GuildVoice) {
            return interaction.reply({
                content: "You must select a **voice channel**!",
                ephemeral: true
            });
        }


        await page.goto(webLink).catch(e => {
            this.client.logger.error(`Error getting to site: ${e}`, this.name)
        })

        const rows: string[][] = await page.$$eval('tbody tr', (rows) =>
            rows.map((row) => {
                const cells = Array.from(row.querySelectorAll('td, th'));
                return cells.map((cell) => cell.textContent?.trim() || '');
            })
        );

        await browser.close()

        const daysoff = rows.slice(1, 9).map((row) => {
            return { dateRange: row[1], type: row[2], in: row[4], region: row[3].replaceAll(' ', '') };
        })

        if (daysoff.length <= 0) {
            return interaction.reply({ content: "No days off found", flags: MessageFlags.Ephemeral })
        }


        daysoff.map(async (day) => {
            if (day.dateRange == "zrušené") return
            if (!day.region.includes("Košickýkraj") && !day.region.includes("CeléSlovensko")) return

            let startDate: Date, endDate: Date;

            if (day.dateRange.includes('–')) { // EN DASH
                const [startDateString, endDateString] = day.dateRange.split('–').map(s => s.trim());
                startDate = new Date(startDateString.split('.').reverse().join('-'));
                endDate = new Date(endDateString.split('.').reverse().join('-'));
            } else {
                // single-day event
                startDate = new Date(day.dateRange.split('.').reverse().join('-'));
                endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour
            }


            if (startDate < new Date()) {
                this.client.logger.command(`Skipping event: ${day.type}, start date has already passed.`, this.name);
                return;
            }


            const event = await interaction.guild!.scheduledEvents.create({
                name: `${day.type}`,
                description: `${day.region} <t:${Math.floor(new Date(startDate).getTime() / 1000)}:R>`,
                scheduledStartTime: startDate,
                scheduledEndTime: endDate,
                privacyLevel: 2,
                entityType: 2,
                channel: eventChannel.id
            })
            this.client.logger.command(`Created event: ${event.name}`, this.name);
        })


    }
}