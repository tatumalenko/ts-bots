import Discord from "discord.js";
import runnerConfig from "../../../config/runner";
import Command from "../../../lib/Command";
import CommandParameters from "../../../lib/CommandParameters";

export default class extends Command {
    public constructor() {
        super(runnerConfig.command.count);
    }

    public async run(message: Discord.Message, params: CommandParameters): Promise<void> {
        try {
            if (message.guild === null) {
                throw new Error("`message.guild` is null.");
            }
            const [ unit, days ] = params.args;
            if (unit === undefined) {
                message.channel.send(`There are **${message.guild.memberCount}** members currently onboard!`);
            } else if (unit === "days" && params.args[1] !== undefined) {
                const { guild } = message;
                let newMembers = 0;

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
