import { MemberEventType, MessageEventType } from "./Client";

interface EventConfig {
    name: string,
    enabled: boolean,
    type: MemberEventType | MessageEventType,
    description: string
}

export default EventConfig;
