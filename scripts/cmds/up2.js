const fs = require("fs");
const os = require("os");

module.exports = {
  config: {
    name: "up2",
    aliases: ["uptime", "up"],
    version: "2.2",
    author: "𝗥𝗨𝗗𝗘𝗨𝗦 𝗔𝗖𝗞𝗘𝗥𝗠𝗔𝗡",
    role: 0,
    shortDescription: {
      en: "Displays bot uptime, stats and system info in cool serif style."
    },
    longDescription: {
      en: "Shows uptime, user & group stats, commands usage, system info, all in fancy serif font with frames and emojis 🍭."
    },
    category: "system",
    guide: {
      en: "Use {p}up2 to see all bot stats in a stylish serif format."
    }
  },
  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const totalUsers = (await usersData.getAll()).length;
      const totalGroups = (await threadsData.getAll()).length;

      const cpuUsage = os.loadavg()[0] * 10;
      const totalMemory = (os.totalmem() / (1024 ** 3)).toFixed(2);
      const freeMemory = (os.freemem() / (1024 ** 3)).toFixed(2);
      const usedMemory = (totalMemory - freeMemory).toFixed(2);
      const status =
        cpuUsage > 90 || usedMemory / totalMemory > 0.9
          ? "🔴| 𝐅𝐚𝐢𝐛𝐥𝐞"
          : cpuUsage > 70 || usedMemory / totalMemory > 0.8
          ? "🟡| 𝐌𝐨𝐲𝐞𝐧"
          : "🟢| 𝐄𝐱𝐜𝐞𝐥𝐥𝐞𝐧𝐭";

      const message = `
🌿 𝐂𝐥𝐞𝐯𝐞𝐫𝐬𝐭𝐨𝐧𝐞 𝐀𝐈 🌿
◆━━━━━◆❃◆━━━━━◆

╭── 𝑼𝑷𝑻𝑰𝑴𝐸 𝑰𝑵𝐅𝑶 ──╮
│ 𝐁𝐨𝐭 : 𝐂𝐥𝐞𝐯𝐞𝐫𝐬𝐭𝐨𝐧𝐞 𝐀𝐈
│ 𝐎𝐰𝐧𝐞𝐫 : 𝗥𝗨𝗗𝗘𝗨𝗦 𝗔𝗖𝗞𝗘𝗥𝗠𝗔𝗡
│ 𝐏𝐫𝐞𝐟𝐢𝐱 : ~
╰────────────╯

╭── ⏳ 𝑻𝑬𝑴𝑷𝑺 𝑫𝐄 𝑺𝐄𝑹𝑽𝐈𝑪𝐄 ──╮
│ ${days} 𝑗𝑜𝑢𝑟𝑠, ${hours} 𝐡𝑒𝑢𝐫𝑒𝑠 🍭
│ ${minutes} 𝑚𝑖𝑛𝑢𝑡𝑒𝑠, ${seconds} 𝑠𝑒𝑐𝑜𝑛𝑑𝑒𝑠 🍭
╰────────────╯

╭── 🌍 𝑺𝑻𝑨𝑻𝑺 ──╮
│ 𝐔𝐬𝐞𝐫𝐬 : ${totalUsers} 🍭
│ 𝐆𝐫𝐨𝐮𝐩𝐬 : ${totalGroups} 🍭
│ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐔𝐬𝐞𝐝 : ${global.GoatBot.commands.size} 🍭
╰────────────╯

╭── 💻 𝑺𝒀𝑺𝑻𝑬𝑴 𝑰𝑵𝐅𝑶 ──╮
│ 𝐎𝐒 : ${os.type()} ${os.release()} 🍭
│ 𝐂𝐏𝐔 : ${cpuUsage.toFixed(2)} % 🍭
│ 𝐑𝐀𝐌 : ${usedMemory}/${totalMemory} 𝐆𝐁 🍭
│ 𝐒𝐭𝐚𝐭𝐮𝐬 : ${status} 🍭
╰────────────╯
`;

      api.sendMessage(message, event.threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ 𝐄𝐫𝐫𝐞𝐮𝐫 𝐚𝐮 𝐜𝐡𝐚𝐫𝐠𝐞𝐦𝐞𝐧𝐭 𝐝𝐞𝐬 𝐢𝐧𝐟𝐨𝐬.", event.threadID);
    }
  }
};