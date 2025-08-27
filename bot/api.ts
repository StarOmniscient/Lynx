// bot/api.ts
import express from 'express';
import client from './index.ts';
import "dotenv/config"

const app = express();
const PORT = process.env.BOT_API_PORT || 4444;

app.get('/commands', (req, res) => {
  res.json({ commands: Array.from(client.commands.keys()) });
});


app.listen(PORT, () => console.log(`Bot API running on port ${PORT}`));