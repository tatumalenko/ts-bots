import Discord from "discord.js";
import Command from "../../../lib/Command";
import CommandParameters from "../../../lib/CommandParameters";

export default class extends Command {
    public constructor() {
        super();
        this.name = "test";
        this.enabled = true;
        this.runIn = ["test-zone"];
        this.description = "";
        this.aliases = [];
    }

    public async run(message: Discord.Message, params: CommandParameters) {
        try {
            console.log("SUCCESS!", `Inside Command.${this.name}`);
            console.log("Message:", message);
            console.log("prefix:", params.prefix);
            console.log("cmd:", params.cmd);
            console.log("args:", params.args);
        } catch (error) {
            console.error(error);
        }
    }
}