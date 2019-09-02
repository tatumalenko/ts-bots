import Discord from "discord.js";
import runnerConfig from "../../../config/runner";
import Monitor from "../../../lib/Monitor";

export default class extends Monitor {
    public constructor () {
        super(runnerConfig.monitor.doubleNom);
    }

    public async run (message: Discord.Message): Promise<void> {
        try {
            // Only listen to messages not coming from the bot itself
            if (this.client.user && message.member && this.client.user.id === message.member.id) {
                return;
            }
            const dnId = "284783755644764161";
            // Only listen to messages from DoubleNom
            if (message.member && message.member.id !== dnId) {
                return;
            }
            const reactions = [ "🌶", "🥵", "🥛" ];
            await Promise.all(reactions.map((e) => message.react(e)));
        } catch (error) {
            await this.log.error(error);
        }
    }
}
