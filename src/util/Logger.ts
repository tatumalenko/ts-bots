/* eslint-disable no-console */
import Discord, { MessageEmbed } from "discord.js";
import Client from "../lib/Client";
import Runner from "../lib/Runner";

export default class Logger {
    private client: Client;

    private runner: Runner | null;

    public constructor(client: Client) {
        this.client = client;
        this.runner = null;
    }

    public setRunner(runner: Runner): void {
        this.runner = runner;
    }

    public async logInfo(data: string | Error): Promise<void> {
        try {
            console.log(this.formatLogString(data));

            const channelName = this.client.configs.channels.botLogs;
            await this.logToChannel(channelName, data);
        } catch (error) {
            console.error(error);
        }
    }

    public async info(...args: (string | Error)[]): Promise<void> {
        try {
            await Promise.all(args.map((arg) => {
                this.logInfo(arg);
                return true;
            }));
        } catch (error) {
            console.error(error);
        }
    }

    public async logError(data: string | Error): Promise<void> {
        try {
            console.error(this.formatLogString(data), data);

            const channel = this.client.configs.channels.errorLogs;
            await this.logToChannel(channel, data);
        } catch (error) {
            console.error(error);
        }
    }

    public async error(...args: (string | Error)[]): Promise<void> {
        try {
            await Promise.all(args.map((arg) => {
                this.logError(arg);
            }));
        } catch (error) {
            console.error(error);
        }
    }

    public async logToChannel(channelName: string, data: string | Error): Promise<void> {
        try {
            const embed = new MessageEmbed();

            embed.setTitle("COLLECTED LOG");
            embed.addField("App", this.client.name);
            embed.addField("Runner", this.runner ? `${this.runner.name}.js` : "N/A");
            embed.addField("When", new Date().toLocaleString()
                .replace(/,|\./g, ""));
            embed.addField("Message", data);
            embed.setColor(this.client.utils.randomColor());

            if (data instanceof Error) {
                embed.addField("Stack Trace", (data as Error).stack);
            }

            if (this.client.guild === null) {
                throw new Error("Tried to send error message to error logs channel, but guild is null.");
            }

            const channel = this.client
                .guild
                .channels
                .find((c: Discord.TextChannel) => c.name === channelName);

            if (!(channel instanceof Discord.TextChannel)) {
                console.error(this.formatLogString("Channel found is not a Discord.TextChannel"));
                return;
            }

            await (channel as Discord.TextChannel).send(embed);
        } catch (error) {
            console.error(error);
        }
    }

    private formatLogString(data: string | Error): string {
        const clientName = this.client.name;
        const runnerName = this.runner ? `${this.runner.name}.ts` : "n/a";

        return `[${clientName}, ${runnerName}] ${data}\n\n`;
    }
}
