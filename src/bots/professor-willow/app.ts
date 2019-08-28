/* eslint-disable @typescript-eslint/camelcase */
import Discord from "discord.js";
import Twitter from "twitter";
import configs from "../../config/config";
import Client from "../../lib/Client";
import Utils from "../../util/Utils";

new Client({
    name: "professor-willow",
    runIn: ["test-zone"],
    appDirName: __dirname,
    discordOptions: {
        fetchAllMembers: true,
        partials: ["MESSAGE", "CHANNEL"]
    }
}).start();

try {
    const {
        access_token_key,
        access_token_secret,
        consumer_key,
        consumer_secret
    } = configs["professor-willow"];
    for (const [key, value] of Object.entries({
        access_token_key,
        access_token_secret,
        consumer_key,
        consumer_secret
    })) {
        if (!value) {
            throw new Error(`ERROR: Attempted to start Twitter client, but \`configs['professor-willow'].${key} === undefined\``);
        }
    }
    const {
        webhookId,
        webhookToken
    } = configs["professor-willow"];
    for (const [key, value] of Object.entries({
        webhookId,
        webhookToken
    })) {
        if (!value) {
            throw new Error(`ERROR: Attempted to start Twitter client, but \`configs['professor-willow'].${key} === undefined\``);
        }
    }
    const accessTokenOptions = {
        access_token_key: access_token_key as string,
        access_token_secret: access_token_secret as string,
        consumer_key: consumer_key as string,
        consumer_secret: consumer_secret as string
    };
    const twitter = new Twitter(accessTokenOptions);
    const webhookClient = new Discord.WebhookClient(webhookId as string, webhookToken as string);

    twitter.stream("statuses/filter", {
        follow: configs["professor-willow"].userIds.join(", "),
    }, (stream) => {
        console.log("-----------------------------------------------------------------");
        console.log("Twitter bot, Ready to serve");
        console.log("-----------------------------------------------------------------");

        stream.on("data", async (tweet) => {
            try {
                if (!configs["professor-willow"].userIds.includes(tweet.user.id_str)
                    || tweet.retweeted_status
                    || tweet.in_reply_to_user_id_str
                    || tweet.in_reply_to_status_id_str) return;

                let mediaUrl;
                interface Media {
                    type: "photo";
                    media_url: string;
                }
                if (Object.prototype.hasOwnProperty.call(tweet.entities, "media")) {
                    tweet.entities.media.forEach((media: Media) => {
                        if (media.type === "photo") { mediaUrl = media.media_url; }
                    });
                }

                const data = {
                    title: "Click here to see the tweet!",
                    description: tweet.text,
                    timestamp: new Date(),
                    url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
                    color: Utils.randomColor(),
                    image: {
                        url: mediaUrl,
                    },
                    author: {
                        name: tweet.user.screen_name,
                        icon_url: tweet.user.profile_image_url,
                    },
                };

                const embed = new Discord.MessageEmbed(data);
                await webhookClient.send(`${tweet.user.screen_name} Tweeted!`, embed);
            } catch (error) {
                console.error(`${process.env.name}.twitter: ${error.message}`);
                console.error(error);
            }
        });

        stream.on("error", (error) => {
            console.error(`${process.env.name}.twitter: ${error.message}`);
            console.error(error);
        });
    });
} catch (error) {
    console.error(`${process.env.name}.twitter: ${error.message}`);
    console.error(error);
}