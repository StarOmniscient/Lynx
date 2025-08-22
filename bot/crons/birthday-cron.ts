import { Cron } from "../structures/Cron.ts";
import config from "../../config.ts"
import { EmbedBuilder, TextChannel } from "discord.js";

export default class BirthDayCron extends Cron {
    public constructor() {
        super({
            name: "birthday",
            description: "Checks birthdays",
            enabled: true,
            repeatTime: 60 * 60 * 1000 // hour
        })
    }

    public async cronExecute() {
        const today = new Date()
        const date = await this.client.prisma.birthdays.findMany().catch(
            (err) => {
                return this.client.logger.error(`Error fetching birthdays: ${err}`)
            }
        )

        if (date) {
            date.map(async item => {
                const [year, month, day] = item.date.split("-")
                const [todayYear, todayMonth, todayDay] = String([today.getFullYear(), today.getMonth() + 1, today.getDate()])

                if (month == todayMonth && day == todayDay) {
                    const guild = await this.client.guilds.fetch(config.birthdays.guildID)
                    const channel = await guild.channels.cache.get(config.birthdays.channelID) as TextChannel

                    const user = await this.client.prisma.birthdays.findMany({
                        where: {
                            userID: item.userID
                        }
                    }).catch(
                        (err) => {
                            return this.client.logger.error(`Error fetching user: ${err}`)
                        }
                    )

                    if (!user) return;

                    const embed = new EmbedBuilder()
                        .setTitle(`🎉 Happy Birthday! You are ${Number(todayYear) - Number(year)} years old!`)
                        .setDescription(`<@${user[0].userID}>`)

                    await channel.send({ embeds: [embed] })
                }
            }
            )
        }
    }
}