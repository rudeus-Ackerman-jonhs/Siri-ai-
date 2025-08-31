const { getTime, drive } = global.utils;

module.exports = {
    config: {
        name: "leave",
        version: "1.5",
        author: "NTKhang",
        category: "events"
    },

    langs: {
        en: {
            leaveVoluntary: "départ volontaire",
            leaveKicked: "kick",
            defaultLeaveMessage: "{userName} a quitté le groupe..."
        }
    },

    onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
        if (event.logMessageType !== "log:unsubscribe") return;

        const { threadID } = event;
        const threadData = await threadsData.get(threadID);
        if (!threadData.settings.sendLeaveMessage) return;

        const { leftParticipantFbId } = event.logMessageData;
        if (leftParticipantFbId == api.getCurrentUserID()) return;

        const hours = getTime("HH");
        const threadName = threadData.threadName;
        const userName = await usersData.getName(leftParticipantFbId);

        let adminName = null;
        if (event.logMessageData.kickerId) {
            adminName = await usersData.getName(event.logMessageData.kickerId);
        }

        let leaveType = leftParticipantFbId == event.author ? getLang("leaveVoluntary") : getLang("leaveKicked");

        // Création du message “avis de décès”
        let leaveMessage = `
╭────────────────────────────╮
│ ${leaveType === getLang("leaveKicked") ? "⚰️ Avis de mise à l’écart ⚰️" : "🕯️ Avis de départ 🕯️"}
│ Nom : ${userName}
│ Groupe : ${threadName}
│ Heure : ${hours}h
│
│ ✨ Type : ${leaveType}
${adminName ? `│ 👑 Admin : ${adminName}` : ""}
│ 💬 Message : ${leaveType === getLang("leaveKicked") 
    ? `${userName} a été écarté par ${adminName || "un admin mystérieux"}`
    : `${userName} a décidé de quitter ce monde de chaos`}
│ 🥲 Repose en paix dans le chat silencieux...
╰────────────────────────────╯`;

        // Prépare les mentions si nécessaire
        const form = { body: leaveMessage };
        if (leaveMessage.includes(userName)) {
            form.mentions = [{ id: leftParticipantFbId, tag: userName }];
        }

        if (threadData.data.leaveAttachment) {
            const files = threadData.data.leaveAttachment;
            const attachments = files.map(file => drive.getFile(file, "stream"));
            form.attachment = (await Promise.allSettled(attachments))
                .filter(({ status }) => status === "fulfilled")
                .map(({ value }) => value);
        }

        message.send(form);
    }
};