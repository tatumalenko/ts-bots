interface CollectorConfig {
    name: string,
    enabled: boolean,
    type: string,
    channel: {
        name: string,
        categoryName: string
    },
    messageId: string,
    description: string
}

export default CollectorConfig;
