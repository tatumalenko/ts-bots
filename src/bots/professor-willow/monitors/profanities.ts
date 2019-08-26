import Discord from "discord.js";
import Monitor from "../../../lib/Monitor";

export default class extends Monitor {
    public constructor() {
        super();
        this.name = "profanites";
        this.enabled = true;
        this.runIn = ["test-zone"];
        this.description = "";
    }

    public async run(message: Discord.Message): Promise<void> {
        try {
            console.log("SUCCESS!", `Inside Monitor.${this.name}`);
            console.log("Message:", message);
        } catch (error) {
            console.error(error);
        }
    }
}