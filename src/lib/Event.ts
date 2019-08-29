import Discord from "discord.js";
import Helper from "../util/Helper";
import Logger from "../util/Logger";
import Utils from "../util/Utils";
import Client, { MemberEventType, MessageEventType } from "./Client";
import Runner from "./Runner";

abstract class Event implements Runner {
    public name!: string;
    public enabled!: boolean;
    public type!: keyof typeof MemberEventType | keyof typeof MessageEventType;
    public description!: string;
    public client!: Client;
    public utils!: Utils;
    public log!: Logger;
    public helper!: Helper;

    public abstract run(
        oldStateMemberOrMessage: Discord.GuildMember | Discord.Message,
        newStateMember?: Discord.GuildMember): Promise<void>;
}

export default Event;