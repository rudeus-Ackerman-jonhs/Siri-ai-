const { post, get } = require("axios");

module.exports = {
  config: { 
    name: "ai", 
    category: "ai" 
  },

  onStart() {},  

  onChat: async ({ 
    message: { reply: r }, 
    args: a, 
    event: { senderID: s, threadID: t, body: b, messageReply: msg }, 
    commandName, 
    usersData, 
    globalData, 
    role 
  }) => {
    const pref = global.utils.getPrefix(t);
    const user = await usersData.get(s) || {};
    const userName = user.name || "user";
    
    // Si l'utilisateur écrit juste "ai"
    if (/^ai$/i.test(b.trim())) {
      return r({
        body: `
🌿 Cleverstone 🌿
◆━━━━━◆❃◆━━━━━◆
Yo 🌿@${userName}🌿, je m'appelle pas Ai 🤧😑
Je me nomme cleverstone 🌿😷
Faut pas te planter la prochaine fois où je te butes 😎
◆━━━━━◆❃◆━━━━━◆
`,
        mentions: [{ id: s, tag: userName }]
      });
    }

    // Détecter si le message mentionne "cleverstone"
    const isCleverstone = b.toLowerCase().includes("cleverstone");

    // Préparer prompt pour l'API
    let prompt = a.join(" ") || b;

    // Gestion des questions "interdites"
    const forbidden = ["xxx", "nsfw", "politique", "violence"];
    const isForbidden = forbidden.some(word => prompt.toLowerCase().includes(word));
    if (isForbidden) {
      prompt = `Réponds de manière simple, drôle et amicale à cette question, sans entrer dans les détails interdits : "${prompt}"`;
    }

    // Récupération du contexte utilisateur et paramètres AI
    let Gpt = await globalData.get("gpt") || { data: { model: "llama", nsfw: false } };
    const model = Gpt.data.model;
    const nsfw = Gpt.data.nsfw;

    // Gestion des attachments si reply
    let url = null;
    if (msg && ["photo", "sticker", "audio"].includes(msg.attachments?.[0]?.type)) {
      const att = msg.attachments[0];
      url = { link: att.url, type: att.type === "photo" || att.type === "sticker" ? "image" : "mp3" };
      if (url) prompt = ".";
    }

    // Appel à l'API AI
    const { result, media } = await ai(prompt, s, userName, user.settings?.system || "helpful", user.gender === 2 ? "male" : "female", model, nsfw, user.settings?.own || {}, url);

    // Préparer le message stylisé
    const replyMessage = {
      body: `
🌿 Cleverstone 🌿
◆━━━━━◆❃◆━━━━━◆
Salut 🌿@${userName}🌿
${result}
◆━━━━━◆❃◆━━━━━◆
`,
      mentions: [{ id: s, tag: userName }]
    };

    // Ajouter media si présent
    if (media) {
      replyMessage.attachment = await global.utils.getStreamFromURL(media, media.endsWith(".mp3") ? "spotify.mp3" : undefined);
    }

    const { messageID } = await r(replyMessage);
    global.GoatBot.onReply.set(messageID, { commandName, s, model, nsfw, system: user.settings?.system || "helpful" });
  },

  onReply: async ({ Reply, message, args, event, usersData }) => {
    const { s, commandName, model, nsfw, system } = Reply;
    const { senderID: x, body: b, attachments, threadID: t } = event;

    if (s !== x || !b || b.toLowerCase().startsWith(commandName)) return;

    let user = await usersData.get(x);
    const userName = user.name || "user";

    let prompt = args.join(" ") || b;
    let url = null;
    if (attachments?.[0]) {
      const att = attachments[0];
      url = { link: att.url, type: att.type === "photo" || att.type === "sticker" ? "image" : "mp3" };
      if (url) prompt = ".";
    }

    const { result, media } = await ai(prompt, x, userName, system, user.gender === 2 ? "male" : "female", model, nsfw, user.settings?.own || {}, url);

    const replyMessage = {
      body: `
🌿 Cleverstone 🌿
◆━━━━━◆❃◆━━━━━◆
Salut 🌿@${userName}🌿
${result}
◆━━━━━◆❃◆━━━━━◆
`,
      mentions: [{ id: x, tag: userName }]
    };

    if (media) {
      replyMessage.attachment = await global.utils.getStreamFromURL(media, media.endsWith(".mp3") ? "spotify.mp3" : undefined);
    }

    const { messageID } = await message.reply(replyMessage);
    global.GoatBot.onReply.set(messageID, { commandName, s: x, model, nsfw, system });
  }
};