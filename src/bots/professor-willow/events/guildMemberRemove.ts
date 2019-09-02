import Discord from "discord.js";
import runnerConfig from "../../../config/runner";
import Event from "../../../lib/Event";

export default class extends Event {
    public constructor() {
        super(runnerConfig.event.guildMemberRemove);
    }

    public async run(member: Discord.GuildMember): Promise<void> {
        try {
            const { guild } = member;
            if (guild === null) { throw new Error("`guild === null`"); }
            const systemMessagesChannel = await this.helper.getChannelByNames("Administration", "system-messages");
            const logMsg = `**${member.displayName}** has left the server`;
            await systemMessagesChannel.send(logMsg);
            await this.log.info(logMsg);
        } catch (error) {
            await this.log.error(error);
        }
    }
}
