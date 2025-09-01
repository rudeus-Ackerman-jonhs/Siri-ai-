const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "sendnoti",
    version: "2.2",
    author: "NTKhang",
    role: 0,
    description: { en: "Send notification to groups with reply-to-admin feature" },
    category: "box chat",
    guide: { en: "{p}sendnoti <groupName> | <message>" }
  },

  onStart: async function({ message, event, args, usersData, api }) {
    const { threadID, senderID, senderName, messageReply, attachments } = event;
    if (!args.length) return message.reply("Veuillez entrer le nom du groupe et le message.");

    const [groupNameRaw, ...msgParts] = args.join(" ").split("|");
    const groupName = groupNameRaw.trim();
    const msgContent = msgParts.join("|").trim();
    if (!msgContent) return message.reply("Veuillez entrer le message à envoyer.");

    const groupsSendNoti = await usersData.get(senderID, "data.groupsSendNoti", []);
    const group = groupsSendNoti.find(g => g.groupName === groupName);
    if (!group) return message.reply(`Le groupNoti "${groupName}" n'existe pas.`);
    if (!group.threadIDs.length) return message.reply(`Le group "${groupName}" est vide.`);

    // Message stylé
    const styledMessage =
`🌱𝑵𝑶𝑻𝑰𝑭𝑰𝑪𝑨𝑻𝑰𝑶𝑵🌱
╭────━🌿━────╮
Message venant de ${senderName}
╰─────▽△▽──—──╯
${msgContent}
—————×∆×—————
Réponds à ce message pour répondre à ${senderName} 🤲`;

    const streamAttachments = attachments.length || (messageReply?.attachments || []).length
      ? await getStreamsFromAttachment([...attachments, ...(messageReply?.attachments || [])].filter(a =>
          ["photo", "video", "audio", "animated_image"].includes(a.type)
        ))
      : null;

    for (const tid of group.threadIDs) {
      api.sendMessage({
        body: styledMessage,
        attachment: streamAttachments
      }, tid, (err, info) => {
        if (!err && info) {
          // Stocker messageID pour reply automatique
          usersData.set(senderID, {
            lastNotiMessageID: info.messageID,
            lastNotiGroupThreads: group.threadIDs
          }, 'data');
        }
      });
    }

    message.reply(`✅ Notification envoyée à ${group.threadIDs.length} groupes !`);
  },

  // Gestion automatique des replies
  onReply: async function({ event, api, usersData }) {
    const { messageReply, body, senderID } = event;
    if (!messageReply || !body) return;

    const allUsers = await usersData.getAll();
    for (const admin of allUsers) {
      const lastMsgID = admin.data.lastNotiMessageID;
      if (messageReply.messageID === lastMsgID) {
        // Renvoyer la réponse au créateur/admin
        api.sendMessage(`📨 Réponse d'un membre du group:\n${body}`, admin.userID);
        break;
      }
    }
  }
};