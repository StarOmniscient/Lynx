import { LynxClient } from "../client/client.ts";
import client from "../index.ts";
import * as Discord from "discord.js"


export class Command {
    public name: string;
    public description: string;
    public category: string;
    public options: Discord.ApplicationCommandOption[];
    public cooldown: number;
    public userPermissions: Discord.PermissionResolvable[]
    public clientPermissions: Discord.PermissionResolvable[]
    public dev: string
    public serverOnly: string[]
    public enabled: boolean
    public nsfw: boolean
    public cooldownFilteredUsers: string[]
    public allowDm: boolean
    public client: LynxClient = client


    
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

    public async autoComplete(interaction: Discord.AutocompleteInteraction): Promise<any> {

    }

    public async slashCommandExecute(interaction: Discord.ChatInputCommandInteraction): Promise<any> {

    }


}


export interface ICommandOptions {
    name: string;
    description: string;
    category: string;
    options: Discord.ApplicationCommandOption[];
    cooldown: number; //default 3 sec
    userPermissions: Discord.PermissionResolvable[]  //   CRASHES BOT
    clientPermissions: Discord.PermissionResolvable[] //   CRASHES BOT
    dev: string
    serverOnly: string[]
    enabled: boolean
    nsfw: boolean
    cooldownFilteredUsers: string[]
    allowDm: boolean


}