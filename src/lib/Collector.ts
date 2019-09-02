import Discord from "discord.js";
import Helper from "../util/Helper";
import Logger from "../util/Logger";
import Utils from "../util/Utils";
import Client from "./Client";
import CollectorConfig from "./CollectorConfig";
import Runner from "./Runner";

abstract class Collector implements Runner {
    public name: string;

    public enabled: boolean;

    public type: string;

    public channel: {
        name: string;
        categoryName: string;
    };

    public messageId: string;

    public description: string;

    public client!: Client;

    public utils!: Utils;

    public log!: Logger;

    public helper!: Helper;

    public constructor(config: CollectorConfig) {
        this.name = config.name;
        this.enabled = config.enabled;
        this.type = config.type;
        this.channel = config.channel;
        this.messageId = config.messageId;
        this.description = config.description;
    }

    public abstract run(message: Discord.Message): Promise<void>;
}

export default Collector;
