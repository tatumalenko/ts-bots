import Discord from "discord.js";
import runnerConfig from "../../../config/runner";
import Command from "../../../lib/Command";
import CommandParameters from "../../../lib/CommandParameters";

export default class extends Command {
    public constructor() {
        super(runnerConfig.command.announce);
    }

    public async run(message: Discord.Message, params: CommandParameters): Promise<void> {
        try {
            if (message.guild === null) {
                throw new Error("`message.guild` is null.");
            }

            const channelToSend = message.mentions.channels.first();
            if (channelToSend === undefined) {
                throw new Error("`channelToSend` is `undefined`.");
            }

            let memberToMention = message.mentions.members
                ? message.mentions.members.first()
                : null;
            if (memberToMention !== null) {
                const guildMembers = await message.guild.members.fetch();
                for (const arg of params.args) {
                    memberToMention = await guildMembers.
                        find((guildMember) => guildMember.id === arg ||
                            guildMember.displayName === arg ||
                            guildMember.user.tag === arg);

                    if (memberToMention) {
                        break;
                    }
                }
            }

            const channelMessages = await message.channel.messages.fetch();
            const messageToSend = params.args.
                reduce((prev, curr) => (channelMessages.get(curr)
                    ? channelMessages.get(curr)
                    : prev), "");

            if (!messageToSend || messageToSend === "") {
                throw new Error("All arguments resolved to a channel. At least one should contain a message resolvable id.");
            }

            if (params.args.length === 3 && !memberToMention) {
                throw new Error("Something went wrong. Found 3 arguments, but no users could be resolved.");
            }

            await channelToSend.send(messageToSend);

            if (memberToMention) {
                await channelToSend.send(`${memberToMention} ^^`);
            }
        } catch (error) {
            await message.channel.send(error.message);
            await this.log.error(error);
            await this.help(message.channel as Discord.TextChannel);
        }
    }
}
