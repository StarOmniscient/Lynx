import { ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, EmbedBuilder, MessageFlags, VoiceChannel } from "discord.js";
import { Command } from "../../structures/Command.ts";
import client from "../../index.ts";
import { firefox} from "playwright"
import type {Page} from "playwright"
import { fileURLToPath } from "url";
import path from "path"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class LunchCommand extends Command {
    constructor() {
        super({
            name: "lunch",
            description: "Sends current week's lunch menu",
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

            ],
            allowDm: false,
        });
    }

    async slashCommandExecute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()
        const browser = await firefox.launch({ headless: true })
        const page = await browser.newPage()
        try {
            await page.goto("https://eskoly.sk/partizanska1057")
            await interaction.editReply({ embeds: [await this.createEmbed(page)] }).then(async () => {

                fs.writeFileSync(path.join(__dirname, "lastWeek.txt"), await this.getDayRange(page))
                await browser.close()
                console.log("Lunch menu sent by user")
                return
            })
        } catch {
            await interaction.editReply({ content: "Something went wrong, try again later" })
            await browser.close()
            return
        }


    }

    public async getDay(day: IDay["day"], page: Page): Promise<{ day: string; date: string, lunchOptions: string }> {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    await page.waitForSelector('.dayColumn').catch(err => {
        console.log(err)
    })
    const dateString = await page.locator(".dayColumn").nth(daysOfWeek.indexOf(day)).textContent() ?? ""
    await page.waitForSelector('.foodCell').catch(err => {
        console.log(err)
    })
    const lunchOptions = await page.locator(".foodCell").nth(daysOfWeek.indexOf(day)).innerText()


    return {
        day: this.splitDayAndDate(dateString).day,
        date: this.splitDayAndDate(dateString).date,
        lunchOptions: lunchOptions.trim()
    }

}

public async createEmbed(page: Page): Promise<EmbedBuilder> {
    return new EmbedBuilder()

        .setTitle(`Lunch Menu ${(await this.getDayRange(page))}`)

        .addFields(
            {
                name: `Monday - ${(await this.getDay("Monday", page)).date}`,
                value: `${(await this.getDay("Monday", page)).lunchOptions || "No lunch provided"}`,
                inline: false
            },
            {
                name: `Tuesday - ${(await this.getDay("Tuesday", page)).date}`,
                value: `${(await this.getDay("Tuesday", page)).lunchOptions || "No lunch provided"}`,
                inline: false
            },
            {
                name: `Wednesday - ${(await this.getDay("Wednesday", page)).date}`,
                value: `${(await this.getDay("Wednesday", page)).lunchOptions || "No lunch provided"}`,
                inline: false
            },
            {
                name: `Thursday - ${(await this.getDay("Thursday", page)).date}`,
                value: `${(await this.getDay("Thursday", page)).lunchOptions || "No lunch provided"}`,
                inline: false
            },
            {
                name: `Friday - ${(await this.getDay("Friday", page)).date}`,
                value: `${(await this.getDay("Friday", page)).lunchOptions || "No lunch provided"}`,
                inline: false
            },

        )
}

public splitDayAndDate(input: string): { day: string, date: string } {
    // Use a regular expression to find the first part (day) and the second part (date)
    const match = input.match(/([^\d]+)([\d\.\s]+)/);

    if (match) {
        const day = match[1].trim();  // First capture group is the day
        const date = match[2].trim(); // Second capture group is the date
        return { day, date };
    }

    // If the input doesn't match the expected pattern, return empty strings
    return { day: '', date: '' };
}

//gets 2. 9. 2024 - 6. 9. 2024 from the page
public async  getDayRange(page: Page) {
    await page.waitForSelector('#ctl00_mainContent_Label2')
    const content = await page.locator("#ctl00_mainContent_Label2").textContent()
    if (content === null) {
        throw new Error("Element not found or content is null")
    }
    return this.processWeek(content.toString())
}

//reduces JEDÁLNY LÍSTOK: 2. 9. 2024 - 6. 9. 2024 to 2. 9. 2024 - 6. 9. 2024 for expample
public async processWeek(dayrange: string) {
    return dayrange.split(":")[1].trim()
}
}

interface IDay {
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday"
}