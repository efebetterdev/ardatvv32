const { EmbedBuilder } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

module.exports = {
  name: "istatistik",
  description: "Botun gelişmiş istatistiklerini gösterir",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    const uptime = moment
      .duration(client.uptime)
      .format("D [gün], H [saat], m [dakika], s [saniye]");

    // Kullanıcı sayısını hesapla
    let totalUsers = 0;
    client.guilds.cache.forEach((guild) => {
      totalUsers += guild.memberCount || 0;
    });

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📊 Bot İstatistikleri")
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: "🕒 Çalışma Süresi",
          value: uptime,
          inline: true
        },
        {
          name: "💾 Bellek Kullanımı",
          value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
          inline: true
        },
        {
          name: "👥 Toplam Kullanıcı",
          value: totalUsers.toLocaleString(),
          inline: true
        },
        {
          name: "🌐 Sunucu Sayısı",
          value: client.guilds.cache.size.toLocaleString(),
          inline: true
        },
        {
          name: "📺 Kanal Sayısı",
          value: client.channels.cache.size.toLocaleString(),
          inline: true
        },
        {
          name: "📡 Ping",
          value: `${client.ws.ping} ms`,
          inline: true
        },
        {
          name: "⚙ Sistem Bilgileri",
          value: `**OS:** ${process.platform} ${process.arch}\n**Node.js:** ${process.version}\n**Discord.js:** v${require("discord.js").version}`,
          inline: false
        },
        {
          name: "👑 Bot Sahibi",
          value: "<@808741421229539348>",
          inline: false
        }
      )
      .setFooter({
        text: "✨ Hazırlayan: ardatvv 💙",
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
