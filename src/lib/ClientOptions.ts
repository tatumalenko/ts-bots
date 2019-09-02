import Discord from "discord.js";

interface ClientOptions {
    name: string;
    runIn: string[];
    appDirName: string;
    discordOptions: Discord.ClientOptions;
}

export default ClientOptions;
