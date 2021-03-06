import axios from "axios";
import cheerio from "cheerio";
import Discord, { MessageEmbed } from "discord.js";
import runnerConfig from "../../../config/runner";
import Event from "../../../lib/Event";

export default class extends Event {
    public constructor() {
        super(runnerConfig.event.messageDelete);
    }

    public async run(message: Discord.Message): Promise<void> {
        try {
            const { guild } = message;
            if (guild === null) { throw new Error("`guild === null`"); }
            const channelToSend = await this.helper.getChannelByNames("Administration", "forbidden-truths");

            const auditLogs = await guild.fetchAuditLogs({
                type: 72,
                limit: 100
            });
            const mostRecentAuditLog = auditLogs.entries.first();
            if (mostRecentAuditLog === undefined) { throw new Error("`mostRecentAuditLog === undefined"); }

            const msgId = message.id;
            let msgContent = message.content;
            const msgChannel = await this.helper.getChannelById(message.channel.id);
            let createdWhen = message.createdAt.toString();
            let createdBy = mostRecentAuditLog.target;
            let deletedBy = `${mostRecentAuditLog.executor}`;
            let deletedWhen = mostRecentAuditLog.createdAt.toString();
            let deleteType;
            let attachments;
            let imageUrl;

            const isValidUrl = (maybeUrl: string) => {
                try {
                    const url = new URL(maybeUrl);
                    return url;
                } catch (_) {
                    return false;
                }
            };

            /*
             * If partial and self delete, then
             *      Audit logs useless and nothing is certain
             * If partial and cross delete, then
             *      Audit logs reliable for stuff (unless a bot deletes msgs?!)
             * If cached and self delete, then
             *      Audit logs useless but can rely on message
             * Else cached and cross delete, then
             *      Audit logs and message reliable
             */
            if (message.partial) { // Msg is not cached
                deleteType = "Inconclusive";
                msgContent = "*Could not fetch uncached deleted message content.*";
                createdWhen = "*Could not fetch uncached deleted message date.*";
                deletedWhen += " (*maybe*)";
            } else { // Msg is cached
                if (message.attachments.size > 0) {
                    attachments = message.attachments.array();
                    const firstAttachment = message.attachments.first();
                    if (firstAttachment !== undefined) {
                        imageUrl = firstAttachment.proxyURL;
                    }
                }
                const deltaTimestamp = new Date().getTime() - new Date(mostRecentAuditLog.createdTimestamp).getTime();
                const deltaTimestampMinutes = deltaTimestamp / 1000 / 60;
                if (message.author !== createdBy ||
                    deltaTimestampMinutes > 1) {

                    /*
                     * Can't rely on audit logs
                     * Chances are deleted own message
                     */
                    if (message.author) {
                        createdBy = message.author;
                    }
                    if (createdBy instanceof Discord.User) {
                        deletedBy = `${createdBy} (unless it was ${this.client.user})`;
                    }
                    deletedWhen = "*Inconclusive*";
                    deleteType = "Self Member Delete";
                } else {
                    deleteType = "Cross Member Delete";
                }
            }

            const embed = new MessageEmbed();
            embed.setColor(this.client.utils.randomColor());
            embed.addField("Type", deleteType);
            embed.addField("Message ID", msgId);
            embed.addField("Deleted When", deletedWhen);
            embed.addField("Created When", createdWhen);
            embed.addField("Created In", msgChannel);
            embed.addField("Created By", message.partial ? `${createdBy} (*maybe*)` : createdBy);
            embed.addField("Deleted By", message.partial ? `${deletedBy} (*maybe*)` : deletedBy);
            embed.addField("Content", msgContent !== "" ? msgContent : "*None*");
            if (attachments) {
                embed.attachFiles(attachments);
                if (imageUrl) { embed.setImage(imageUrl); }
            } else if (isValidUrl(msgContent)) {
                const isTenorUrl = (str: string) => {
                    const url = new URL(str);
                    return url.origin.includes("tenor");
                };

                if (isTenorUrl(msgContent)) {
                    const html = await axios.get(msgContent);
                    const $ = cheerio.load(html.data);
                    const gifElement = $("#single-gif-container > div > div > img");
                    const rawUrl = gifElement[0].attribs.src;
                    if (isValidUrl(rawUrl)) {
                        const imgUrl = new URL(rawUrl);
                        const path = `${imgUrl.origin}${imgUrl.pathname}`;
                        embed.setImage(path);
                    }
                } else {
                    embed.setImage(msgContent);
                }
            }

            const modRole = await this.helper.getRoleByName("mod");
            const modPermissions = msgChannel.permissionsFor(modRole);
            if (!modPermissions || !modPermissions.has("VIEW_CHANNEL")) {
                const logChannel = await this.helper.getChannelByNames("Dev", "bot-logs");
                await logChannel.send(embed);
            } else {
                await channelToSend.send(embed);
            }

            return;
        } catch (error) {
            this.log.error(error);
        }
    }
}
