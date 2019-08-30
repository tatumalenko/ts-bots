import Discord from "discord.js";
import Command from "../../../lib/Command";
import CommandParameters from "../../../lib/CommandParameters";

enum RoleEditAction {
    add = "add",
    remove = "remove"
}

enum PrivilegeRole {
    admin = "admin",
    mod = "mod",
    "mega-bot" = "mega-bot",
    bot = "bot"
}

enum NonPrivilegeRole {
    "iv0-", "iv98+", "lvl1", "rare", "unown", "gible", "bidoof", "rocket"
}

export default class extends Command {
    public constructor() {
        super({
            name: "role",
            enabled: true,
            runIn: ["test-zone", "role-management", "4200-st-laurent-raid-break", "502678237302882304", "test-zone"],
            description: "",
            aliases: [],
            lowerCaseArgs: false,
            template: "",
            helpMessageInfo: {
                messageId: "616818963862651030",
                channelName: "bot-cmd-msgs",
                categoryName: "Dev"
            }
        });
    }

    public async run(message: Discord.Message, params: CommandParameters): Promise<void>  {
        try {
            if (params.args.length === 0) {
                await this.helper.sendMessageByIdToChannel(message.channel as Discord.TextChannel, {
                    messageId: "614856749106593801",
                    channelName: "announcement-post",
                    categoryName: "Dev"
                });
                return;
            }

            if (params.args.length > 3) {
                await this.helper.sendMessageByIdToChannel(message.channel as Discord.TextChannel, {
                    messageId: "614856749106593801",
                    channelName: "announcement-post",
                    categoryName: "Dev"
                });
                throw new Error("Invalid number of arguments, see command instructions ^^.");
            }

            if (!message.member || !(message.channel instanceof Discord.TextChannel)) {
                throw new Error("`message.member === null` or `message.channel instanceof Discord.TextChannel === false`.");
            }

            let roleToEditAction: string | undefined;
            let roleToEdit: Discord.Role | undefined;
            let roleMember: Discord.GuildMember | undefined;

            for (const arg of params.args) {
                if (Object.keys(RoleEditAction).includes(arg)) {
                    roleToEditAction = arg;
                    break;
                }
            }
            for (const arg of params.args) {
                const member = await this.helper.getMemberByIdOrNameOrTag(arg);
                if (member) {
                    roleMember = member;
                    break;
                }
            }
            for (const arg of params.args) {
                try {
                    const role = await this.helper.getRoleByName(arg);
                    roleToEdit = role;
                    break;
                } catch (error) {
                    // Keep iterating..
                }
            }

            if (!roleToEditAction) {
                throw new Error(`You must supply an action name as an argument. One of ${Object.keys(RoleEditAction).map(e => `\`${e}\``).join(", ")}`);
            }

            // If the role cannot be found.
            if (!roleToEdit) {
                throw new Error("The role could not be found! Le role ne semble pas être valid.");
            }

            // Prevent trying to edit a privileged role when member has none of them.
            if (Object.keys(PrivilegeRole).some(forbiddenRoleName => roleToEdit && forbiddenRoleName === roleToEdit.name)
                && !message.member.roles.some(role => Object.keys(PrivilegeRole).includes(role.name))) {
                throw new Error("You do not have permission for this command! You n'avez pas la permissions d'utiliser cette commande!");
            }

            // Then the member argument isn't present at all -> assume themself as member to edit.
            if (roleMember === undefined && params.args.length === 2) {
                roleMember = message.member;
            } else if (!roleMember) {
                // If still not successful at this point, then member could not be found.
                throw new Error("No member could not be found! Aucun membre semble pas être valid.");
            }

            // Prevent trying to edit someone else's role when they have no priviledged role.
            if (!message.member.roles.some(role => Object.keys(PrivilegeRole).includes(role.name))
                    && message.member.id !== roleMember.id) {
                throw new Error("You do not have permission for this command! You n'avez pas la permissions d'utiliser cette commande!");
            }

            if (!(message.channel instanceof Discord.TextChannel)) {
                throw new Error("`message.channel instanceof Discord.TextChannel === false`");
            }

            // If in high-iv-alerts, can only edit non priviledged roles.
            const allowedRoleNames = Object.keys(NonPrivilegeRole);
            if (message.channel.name === "💥high-iv-alerts💥"
                && !allowedRoleNames.some(allowedRoleName => roleToEdit && roleToEdit.name === allowedRoleName)) {
                throw new Error(`💥Not a valid role name.💥\nTry one of ${allowedRoleNames.join(", ")}`);
            }

            let okMsg: string;
            switch (roleToEditAction.toLowerCase()) {
                case RoleEditAction.add.toString():
                    await roleMember.roles.add(roleToEdit);
                    okMsg = `Got it! Gave ${roleToEdit.name} access to ${roleMember.displayName}`;
                    break;

                case RoleEditAction.remove.toString():
                    await roleMember.roles.remove(roleToEdit);
                    okMsg = `Got it! Removed ${roleToEdit.name} access to ${roleMember.displayName}`;
                    break;

                default:
                    okMsg = "Oops. Something went wrong, no roles were edited";
                    break;
            }
            await message.channel.send(okMsg);
            this.log.info(okMsg);
            return;
        } catch (error) {
            await message.channel.send(error.message);
            await this.log.error(error);
            await this.help(message.channel as Discord.TextChannel);
        }
    }
}
