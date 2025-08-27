import { ApplicationCommandOptionType, ChatInputCommandInteraction, MessageFlags } from "discord.js"
import client from "../../index.ts"
import { Command } from "../../structures/Command.ts"
import { channel } from "diagnostics_channel"

export default class BirthDayCommand extends Command {
    public constructor() {
        super({
            name: "birthday",
            category: "misc",
            clientPermissions: [],
            userPermissions: [],
            cooldown: 5,
            allowDm: false,
            cooldownFilteredUsers: [],
            description: "Adds birthday to database",
            dev: client.mode,
            nsfw: false,
            serverOnly: [],
            enabled: true,
            options: [
                {
                    name: "date",
                    description: "Your birthday in format dd.mm.yyyy",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "channel",
                    description: "Channel to send birthday to",
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: "user",
                    description: "User to add birthday to",
                    type: ApplicationCommandOptionType.User,
                    required: false
                },
                
            ]
        })
    }

    public async slashCommandExecute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user")?.id || interaction.user.id
        const date = interaction.options.getString("date")!
        const channel = interaction.options.getChannel("channel")!
        const guildID = interaction.guildId!

        const [day, month, year] = date.split(".")

        const userExists = await this.client.prisma.birthdays.findFirst({
            where: {
                userID: user,
                guildID: guildID

            }
        })

        if (userExists) {
            this.client.logger.warn(`Updating birthday for ${user}`)
            await this.client.prisma.birthdays.updateMany({
                where: {
                    userID: user,
                    guildID: guildID,

                },
                data: {
                    date: `${year}-${month}-${day}`,
                    channelID: channel.id
                }
            }).catch(
                (err) => {
                    this.client.logger.error(`Error updating birthday for ${user}: ${err}`)
                }
            )

            return await interaction.reply({ content: "Birthday updated", flags: MessageFlags.Ephemeral })
        }

        await this.client.prisma.birthdays.create({
            data: {
                userID: user,
                date: `${year}-${month}-${day}`,
                channelID: channel.id,
                guildID: guildID
            }
        }).catch(
            (err) => {
                this.client.logger.error(`Error creating birthday for ${user}: ${err}`)
            }
        )




        return interaction.reply({ content: "Birthday added", flags: MessageFlags.Ephemeral })
    }
}