import axios from "axios";
import cheerio from "cheerio";
import Discord, { MessageEmbed } from "discord.js";
import Event from "../../../lib/Event";

export default class extends Event {
    public constructor() {
        super();
        this.name = "messageDelete";
        this.enabled = true;
        this.type = "messageDelete";
        this.description = "";
    }

    public async run(message: Discord.Message): Promise<void>  {
        try {
            const guild = message.guild;
            if (guild === null) { throw new Error("`guild === null`"); }
            const channelToSend = await this.helper.getChannelByNames("Dev", "forbidden-truths");
            const auditLogs = await guild.fetchAuditLogs({
                type: 72,
                limit: 100,
            });
            const mostRecentAuditLog = auditLogs.entries.first();
            if (mostRecentAuditLog === undefined) { throw new Error("`mostRecentAuditLog === undefined"); }

            const msgId = message.id;
            let msgContent = message.content;
            let msgChannel = message.channel;
            let createdWhen = message.createdAt.toString();
            let createdBy = mostRecentAuditLog.target;
            let deletedBy = mostRecentAuditLog.executor;
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

            // if partial and self delete, then
            //      audit logs useless and nothing is certain
            // if partial and cross delete, then
            //      audit logs reliable for stuff
            // if cached and self delete, then
            //      audit logs useless but can rely on message
            // else cached and cross delete, then
            //      audit logs and message reliable
            if (message.partial) { // msg is not cached
                deleteType = "Inconclusive";
                msgChannel = message.channel;
                msgContent = "*Could not fetch uncached deleted message content.*";
                createdWhen = "*Could not fetch uncached deleted message date.*";
                deletedWhen += " (*maybe*)";
            } else { // msg is cached
                console.log("Message is cached");
                if (message.attachments.size > 0) {
                    attachments = message.attachments.array();
                    const firstAttachment = message.attachments.first();
                    if (firstAttachment !== undefined) {
                        imageUrl = firstAttachment.proxyURL;
                    }
                }
                const deltaTimestamp = new Date().getTime() - new Date(mostRecentAuditLog.createdTimestamp).getTime();
                const deltaTimestampMinutes = deltaTimestamp / 1000 / 60;
                if (message.author !== createdBy
                    || deltaTimestampMinutes > 1) {
                    console.log("Inconsistency found in author/createdBy or date.");
                    // can't rely on audit logs
                    // chances are deleted own message
                    if (message.author) { createdBy = message.author; }
                    if (createdBy instanceof Discord.User) { deletedBy = createdBy; }
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

            await channelToSend.send(embed);
        } catch (error) {
            this.log.error(error);
        }
    }
}