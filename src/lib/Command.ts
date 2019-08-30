import Discord from "discord.js";
import Helper from "../util/Helper";
import Logger from "../util/Logger";
import Utils from "../util/Utils";
import Client from "./Client";
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

    public constructor({
        name,
        enabled,
        description,
        runIn,
        aliases,
        lowerCaseArgs,
        template,
        helpMessageInfo: {
            messageId,
            channelName,
            categoryName
        }
    }: {
        name: string;
        enabled: boolean;
        description: string;
        runIn: string[];
        aliases: string[];
        lowerCaseArgs: boolean;
        template: string;
        helpMessageInfo: {
            messageId: string;
            channelName: string;
            categoryName: string;
        };
    }) {
        this.name = name;
        this.enabled = enabled;
        this.description = description;
        this.runIn = runIn;
        this.aliases = aliases;
        this.lowerCaseArgs = lowerCaseArgs;
        this.template = template;
        this.helpMessageInfo = {
            messageId, channelName, categoryName
        };
    }

    public async help(channelToSend: Discord.TextChannel): Promise<void> {
        const helpMsg = await this.helper.getMessageById(this.helpMessageInfo);
        channelToSend.send(helpMsg);
        return;
    }

    public abstract run(message: Discord.Message, params: CommandParameters): Promise<void>;
}

export default Command;