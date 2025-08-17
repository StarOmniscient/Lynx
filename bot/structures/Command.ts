import { AutocompleteInteraction, ChatInputCommandInteraction, CommandInteraction, PermissionsBitField} from "discord.js";
import { LynxClient } from "../client/client.ts";

export class Command {
    public name: string;
    public description: string;
    public category: string;
    public options: any[];
    public cooldown: number;
    public userPermissions: PermissionsBitField[]
    public clientPermissions: PermissionsBitField[]
    public dev: string
    public serverOnly: string[]
    public enabled: boolean
    public nsfw: boolean
    public cooldownFilteredUsers: string[]
    public allowDm: boolean


    
    constructor(options: ICommandOptions) {
        this.name = options.name;
        this.description = options.description
        this.category = options.category
        this.options = options.options || []; // for slash commands
        this.cooldown = options.cooldown || 3;
        this.userPermissions = options.userPermissions || [];
        this.clientPermissions = options.clientPermissions || [];
        this.dev = options.dev
        this.serverOnly = options.serverOnly || [];
        this.enabled = options.enabled
        this.nsfw = options.nsfw
        this.cooldownFilteredUsers = options.cooldownFilteredUsers || [];
        this.allowDm = options.allowDm || false

    }

    public async autoComplete(interaction: AutocompleteInteraction) {

    }

    public async slashCommandExecute(interaction: ChatInputCommandInteraction) {

    }


}


export interface ICommandOptions {
    name: string;
    description: string;
    category: string;
    options: any[];
    cooldown: number; //default 3 sec
    userPermissions: PermissionsBitField[]
    clientPermissions: PermissionsBitField[]
    dev: string
    serverOnly: string[]
    enabled: boolean
    nsfw: boolean
    cooldownFilteredUsers: string[]
    allowDm: boolean
}