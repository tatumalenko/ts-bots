import Discord from "discord.js";
import Helper from "../util/Helper";
import Logger from "../util/Logger";
import Utils from "../util/Utils";
import Client from "./Client";
import CommandParameters from "./CommandParameters";
import Runner from "./Runner";

abstract class Command implements Runner {
    public name!: string;
    public enabled!: boolean;
    public description!: string;
    public runIn!: string[];
    public aliases!: string[];
    public client!: Client;
    public utils!: Utils;
    public log!: Logger;
    public helper!: Helper;

    public abstract run(message: Discord.Message, params: CommandParameters): Promise<void>;
}

export default Command;