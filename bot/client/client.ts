import { PrismaClient } from "@prisma/client";
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import { Command } from "../structures/Command.ts";
import { CommandHandler } from "../handlers/commandHandler.ts";
import { EventHandler } from "../handlers/eventHandler.ts";
import { SubCommand } from "../structures/SubCommand.ts";
import { CronHandler } from "../handlers/cronHandler.ts";
import { Cron } from "../structures/Cron.ts";
import { Logger } from "../utils/logger.ts";
import { Event } from "../structures/Event.ts";


export class LynxClient extends Client{
    public mode: "development" | "production";
    public prisma: PrismaClient
    public logger: Logger

    public commands: Collection<string, Command> 
    public subCommands: Collection<string, SubCommand>
    public crons: Collection<string, Cron>
    public events: Collection<string, Event>
    public cooldowns: Collection<string, Collection<string, number>>
    public commandHandler: CommandHandler
    public eventHandler: EventHandler
    public cronHandler: CronHandler


    public constructor() {
        super
            (
                {
                    intents:
                        [
                            GatewayIntentBits.Guilds,
                            GatewayIntentBits.GuildMembers,
                            GatewayIntentBits.GuildMessages,
                            GatewayIntentBits.GuildVoiceStates,
                            GatewayIntentBits.MessageContent,
                            GatewayIntentBits.DirectMessages,
                            GatewayIntentBits.DirectMessageTyping,
                            GatewayIntentBits.GuildPresences,
                        ],
                    partials:
                        [
                            Partials.Channel,
                            Partials.Message,
                            Partials.GuildMember,
                        ]
                }
            )

        this.mode = process.argv.slice(2).includes("--dev") ? "development" : "production";
        this.prisma = new PrismaClient()
        this.logger = new Logger()


        this.commands = new Collection()
        this.subCommands = new Collection()
        this.cooldowns = new Collection()
        this.crons = new Collection()
        this.events = new Collection()
        
        this.commandHandler = new CommandHandler(this)
        this.eventHandler = new EventHandler(this)
        this.cronHandler = new CronHandler(this)

        this.commandHandler.loadCommands()
        this.eventHandler.loadEvents()
        // this.cronHandler.runCrons()  //  Moved to ready event

        this.createDefaultUser()
    }

    


    public override async login() {
    
        let token: string;
        switch (this.mode) {
            case "development": {
                token = process.env.DEV_BOT_TOKEN!;
                break;
            }
            case "production": {
                token = process.env.PROD_BOT_TOKEN!;
                break;
            }
            default: {
                throw new Error("Invalid mode");
            }
        }

        if (!token) throw new Error("No token provided")

        return super.login(token)
    }

    private async createDefaultUser() {
        const users = await this.prisma.user.findMany()

        if (users.length == 0) {
            const name = "lynx"
            const password = this.token ? `${this.token?.slice(0, 8)}` : `${Math.random().toString(36).slice(2, 8)}`
            await this.prisma.user.create({
                data: {
                    name,
                    password
                }
            }).then(() => {
                console.log(`Created default user with name: ${name} and password: ${password}`)
            })
        }
    }

}
