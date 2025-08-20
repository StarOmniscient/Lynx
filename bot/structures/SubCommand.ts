import { AutocompleteInteraction, ChatInputCommandInteraction, CommandInteraction, PermissionsBitField} from "discord.js";
import { LynxClient } from "../client/client.ts";
import client from "../index.ts";

export class SubCommand {
    public name: string;
    public enabled: boolean
    public client: LynxClient = client


    
    constructor(client: LynxClient, options: ISubCommandOptions) {
        this.name = options.name;
        this.enabled = options.enabled

    
    }

    public async slashCommandExecute(interaction: ChatInputCommandInteraction) {

    }


}


export interface ISubCommandOptions {
    name: string;
    enabled: boolean

}