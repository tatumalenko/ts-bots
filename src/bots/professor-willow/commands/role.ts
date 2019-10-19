import Discord from "discord.js";
import MessageIds from "../../../config/MessageIds";
import runnerConfig from "../../../config/runner";
import Command from "../../../lib/Command";
import CommandParameters from "../../../lib/CommandParameters";
import ConfigParser from "../../../util/ConfigParser";

enum RoleEditAction {
    Add = "add",
    Remove = "remove",
}

enum PrivilegeRole {
    Admin = "admin",
    Mod = "mod",
    MegaBot = "mega-bot",
    Bot = "bot"
}

enum NonPrivilegeRole {
    Iv0 = "iv0-",
    Iv98 = "iv98+",
    Lvl1 = "lvl1",
    Rare = "rare",
    Unown = "unown",
    Gible = "gible",
    Bidoof = "bidoof",
    Rocket = "rocket"
}

export default class extends Command {
    public constructor() {
        super(runnerConfig.command.role);
    }

    public async run(message: Discord.Message, params: CommandParameters): Promise<void> {
        let infoMsg: Discord.Message | null = null;
        try {
            infoMsg = await this.helper.getMessageById({
                messageId: MessageIds.RoleCommandInfo,
                categoryName: "Dev",
                channelName: "bot-cmd-msgs"
            });
        } catch (error) {
            await this.log.error("Could not find `infoMsg`", error);
        }

        try {
            if (params.args.length > 3) {
                throw new Error("Invalid number of arguments, see command instructions.");
            }

            if (!message.member || !(message.channel instanceof Discord.TextChannel)) {
                throw new Error("`message.member === null` or `message.channel instanceof Discord.TextChannel === false`.");
            }

            let roleToEditAction: string | undefined;
            let roleToEdit: Discord.Role | undefined;
            let roleMember: Discord.GuildMember | undefined;

            for (const arg of params.args) {
                if (Object.values(RoleEditAction)
                    .map((e) => e.toString())
                    .includes(arg)) {
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
                throw new Error(`You must supply an action name as an argument. One of ${
                    Object.values(RoleEditAction).map((e): string => `\`${e}\``).
                        join(", ")}`);
            }

            // If the role cannot be found.
            if (!roleToEdit) {
                throw new Error("The role could not be found! Le role ne semble pas être valid.");
            }

            // Prevent trying to edit a privileged role when member has none of them.
            if (Object.values(PrivilegeRole).
                some((forbiddenRoleName): boolean => !!roleToEdit &&
                    forbiddenRoleName === roleToEdit.name,) &&
                    !message.member.roles.some((role) => Object.values(PrivilegeRole)
                        .map((e) => e.toString())
                        .includes(role.name))) {
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
            if (!message.member.roles.some((role) => Object.values(PrivilegeRole)
                .map((e) => e.toString())
                .includes(role.name)) &&
                message.member.id !== roleMember.id) {
                throw new Error("You do not have permission for this command! You n'avez pas la permissions d'utiliser cette commande!");
            }

            if (!(message.channel instanceof Discord.TextChannel)) {
                throw new Error("`message.channel instanceof Discord.TextChannel === false`");
            }

            // If in high-iv-alerts, can only edit non priviledged roles.
            const allowedRoleNames = await ConfigParser.publicRoles(await this.helper.getChannelByNames("Dev", "bot-config-msgs"));
            if (message.channel.name === "💥high-iv-alerts💥" &&
                !allowedRoleNames.some((allowedRoleName) => !!roleToEdit && roleToEdit.name === allowedRoleName)) {
                throw new Error("💥Not a valid role name.💥");
            }

            let okMsg: string;
            switch (roleToEditAction.toLowerCase()) {
            case RoleEditAction.Add.toString():
                await roleMember.roles.add(roleToEdit);
                okMsg = `Got it! Assigned ${roleToEdit.name} role to ${roleMember.displayName}.`;
                break;

            case RoleEditAction.Remove.toString():
                await roleMember.roles.remove(roleToEdit);
                okMsg = `Got it! Removed ${roleToEdit.name} role to ${roleMember.displayName}.`;
                break;

            default:
                okMsg = "Oops. Something went wrong, no roles were edited.";
                break;
            }
            await message.channel.send(okMsg);
            this.log.info(okMsg);
            return;
        } catch (error) {
            await message.channel.send(error.message);

            if (message.channel instanceof Discord.TextChannel &&
                message.channel.name === "💥high-iv-alerts💥" &&
                infoMsg !== null) {
                await message.channel.send(infoMsg);
            } else {
                await this.help(message.channel as Discord.TextChannel);
            }

            await this.log.error(error);
        }
    }
}
