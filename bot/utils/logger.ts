

export class Logger {
    public info(message: string): void {
        console.log(`${new Date().toISOString()} [INFO] ${message}`);
    }

    public warn(message: string): void {
        console.warn(`${new Date().toISOString()} [WARN] ${message}`);
    }

    public error(message: string): void {
        console.error(`${new Date().toISOString()} [ERROR] ${message}`);
    }

}