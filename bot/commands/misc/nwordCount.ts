
import { Command } from "../../structures/Command.ts";
import client from "../../index.ts";
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";


export default class NwordCountCommand extends Command {
    constructor() {
        super({
            name: "nwords",
            description: "Shows count of nwords user has said or everyone in the server",
            category: "Misc",
            allowDm: false,
            clientPermissions: [],
            cooldown: 2,
            cooldownFilteredUsers: [],
            dev: client.mode,
            enabled: true,
            nsfw: false,
            serverOnly: [],
            userPermissions: [],
            options: [
                {
                    name: "user",
                    description: "User which count to show",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                }
            ],
        });

    }


    public async slashCommandExecute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user");
        const embed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
        if (user) {
            // get all rows for this user
            const yearlyCounts = await this.client.prisma.nwordCount.groupBy({
                by: ["year"],
                where: { guildID: interaction.guildId!, userID: user.id },
                _sum: { count: true },
                orderBy: { year: "asc" },
            });

            if (yearlyCounts.length === 0) {
                embed.setDescription(`${user} has no data.`);
            } else {
                embed.setTitle(`${user.displayName}'s Nword Count`);
                embed.setDescription(
                    yearlyCounts
                        .map((row) => `**${row.year}** → ${row._sum.count}`)
                        .join("\n")
                );
            }

            return interaction.reply({ embeds: [embed] });
        }

        if (!user) {
            // Get all counts grouped by user and year
            const yearlyCounts = await this.client.prisma.nwordCount.groupBy({
                by: ["userID", "year"],
                where: { guildID: interaction.guildId! },
                _sum: { count: true },
                orderBy: [
                    { userID: "asc" },
                    { year: "asc" }
                ],
            });

            if (yearlyCounts.length === 0) {
                return interaction.reply("No data available for this server.");
            }

            // Map userID to yearly counts
            const userMap = new Map<string, { year: number; count: number }[]>();
            for (const row of yearlyCounts) {
                if (!userMap.has(row.userID)) userMap.set(row.userID, []);
                userMap.get(row.userID)!.push({ year: row.year, count: row._sum.count! });
            }

            const embed = new EmbedBuilder()
                .setTitle(`${interaction.guild?.name} — Yearly Nword Counts`)
                .setColor("Blue");

            const lines: string[] = [];
            for (const [userID, years] of userMap) {
                const userMention = `<@${userID}>`;
                const yearCounts = years
                    .map((y) => `**${y.year}**: ${y.count}`)
                    .join(" | ");
                    
                lines.push(`${userMention} → ${yearCounts}`);
            }

            embed.setDescription(lines.join("\n"));

            return interaction.reply({ embeds: [embed] });
        }


    }






}
