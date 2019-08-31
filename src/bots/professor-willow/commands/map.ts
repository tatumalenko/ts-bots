import Discord from "discord.js";
import Command from "../../../lib/Command";
import CommandParameters from "../../../lib/CommandParameters";

export default class extends Command {
    public constructor() {
        super({
            name: "map",
            enabled: true,
            runIn: ["test-zone", "quest-raid-iv-map"],
            description: "",
            aliases: [],
            lowerCaseArgs: false,
            template: "",
            helpMessageInfo: {
                messageId: "617189124209639454",
                channelName: "bot-cmd-msgs",
                categoryName: "Dev"
            }
        });
    }

    public async run(message: Discord.Message, params: CommandParameters): Promise<void> {
        try {
            const infoMsg = await this.helper.getMessageById({
                messageId: "599766056646737980",
                categoryName: "General",
                channelName: "quest-raid-iv-map"
            });
            await message.channel.send(infoMsg);
        } catch (error) {
            await message.channel.send(error.message);
            await this.log.error(error);
            await this.help(message.channel as Discord.TextChannel);
        }
    }
}
