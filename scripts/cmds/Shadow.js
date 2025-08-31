const { getStreamFromURL, getPrefix } = global.utils;

module.exports = {
  config: {
    name: "shadow",
    category: "ai",
    version: "1.0",
    author: "NTKhang",
  },

  onStart: async ({ message, event, usersData, globalData }) => {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const { body, messageReply, attachments } = event;

    const prefix = getPrefix(threadID);
    const nameData = await usersData.get(senderID);
    const userName = nameData?.name || "Utilisateur";
    const gender = nameData?.gender === 2 ? "male" : "female";

    let prompt = body;

    // Si c'est un reply, on récupère le message original
    if (messageReply?.body) {
      prompt = messageReply.body;
    }

    // Prompt personnalisé pour Shadow
    const shadowSystem = `
Tu es Shadow, une fille de 17 ans, coquine et taquine, toujours 🍭 à la fin de ses phrases.
Quand l'utilisateur pose une question ou envoie un message, détecte son émotion.
- Si il/elle est en colère ou stressé(e), répond calmement mais avec humour et un peu de taquinerie 🍭.
- Si il/elle est triste, mets des phrases mignonnes et rassurantes 🍭.
- Si il/elle est joyeux(se), répond de façon taquine mais sympathique 🍭.
- Si c'est une question banale, répond de façon coquine et amusante 🍭.
Toujours mentionne l'utilisateur ${userName} dans ta réponse et personnalise ton texte pour le satisfaire et l'amuser 🍭.
`;

    // URL si media attaché
    let url = null;
    const attachment = attachments?.[0];
    if (attachment) {
      if (["photo", "sticker"].includes(attachment.type)) {
        url = { link: attachment.url, type: "image" };
      } else if (attachment.type === "audio") {
        url = { link: attachment.url, type: "mp3" };
      }
    }

    // Appel à l'API de la commande AI
    const { result, media } = await ai(
      prompt,
      senderID,
      userName,
      "helpful",
      gender,
      (await globalData.get("gpt"))?.data?.model || "llama",
      false,
      [{ default: shadowSystem }],
      url
    );

    const response = {
      body: `🌸 Shadow 🌸\n〜〜〜〜〜〜〜〜〜〜\n@${userName} ${result}\n〜〜〜〜〜〜〜〜〜〜`,
      mentions: [{ id: senderID, tag: userName }]
    };

    if (media) {
      response.attachment = await getStreamFromURL(media);
    }

    return message.send(response);
  }
};