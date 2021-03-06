import Discord, { ReactionCollector } from "discord.js";
import MessageIds from "../../../config/MessageIds";
import runnerConfig from "../../../config/runner";
import Collector from "../../../lib/Collector";

enum Team {
    mystic = "mystic",
    instinct = "instinct",
    valor = "valor"
}

export default class extends Collector {
    private teamEmojis!: Record<Team, Discord.GuildEmoji>;

    private teamRoles!: Record<Team, Discord.Role>;

    public constructor() {
        super(runnerConfig.collector.welcome);
    }

    private async init(): Promise<void> {
        this.teamEmojis = await this.helper.getTeamEmojis();
        this.teamRoles = await this.helper.getTeamRoles();
        this.filter = this.filter.bind(this);
        this.remove = this.remove.bind(this);
    }

    public async run(message: Discord.Message): Promise<void> {
        try {
            await this.init();
            const reactionCollector = new ReactionCollector(
                message,
                (): boolean => true, { "dispose": true }
            );
            reactionCollector.on("collect", this.filter);
            reactionCollector.on("remove", this.remove);
        } catch (error) {
            await this.log.error(error);
        }
    }

    private async filter(reaction: Discord.MessageReaction, user: Discord.User): Promise<boolean> {
        if (reaction.users.size === 0 || !reaction.users.has(user.id)) {
            await this.remove(reaction, user);
            return false;
        }
        if (!this.helper) {
            throw new Error("this.helper is undefined or null.");
        }
        const channelName = "Dev";
        const categoryName = "test-welcome";
        const channel = await this.helper.getChannelByNames(channelName, categoryName);
        if (!channel) {
            throw new Error(`Channel ${categoryName}.${channelName} returned undefined`);
        }

        if (reaction.emoji.name === "🇪") {
            const contentChannel = await this.helper.getChannelByNames("Dev", "test-welcome");
            if (!(contentChannel instanceof Discord.TextChannel)) {
                throw new Error("Content channel for english message not found.");
            }
            const msgToSend = await contentChannel.messages.fetch(MessageIds.WelcomeDMEnglishOutput);
            if (msgToSend.content === "") {
                throw new Error("English message to send is not found/empty!");
            }
            await user.send(msgToSend);

        } else if (reaction.emoji.name === "🇫") {
            const contentChannel = await this.helper.getChannelByNames("Dev", "test-welcome");
            if (!(contentChannel instanceof Discord.TextChannel)) {
                throw new Error("Content channel for french message not found.");
            }
            const msgToSend = await contentChannel.messages.fetch(MessageIds.WelcomeDMFrenchOutput);
            if (msgToSend.content === "") {
                throw new Error("French message to send is not found/empty!");
            }
            await user.send(msgToSend);

        } else if (this.reactionIsTeamEmojiReaction(reaction)) {
            const teamRoleToAddOrRemove = this.teamRoles[this.getTeamFromName(reaction.emoji.name)];
            if (!teamRoleToAddOrRemove) {
                throw Error("Team role associated with emoji not found!");
            }
            const member = await this.helper.getMemberById(user.id);

            // Get other team emojis (i.e. those that aren't the current one)
            const otherTeamEmojis = Object.values(this.teamEmojis)
                .filter((teamEmoji) => teamEmoji.name !== reaction.emoji.name);

            // Get other team reactions other than current one attempted
            const otherTeamMsgReactions = await reaction.message.reactions
                .filter((msgReaction) => {
                    const otherTeamEmojisNames = otherTeamEmojis.map((emoji) => emoji.name);
                    return otherTeamEmojisNames.includes(msgReaction.emoji.name);
                });

            const otherTeamMsgReactionsPreviouslyReactedOrNull = await Promise
                .all(otherTeamMsgReactions.map(async (e) => ((await e.users.fetch()).has(user.id) ? e : null)));

            const reactionsReactedPreviously = otherTeamMsgReactionsPreviouslyReactedOrNull
                .filter((e) => !!e);

            const emojisReactedPreviously = reactionsReactedPreviously.map((e) => (e ? e.emoji : null));
            const hasReactedToOtherTeamEmoji = emojisReactedPreviously.length > 0;

            // If user already reacted to any of the other two emojis
            if (hasReactedToOtherTeamEmoji) {
                // 1. Unreact the other emoji
                await Promise.all(reactionsReactedPreviously.map(async (e) => {
                    if (e === null) {
                        return;
                    }
                    await e.users.remove(user.id);

                }));

                // 2. Remove the other team role associated with other emoji
                await Promise.all(emojisReactedPreviously.map(async (emoji) => {
                    if (emoji === null) {
                        return;
                    }
                    const teamRole = this.teamRoles[this.getTeamFromName(emoji.name)];
                    if (teamRole) {
                        await member.roles.remove(teamRole.id);
                    }
                }));

                // 3. Add new role
                await member.roles.add(teamRoleToAddOrRemove.id);
            } else {
                // 1. Add associated team role
                member.roles.add(teamRoleToAddOrRemove.id);
            }
        } else { // Bogus emoji react, remove all
            const users = await reaction.users.fetch();
            await Promise.all(users.map((e) => {
                if (e === null) { return; }
                reaction.users.remove(e);
            }));
        }
        return true;
    }

    private async remove(reaction: Discord.MessageReaction, user: Discord.User): Promise<void> {
        if (this.reactionIsTeamEmojiReaction(reaction)) {
            const member = await this.helper.getMemberById(user.id);
            const teamRole = this.teamRoles[this.getTeamFromName(reaction.emoji.name)];
            if (!teamRole) {
                throw new Error("Role associated with team emoji not found!");
            }
            member.roles.remove(teamRole.id);
        }
    }

    private getTeamFromName(teamName: string): Team {
        let team;
        if (Team.mystic === teamName) {
            team = Team.mystic;
        } else if (Team.instinct === teamName) {
            team = Team.instinct;
        } else if (Team.valor === teamName) {
            team = Team.valor;
        } else {
            throw new Error(`Could not find team ${teamName}`);
        }
        return team;
    }

    private reactionIsTeamEmojiReaction (reaction: Discord.MessageReaction) {
        return Object.values(this.teamEmojis)
            .some((teamEmoji) => teamEmoji && teamEmoji.name === reaction.emoji.name);
    }
}
