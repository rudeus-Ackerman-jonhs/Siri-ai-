const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;

module.exports = {
    config: {
        name: "help",
        version: "2.0",
        author: "RUDEUS ACKERMAN",
        role: 0,
        description: { en: "Voir l'utilisation des commandes" },
        category: "info",
        priority: 1
    },

    langs: {
        en: {
            helpHeader: "🌿 Cleverstone AI 🌿",
            helpFooter: (count, author) => `━━━━━━━━━━━━\nLe bot détient actuellement ${count} commandes\nCréateur : ${author}`,
            categoryFrame: (title, commands) => `╭── ${title} ──╮\n│ ${commands.join(" 🌿\n│ ")} 🌿\n╰────────╯`,
            commandNotFound: "La commande \"%1\" n'existe pas",
            commandDetailsHeader: "╭── 🍁DÉTAILS COMMANDE🍁 ──╮",
            commandDetailsFooter: "╰────────────────────────╯"
        }
    },

    onStart: async ({ message, args, event, threadsData, commands, aliases }) => {
        const threadID = event.threadID;
        const prefix = getPrefix(threadID);

        // Si aucune commande spécifique n'est demandée, liste toutes les commandes
        if (!args[0]) {
            const allCommands = [...commands.values()].filter(cmd => cmd.config.role <= (event.role || 0));
            const categories = {};

            for (const cmd of allCommands) {
                const cat = (cmd.config.category || "utility").toUpperCase();
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(cmd.config.name);
            }

            const orderedCategories = ["AI", "FUN", "ADMIN", "UTILITY", "MEDIA", "SYSTEM"];
            let helpMessage = [];

            helpMessage.push(module.exports.langs.en.helpHeader);

            for (const cat of orderedCategories) {
                if (categories[cat]) {
                    helpMessage.push(module.exports.langs.en.categoryFrame(cat, categories[cat]));
                }
            }

            // Ajouter toutes les autres catégories non listées
            for (const cat in categories) {
                if (!orderedCategories.includes(cat)) {
                    helpMessage.push(module.exports.langs.en.categoryFrame(cat, categories[cat]));
                }
            }

            helpMessage.push(module.exports.langs.en.helpFooter(allCommands.length, "RUDEUS ACKERMAN"));

            return message.reply(helpMessage.join("\n"));
        }

        // Sinon, afficher les détails d'une commande spécifique
        const cmdName = args[0].toLowerCase();
        let command = commands.get(cmdName) || commands.get(aliases.get(cmdName));

        if (!command) return message.reply(module.exports.langs.en.commandNotFound.replace("%1", cmdName));

        const config = command.config;
        const detailLines = [
            module.exports.langs.en.commandDetailsHeader,
            `│ Nom : ${config.name} 🌿`,
            `│ Description : ${config.description?.en || "Aucune"} 🌿`,
            `│ Alias : ${config.aliases ? config.aliases.join(", ") : "Aucun"} 🌿`,
            `│ Version : ${config.version || "1.0"} 🌿`,
            `│ Rôle : ${config.role || 0} 🌿`,
            `│ Auteur : ${config.author || "Inconnu"} 🌿`,
            `│ Utilisation : ${prefix}${config.name} <args> 🌿`,
            module.exports.langs.en.commandDetailsFooter
        ];

        return message.reply(detailLines.join("\n"));
    }
};