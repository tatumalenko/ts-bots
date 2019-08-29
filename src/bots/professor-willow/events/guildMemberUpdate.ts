import Discord from "discord.js";
import Event from "../../../lib/Event";

export default class extends Event {
    public constructor() {
        super();
        this.name = "guildMemberUpdate";
        this.enabled = true;
        this.type = "guildMemberUpdate";
        this.description = "";
    }

    public async run(oldStateMember: Discord.GuildMember, newStateMember: Discord.GuildMember): Promise<void>  {
        try {
            const guild = newStateMember.guild;
            if (guild === null) { throw new Error("`guild === null`"); }

            const systemMessagesChannel = await this.helper.getChannelByNames("Administration", "system-messages");

            const newMemberRole = await this.helper.getRoleByName("new-member");
            const teamRoles = await this.helper.getTeamRoles();

            const hasNewMemberRole = newStateMember.roles.has(newMemberRole.id);
            const hasTeamRole = newStateMember.roles.some(role => Object.values(teamRoles).map(e => e.id).includes(role.id));

            if (hasNewMemberRole && hasTeamRole) {
                const teamRole: Discord.Role | undefined = newStateMember.roles.reduce((chosenRole, currRole) => Object.values(teamRoles).map(e => e.id).includes(currRole.id) ? currRole : chosenRole);
                if (!teamRole) {
                    throw new Error("`!teamRole === true`");
                }
                const logMsg = `**${newStateMember.displayName}** selected team ${teamRole}`;
                await newStateMember.roles.remove(newMemberRole);
                await systemMessagesChannel.send(logMsg);
                await this.log.info(logMsg);
            }
        } catch (error) {
            await this.log.error(error);
        }
    }
}
