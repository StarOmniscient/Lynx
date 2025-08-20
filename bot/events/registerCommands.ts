import { Collection, Events, REST, Routes } from "discord.js";
import { LynxClient } from "../client/client.ts";
import { Event } from "../structures/Event.ts"
import { Command } from "../structures/Command.ts";
import type { ICommandOptions } from "../structures/Command.ts";
import 'dotenv/config'

export default class RegisterCommandsEvent extends Event {
    constructor(client: LynxClient) {
        super(client, {
            name: "RegisterCommandsEvent",
            type: Events.ClientReady,
            once: true,
            enabled: true,
            description: "Register Slash Commands",
        });
    }

    public async eventExecute() {
        const clientId = this.client.user?.id ?? ""
        const rest = new REST().setToken(this.client.token!)

        if (this.client.mode == "production") {
            const globalCmds: any = await rest.put(Routes.applicationCommands(clientId), {
                body: this.GetJson(this.client.commands.filter(command => command.dev != "development"))
            })
            console.log(`Succesfully loaded ${globalCmds.length} global (/) commands`)

        }

        const devCmds: any = await rest.put(Routes.applicationGuildCommands(clientId, process.env.DEV_SERVER!), {
            body: this.GetJson(this.client.commands.filter(command => command.dev == "development"))
        })

        console.log(`Successfully loaded ${devCmds.length} dev (/) commands`)


        let dCmd = devCmds.map((cmd: { name: any; id: any; }) => {
            return { Commands: cmd.name, Id: cmd.id };
        });


    }

    private GetJson(commands: Collection<string, Command>): object[] {
        const data: object[] = []

        commands.forEach((command: ICommandOptions) => {
            data.push({
                name: command.name,
                description: command.description,
                category: command.category,
                options: command.options,
                cooldown: command.cooldown,
                userPermissions: command.userPermissions,
                clientPermissions: command.clientPermissions,
                dev: command.dev,
                serverOnly: command.serverOnly,
                enabled: command.enabled,
                nsfw: command.nsfw,
                cooldownFilteredUsers: command.cooldownFilteredUsers,
                allowDm: command.allowDm

            })
        })

        return data
    }

}