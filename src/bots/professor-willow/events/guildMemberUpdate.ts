import Discord from "discord.js";
import Event from "../../../lib/Event";

export default class extends Event {
    public constructor() {
        super();
        this.name = "guildMemberUpdate";
        this.enabled = false;
        this.type = "guildMemberUpdate";
        this.description = "";
    }

    public async run(oldStateMember: Discord.GuildMember, newStateMember: Discord.GuildMember): Promise<void>  {
        try {
            const guild = newStateMember.guild;
            if (guild === null) { throw new Error("`guild === null`"); }

            const newMemberRole = await this.helper.getRoleByName("new-member");
            const teamRoles = await this.helper.getTeamRoles();

            const hasNewMemberRole = newStateMember.roles.has(newMemberRole.id);
            const hasTeamRole = newStateMember.roles.some(role => Object.values(teamRoles).map(e => e.id).includes(role.id));

            if (hasNewMemberRole && hasTeamRole) {
                newStateMember.roles.remove(newMemberRole);
            }
        } catch (error) {
            this.log.error(error);
        }
    }
}