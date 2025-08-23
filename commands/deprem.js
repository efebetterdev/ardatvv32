const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const axios = require("axios");
const db = require("croxydb");

module.exports = {
  name: "deprem",
  description: "Son depremler hakkında bilgi alırsınız veya deprem bildirim kanalını ayarlarsınız.",
  type: 1,
  options: [
    {
      name: "kanal-ayarla",
      description: "Deprem bildirimlerinin gönderileceği kanalı ayarlar.",
      type: 7, // CHANNEL
      required: false,
    }
  ],
  run: async (client, interaction) => {
    try {
      const kanal = interaction.options.getChannel("kanal-ayarla");

      if (kanal) {
        db.set(`depremKanal_${interaction.guild.id}`, kanal.id);
        return interaction.reply(`✅ | Deprem bildirim kanalı <#${kanal.id}> olarak ayarlandı.`);
      }

      await interaction.deferReply();
      const response = await axios.get("https://rudsdev.xyz/api/deprem");
      const earthquakes = response.data;

      if (!earthquakes || earthquakes.length === 0) {
        return interaction.editReply("<a:carpi:1227670096462221363>  | Son depremler hakkında bilgi bulunamadı.");
      }

      const displayCount = 10;
      let currentPage = 0;
      const totalPages = Math.ceil(earthquakes.length / displayCount);

      const createEmbed = (page) => {
        const start = page * displayCount;
        const end = start + displayCount;
        const earthquakesPage = earthquakes.slice(start, end);

        const embedDescription = earthquakesPage
          .map((eq, index) =>
            `#${start + index + 1} - **Yer:** ${eq.yer || 'Bilinmiyor'}
📍 **Büyüklük:** ${eq.buyukluk}
⛏️ **Derinlik:** ${eq.derinlik} km
⏰ **Zaman:** ${eq.tarih} - ${eq.saat}`
          )
          .join("\n\n");

        return new EmbedBuilder()
          .setColor("#e74c3c")
          .setTitle("Son Depremler")
          .setDescription(embedDescription)
          .setFooter({ text: `Sayfa ${page + 1} / ${totalPages}` });
      };

      const embed = createEmbed(currentPage);
      const message = await interaction.editReply({ embeds: [embed], fetchReply: true });

      if (totalPages > 1) {
        await message.react("⬅️");
        await message.react("➡️");

        const filter = (reaction, user) =>
          ["⬅️", "➡️"].includes(reaction.emoji.name) && !user.bot;

        const collector = message.createReactionCollector({ filter, time: 60000 });

        collector.on("collect", async (reaction, user) => {
          if (reaction.emoji.name === "⬅️" && currentPage > 0) currentPage--;
          if (reaction.emoji.name === "➡️" && currentPage < totalPages - 1) currentPage++;

          const newEmbed = createEmbed(currentPage);
          await message.edit({ embeds: [newEmbed] });

          if (
            message.guild &&
            message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)
          ) {
            await reaction.users.remove(user.id).catch(() => {});
          }
        });

        collector.on("end", () => {
          if (
            message.guild &&
            message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)
          ) {
            message.reactions.removeAll().catch(() => {});
          }
        });
      }
    } catch (error) {
      console.error("Deprem verisi çekilirken hata oluştu:", error);
      return interaction.editReply("<a:carpi:1227670096462221363>  | Deprem bilgileri alınırken bir hata oluştu.");
    }
  },
};
