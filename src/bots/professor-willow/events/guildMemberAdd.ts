import Discord from "discord.js";
import runnerConfig from "../../../config/runner";
import Event from "../../../lib/Event";

export default class extends Event {
    public constructor() {
        super(runnerConfig.event.guildMemberAdd);
    }

    public async run(member: Discord.GuildMember): Promise<void> {
        try {
            const { guild } = member;
            if (guild === null) { throw new Error("`guild === null`"); }
            const newMemberRole = await this.helper.getRoleByName("new-member");
            await member.roles.add(newMemberRole);
        } catch (error) {
            this.log.error(error);
        }
    }
}
