import Discord from "discord.js";
import Command from "../../../lib/Command";
import CommandParameters from "../../../lib/CommandParameters";

export default class extends Command {
    public constructor() {
        super({
            name: "clear",
            enabled: true,
            runIn: ["all"],
            description: "",
            aliases: [],
            lowerCaseArgs: false,
            template: "",
            helpMessage: {
                id: "",
                channelName: ""
            }
        });
    }

    public async run(message: Discord.Message, params: CommandParameters): Promise<void> {
        try {
            const numberOfMsgsToClear = params.args[0];

            if (!(message.channel instanceof Discord.TextChannel)) {
                throw new Error("`message.channel` is not an instance of `Discord.TextChannel`.");
            }

            if (!message.author) {
                throw new Error("`message.author` is not valid (null).");
            }

            const memberPermissions = message.channel.permissionsFor(message.author);

            // Check the following permissions before deleting messages:
            //    1. Check if the user has enough permissions
            //    2. Check if I have the permission to execute the command
            if (!memberPermissions || !memberPermissions.has("MANAGE_MESSAGES")) {
                throw new Error(`Sorry, you don't have the permission to execute the command \`${message.content}\`.`);
            }

            // Only delete messages if the channel type is `TextChannel`
            // DO NOT delete messages in `GroupChannel` or `DMChannel`
            if (!(message.channel instanceof Discord.TextChannel)) {
                throw new Error();
            }

            if (!numberOfMsgsToClear || typeof Number(numberOfMsgsToClear) !== "number") {
                throw new Error("You need to enter a number following the `!clear` "
                + "command to indicate how many messages to delete!\n"
                + "Example: `!clear 2`");
            }

            // Default 50 most recent are loaded in cache
            const numberOfMsgsToDelete = Number(numberOfMsgsToClear) + 1;
            try {
                await message.channel.bulkDelete(numberOfMsgsToDelete);
            } catch (error) {
                const msgs = await message.channel.messages.fetch({ limit: 50 });
                const msgsToDelete = msgs.first(numberOfMsgsToDelete);
                for (const msg of msgsToDelete.values()) {
                    await message.channel.messages.remove(msg.id);
                }
            }

            await this.log.info(`${message.author.toString()} cleared ${numberOfMsgsToClear} messages in \`${(message.channel as Discord.TextChannel).name}\`.`);
        } catch (error) {
            await message.channel.send(error.message !== "" ? error.message : "Oops, something went wrong :( @uphill");
            await this.log.error(error);
        }
    }
}
