import { PrismaClient } from "@prisma/client";
import client from "../index.ts";

const prisma = new PrismaClient();

export class Logger {
    private async save(level: string, message: string, context?: string) {
        try {
            await prisma.log.create({
                data: {
                    level,
                    message,
                    context,
                },
            });
            console.log(`${new Date().toLocaleTimeString()} [${level}] ${message}`);
        } catch (err) {
            console.error("Failed to save log:", err);
        }
    }

    public command(message: string, context?: string) {
        this.save("COMMAND", message, context);
    }

    public event(message: string, context?: string) {
        this.save("EVENT", message, context);
    }

    public cron(message: string, context?: string) {
        this.save("CRON", message, context);
    }

    public alert(message: string, context?: string) {
        this.save("ALERT", message, context)
    }

    public info(message: string, context?: string) {
        this.save("INFO", message, context);
    }

    public warn(message: string, context?: string) {
        this.save("WARN", message, context);
    }

    public error(message: string, context?: string) {
        this.save("ERROR", message, context);
    }

    public debug(message: string | object, context?: string) {
        if (client.mode == "development") {
            return console.log(message)
        }
    }

}
