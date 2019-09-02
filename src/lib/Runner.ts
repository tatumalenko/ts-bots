import Helper from "../util/Helper";
import Logger from "../util/Logger";
import Utils from "../util/Utils";
import Client from "./Client";

interface Runner {
    name: string;
    enabled: boolean;
    description: string;
    client: Client;
    utils: Utils;
    log: Logger;
    helper: Helper;
}

export default Runner;
