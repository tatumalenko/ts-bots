import Discord from "discord.js";
import Command from "../../../lib/Command";
import CommandParameters from "../../../lib/CommandParameters";

export default class extends Command {
    public constructor() {
        super({
            name: "react",
            enabled: true,
            runIn: ["announcement-post"],
            description: "",
            aliases: [],
            lowerCaseArgs: false,
            template: "",
            helpMessageInfo: {
                messageId: "617260497141760000",
                channelName: "bot-cmd-msgs",
                categoryName: "Dev"
            }
        });
    }

    public async run(message: Discord.Message, params: CommandParameters): Promise<void> {
        try {
            const channelToReact = message.mentions.channels.first();
            if (channelToReact === undefined) {
                throw new Error("No channel mentionned. Make sure to # tag the channel.");
            }
            if (!(channelToReact instanceof Discord.TextChannel)) {
                throw new Error("`message.channel instanceof Discord.TextChannel === false`");
            }
            if (channelToReact.parent === null) {
                throw new Error("`message.channel.parent === null`");
            }
            let msgToReact: Discord.Message | null = null;
            for (const arg of params.args) {
                if (typeof arg === "string") {
                    try {
                        msgToReact = await this.helper.getMessageById({
                            messageId: arg,
                            categoryName: channelToReact.parent.name,
                            channelName: channelToReact.name
                        });
                        break;
                    } catch (error) {
                        continue;
                    }
                }
            }
            if (msgToReact === null) {
                throw new Error("Could not find message, are you sure you copied the right message ID?");
            }

            let emojiToReact: Discord.GuildEmoji | null = null;
            for (const arg of params.args) {
                if (typeof arg === "string") {
                    try {
                        await msgToReact.react(arg);
                        return;
                    } catch (error) {
                        // Might be native emoji
                    }
                    try {
                        emojiToReact = await this.helper.getEmojiById(arg);
                        await msgToReact.react(emojiToReact);
                        return;
                    } catch (error) {
                        // Might be custom emoji
                    }
                }
            }
            if (emojiToReact === null) {
                throw new Error("Could not find emoji, ask Serializable to do it right.");
            }
        } catch (error) {
            await message.channel.send(error.message);
            await this.log.error(error);
            await this.help(message.channel as Discord.TextChannel);
        }
    }
}
