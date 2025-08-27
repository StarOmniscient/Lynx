import { LynxClient } from "./client/client.ts"
import express from 'express';
import type {Request, Response} from 'express';
import "dotenv/config"
import cors from "cors";
import type { ICommandOptions } from "./structures/Command.ts";


const client = new LynxClient()
client.login()

const app = express();
const router = express.Router()
const PORT = process.env.BOT_API_PORT || 4444;

app.use(cors({
  origin: '*'
}))

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




app.listen(PORT, () => console.log(`Bot API running on port ${PORT}`));

export default client