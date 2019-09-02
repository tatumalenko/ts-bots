import Discord from "discord.js";
import Helper from "../util/Helper";
import Logger from "../util/Logger";
import Utils from "../util/Utils";
import Client from "./Client";
import CommandConfig from "./CommandConfig";
import CommandParameters from "./CommandParameters";
import Runner from "./Runner";

abstract class Command implements Runner {
    public name: string;

    public enabled: boolean;

    public description: string;

    public runIn: string[];

    public aliases: string[];

    public lowerCaseArgs: boolean;

    public template: string;

    public helpMessageInfo: {
        messageId: string;
        channelName: string;
        categoryName: string;
    };

    public client!: Client;

    public utils!: Utils;

    public log!: Logger;

    public helper!: Helper;

    public constructor(config: CommandConfig) {
        this.name = config.name;
        this.enabled = config.enabled;
        this.description = config.description;
        this.runIn = config.runIn;
        this.aliases = config.aliases;
        this.lowerCaseArgs = config.lowerCaseArgs;
        this.template = config.template;
        this.helpMessageInfo = config.helpMessageInfo;
    }

    public async help(channelToSend: Discord.TextChannel): Promise<void> {
        const helpMsg = await this.helper.getMessageById(this.helpMessageInfo);
        channelToSend.send(helpMsg);
    }

    public abstract run(message: Discord.Message, params: CommandParameters): Promise<void>;
}

export default Command;
