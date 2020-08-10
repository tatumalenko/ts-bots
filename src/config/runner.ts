import { MemberEventType, MessageEventType } from "../lib/Client";
import CollectorConfig from "../lib/CollectorConfig";
import CommandConfig from "../lib/CommandConfig";
import EventConfig from "../lib/EventConfig";
import MonitorConfig from "../lib/MonitorConfig";
import MessageIds from "./MessageIds";

const announce: CommandConfig = {
    name: "announce",
    enabled: true,
    runIn: [
        "test-zone",
        "announcement-post"
    ],
    description: "",
    aliases: [],
    lowerCaseArgs: false,
    template: "",
    helpMessageInfo: {
        messageId: MessageIds.AnnounceCommandTemplate,
        channelName: "bot-cmd-msgs",
        categoryName: "Dev"
    }
};

const clear: CommandConfig = {
    name: "clear",
    enabled: true,
    runIn: [ "all" ],
    description: "",
    aliases: [],
    lowerCaseArgs: false,
    template: "",
    helpMessageInfo: {
        messageId: MessageIds.ClearCommandTemplate,
        channelName: "bot-cmd-msgs",
        categoryName: "Dev"
    }
};

const count: CommandConfig = {
    name: "count",
    enabled: true,
    runIn: [
        "test-zone",
        "secret-treehouse",
        "moderation",
        "super-secret-penthouse",
        "bot-testing"
    ],
    description: "",
    aliases: [],
    lowerCaseArgs: false,
    template: "",
    helpMessageInfo: {
        messageId: MessageIds.CountCommandTemplate,
        channelName: "bot-cmd-msgs",
        categoryName: "Dev"
    }
};

const map: CommandConfig = {
    name: "map",
    enabled: true,
    runIn: [
        "test-zone",
        "quest-raid-iv-map"
    ],
    description: "",
    aliases: [],
    lowerCaseArgs: false,
    template: "",
    helpMessageInfo: {
        messageId: MessageIds.MapCommandTemplate,
        channelName: "bot-cmd-msgs",
        categoryName: "Dev"
    }
};

const react: CommandConfig = {
    name: "react",
    enabled: true,
    runIn: [ "announcement-post" ],
    description: "",
    aliases: [],
    lowerCaseArgs: false,
    template: "",
    helpMessageInfo: {
        messageId: MessageIds.ReactCommandTemplate,
        channelName: "bot-cmd-msgs",
        categoryName: "Dev"
    }
};

const role: CommandConfig = {
    name: "role",
    enabled: true,
    runIn: [
        "test-zone",
        "role-management",
        "4200-st-laurent-raid-break",
        "502678237302882304",
        "test-zone"
    ],
    description: "",
    aliases: [],
    lowerCaseArgs: false,
    template: "",
    helpMessageInfo: {
        messageId: MessageIds.RoleCommandTemplate,
        channelName: "bot-cmd-msgs",
        categoryName: "Dev"
    }
};

const commandConfigs = {
    announce,
    clear,
    count,
    map,
    react,
    role
};

const cpCountingGame: MonitorConfig = {
    name: "cpCountingGame",
    enabled: true,
    runIn: [
        "test-zone",
        "cp-counting-game",
        "✨-cp-counting-game"
    ],
    description: ""
};

const profanities: MonitorConfig = {
    name: "profanities",
    enabled: true,
    runIn: [
        "show-off",
        "rant",
        "moderation",
        "secret-treehouse",
        "super-secret-penthouse",
        "bot-testing"
    ],
    description: ""
};

const doubleNom: MonitorConfig = {
    name: "doubleNom",
    enabled: true,
    runIn: [ "all" ],
    description: ""
};

const uncleJoe: MonitorConfig = {
    name: "uncleJoe",
    enabled: true,
    runIn: [ "all" ],
    description: ""
};

const monitorConfigs = {
    cpCountingGame,
    profanities,
    doubleNom,
    uncleJoe
};

const guildMemberAdd: EventConfig = {
    name: "guildMemberAdd",
    enabled: true,
    type: MemberEventType.GuildMemberAdd,
    description: ""
};

const guildMemberRemove: EventConfig = {
    name: "guildMemberRemove",
    enabled: true,
    type: MemberEventType.GuildMemberRemove,
    description: ""
};

const guildMemberUpdate: EventConfig = {
    name: "guildMemberUpdate",
    enabled: true,
    type: MemberEventType.GuildMemberUpdate,
    description: ""
};

const messageDelete: EventConfig = {
    name: "messageDelete",
    enabled: true,
    type: MessageEventType.MessageDelete,
    description: ""
};

const messageDeleteBulk: EventConfig = {
    name: "messageDeleteBulk",
    enabled: true,
    type: MessageEventType.MessageDeleteBulk,
    description: ""
};

const eventConfigs = {
    guildMemberAdd,
    guildMemberRemove,
    guildMemberUpdate,
    messageDelete,
    messageDeleteBulk
};

const welcome: CollectorConfig = {
    name: "welcome",
    enabled: true,
    type: "reaction",
    channel: {
        name: "welcome",
        categoryName: "General"
    },
    messageId: MessageIds.WelcomeCollector,
    description: ""
};

const collectorCofigs = { welcome };

export default {
    command: commandConfigs,
    monitor: monitorConfigs,
    event: eventConfigs,
    collector: collectorCofigs
};
