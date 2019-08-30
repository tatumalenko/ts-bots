import Discord from "discord.js";
import Command from "../../../lib/Command";
import CommandParameters from "../../../lib/CommandParameters";

export default class extends Command {
    public constructor() {
        super({
            name: "count",
            enabled: true,
            runIn: ["test-zone", "secret-treehouse", "moderation", "super-secret-penthouse", "bot-testing"],
            description: "",
            aliases: [],
            lowerCaseArgs: false,
            template: "",
            helpMessageInfo: {
                messageId: "616819790463500289",
                channelName: "bot-cmd-msgs",
                categoryName: "Dev"
            }
        });
    }

    public async run(message: Discord.Message, params: CommandParameters): Promise<void>  {
        try {
            if (message.guild === null) {
                throw new Error("`message.guild` is null.");
            }
            if (params.args[0] === undefined) {
                message.channel.send(`There are **${message.guild.memberCount}** members currently onboard!`);
            } else if (params.args[0] === "days" && params.args[1] !== undefined) {
                const { guild } = message;
                let newMembers = 0;
                const days = params.args[1];
                const daysMs = Number(days) * 24 * 60 * 60 * 1000;
                const hours = Number(days) * 24;

                const curDate = new Date();
                const curDateMs = curDate.getTime();

                const compareDateMs = curDateMs - daysMs;

                for (const member of guild.members.values()) {
                    const joinedDateMs = member.joinedTimestamp;

                    if (joinedDateMs && joinedDateMs > compareDateMs) {
                        newMembers += 1;
                    }
                }

                message.channel.send(`There are **${newMembers}** new members in the past ${days} day(s)/${hours} hours!`);
            }
        } catch (error) {
            await message.channel.send(error.message);
            await this.log.error(error);
            await this.help(message.channel as Discord.TextChannel);
        }
    }
}
