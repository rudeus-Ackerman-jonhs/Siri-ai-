const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

// Message quand le bot arrive
const botJoinMessage = (prefix) => `
╭──────────────╮
🍁 Salut ! Je me nomme cleverstone ackerman ai
🤖 Je suis là pour vous assister
📜 Pour voir ma liste de cmd : ${prefix}help
😎 Amusez-vous bien !
╰──────────────╯
`;

// Message quand un utilisateur arrive
const userJoinMessage = (userNames, threadName, session, multiple = false) => `
╭──────────────╮
👋 Bonjour ${userNames.join(", ")} !
🎉 Bienvenue ${multiple ? "à tous" : "à toi"} dans ${threadName}
⏰ Bon ${session} !
╰──────────────╯
`;

module.exports = {
    config: {
        name: "welcome",
        version: "1.8",
        author: "NTKhang",
        category: "events"
    },

    langs: {
        en: {
            session1: "morning",
            session2: "noon",
            session3: "afternoon",
            session4: "evening"
        }
    },

    onStart: async ({ threadsData, message, event, api, getLang }) => {
        const hours = getTime("HH");
        const session = hours <= 10 ? getLang("session1") :
                        hours <= 12 ? getLang("session2") :
                        hours <= 18 ? getLang("session3") : getLang("session4");

        if (event.logMessageType === "log:subscribe") {
            const threadID = event.threadID;
            const prefix = global.utils.getPrefix(threadID);
            const addedParticipants = event.logMessageData.addedParticipants;

            // Si le bot arrive
            if (addedParticipants.some(p => p.userFbId === api.getCurrentUserID())) {
                return message.send(botJoinMessage(prefix));
            }

            // Si un ou plusieurs utilisateurs arrivent
            if (!global.temp.welcomeEvent[threadID]) {
                global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };
            }

            global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...addedParticipants);
            clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

            global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
                const threadData = await threadsData.get(threadID);
                if (threadData.settings.sendWelcomeMessage === false) return;

                const dataAdded = global.temp.welcomeEvent[threadID].dataAddedParticipants;
                const threadName = threadData.threadName;
                const userNames = dataAdded.map(u => u.fullName);
                if (userNames.length === 0) return;

                const form = { body: userJoinMessage(userNames, threadName, session, userNames.length > 1) };
                message.send(form);

                delete global.temp.welcomeEvent[threadID];
            }, 1500);
        }
    }
};