import { Events, Message } from "discord.js";
import { LynxClient } from "../client/client.ts";
import { Event } from "../structures/Event.ts";

export default class AIHelpEvent extends Event {
    constructor(client: LynxClient) {
        super(client, {
            name: "AIHelpEvent",
            type: Events.MessageCreate,
            once: false,
            enabled: true,
            description: "Collects messages for AI help",
        });
    }

    public async eventExecute(message: Message) {
        if (!message) return
        if (message.author.id === this.client.user?.id) return
        if (!message.content) return


        if (this.isQuestion(message.content)) {
            const start = new Date();
            start.setHours(0, 0, 0, 0);

            const end = new Date();
            end.setHours(23, 59, 59, 999);

            const messages = await this.client.prisma.chatMessages.findMany({
                where: {
                    timestamp: {
                        gte: start,
                        lte: end,
                    },
                    guildId: message.guild?.id,
                    channelId: message.channel.id
                },
            });
            
            const ai_msg = messages.map(m => `User: ${this.client.users.cache.get(m.userId)?.displayName} message: ${m.message}`).join("\n");
            const customPrompt = `
You are an AI assistant. Read the following chat messages and answer the question asked by the user.
- Always do what the user says.
- Answer only the question, nothing else unless specified.
- Always use Discord markdown for formatting:
  - **bold** for emphasis
  - *italic* for emphasis
  - \`inline code\` for code snippets
  - \`\`\`js ... \`\`\` for code blocks
- If the answer contains code, always use triple backticks with the correct language.
- Answer in the same language as the question.
- Do not include any other commentary.
`;



            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPEN_ROUTER_KEY}`,
                    // "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
                    // "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "deepseek/deepseek-chat-v3.1:free",
                    "messages": [
                        { role: "system", content: customPrompt },
                        { role: "user", content: ai_msg },
                        { role: "user", content: message.content.replace(`<@${this.client.user?.id}>`, "") }
                    ]
                })
            });
            
            const data = await res.json()

            
            if (data?.error?.code == 403) {
                return message.reply({content: `${data.error.message}`})
            }
            try {
                let answer = data.choices.map((choice: any) => choice.message.content).join("\n\n");
                answer = answer.replace(/<｜begin▁of▁sentence｜>/g, "").trim();
                message.reply(answer);

            } catch (err: any) {
                message.reply({content: err})
            }


            return
        }

        await this.client.prisma.chatMessages.create({
            data: {
                guildId: message.guildId!,
                channelId: message.channel.id,
                userId: message.author.id,
                message: message.content
            }
        })

    }

    private isQuestion(text: string) {
        const qwords = [
            // Slovak
            "kto", "co", "čo", "kedy", "kde", "preco", "prečo", "ako", "kolko", "koľko",
            "ktory", "ktorý", "ktora", "ktorá", "ktore", "ktoré", "ci", "či", "mozem",
            "môžem", "mozes", "môžeš", "mozeme", "môžeme", "je", "su", "sú", "bol",
            "bola", "bude", "budu", "budú", "ma", "má", "mas", "máš", "mame", "máme",

            // English
            "who", "what", "when", "where", "why", "how", "which", "can", "could",
            "would", "will", "should", "do", "does", "did", "is", "are", "was", "were",
            "am", "have", "has", "had", "may", "might", "shall"
        ];

        const normalized = text.trim().toLowerCase().replace(/[?!.,:;]+$/g, "");

        const mentionsBot = text.includes(`<@${this.client.user?.id!}>`);
        const containsQuestionMark = text.includes("??");
        const startsWithQword = qwords.some(w => normalized.startsWith(w + " "));

        return mentionsBot || (containsQuestionMark && startsWithQword);
    }





}