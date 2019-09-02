import Discord, { Collection, Snowflake } from "discord.js";
import runnerConfig from "../../../config/runner";
import { MessageEventType } from "../../../lib/Client";
import Event from "../../../lib/Event";

export default class extends Event {
    public constructor() {
        super(runnerConfig.event.messageDeleteBulk);
    }

    public async run(messages: Collection<Snowflake, Discord.Message>): Promise<void> {
        try {
            const deleteMessageEventInstance = this.client.events
                .find((e) => e.type === MessageEventType.MessageDelete);
            if (deleteMessageEventInstance === undefined) { throw new Error("`deleteMessageBulkEventInstance === undefined`"); }
            for (const message of messages.values()) {
                await deleteMessageEventInstance.run(message);
            }
        } catch (error) {
            this.log.error(error);
        }
    }
}
