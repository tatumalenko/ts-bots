import Discord from "discord.js";
import Event from "../../../lib/Event";

export default class extends Event {
    public constructor() {
        super();
        this.name = "guildMemberAdd";
        this.enabled = false;
        this.type = "guildMemberAdd";
        this.description = "";
    }

    public async run(member: Discord.GuildMember): Promise<void>  {
        try {
            const guild = member.guild;
            if (guild === null) { throw new Error("`guild === null`"); }
            const newMemberRole = await this.helper.getRoleByName("new-member");
            await member.roles.add(newMemberRole);
        } catch (error) {
            this.log.error(error);
        }
    }
}