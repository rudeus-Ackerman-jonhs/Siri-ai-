const fs = require("fs-extra");

module.exports = {
  config: {
    name: "restart",
    version: "1.1",
    author: "NTKhang",
    countDown: 5,
    role: 2,
    description: {
      vi: "Khởi động lại bot",
      en: "Restart bot"
    },
    category: "Owner",
    guide: {
      vi: "   {pn}: Khởi động lại bot",
      en: "   {pn}: Restart bot"
    }
  },

  langs: {
    vi: {
      restarting: "🔄 | Đang khởi động lại bot..."
    },
    en: {
      restarting: "🔄 | Restarting bot..."
    }
  },

  onLoad: function ({ api }) {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    if (fs.existsSync(pathFile)) {
      const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
      api.sendMessage(`✅ | Bot restarted\n⏰ | Time taken: ${(Date.now() - time) / 1000}s`, tid);
      fs.unlinkSync(pathFile);
    }
  },

  onStart: async function ({ message, event, usersData, threadsData, getPrefix }) {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);

    // Récupération des stats
    const uptimeSec = process.uptime();
    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = Math.floor(uptimeSec % 60);

    const totalUsers = (await usersData.getAll()).length;
    const totalGroups = (await threadsData.getAll()).length;
    const statsFile = "./stats.json";
    let totalCommands = 0;
    if (fs.existsSync(statsFile)) {
      const stats = JSON.parse(fs.readFileSync(statsFile, "utf-8"));
      totalCommands = stats.totalCommands || 0;
    }

    const restartMessage = `
🌿 Cleverstone AI 🌿
◆━━━━━◆❃◆━━━━━◆

╭── RESTART BOT ──╮
│ ➤ Uptime avant restart : 
│    • Jours    : ${days} 🍭
│    • Heures   : ${hours} 🍭
│    • Minutes  : ${minutes} 🍭
│    • Secondes : ${seconds} 🍭
│ ➤ Users          : ${totalUsers} 🍭
│ ➤ Groups         : ${totalGroups} 🍭
│ ➤ Commands Used  : ${totalCommands} 🍭
╰────────────╯
`;

    await message.reply(restartMessage);

    // Petit délai pour que le message soit envoyé avant le restart
    setTimeout(() => process.exit(2), 2000);
  }
};