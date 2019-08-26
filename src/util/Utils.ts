import Discord from "discord.js";
import CommandParameters from "../lib/CommandParameters";

export default abstract class Utils {
    public static randomColor(): number {
        return Math.floor(Math.random() * 16777214) + 1;
    }

    public static createCommandParametersFromMessage(
        message: Discord.Message,
        lowerCaseArgsFlag = true
    ): CommandParameters {
        const prefix = message.content.charAt(0);
        const cmd = message.content.slice(1).split(" ")[0].toLowerCase();
        let args = Utils
            .removeSpacesCommasFromString(message.content.slice(1))
            .split(" ")
            .slice(1);

        if (lowerCaseArgsFlag) { args = args.map(e => e.toLowerCase()); }

        return { prefix, cmd, args };
    }

    public static removeSpacesCommasFromString(str: string) {
        return str.replace(/,/g, " ").replace(/\s{2,}/g, " ");
    }
}