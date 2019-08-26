import Discord from "discord.js";
import Client from "../lib/Client";
import Logger from "./Logger";

enum Team {
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
        valor: "352485092599529473"
    };
    public teamEmojis: Record<Team, Discord.GuildEmoji | undefined> | null = null;
    public readonly teamRoleIds: Record<Team, string> = {
        mystic: "352484478997889024",
        instinct: "352485000270315525",
        valor: "352485092599529473",
    };
    public teamRoles: Record<Team, Discord.Role | undefined> | null = null;

    public constructor(client: Client) {
        super(client, {});

        const guild = this.client.guilds.get(client.configs.guildId);
        if (guild !== undefined) {
            this.guild = guild;
        };
        this.log = client.log;

        this.getTeamEmojis()
            .then(teamEmojis => {
                this.teamEmojis = teamEmojis;
            })
            .catch(e => this.log.error(e));
        this.getTeamRoles()
            .then(teamRoles => {
                this.teamRoles = teamRoles;
            })
            .catch(e => this.log.error(e));

        // eslint-disable-next-line no-underscore-dangle
        this.channelsByCategoryMap = this._createChannelsByCategoryMap();
    }

    private _createChannelsByCategoryMap() {
        const channelsByCategoryMap = new Map();
        if (this.guild === undefined) {
            throw new Error("Could not get channels since guild is undefined.");
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const channel of this.guild.channels.array()) {
            // console.log('channel.name', channel.name);
            // console.log('channel.parent', channel.parent);
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

    public async getChannelById(channelId: string): Promise<Discord.GuildChannel | undefined> {
        if (this.guild === undefined) {
            throw new Error("Could not get channel since guild is undefined.");
        }
        return this.guild.channels.get(channelId);
    }

    public async getChannelByName(channelName: string): Promise<Discord.GuildChannel | undefined> {
        if (this.guild === undefined) {
            throw new Error("Could not get channel since guild is undefined.");
        }
        return this.guild.channels.find(channel => channel.name === channelName);
    }

    // public async getGrouppedChannelByNames(categoryName, channelName) {
    //     // return this.guild.channels.find((channel) => {
    //     //     const category = channel.parent;
    //     //     return category.name === categoryName && channel.name === channelName;
    //     // });
    //     return this.channelsByCategoryMap.get(categoryName).get(channelName);
    // }

    public async getRoleById(roleId: string): Promise<Discord.Role | undefined> {
        if (this.guild === undefined) {
            throw new Error("Could not get role since guild is undefined.");
        }
        return this.guild.roles.get(roleId);
    }

    public async getTeamRoles(): Promise<Record<Team, Discord.Role | undefined>> {
        const [mystic, instinct, valor] = await Promise.all([
            this.getRoleById(this.teamRoleIds.mystic),
            this.getRoleById(this.teamRoleIds.instinct),
            this.getRoleById(this.teamRoleIds.valor),
        ]);
        return {
            mystic,
            instinct,
            valor,
        };
    }

    public async getRoleByName(roleName: string) {
        if (this.guild === undefined) {
            throw new Error("Could not get role since guild is undefined.");
        }
        return this.guild.roles.find(role => role.name === roleName);
    }

    public async getEmojiById(emojiId: string) {
        if (this.guild === undefined) {
            throw new Error("Could not get emoji since guild is undefined.");
        }
        return this.guild.emojis.get(emojiId);
    }

    private async _setTeamEmojis(): Promise<void> {
        const teamEmojis = await this.getTeamEmojis();

        for (const [teamName, teamEmoji] of Object.entries(teamEmojis)) {
            if (teamEmoji === undefined) {
                throw new Error(`Team emoji (${teamName}) could not be found (undefined).`);
            }
        }
    }

    public async getTeamEmojis(): Promise<Record<Team, Discord.GuildEmoji>> {
        try {
            const [mystic, instinct, valor] = await Promise.all([
                this.getEmojiById(this.teamEmojiIds.mystic),
                this.getEmojiById(this.teamEmojiIds.instinct),
                this.getEmojiById(this.teamEmojiIds.valor),
            ]);

            for (const [teamName, teamEmoji] of Object.entries({mystic, instinct, valor})) {
                if (teamEmoji === undefined) {
                    throw new Error(`Team emoji (${teamName}) could not be found (undefined).`);
                }
            }

            return {
                mystic: mystic as Discord.GuildEmoji,
                instinct: instinct as Discord.GuildEmoji,
                valor: valor as Discord.GuildEmoji,
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

    public async getMemberById(memberIdResolvable: IdResolvable) {
        if (this.guild === undefined) {
            throw new Error("Could not get member since guild is undefined.");
        }
        return this.guild.members.fetch(
            Helper.resolveToId(memberIdResolvable),
        );
    }

    public async getMemberRoleById(memberIdResolvable: IdResolvable, roleIdResolvable: IdResolvable) {
        return (await this.getMemberById(
            Helper.resolveToId(memberIdResolvable),
        )).roles.get(Helper.resolveToId(roleIdResolvable));
    }

    public async getMemberRoles(memberIdResolvable: IdResolvable) {
        return (await this.getMemberById(Helper.resolveToId(memberIdResolvable))).roles;
    }

    public async hasMemberRole(memberIdResolvable: IdResolvable, roleIdResolvable: IdResolvable) {
        return !!(await this.getMemberRoleById(memberIdResolvable, roleIdResolvable));
    }

    public async hasAnyMemberRole(memberIdResolvable: IdResolvable, roleIdResolvables: IdResolvable[] | Record<string, IdResolvable>) {
        const roleIdResolvablesAsArray = roleIdResolvables instanceof Array
            ? roleIdResolvables
            : Object.values(roleIdResolvables);
        const memberRoles = await this.getMemberRoles(memberIdResolvable);
        roleIdResolvablesAsArray.some(roleIdResolvable => memberRoles.has(Helper.resolveToId(roleIdResolvable)));
        return roleIdResolvablesAsArray.some(roleIdResolvableAsArray => memberRoles.has(Helper.resolveToId(roleIdResolvableAsArray)));
    }
}

module.exports = Helper;
