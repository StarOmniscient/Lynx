
import { Command } from "../../structures/Command.ts";
import client from "../../index.ts";
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { Downloader } from "@tobyg74/tiktok-api-dl"
import fs from "fs"
import axios from "axios"
import ytdlp from "yt-dlp-exec";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class TikTokCommand extends Command {
    constructor() {
        super({
            name: "tiktok",
            description: "Sends a TikTok video from URL.",
            category: "Misc",
            allowDm: true,
            clientPermissions: [],
            cooldown: 30,
            cooldownFilteredUsers: [],
            dev: client.mode,
            enabled: true,
            nsfw: false,
            serverOnly: [],
            userPermissions: [],
            options: [
                {
                    name: "url",
                    description: "Tiktok video url",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                }
            ],
        });

    }


    public async slashCommandExecute(interaction: ChatInputCommandInteraction) {
    const url = interaction.options.getString("url")!;
    await interaction.deferReply();

    // Ensure the folder exists
    const folder = path.join(__dirname, "tiktok_videos");
    fs.mkdirSync(folder, { recursive: true });

    // Unique filename using ms timestamp
    const date = Date.now();
    const fileName = `video${date}.mp4`;
    const filePath = path.join(folder, fileName);

    try {
        // Step 1: Download video into misc/tiktok_videos/
        await ytdlp(url, {
            output: path.join(folder, `video${date}.%(ext)s`),
            format: "mp4",
            noWarnings: true,
            restrictFilenames: true
        });

        // Step 2: Send file to Discord
        await interaction.editReply({
            content: `Here’s your video 🎬`,
            files: [
                {
                    attachment: filePath,
                    name: "tiktok.mp4" // always shown as this in Discord
                }
            ]
        });

        // Step 3: Cleanup
        fs.unlinkSync(filePath);

    } catch (err) {
        this.client.logger.error(`Failed to download TikTok video: ${err}`, this.name);
        await interaction.editReply("❌ Failed to download TikTok video.");
    }
}




}
