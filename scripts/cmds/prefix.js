const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "prefix",
        version: "1.5",
        author: "NTKhang",
        role: 0,
        shortDescription: "Change or view the bot prefix",
        category: "config",
        guide: {
            en: "Use {pn} <newPrefix> to set new prefix for this group\nUse {pn} <newPrefix> -g to set global prefix\nUse {pn} to view current prefix"
        }
    },

    onStart: async function({ message, event, args, threadsData, getLang }) {
        const threadID = event.threadID;
        const currentPrefix = await threadsData.get(threadID, "data.prefix") || global.GoatBot.config.prefix;

        // Affichage du prefix si aucun argument
        if (!args[0]) {
            const prefixMessage = `
🌿 𝑪𝑳𝑬𝑽𝑬𝑹𝑺𝑻𝑶𝑵𝐸 𝐀𝐈 🌿
╭── 𝗣𝗥𝗘𝗙𝗜𝗫 𝗜𝗡𝗙𝗢 ──╮
│ Bot : Cleverstone AI
│ Prefix système : ⇛ ${global.GoatBot.config.prefix}
│ Prefix de ce groupe : ⇛ ${currentPrefix}
╰────────────╯

╭── 𝗔𝗦𝗦𝗜𝗦𝗧𝗔𝗡𝗖𝗘 ──╮
│ Tape ${currentPrefix}help pour voir toutes
│ les commandes disponibles
╰────────────╯
`;
            const imagePath = './path/to/photo.jpg'; // à remplacer par ton image
            return message.reply({ body: prefixMessage, attachment: fs.createReadStream(imagePath) });
        }

        // Réinitialisation du prefix local
        if (args[0] === "reset") {
            await threadsData.set(threadID, null, "data.prefix");
            return message.reply(`✅ Prefix du groupe remis à ${global.GoatBot.config.prefix}`);
        }

        const newPrefix = args[0];
        const setGlobal = args[1] === "-g";

        if (setGlobal && event.role < 2) {
            return message.reply("❌ Seul l'admin du bot peut changer le prefix global");
        }

        const confirmMsg = setGlobal ?
            "Réagissez à ce message pour confirmer le changement du prefix global" :
            "Réagissez à ce message pour confirmer le changement du prefix de ce groupe";

        message.reply(confirmMsg, (err, info) => {
            // Stocke les infos pour onReaction
            global.GoatBot.onReaction.set(info.messageID, {
                author: event.senderID,
                newPrefix,
                setGlobal
            });
        });
    },

    onReaction: async function({ event, message, Reaction, threadsData }) {
        const { author, newPrefix, setGlobal } = Reaction;
        if (event.userID !== author) return;

        if (setGlobal) {
            global.GoatBot.config.prefix = newPrefix;
            fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
            return message.reply(`✅ Prefix global changé en: ${newPrefix}`);
        } else {
            await threadsData.set(event.threadID, newPrefix, "data.prefix");
            return message.reply(`✅ Prefix du groupe changé en: ${newPrefix}`);
        }
    }
};