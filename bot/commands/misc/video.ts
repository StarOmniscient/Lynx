
import { Command } from "../../structures/Command.ts";
import client from "../../index.ts";
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import fs from "fs"
import ytdlp from "yt-dlp-exec";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class VideoCommand extends Command {
    constructor() {
        super({
            name: "video",
            description: "Sends a Video from tiktok, instagram.",
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
                    description: "Video url",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                }
            ],
        });

    }


   public async slashCommandExecute(interaction: ChatInputCommandInteraction) {
    const url = interaction.options.getString("url")!;
    await interaction.deferReply();

    let downloadedFilePath: string | null = null;

    try {
        // Use a simple, guaranteed-writable directory
        const folder = path.join(process.cwd(), 'video_cache');
        
        // Create directory with explicit verification
        try {
            fs.mkdirSync(folder, { recursive: true });
            if (!fs.existsSync(folder)) {
                throw new Error(`Failed to create: ${folder}`);
            }
        } catch (dirErr) {
            this.client.logger.error(`Directory error: ${dirErr}`, this.name);
            await interaction.editReply("❌ Could not create download directory. Check bot permissions.");
            return;
        }

        const uniqueId = `${Date.now()}_${interaction.id}`;
        // CRITICAL: Use a fixed filename - NO %(ext)s template
        const outputFileName = `video_${uniqueId}.mp4`;
        const outputPath = path.join(folder, outputFileName);

        this.client.logger.info(`Downloading to: ${outputPath}`, this.name);

        // Download with simplified options
        await ytdlp(url, {
            output: outputPath, // Direct path, no template
            noWarnings: true,
            restrictFilenames: true,
            noPlaylist: true,
            maxFilesize: '10M',
        });

        // Verify file exists and has content
        if (!fs.existsSync(outputPath)) {
            throw new Error("Download failed - file not created at expected location");
        }
        
        const stats = fs.statSync(outputPath);
        if (stats.size === 0) {
            throw new Error("Downloaded file is empty");
        }

        downloadedFilePath = outputPath;

        // Send the video
        await interaction.editReply({
            content: `Here’s your video 🎬`,
            files: [{ attachment: downloadedFilePath, name: "video.mp4" }]
        });

    } catch (err: any) {
        this.client.logger.error(`Download failed: ${err}`, this.name);
        await interaction.editReply(`❌ Failed to download video: ${err.message}`);
    } finally {
        // Cleanup
        if (downloadedFilePath && fs.existsSync(downloadedFilePath)) {
            try {
                fs.unlinkSync(downloadedFilePath);
            } catch (cleanupErr) {
                this.client.logger.warn(`Cleanup failed: ${cleanupErr}`, this.name);
            }
        }
    }
}




}
