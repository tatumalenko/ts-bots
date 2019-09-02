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
        let msgContent = message.content;
        const prefix = msgContent.charAt(0);
        const cmd = msgContent.slice(1).split(" ")[0].toLowerCase();
        // eslint-disable-next-line prefer-named-capture-group
        const quotedArgs = msgContent.match(/"(.*?)"/g);
        let args = quotedArgs ? Array.from(quotedArgs).map((e) => e) : [];
        // Remove quoted args from `msgContent` since it was added to `args`
        for (const arg of args) {
            msgContent = msgContent.replace(arg, "");
        }
        // Remove unnecessary quotes around any args
        args = args.map((e) => e.replace(/"/g, "")); // Remove quotes around any arg
        // Trim around `msgContent` that might be needed
        msgContent = msgContent.trim();
        // Parse the remaining args by first removing any extra spaces and commas
        args.push(...Utils
            .removeExtraSpacesAndAllCommasFromString(msgContent.slice(1))
            .split(" ")
            .slice(1));

        // If lower case args is desired
        if (lowerCaseArgsFlag) { args = args.map((e) => e.toLowerCase()); }

        return { prefix,
            cmd,
            args };
    }

    public static removeExtraSpacesAndAllCommasFromString(str: string) {
        return str.replace(/,/g, " ").replace(/\s{2,}/g, " ");
    }
}
