import Discord from "discord.js";
import Monitor from "../../../lib/Monitor";

export default class extends Monitor {
    public constructor() {
        super();
        this.name = "profanites";
        this.enabled = true;
        this.runIn = ["show-off", "rant", "moderation", "secret-treehouse", "super-secret-penthouse", "bot-testing"];
        this.description = "";
    }

    public async run(message: Discord.Message): Promise<void> {
        try {
            // Only listen to messages not coming from the bot itself
            if (this.client.user && message.member && this.client.user.id === message.member.id) {
                return;
            }

            const randNumber = Math.random();
            const shouldReply = randNumber > 0.1 && randNumber < 0.4;
            if (!shouldReply) {
                return;
            }

            const cussWordsFrench = ["shit", "damn", "christ", "jesus", "fuck"];
            const cussWordsEnglish = ["merde", "calisse", "tabarnak", "esti", "putain"];
            const reactions = ["😱", "😤", "😭", "😝", "🥞"];

            if (cussWordsFrench.some(word => message.content.toLowerCase().includes(word))) {
                await message.react(reactions[Math.floor(Math.random() * reactions.length)]);
                await message.channel.send(cussWordsEnglish[Math.floor(Math.random() * cussWordsEnglish.length)]);
            } else if (cussWordsEnglish.some(word => message.content.toLowerCase().includes(word))) {
                await message.react(reactions[Math.floor(Math.random() * reactions.length)]);
                await message.channel.send(cussWordsFrench[Math.floor(Math.random() * cussWordsFrench.length)]);
            }
        } catch (error) {
            await this.log.error(error);
        }
    }
}