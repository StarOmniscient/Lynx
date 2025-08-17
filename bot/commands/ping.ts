import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../structures/Command.ts";
import client from "../index.ts";

export default class PingCommand extends Command {
    constructor() {
        super({
            name: "ping",
            description: "Ping the bot",
            category: "Misc",
            cooldown: 5,
            nsfw: false,
            clientPermissions: [],
            userPermissions: [],
            dev: client.mode,
            enabled: true,
            cooldownFilteredUsers: [],
            serverOnly: [],
            options: [],
            allowDm: true
        });
    }

    async slashCommandExecute(interaction: ChatInputCommandInteraction) {
        const msg = await interaction.reply({ content: `Ping?`, ephemeral: true, fetchReply: true });
        const latency = msg.createdTimestamp - interaction.createdTimestamp;
        interaction.editReply({ content: `Pong! Latency: ${latency}ms` });

    }
}