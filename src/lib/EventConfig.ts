import { MemberEventType, MessageEventType } from "./Client";

interface EventConfig {
    name: string,
    enabled: boolean,
    type: keyof typeof MemberEventType | keyof typeof MessageEventType,
    description: string
}

export default EventConfig;
