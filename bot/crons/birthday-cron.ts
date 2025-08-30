import { Cron } from "../structures/Cron.ts";
import { EmbedBuilder, TextChannel } from "discord.js";

export default class BirthDayCron extends Cron {
    public constructor() {
        super({
            name: "BirthdayCheckCron",
            description: "Checks birthdays",
            enabled: true,
            repeatTime: 1000 * 60 * 60 * 12, // 12 hours in ms
            excludeRunOnStart: false
        });
    }

    public async cronExecute() {
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = String(today.getMonth() + 1)
        const todayDay = String(today.getDate())
        const todayString = today.toISOString().split("T")[0];


        // Fetch birthdays for today that haven't been sent yet
        const birthdays = await this.client.prisma.birthdays.findMany({
            where: {
                AND: [
                    { date: { contains: `-${todayMonth}-${todayDay}` } },
                    {
                        OR: [
                            { lastSent: null },
                            { lastSent: { lt: new Date(todayString) } }
                        ]
                    }
                ]
            }
        }).catch(err => this.client.logger.error(`Error fetching birthdays: ${err}`, this.name));

        if (!birthdays || birthdays.length === 0) return;

        for (const birthday of birthdays) {
            if (!birthday.guildID || !birthday.channelID) continue;

            try {
                const guild = await this.client.guilds.fetch(birthday.guildID);
                const channel = guild.channels.cache.get(birthday.channelID) as TextChannel;

                const birthYear = Number(birthday.date.split("-")[0]);
                const embed = new EmbedBuilder()
                    .setTitle(`🎉 Happy Birthday! You are ${todayYear - birthYear} years old!`)
                    .setDescription(`<@${birthday.userID}>`);

                await channel.send({ embeds: [embed] });

                // Mark as sent for this row
                await this.client.prisma.birthdays.update({
                    where: { id: birthday.id },
                    data: { lastSent: today }
                });
            } catch (err) {
                this.client.logger.error(`Error sending birthday for user ${birthday.userID} in guild ${birthday.guildID}: ${err}`, this.name);
            }
        }
    }
}
