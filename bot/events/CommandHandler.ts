import { AutocompleteInteraction, ChannelType, ChatInputCommandInteraction, Collection, Events, MessageFlags, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import { Event } from "../structures/Event.ts";
import { LynxClient } from "../client/client.ts";
import { Command } from "../structures/Command.ts";


export default class CommandHandlerEvent extends Event {
    constructor(client: LynxClient) {
        super(client, {
            name: "CommandHandlerEvent",
            type: Events.InteractionCreate,
            once: false,
            enabled: true,
            description: "Command Handler Event",
        });
    }

    public async eventExecute(interaction: ChatInputCommandInteraction | AutocompleteInteraction) {
        if (interaction.isChatInputCommand()) {
            
             const command: Command = this.client.commands.get(interaction.commandName)!

            if (!command) {
                await interaction.reply({ content: "This command does not exist!", flags: MessageFlags.Ephemeral }) && this.client.commands.delete(interaction.commandName)
                return
            }

            if (interaction.channel?.isDMBased() && !command.allowDm) {
                interaction.reply({ content: "This command cannot be used in DMs.", flags: MessageFlags.Ephemeral })
                return
            }

            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                if (!interaction.memberPermissions?.has(command.userPermissions)) {
                    interaction.reply({ content: "You do not have permission to use this command!", flags: MessageFlags.Ephemeral})
                }
            }
            
            const botMember = interaction.guild?.members.cache.get(this.client.user?.id!)
            
            if (!botMember!.permissions.has(PermissionFlagsBits.AddReactions)) {
                if (!botMember!.permissions.has(command.clientPermissions)) {
                    interaction.reply({ content: "I dont have required permissions to use this command.", flags: MessageFlags.Ephemeral })
                    return
                }
            }

            const isNSFW = interaction.channel?.type === ChannelType.GuildText && interaction.channel.nsfw
            if (command.nsfw && !isNSFW) {
                interaction.reply({ content: "This command can only be used in an NSFW channel.", flags: MessageFlags.Ephemeral })
                return
            }

            const { cooldowns } = this.client
            if (!cooldowns.has(command.name)) {
                cooldowns.set(command.name, new Collection())
            }

            if (!command?.cooldownFilteredUsers.includes(interaction.user.id)) {
                const now = Date.now()
                const timestamps = cooldowns.get(command.name)!
                const cooldownAmount = (command.cooldown) * 1000

                if (timestamps.has(interaction.user.id) && (now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount)) {
                    interaction.reply({ content: `You are on cooldown for ${((((timestamps.get(interaction.user.id) || 0) + cooldownAmount) - now) / 1000).toFixed(1)} seconds`, flags: MessageFlags.Ephemeral })
                        return
                }
    
                timestamps.set(interaction.user.id, now)
                setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount)
            }


            try {
                const subCommandGroup = interaction.options.getSubcommandGroup(false)
                const subCommand = `${interaction.commandName}${subCommandGroup ? `.${subCommandGroup}` : ""}.${interaction.options.getSubcommand(false) || ""}`
            
                const subCommandExec = this.client.subCommands.get(subCommand);

                // Await subcommand if it exists
                if (subCommandExec) {
                    subCommandExec.slashCommandExecute(interaction);
                }

                // Await main command execution
                return command?.slashCommandExecute(interaction);
                //return command?.execute(interaction) || this.client.subcommands?.get(subCommand)?.execute(interaction)

            } catch (e) {
                this.client.logger.error(`Error while executing slash command ${interaction.commandName}: ${e}`)
            }


            
        }

        if (interaction.isAutocomplete()) {
            const command = this.client.commands.get(interaction.commandName);

            if (!command) {
                this.client.logger.error(`No command matching ${interaction.commandName} was found.`)
                return;
            }

            try {
                command.autoComplete(interaction);
            } catch (error) {
                this.client.logger.error(`Error while executing autocomplete command ${interaction.commandName}: ${error}`)
            }
        }
    }

}