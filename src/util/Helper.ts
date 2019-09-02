import Discord from "discord.js";
import Client from "../lib/Client";
import Logger from "./Logger";

export enum Team {
    mystic = "mystic",
    instinct = "instinct",
    valor = "valor"
}

type IdResolvable = string | Discord.User | Discord.GuildMember | Discord.Role | Discord.Channel;

export default class Helper extends Discord.Guild {
    private guild: Discord.Guild | undefined;

    public channelsByCategoryMap: Map<string, Map<string, Discord.GuildChannel | undefined>> | undefined;

    private log: Logger;

    public readonly teamEmojiIds: Record<Team, string> = {
        mystic: "352708130297348097",
        instinct: "352708126795104256",
        valor: "352708126887247872"
    };

    public teamEmojis: Record<Team, Discord.GuildEmoji | undefined> | null = null;

    public readonly teamRoleIds: Record<Team, string> = {
        mystic: "352484478997889024",
        instinct: "352485000270315525",
        valor: "352485092599529473"
    };

    public teamRoles: Record<Team, Discord.Role | undefined> | null = null;

    public constructor(client: Client) {
        super(client, {});

        const guild = this.client.guilds.get(client.configs.guildId);
        if (guild !== undefined) {
            this.guild = guild;
        }
        this.log = client.log;

        // eslint-disable-next-line no-underscore-dangle
        this.channelsByCategoryMap = this._createChannelsByCategoryMap();
    }

    public async init(): Promise<void> {
        this.teamEmojis = await this.getTeamEmojis();
        this.teamRoles = await this.getTeamRoles();
    }

    private _createChannelsByCategoryMap() {
        const channelsByCategoryMap = new Map();
        if (this.guild === undefined) {
            throw new Error("Could not get channels since guild is undefined.");
        }

        for (const channel of this.guild.channels.array()) {
            if (!channel.parent) {
                // eslint-disable-next-line no-continue
                continue;
            }
            if (!channelsByCategoryMap.has(channel.parent.name)) {
                channelsByCategoryMap.set(channel.parent.name, new Map());
            }
            channelsByCategoryMap.get(channel.parent.name).set(channel.name, channel);
        }

        return channelsByCategoryMap;
    }

    public getChannelById(channelId: string): Discord.GuildChannel {
        if (this.guild === undefined) {
            throw new Error("Could not get channel since guild is undefined.");
        }
        const channel = this.guild.channels.get(channelId);
        if (!(channel instanceof Discord.TextChannel)) {
            throw new Error("`message.channel instanceof Discord.TextChannel === false`");
        }
        return channel;
    }

    public getChannelByName(channelName: string): Discord.GuildChannel {
        if (this.guild === undefined) {
            throw new Error("Could not get channel since guild is undefined.");
        }
        const channel = this.guild.channels.find((e) => e.name === channelName);
        if (!(channel instanceof Discord.TextChannel)) {
            throw new Error("`message.channel instanceof Discord.TextChannel === false`");
        }
        return channel;
    }

    public async getChannelByNames(categoryName: string, channelName: string): Promise<Discord.TextChannel> {
        if (!this.channelsByCategoryMap) {
            throw new Error("this.channelsByCategory unavailable!");
        }
        const category = this.channelsByCategoryMap.get(categoryName);
        if (!category) {
            throw new Error(`this.channelsByCategory.get(${categoryName}) unavailable!`);
        }
        const channel = await category.get(channelName);
        if (!(channel instanceof Discord.TextChannel)) {
            throw new Error("`message.channel instanceof Discord.TextChannel === false`");
        }
        return channel;
    }

    public getRoleById(roleId: string): Discord.Role | undefined {
        if (this.guild === undefined) {
            throw new Error("Could not get role since guild is undefined.");
        }
        return this.guild.roles.get(roleId);
    }

    public async getTeamRoles(): Promise<Record<Team, Discord.Role>> {
        const [
            mystic,
            instinct,
            valor
        ] = await Promise.all([
            this.getRoleById(this.teamRoleIds.mystic),
            this.getRoleById(this.teamRoleIds.instinct),
            this.getRoleById(this.teamRoleIds.valor)
        ]);

        for (const [
            teamName,
            teamEmoji
        ] of Object.entries({ mystic,
                instinct,
                valor })) {
            if (teamEmoji === undefined) {
                throw new Error(`Team emoji (${teamName}) could not be found (undefined).`);
            }
        }

        return {
            mystic: mystic as Discord.Role,
            instinct: instinct as Discord.Role,
            valor: valor as Discord.Role
        };
    }

    public getRoleByName(roleName: string): Discord.Role {
        if (this.guild === undefined) {
            throw new Error("Could not get role since guild is undefined.");
        }
        const role = this.guild.roles.find((e) => e.name === roleName);
        if (role === undefined) {
            throw new Error("Could not get role, returned `undefined`.");
        }
        return role;
    }

    // TODO: Make use of the maybe version for variable order commands.
    public getEmojiByIdMaybe(emojiId: string): Discord.GuildEmoji | undefined {
        if (this.guild === undefined) {
            throw new Error("Could not get emoji since guild is undefined.");
        }
        return this.guild.emojis.get(emojiId);
    }

    public getEmojiById(emojiId: string): Discord.GuildEmoji {
        if (this.guild === undefined) {
            throw new Error("Could not get emoji since guild is undefined.");
        }
        let emoji = this.guild.emojis.get(emojiId);
        if (emoji === undefined) {
            // Try to see if numeric only part of string is ID
            // eslint-disable-next-line require-unicode-regexp
            const maybeCustomEmojiId = emojiId.match(/:[0-9.]+/g);
            if (!!maybeCustomEmojiId && maybeCustomEmojiId[0][0] === ":") {
                emoji = this.guild.emojis
                    .get(maybeCustomEmojiId[0]
                        .split("")
                        .slice(1)
                        .join(""));
            }
            if (emoji === undefined) {
                throw new Error("Could not find emoji.");
            }
        }
        return emoji;
    }

    private async _setTeamEmojis(): Promise<void> {
        const teamEmojis = await this.getTeamEmojis();

        for (const [
            teamName,
            teamEmoji
        ] of Object.entries(teamEmojis)) {
            if (teamEmoji === undefined) {
                throw new Error(`Team emoji (${teamName}) could not be found (undefined).`);
            }
        }
    }

    public async getTeamEmojis(): Promise<Record<Team, Discord.GuildEmoji>> {
        try {
            const [
                mystic,
                instinct,
                valor
            ] = await Promise.all([
                this.getEmojiById(this.teamEmojiIds.mystic),
                this.getEmojiById(this.teamEmojiIds.instinct),
                this.getEmojiById(this.teamEmojiIds.valor)
            ]);

            for (const [
                teamName,
                teamEmoji
            ] of Object.entries({ mystic,
                    instinct,
                    valor })) {
                if (teamEmoji === undefined) {
                    throw new Error(`Team emoji (${teamName}) could not be found (undefined).`);
                }
            }

            return {
                mystic: mystic as Discord.GuildEmoji,
                instinct: instinct as Discord.GuildEmoji,
                valor: valor as Discord.GuildEmoji
            };
        } catch (error) {
            this.log.error(error);
            throw new Error();
        }
    }

    public static resolveToId(memberIdResolvable: IdResolvable): string {
        return typeof memberIdResolvable === "string"
            ? memberIdResolvable
            : memberIdResolvable.id;
    }

    public getMemberById(memberIdResolvable: IdResolvable): Promise<Discord.GuildMember> {
        if (this.guild === undefined) {
            throw new Error("Could not get member since guild is undefined.");
        }
        return this.guild.members.fetch(Helper.resolveToId(memberIdResolvable));
    }

    public getMemberByIdOrNameOrTag(str: string): Discord.GuildMember | undefined {
        return this.guild
            ? this.guild.members
                .find((guildMember) => guildMember.id === str ||
                    guildMember.displayName === str ||
                    guildMember.user.tag === str)
            : undefined;
    }

    public async getMemberRoleById(memberIdResolvable: IdResolvable, roleIdResolvable: IdResolvable) {
        return (await this.getMemberById(Helper.resolveToId(memberIdResolvable))).roles.get(Helper.resolveToId(roleIdResolvable));
    }

    public async getMemberRoles(memberIdResolvable: IdResolvable) {
        return (await this.getMemberById(Helper.resolveToId(memberIdResolvable))).roles;
    }

    public async hasMemberRole(memberIdResolvable: IdResolvable, roleIdResolvable: IdResolvable) {
        return !!(await this.getMemberRoleById(memberIdResolvable, roleIdResolvable));
    }

    public async hasAnyMemberRole(
        memberIdResolvable: IdResolvable,
        roleIdResolvables: IdResolvable[] | Record<string, IdResolvable>
    ) {
        const roleIdResolvablesAsArray = roleIdResolvables instanceof Array
            ? roleIdResolvables
            : Object.values(roleIdResolvables);
        const memberRoles = await this.getMemberRoles(memberIdResolvable);
        roleIdResolvablesAsArray.some((roleIdResolvable) => memberRoles.has(Helper.resolveToId(roleIdResolvable)));
        return roleIdResolvablesAsArray.some((roleIdResolvableAsArray) => memberRoles.has(Helper.resolveToId(roleIdResolvableAsArray)));
    }

    public async getMessageById({
        messageId,
        channelName,
        categoryName
    }: {
        messageId: string;
        channelName: string;
        categoryName: string;
    }): Promise<Discord.Message> {
        const channelOfMsgToSend = await this.getChannelByNames(categoryName, channelName);
        if (channelOfMsgToSend === undefined) {
            throw new Error(`Channel ${categoryName}.${channelName} could not be found.`);
        }
        if (!(channelOfMsgToSend instanceof Discord.TextChannel)) {
            throw new Error(`Channel ${categoryName}.${channelName} is not a \`Discord.TextChannel\`.`);
        }
        const message = await channelOfMsgToSend.messages.fetch(messageId);
        return message;
    }

    public async sendMessageByIdToChannel(
        channelToSend: Discord.TextChannel,
        {
            messageId,
            channelName,
            categoryName
        }: {
            messageId: string;
            channelName: string;
            categoryName: string;
        }
    ) {
        const message = await this.getMessageById({
            messageId,
            channelName,
            categoryName
        });

        await channelToSend.send(message);
    }
}

module.exports = Helper;
