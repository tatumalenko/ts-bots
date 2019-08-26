import Client from "../../lib/Client";

new Client({
    name: "professor-willow",
    runIn: ["test-zone"],
    appDirName: __dirname,
    discordOptions: {
        fetchAllMembers: true
    }
}).start();