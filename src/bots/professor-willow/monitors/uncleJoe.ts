import Discord from "discord.js";
import runnerConfig from "../../../config/runner";
import Monitor from "../../../lib/Monitor";

export default class extends Monitor {
    public constructor () {
        super(runnerConfig.monitor.uncleJoe);
    }

    public async run (message: Discord.Message): Promise<void> {
        try {
            // Only listen to messages not coming from the bot itself
            if (this.client.user && message.member && this.client.user.id === message.member.id) {
                return;
            }
            const userId = "162719490004615168";
            // Only listen to messages from DoubleNom
            if (message.member && message.member.id !== userId) {
                return;
            }
            // Add a random probability of responding
            const randNumber = Math.random();
            const shouldReply = randNumber > 0.1 && randNumber < 0.2;
            if (!shouldReply) { return; }

            const reactions = [ "718223792786112584" ];
            await Promise.all(reactions.map((e) => message.react(e)));
        } catch (error) {
            await this.log.error(error);
        }
    }
}
