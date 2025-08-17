import { Cron } from "../structures/Cron.ts";


export default class TestCron extends Cron {
    constructor() {
        super({
            name: "test",
            description: "test cron",
            enabled: false,
            repeatTime: 5
        });
    }

    public async cronExecute() {
        console.log("Test cron executed");
    }

}