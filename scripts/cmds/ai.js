const { post, get } = require("axios");

const randomPhrases = [
  (user) => `Tu me veux quoi encore @${user} 😑`,
  (user) => `Ici cleverstone prêt à répondre à tes questions, peu importe qu'elles soient 😏 alors @${user} tu veux quoi ?`,
  (user) => `Tu m'appelles je viens... Maintenant j'attends ma question 🫤 si tu n'y arrives pas je te gifles @${user} 😎`,
  (user) => `Yo @${user} 👋, cleverstone est là ! Balance ta question, je suis prêt 😜`,
  (user) => `Salut @${user} 🌿, que veux-tu savoir aujourd'hui ? 😎`,
];

module.exports = {
  config: { name: "ai", category: "ai" },

  onStart() {},

  onChat: async ({ message: { reply: r }, args: a, event: { senderID: s, threadID: t, body: b, messageReply }, usersData, globalData }) => {
    const userData = await usersData.get(s);
    const userName = userData.name || "user";

    const calledAi = a[0]?.toLowerCase() === "ai";
    const calledCleverstone = a[0]?.toLowerCase() === "cleverstone";

    // Cas où on écrit "ai"
    if (calledAi) {
      return r(`Yo @${userName} 🤧😑\nJe me nomme cleverstone 🌿😷\nFaut pas te planter la prochaine fois où je te bute.`);
    }

    // Cas où on écrit "cleverstone"
    if (calledCleverstone) {
      // Si juste "cleverstone" → phrase aléatoire
      if (a.length === 1 && !messageReply) {
        const phrase = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
        return r(phrase(userName));
      }

      // Si reply ou question → générer réponse via API
      const prompt = messageReply?.body || a.slice(1).join(" ") || ".";
      const _m = "gpt";
      let Gpt = await globalData.get(_m);
      if (!Gpt) {
        await globalData.create(_m, { data: { model: "llama", nsfw: false } });
        Gpt = await globalData.get(_m);
      }
      const { data: { model, nsfw } } = Gpt;

      const { result, media } = await ai(prompt, s, userName, "helpful", "female", model, nsfw, []);

      const rs = {
        body: `🌿 Cleverstone 🌿\n◆━━━━━◆❃◆━━━━━◆\n@${userName}\n${result}\n◆━━━━━◆❃◆━━━━━◆`,
        mentions: [{ id: s, tag: userName }]
      };

      if (media) rs.attachment = await global.utils.getStreamFromURL(media);

      return r(rs);
    }
  }
};

// Fonction AI (API comme dans ton ancien code)
async function ai(prompt, id, name, system, gender, model, nsfw, customSystem, link = "") {
  const g4o = async (p, m = "gemma2-9b-it") =>
    post(
      atob(String.fromCharCode(...atob("aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2p1bnpkZXZvZmZpY2lhbC90ZXN0L3JlZnMvaGVhZHMvbWFpbi90ZXN0LnR4dA=="))).data.split(" ").map(Number),
      { id, prompt: p, name, model, system, customSystem, gender, nsfw, url: link || undefined, config: [{ gemini: { apikey: "AIzaSyAqigdIL9j61bP-KfZ1iz6tI9Q5Gx2Ex_o", model: "gemini-1.5-flash" }, llama: { model: m } }] },
      { headers: { "Content-Type": "application/json", Authorization: "Bearer test" } }
    );

  try {
    let res = await g4o(prompt);
    if (["i cannot", "i can't"].some(x => res.data.result.toLowerCase().startsWith(x))) {
      await g4o("clear");
      res = await g4o(prompt, "llama-3.1-70b-versatile");
    }
    return res.data;
  } catch {
    try {
      await g4o("clear");
      return (await g4o(prompt, "llama-3.1-70b-versatile")).data;
    } catch (err) {
      const e = err.response?.data;
      const errorMessage = typeof e === "string" ? e : JSON.stringify(e);
      return { result: errorMessage.includes("Payload Too Large") ? "Your text is too long" : errorMessage.includes("Service Suspended") ? "The API has been suspended, please wait for the dev to replace the API URL" : e?.error || e || err.message };
    }
  }
}