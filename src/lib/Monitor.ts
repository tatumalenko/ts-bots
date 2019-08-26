import Discord from "discord.js";
import Helper from "../util/Helper";
import Logger from "../util/Logger";
import Utils from "../util/Utils";
import Client from "./Client";
import Runner from "./Runner";

abstract class Monitor implements Runner {
    public name!: string;
    public enabled!: boolean;
    public runIn!: string[];
    public description!: string;
    public client!: Client;
    public utils!: Utils;
    public log!: Logger;
    public helper!: Helper;

    public abstract run(message: Discord.Message): Promise<void>;
}

export default Monitor;