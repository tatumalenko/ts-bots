import Discord, { Collection, Snowflake } from "discord.js";
import Helper from "../util/Helper";
import Logger from "../util/Logger";
import Utils from "../util/Utils";
import Client, { MemberEventType, MessageEventType } from "./Client";
import EventConfig from "./EventConfig";
import Runner from "./Runner";

abstract class Event implements Runner {
    public name: string;

    public enabled: boolean;

    public type: MemberEventType | MessageEventType;

    public description: string;

    public client!: Client;

    public utils!: Utils;

    public log!: Logger;

    public helper!: Helper;

    public constructor(config: EventConfig) {
        this.name = config.name;
        this.enabled = config.enabled;
        this.type = config.type;
        this.description = config.description;
    }

    public abstract run(
        oldStateMemberOrMessage: Discord.GuildMember | Discord.Message | Collection<Snowflake, Discord.Message>,
        newStateMember?: Discord.GuildMember): Promise<void>;
}

export default Event;
