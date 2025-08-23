const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");

module.exports = {
  name: "emojiler",
  description: "Sunucudaki tüm özel emojileri sayfa sayfa gösterir.",
  type: 1,

  run: async (client, interaction) => {
    const guild = interaction.guild;

    try {
      await interaction.deferReply();

      const emojiler = guild.emojis.cache;
      
      if (emojiler.size === 0) {
        return interaction.editReply({
          content: "Bu sunucuda hiç özel emoji bulunmamaktadır.",
          flags: MessageFlags.FLAGS.EPHEMERAL
        });
      }

      // Emojileri türlerine göre ayır
      const animasyonluEmojiler = emojiler.filter(emoji => emoji.animated);
      const normalEmojiler = emojiler.filter(emoji => !emoji.animated);

      // Sayfalara ayırma fonksiyonu
      const paginateEmojis = (emojiList, title, emojisPerPage = 20) => {
        const pages = [];
        const totalPages = Math.ceil(emojiList.size / emojisPerPage);
        
        let currentPage = 0;
        const emojiArray = [...emojiList.values()];
        
        while (currentPage < totalPages) {
          const start = currentPage * emojisPerPage;
          const end = start + emojisPerPage;
          const pageEmojis = emojiArray.slice(start, end);
          
          const embed = new EmbedBuilder()
            .setColor("#3498db")
            .setTitle(`${guild.name} Sunucusu - ${title}`)
            .setDescription(pageEmojis.map(emoji => `${emoji} \`${emoji.name}\``).join(" "))
            .setFooter({ 
              text: `Sayfa ${currentPage + 1}/${totalPages} • Toplam ${emojiList.size} emoji`,
              iconURL: guild.iconURL() 
            });
          
          pages.push(embed);
          currentPage++;
        }
        
        return pages;
      };

      // Tüm sayfaları oluştur
      const normalPages = paginateEmojis(normalEmojiler, "Statik Emojiler");
      const animasyonluPages = paginateEmojis(animasyonluEmojiler, "Animasyonlu Emojiler");
      const allPages = [...normalPages, ...animasyonluPages];
      
      // Eğer tek sayfa varsa direkt gönder
      if (allPages.length <= 1) {
        return interaction.editReply({ embeds: [allPages[0]] });
      }

      // Sayfa kontrol butonları
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("◀️ Önceki")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Sonraki ▶️")
          .setStyle(ButtonStyle.Primary)
      );

      let currentPage = 0;
      const message = await interaction.editReply({ 
        embeds: [allPages[currentPage]], 
        components: [buttons] 
      });

      // Buton etkileşimleri için collector
      const collector = message.createMessageComponentCollector({ 
        time: 300000 // 5 dakika sonra zaman aşımı
      });

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ 
            content: "Bu butonları sadece komutu kullanan kişi kullanabilir.",
            ephemeral: true 
          });
        }

        if (i.customId === "previous") {
          currentPage--;
        } else if (i.customId === "next") {
          currentPage++;
        }

        // Buton durumlarını güncelle
        buttons.components[0].setDisabled(currentPage === 0);
        buttons.components[1].setDisabled(currentPage === allPages.length - 1);

        await i.update({
          embeds: [allPages[currentPage]],
          components: [buttons]
        });
      });

      collector.on("end", () => {
        message.edit({ components: [] }).catch(console.error);
      });

    } catch (err) {
      console.error("Emojiler alınırken bir hata oluştu:", err);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: "<a:carpi:1227670096462221363>  | Emojiler alınırken bir hata oluştu.",
          flags: MessageFlags.FLAGS.EPHEMERAL
        }).catch(console.error);
      } else {
        await interaction.reply({
          content: "<a:carpi:1227670096462221363>  | Emojiler alınırken bir hata oluştu.",
          flags: MessageFlags.FLAGS.EPHEMERAL
        }).catch(console.error);
      }
    }
  },
};