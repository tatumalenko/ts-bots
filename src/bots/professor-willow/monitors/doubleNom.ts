import Discord from "discord.js";
import runnerConfig from "../../../config/runner";
import Monitor from "../../../lib/Monitor";

export default class extends Monitor {
    public constructor () {
        super(runnerConfig.monitor.doubleNom);
    }

    public async run (message: Discord.Message): Promise<void> {
        try {
            const dnId = "284783755644764161";
            
            // Only listen to messages from DoubleNom
            if (!(message.member && message.member.id === dnId)) {
                return
            }

            // Add a random probability of responding
            const randNumber = Math.random();
            const shouldReply = randNumber > 0.1 && randNumber < 0.15;
            if (!shouldReply) { return; }

            const reactions = [ "🌶", "🥛", "604468664024039454" ];
            await Promise.all(reactions.map((e) => message.react(e)));        
        } catch (error) {
            await this.log.error(error);
        }
    }
}
