const {
    EmbedBuilder,
    ApplicationCommandType,
    PermissionsBitField
  } = require("discord.js");
  const db = require("croxydb");
  const config = require("../config.json");
  
  module.exports = {
    name: "destek-sıfırla",
    description: "Destek sistemini sıfırlar ve tüm verileri temizler.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 10,
  
    run: async (client, interaction) => {
      try {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          return await interaction.reply({
            content: "❌ | Bu komutu kullanmak için `Yönetici` yetkisine sahip olmalısınız!",
            ephemeral: true,
          });
        }
  
        // Önce yanıt verelim ki interaction zaman aşımına uğramasın
        await interaction.deferReply({ ephemeral: true });
  
        const allData = db.all();
        let deletedChannels = 0;
        let deletedTickets = 0;
        let errors = 0;
  
        // Tüm destek kanallarını işle
        for (const key in allData) {
          if (key.startsWith(`destek_kanal_${interaction.guild.id}_`)) {
            const ticketData = db.get(key);
            try {
              const channel = interaction.guild.channels.cache.get(ticketData.kanalId);
              if (channel) {
                try {
                  await channel.delete();
                  deletedChannels++;
                } catch (deleteError) {
                  console.error(`Kanal silinirken hata (${ticketData.kanalId}):`, deleteError);
                  errors++;
                }
              }
              db.delete(key);
              deletedTickets++;
            } catch (error) {
              console.error(`Kanal işlenirken hata (${key}):`, error);
              errors++;
            }
          }
        }
  
        // Ana destek sistemini sil
        db.delete(`destek_sistemi_${interaction.guild.id}`);
  
        // Cooldown verilerini temizle
        for (const key in allData) {
          if (key.startsWith(`destek_cooldown_${interaction.guild.id}_`)) {
            db.delete(key);
          }
        }
  
        const embed = new EmbedBuilder()
          .setTitle("✅ Destek Sistemi Sıfırlandı")
          .setDescription(`Destek sistemi başarıyla sıfırlandı.`)
          .addFields([
            { name: "Silinen Destek Kanalları", value: `${deletedChannels}`, inline: true },
            { name: "Silinen Destek Talepleri", value: `${deletedTickets}`, inline: true },
            { name: "Hatalar", value: `${errors}`, inline: true },
          ])
          .setColor("#00ff00")
          .setFooter({ text: config.footer || "Destek sistemi artık tamamen kaldırıldı." })
          .setTimestamp();
  
        await interaction.editReply({ embeds: [embed] });
      } catch (mainError) {
        console.error("Destek sıfırlama sırasında ana hata:", mainError);
        if (!interaction.replied) {
          await interaction.editReply({
            content: "❌ | Sistem sıfırlanırken bir hata oluştu. Lütfen konsolu kontrol edin.",
          });
        }
      }
    },
  };