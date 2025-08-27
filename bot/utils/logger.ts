import { PrismaClient } from "@prisma/client";

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

    public info(message: string, context?: string) {
        this.save("INFO", message, context);
    }

    public warn(message: string, context?: string) {
        this.save("WARN", message, context);
    }

    public error(message: string, context?: string) {
        this.save("ERROR", message, context);
    }

    public debug(message: string, context?: string) {
        this.save("DEBUG", message, context);
    }
}
