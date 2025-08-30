import { LynxClient } from "./client/client.ts"
import express from 'express';
import type { Request, Response } from 'express';
import "dotenv/config"
import cors from "cors";
import type { ICommandOptions } from "./structures/Command.ts";
import { TextChannel } from "discord.js";


const client = new LynxClient()
client.login()

const app = express();
const router = express.Router()
const PORT = process.env.BOT_API_PORT || 4444;

app.use(cors({
  origin: '*'
}))
app.use(express.json());

app.get('/commands', (req, res) => {
  res.json({
    commands: Array.from(client.commands.map(a => {
      return {
        name: a.name,
        enabled: a.enabled,
        description: a.description,
      }
    }))
  });
});

app.get('/commands/:command', (req, res) => {
  const cmdName = req.params.command; // get the command name from the URL
  const command: ICommandOptions = client.commands.get(cmdName)!;

  if (!command) {
    return res.status(404).json({ error: 'Command not found' });
  }

  res.json({
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

  });
});

app.get("/guilds", (req: Request, res: Response) => {
  const guilds = client.guilds.cache.map(guild => {
    return {
      id: guild.id,
      name: guild.name,
      iconUrl: guild.iconURL(),
    }
  })
  if (!guilds) return res.status(404).json({ error: "Guilds not found" })
    
  res.json({
    guilds: guilds
  })
  })

app.get("/guilds/:guildId/channels/:channelId", async (req: Request, res: Response) => {
    const guildId = req.params.guildId
    const channelId = req.params.channelId

    const guild = client.guilds.cache.get(guildId)
    const channel = guild?.channels.cache.get(channelId) as TextChannel
    const messages = (await channel.messages.fetch()).map(message => {
      return {
        id: message.id,
        content: message.content,
        channelId: message.channelId,
        createdTimestamp: message.createdTimestamp,
        author: {
          username: message.author.username,
          globalName: message.author.globalName,
          id: message.author.id,

        }
      }
    })

    res.json( messages )
})

app.post("/guilds/:guildId/channels/:channelId/send", async (req: Request, res: Response) => {
  const guildId = req.params.guildId;
  const channelId = req.params.channelId;
  const { content } = req.body; // make sure you use express.json() middleware
  console.log(req.body)
  

  if (!content) return res.status(400).json({ error: "Message content is required" });

  const guild = client.guilds.cache.get(guildId);
  const channel = guild?.channels.cache.get(channelId) as TextChannel;

  if (!channel) return res.status(404).json({ error: "Channel not found" });

  try {
    const message = await channel.send(content);
    res.json({
      id: message.id,
      content: message.content,
      channelId: message.channelId,
      createdTimestamp: message.createdTimestamp,
      author: {
        username: message.author.username,
        globalName: message.author.globalName,
        id: message.author.id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send message", details: err });
  }
});


app.listen(PORT, () => console.log(`Bot API running on port ${PORT}`));

export default client