import Discord from "discord.js";
import Event from "../../../lib/Event";

export default class extends Event {
    public constructor() {
        super();
        this.name = "guildMemberRemove";
        this.enabled = false;
        this.type = "guildMemberRemove";
        this.description = "";
    }

    public async run(member: Discord.GuildMember): Promise<void>  {
        try {
            const guild = member.guild;
            if (guild === null) { throw new Error("`guild === null`"); }
            const systemMessagesChannel = await this.helper.getChannelByNames("Dev", "system-messages");
            systemMessagesChannel.send(`Gee-Golly. ${member.displayName} has left us.  😢`);
        } catch (error) {
            this.log.error(error);
        }
    }
}