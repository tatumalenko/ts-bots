import Discord from "discord.js";
import Monitor from "../../../lib/Monitor";

export default class extends Monitor {
    public constructor() {
        super();
        this.name = "cpCountingGame";
        this.enabled = true;
        this.runIn = ["test-zone", "cp-counting-game"];
        this.description = "";
    }

    public async run(message: Discord.Message): Promise<void> {
        try {
            if (!!message.author && message.author.bot === true
                || message.attachments.size === 0) {
                return;
            }

            const infoMsg = `You can only post one at a time, ${message.author}! You little cheater, you.`;
            const isCurrentMessage2Images = message.attachments.size > 1;
            const last50Messages = await message.channel.messages.fetch();

            // Sort by most recent.
            const last50MessagesSorted = last50Messages.sort((msgA, msgB) => msgB.createdTimestamp - msgA.createdTimestamp);
            let isPreviousMessageAlsoImageFromSameAuthor = false;
            for (const msg of last50MessagesSorted.values()) {
                if (msg.id === message.id) {
                    // Same message, continue.
                    continue;
                }
                // If the `msg` last posted containing an attachment/image.
                if (msg.attachments.size > 0 && message.attachments.size > 0) {
                    // If these this last attachment corresponds to one from same author.
                    if (!!msg.author && !!message.author && msg.author.id === message.author.id) {
                        isPreviousMessageAlsoImageFromSameAuthor = true;
                    }
                    break;
                }
            }

            if (isCurrentMessage2Images || isPreviousMessageAlsoImageFromSameAuthor) {
                await message.channel.messages.remove(message, "Double posted in cp-counting-game.");
                throw new Error(infoMsg);
            }
        } catch (error) {
            await message.channel.send(error.message);
            await this.log.error(error);
        }
    }
}