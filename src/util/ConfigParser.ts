import Discord from "discord.js";

enum ConfigMessages {
    PublicRoles = "635138806294642701"
}

export default class ConfigParser {
    public static async publicRoles(channel: Discord.TextChannel): Promise<string[]> {
        const msg = await channel.messages.fetch(ConfigMessages.PublicRoles);
        const msgText = `${msg}`;
        const roleTexts = msgText.split("\n");
        const filteredRoleTexts = roleTexts.filter((e) => !e.startsWith("$"));
        return filteredRoleTexts;
    }
}
