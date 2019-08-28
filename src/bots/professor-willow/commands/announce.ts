import Discord from "discord.js";
import Command from "../../../lib/Command";
import CommandParameters from "../../../lib/CommandParameters";

export default class extends Command {
    public constructor() {
        super();
        this.name = "announce2";
        this.enabled = true;
        this.runIn = ["test-zone", "announcement-post"];
        this.description = "";
        this.aliases = [];
        this.lowerCaseArgs = false;
    }

    public async run(message: Discord.Message, params: CommandParameters): Promise<void>  {
        try {
            if (message.guild === null) {
                throw new Error("`message.guild` is null.");
            }

            if (params.args.length === 0) {
                await this.helper.sendMessageByIdToChannel(message.channel as Discord.TextChannel, {
                    messageId: "614856749106593801",
                    channelName: "announcement-post",
                    categoryName: "Dev"
                });
                return;
            }

            const channelToSend = message.mentions.channels.first();
            if (channelToSend === undefined) {
                throw new Error("`channelToSend` is `undefined`.");
            }

            let memberToMention = message.mentions.members ? message.mentions.members.first() : null;
            if (memberToMention !== null) {
                const guildMembers = await message.guild.members.fetch();
                for (const arg of params.args) {
                    console.log("arg:", arg);
                    memberToMention = await guildMembers
                        .find(guildMember => guildMember.id === arg
                            || guildMember.displayName === arg
                            || guildMember.user.tag === arg);

                    if (memberToMention) {
                        break;
                    }
                }
            }

            const channelMessages = await message.channel.messages.fetch();
            const messageToSend = params.args
                .reduce((prev, curr) => (channelMessages.get(curr)
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
        }
    }
}
