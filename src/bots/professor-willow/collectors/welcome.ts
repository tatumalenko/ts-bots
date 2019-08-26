import Discord, { ReactionCollector } from "discord.js";
import Collector from "../../../lib/Collector";

export default class extends Collector {
    public constructor() {
        super();

        this.name = "welcome";
        this.enabled = true;
        this.type = "reaction";
        this.channel = {
            name: "test-welcome",
            categoryName: "Dev",
        };
        this.messageId = "614807483277377539";
        this.description = "";
    }

    public async run(message: Discord.Message): Promise<void> {
        try {
            console.log("INSIDE REACTION COLLETOR");
            // const helper = this.client.newHelper();
            const channels = await this.helper.channelsByCategoryMap;
            const teamEmojis = await this.helper.getTeamEmojis();
            const teamRoles = await this.helper.getTeamRoles();

            const rc = new ReactionCollector(message, async (reaction, user) => {
                console.log("Inside filter!");
                // console.log('reaction.emoji.name:', reaction.emoji.name);
                // console.log('user.username', user.username);

                // if emoji is team emoji, then
                //      if action is react, then
                //          if user already reacted to any of the other two emojis, then
                //              1. unreact the other emoji
                //              2. remove the other team role associated with other emoji
                //              3. add new role
                //          else, then
                //              1. add associated team role
                //      if action is unreact, then
                //          1. remove team role associated
                // else if emoji is dm info emoji, then
                //      if action is react (i.e. ^!!), then send via dm
                //      if action is unreact (i.e. !reaction.users.has(user), then nothing)
                // else invalid emoji react, remove

                if (reaction.emoji.name === "🇪") {
                    if (reaction.users.has(user.id)) { // if action is react
                        // const messages = await this.helper.channelsByCategoryMap.get("Dev").get("test-zone").messages.fetch();
                        await user.send(await this.helper.channelsByCategoryMap.get("Dev").get("new-welcome").messages.fetch("614850354714116109"));
                    }
                } else if (reaction.emoji.name === "🇫") {
                    if (reaction.users.has(user.id)) {
                        await user.send(await this.helper.channelsByCategoryMap.get("Dev").get("new-welcome").messages.fetch("614851634882674689"));
                    }
                } else if (Object.values(teamEmojis)
                    .some(teamEmojiName => teamEmojiName.name === reaction.emoji.name)) {
                    console.log("In filter!");
                    const member = await this.helper.getMemberById(user.id);
                    if (reaction.users.has(user.id)) { // if action is react
                        // get other team emojis (i.e. those that aren't the current one)
                        const otherTeamEmojis = Object.values(teamEmojis)
                            .filter(teamEmoji => teamEmoji.name !== reaction.emoji.name);

                        // get other team reactions other than current one attempted
                        const otherTeamMsgReactions = await message.reactions
                            .filter((msgReaction) => {
                                const otherTeamEmojisNames = otherTeamEmojis.map(e => e.name);
                                return otherTeamEmojisNames.includes(msgReaction.emoji.name);
                            });

                        const otherTeamMsgReactionsPreviouslyReactedOrNull = await Promise
                            .all(otherTeamMsgReactions.map(async e => ((await e.users.fetch()).has(user.id) ? e : null)));

                        const reactionsReactedPreviously = otherTeamMsgReactionsPreviouslyReactedOrNull
                            .filter(e => !!e);

                        const emojisReactedPreviously = reactionsReactedPreviously.map(e => e.emoji);
                        const hasReactedToOtherTeamEmoji = emojisReactedPreviously.length > 0;

                        // if user already reacted to any of the other two emojis
                        if (hasReactedToOtherTeamEmoji) {
                            // 1. unreact the other emoji
                            await Promise.all(reactionsReactedPreviously.map(e => e.users.remove(user.id)));

                            // 2. remove the other team role associated with other emoji
                            await Promise.all(emojisReactedPreviously.map(e => member.roles.remove(teamRoles[e.name].id)));

                            // 3. add new role
                            await member.roles.add(teamRoles[reaction.emoji.name].id);
                        } else {
                            // 1. add associated team role
                            member.roles.add(teamRoles[reaction.emoji.name].id);
                        }
                    } else { // if action is unreact
                        // todo: maybe unnecessary?
                        member.roles.remove(teamRoles[reaction.emoji.name].id);
                    }
                } else { // bogus emoji react, remove all
                    // get all users from reaction
                    const users = await reaction.users.fetch();
                    await Promise.all(users.map(e => reaction.users.remove(e)));
                    // await reaction.users.remove();
                }
                return true;
            }, { dispose: true });
            rc.on("remove", async (reaction: Discord.MessageReaction, user: Discord.User) => {
                console.log("Inside remove!!");
                if (Object.values(teamEmojis)
                    .some(teamEmojiName => teamEmojiName.name === reaction.emoji.name)) {
                    const member = await this.helper.getMemberById(user.id);
                    member.roles.remove(teamRoles[reaction.emoji.name].id);
                }
            });
        } catch (e) {
            await this.log.error(e);
        }
    }

    private filter(reaction: Discord.MessageReaction, user: Discord.User): Promise<boolean> {

    }

}