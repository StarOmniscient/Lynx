import { LynxClient } from "../client/client.ts"
import { glob } from "glob";
import path from "path";
import { Command } from "../structures/Command.ts";
import { SubCommand } from "../structures/SubCommand.ts";
import url, { pathToFileURL } from "url"

export class CommandHandler {
    public client: LynxClient


    constructor(client: LynxClient) {
        this.client = client
    }

    public async loadCommands() {
        const files = (await glob("bot/commands/**/*.{js,ts}")).map(filepath => path.resolve(filepath));


        files.map(async (file: string) => {
            const { default: CommandClass } = await import(pathToFileURL(file).href);
            const command: Command | SubCommand = new CommandClass();

            if (!command.enabled) return

            if (!command.name) {
                this.client.logger.error(`Command: ${file.split(path.sep).pop()} does not have a name`)
                return
            }

            if (file.split("/").pop()?.split(".")[2] !== undefined) {
                this.client.subCommands.set(command.name, command as SubCommand);
            } else {
                this.client.commands.set(command.name, command as Command);

            }
            this.client.logger.info(`Loaded command: ${command.name}`);
        })
    }
}