import Discord from "discord.js";
import MessageIds from "../../../config/MessageIds";
import runnerConfig from "../../../config/runner";
import Command from "../../../lib/Command";
import CommandParameters from "../../../lib/CommandParameters";

export default class extends Command {
    public constructor() {
        super(runnerConfig.command.map);
    }

    public async run(message: Discord.Message, params: CommandParameters): Promise<void> {
        try {
            const infoMsg = await this.helper.getMessageById({
                messageId: MessageIds.MapCommandOutput,
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
