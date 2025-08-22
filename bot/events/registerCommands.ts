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
                body: this.GetJson(this.client.commands.filter(command => command.dev != "development" && command.serverOnly.length == 0))
            })
            this.client.logger.info(`Succesfully loaded ${globalCmds.length} global (/) commands`)

            this.client.commands.filter(command => command.dev != "development" && command.serverOnly.length > 0).forEach(async command => {
                if (!command.serverOnly) return
                const cmd: any = await rest.put(Routes.applicationGuildCommands(clientId, command.serverOnly[0]), {
                    body: [{
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
                    }]
                }

                )
                this.client.logger.info(`Loaded command: ${cmd[0].name} in server: ${cmd[0].guild_id}`)
            }

            )
        }

        const devCmds: any = await rest.put(Routes.applicationGuildCommands(clientId, process.env.DEV_SERVER!), {
            body: this.GetJson(this.client.commands.filter(command => command.dev == "development"))
        })

        this.client.logger.info(`Successfully loaded ${devCmds.length} dev (/) commands`)


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