import Discord from "discord.js";
import Event from "../../../lib/Event";

export default class extends Event {
    public constructor() {
        super();
        this.name = "guildMemberRemove";
        this.enabled = true;
        this.type = "guildMemberRemove";
        this.description = "";
    }

    public async run(member: Discord.GuildMember): Promise<void>  {
        try {
            const guild = member.guild;
            if (guild === null) { throw new Error("`guild === null`"); }
            const systemMessagesChannel = await this.helper.getChannelByNames("Dev", "system-messages");
            const logMsg = `**${member.displayName}** has left the server`;
            await systemMessagesChannel.send(logMsg);
            await this.log.info(logMsg);
        } catch (error) {
            await this.log.error(error);
        }
    }
}