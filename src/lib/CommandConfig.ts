interface CommandConfig {
    name: string,
    enabled: boolean,
    runIn: string[],
    description: string,
    aliases: string[]
    lowerCaseArgs: boolean,
    template: string,
    helpMessageInfo: {
        messageId: string,
        channelName: string,
        categoryName: string
    }
}

export default CommandConfig;
