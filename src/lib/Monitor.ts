import Discord from "discord.js";
import Helper from "../util/Helper";
import Logger from "../util/Logger";
import Utils from "../util/Utils";
import Client from "./Client";
import MonitorConfig from "./MonitorConfig";
import Runner from "./Runner";

abstract class Monitor implements Runner {
    public name: string;

    public enabled: boolean;

    public runIn: string[];

    public description: string;

    public client!: Client;

    public utils!: Utils;

    public log!: Logger;

    public helper!: Helper;

    public constructor(config: MonitorConfig) {
        this.name = config.name;
        this.enabled = config.enabled;
        this.runIn = config.runIn;
        this.description = config.description;
    }

    public abstract run(message: Discord.Message): Promise<void>;
}

export default Monitor;
