/* eslint-disable global-require */
/* eslint-disable no-process-exit */
/* eslint-disable no-console */
import Discord, { Collection, Snowflake } from "discord.js";
import fs from "fs";
import path from "path";
import config from "../config/config";
import Helper from "../util/Helper";
import Logger from "../util/Logger";
import Utils from "../util/Utils";
import ClientOptions from "./ClientOptions";
import Collector from "./Collector";
import Command from "./Command";
import Event from "./Event";
import Monitor from "./Monitor";
import Runner from "./Runner";

process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at:", p, "reason:", reason);
    console.log("Exiting bot with status code 1.");
    process.exit(1);
});

export enum GeneralEventType {
    Ready = "ready"
}

export enum MessageEventType {
    Message = "message",
    MessageDelete = "messageDelete",
    MessageDeleteBulk = "messageDeleteBulk"
}

export enum MemberEventType {
    GuildMemberAdd = "guildMemberAdd",
    GuildMemberRemove = "guildMemberRemove",
    GuildMemberUpdate = "guildMemberUpdate"
}

export enum CollectorType {
    Reaction = "reaction"
}

// TODO: Use config file instead for runner args
export default class Client extends Discord.Client {
    public name: string;

    public runIn: string[];

    public configs: any;

    public utils: typeof Utils;

    public log: Logger;

    public guild: Discord.Guild | null = null;

    public clientOptions: ClientOptions;

    public commands: Command[] = [];

    public monitors: Monitor[] = [];

    public events: Event[] = [];

    public collectors: Collector[] = [];

    public constructor(options: ClientOptions) {
        super(options.discordOptions);
        this.clientOptions = options;
        this.name = options.name;
        this.runIn = options.runIn;
        this.configs = config;

        /*
         * Be careful of ordering here, passing this requires
         * other props to be set first
         */
        this.utils = Utils;
        this.log = new Logger(this);

        try {
            this.on(GeneralEventType.Ready, this.readyEvent);
            this.on(MessageEventType.Message, this.messageSendEvent);
            this.on(MessageEventType.MessageDelete, this.messageDeleteEvent);
            this.on(MessageEventType.MessageDeleteBulk, this.messageDeleteBulkEvent);
            this.on(MemberEventType.GuildMemberAdd, this.guildMemberAddEvent);
            this.on(MemberEventType.GuildMemberRemove, this.guildMemberRemoveEvent);
            this.on(MemberEventType.GuildMemberUpdate, this.guildMemberUpdateEvent);
        } catch (error) {
            this._log(error);
        }
    }

    public async readyEvent(): Promise<void> {
        try {
            console.log("Client is ready!");

            const guild = this.guilds.get(config.guildId);
            this.guild = guild ? guild : null;

            this.commands = this.load<Command>("commands");
            this.monitors = this.load<Monitor>("monitors");
            this.events = this.load<Event>("events");
            this.collectors = this.load<Collector>("collectors");

            console.log("\n-----------------------------------------------------------------\n" +
                `${this.user ? this.user.tag : "null?!"}, Ready to serve ${this.guilds.size} guilds and ${this.users.size} users\n` +
                "-----------------------------------------------------------------");

            this.initCollectors();

            return;
        } catch (error) {
            await this._log(error);
        }
    }

    public async messageSendEvent(message: Discord.Message): Promise<void> {
        try {
            if (!(message.channel instanceof Discord.TextChannel)) { return; }

            const { prefix } = this.utils.createCommandParametersFromMessage(message);
            const someCommandShouldRun = this.configs.cmdPrefix === prefix;
            if (someCommandShouldRun) { await this.commandMessageEvent(message); }

            if (this.monitors.length > 0) {
                const someMonitorShouldRun = this.monitors.some((monitor) => monitor.runIn.includes((message.channel as Discord.TextChannel).name));
                if (someMonitorShouldRun) { await this.monitorMessageEvent(message); }
                return;
            }
        } catch (error) {
            await this._log(error);
        }
    }

    public async commandMessageEvent(message: Discord.Message) {
        try {
            await Promise.all(this.commands.map(async (command) => {
                try {
                    const params = Utils.createCommandParametersFromMessage(message, command.lowerCaseArgs);

                    // Check `cmd` is a valid `command.name` or `command.aliases`
                    if (command.name === params.cmd ||
                        command.aliases.includes(params.cmd)) {
                        // Check `command.enabled` is `true`
                        if (!command.enabled) { return; }

                        const channel = message.channel as Discord.TextChannel;

                        // Check if `command.runIn` is empty (else use `client.runIn`)
                        if (command.runIn.length !== 0) { // `command.runIn = []`?
                            if (!command.runIn.includes(channel.name) &&
                            !command.runIn.includes(channel.type) &&
                            !command.runIn.includes(channel.id) &&
                            !command.runIn.includes("all") // `command.runIn[i] == 'all'`
                            ) {
                                return;
                            }
                        } else { // Check `client.runIn` values to make sure bot can run in these channels
                            // eslint-disable-next-line
                            if (!this.runIn.includes(channel.name) && // `client.runIn[i] == msg.channel.name`
                            !this.runIn.includes(channel.type) && // `client.runIn[i] == 'dm'`
                            !this.runIn.includes("all") // `client.runIn[i] == 'all'`
                            ) { return; }
                        }
                        // Pass `client`, `utils`, and other into `command` instance as property
                        this.setGoodies<Command>(command);

                        if (params.args.length > 0 && params.args[0] === "help") {
                            await command.helper.sendMessageByIdToChannel(message.channel as Discord.TextChannel, command.helpMessageInfo);
                            return;
                        }
                        // Call `command.run()` method
                        await command.run(message, params);
                    }
                } catch (error) {
                    await this._log(error);
                }
            }));
        } catch (error) {
            await this._log(error);
        }
    }

    public async monitorMessageEvent(message: Discord.Message): Promise<void> {
        try {
            if (!(message.channel instanceof Discord.TextChannel)) {
                return;
            }

            await Promise.all(this.monitors.map(async (monitor) => {
                try {
                    if (!monitor.enabled) { return; }

                    if (monitor.runIn.length !== 0) {
                        if (monitor.runIn.includes((message.channel as Discord.TextChannel).name) ||
                        monitor.runIn.includes(message.channel.type) ||
                        monitor.runIn.includes(message.channel.id) ||
                        monitor.runIn.includes("all")) {
                            this.setGoodies<Monitor>(monitor);
                            await monitor.run(message);
                        }
                    }
                } catch (error) {
                    this._log(error);
                }
            }));

            return;
        } catch (error) {
            await this._log(error);
        }
    }

    public async guildMemberAddEvent(member: Discord.GuildMember): Promise<void> {
        try {
            if (this.events.length === 0) { return; }

            // Check for `this.events` which has a property called `type = '<MemberEventType>'`
            await Promise.all(this.events.map((event) => {
                // Check `event.enabled` is `true`
                if (!event.enabled) { return; }
                // Check for `this.events` has property `type = <MemberEventType>`
                if (event.type === MemberEventType.GuildMemberAdd) {
                    // Pass `client`, `utils`, and other into `event` instance as property
                    this.setGoodies<Event>(event);
                    // Call `event.run()` method
                    event.run(member);
                }
            }));
        } catch (error) {
            await this._log(error);
        }
    }

    public async guildMemberRemoveEvent(member: Discord.GuildMember): Promise<void> {
        try {
            if (this.events.length === 0) { return; }

            // Check for `this.events` which has a property called `type = '<MemberEventType>'`
            await Promise.all(this.events.map((event) => {
                // Check `event.enabled` is `true`
                if (!event.enabled) { return; }
                // Check for `this.events` has property `type = <MemberEventType>`
                if (event.type === MemberEventType.GuildMemberRemove) {
                    // Pass `client`, `utils`, and other into `event` instance as property
                    this.setGoodies<Event>(event);
                    // Call `event.run()` method
                    event.run(member);
                }
            }));
        } catch (error) {
            await this._log(error);
        }
    }

    public async guildMemberUpdateEvent(oldStateMember: Discord.GuildMember, newStateMember: Discord.GuildMember) {
        try {
            if (this.events.length === 0) { return; }

            // Check for `this.events` which has a property called `type = '<MemberEventType>'`
            await Promise.all(this.events.map((event) => {
                // Check `event.enabled` is `true`
                if (!event.enabled) { return; }
                // Check for `this.events` has property `type = <MemberEventType>`
                if (event.type === MemberEventType.GuildMemberUpdate) {
                    // Pass `client`, `utils`, and other into `event` instance as property
                    this.setGoodies<Event>(event);
                    // Call `event.run()` method
                    event.run(oldStateMember, newStateMember);
                }
            }));
        } catch (error) {
            await this._log(error);
        }
    }

    public async messageDeleteEvent(deletedMessage: Discord.Message): Promise<void> {
        try {
            if (this.events.length === 0) { return; }

            await Promise.all(this.events.map(async (event) => {
                if (!event.enabled) { return; }

                // Check for `this.events` has property `eventName = 'messageDelete'`
                if (event.type !== MessageEventType.MessageDelete) { return; }

                // Pass `client`, `utils`, and other into `event` instance as property
                this.setGoodies<Event>(event);

                // Call `event.run()` method
                await event.run(deletedMessage);
            }));
        } catch (error) {
            this._log(error);
        }
    }

    public async messageDeleteBulkEvent(deletedMessages: Collection<Snowflake, Discord.Message>): Promise<void> {
        try {
            if (this.events.length === 0) { return; }

            await Promise.all(this.events.map(async (event) => {
                if (!event.enabled) { return; }

                // Check for `this.events` has property `eventName = 'messageDelete'`
                if (event.type !== MessageEventType.MessageDeleteBulk) { return; }

                // Pass `client`, `utils`, and other into `event` instance as property
                this.setGoodies<Event>(event);

                // Call `event.run()` method
                await event.run(deletedMessages);
            }));
        } catch (error) {
            this._log(error);
        }
    }

    public async initCollectors(): Promise<void> {
        try {
            if (this.collectors.length === 0) { return; }

            await Promise.all(this.collectors.map(async (collector) => {
                // Check `collector.enabled` is `true`
                if (!collector.enabled) { return; }

                // Check for `this.collectors` has property `type = 'reaction'`
                if (collector.type === "reaction") {
                    // Pass `client`, `utils`, and other into `collector` instance as property
                    this.setGoodies<Collector>(collector);

                    if (!collector.helper) { throw new Error("collector.helper invalid!"); }
                    const channel = await collector
                        .helper
                        .getChannelByNames(collector.channel.categoryName, collector.channel.name);

                    if (!channel) { throw new Error("channel not found in this.collector/client init"); }
                    if (!(channel instanceof Discord.TextChannel)) { throw new Error("channel not a text channel"); }
                    if (!channel.messages) { throw new Error("channel not found in collector"); }
                    const message = await channel.messages.fetch(collector.messageId);

                    // Call `collector.run()` method
                    await collector.run(message);
                }
            }));
        } catch (error) {
            this._log(error);
        }
    }

    public async start(): Promise<void> {
        try {
            super.login(`${this.configs[this.name].botToken}`);
            return;
        } catch (error) {
            await this._log(error);
        }
    }

    private load<T>(moduleDirName: string): T[] {
        const instances: T[] = [];
        try {
            const { appDirName } = this.clientOptions;
            const dirContents = fs.readdirSync(path.join(appDirName));
            const paths = dirContents.map((content) => path.join(appDirName, content));

            let dirPath = "";
            for (const p of paths) {
                if (fs.statSync(p).isDirectory() && path.basename(p) === moduleDirName) {
                    dirPath = p;
                }
            }

            if (dirPath === "") { return instances; }

            const filePaths = fs.readdirSync(dirPath)
                .filter((dirContent) => fs.statSync(path.join(dirPath, dirContent)).isFile() &&
                path.extname(path.join(dirPath, dirContent)) === ".js")
                .map((jsFile) => path.join(dirPath, jsFile));

            const Ctors: Record<string, any> = {};
            for (const filePath of filePaths) {
                Ctors[path.basename(filePath).replace(".js", "")] = require(filePath).default;
            }

            for (const Ctor of Object.values(Ctors)) {
                instances.push(new Ctor());
            }

            return instances;
        } catch (error) {
            this._log(error);
        }
        return instances;
    }

    private setGoodies<T extends Runner>(runner: T): void {
        try {
            runner.client = this;
            runner.utils = Utils;
            runner.helper = new Helper(this);
            runner.helper.init();
            runner.log = new Logger(this);
            runner.log.setRunner(runner);
        } catch (error) {
            this._log(error);
        }
    }

    private async _log(...data: (string | Error)[]): Promise<void> {
        try {
            if (this.log !== undefined) {
                await this.log.error(...data);
                return;
            }

            console.error(...data);

            if (this.guild === null) {
                throw new Error("Tried to send error message to error logs channel, but guild is null.");
            }

            const channel = await this
                .guild
                .channels
                .find((c: Discord.GuildChannel) => c.name === this.configs.channels.errorLogs) as Discord.TextChannel;
            await channel.send(`${data}`);
        } catch (error) {
            console.error(error);
        }
    }
}
