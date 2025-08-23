const {
    Client,
    EmbedBuilder,
    PermissionsBitField
  } = require("discord.js");
  
  module.exports = {
    name: "sil",
    description: "Sohbetten belirttiğin kadar mesajı silersin (1-100)!",
    type: 1,
    options: [
      {
        name: "sayı",
        description: "Silinecek mesaj miktarı (en fazla 100)",
        type: 3,
        required: true,
      },
    ],
  
    run: async (client, interaction) => {
      const user = interaction.user;
      const guild = interaction.guild;
      const channel = interaction.channel;
  
      // Yetki kontrolü
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#e74c3c")
              .setTitle("🚫 Yetkin Yok!")
              .setDescription("Bu komutu kullanmak için `Mesajları Yönet` yetkisine sahip olmalısın.")
              .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
          ],
          ephemeral: true,
        });
      }
  
      const input = interaction.options.getString("sayı");
      const amount = parseInt(input);
  
      // Sayı geçerlilik kontrolü
      if (isNaN(amount) || amount < 1 || amount > 100) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#f1c40f")
              .setTitle("⚠️ Geçersiz Girdi")
              .setDescription("Lütfen **1 ile 100** arasında bir sayı girin.")
          ],
          ephemeral: true,
        });
      }
  
      // Silme işlemi
      try {
        await channel.bulkDelete(amount, true);
  
        const embed = new EmbedBuilder()
          .setColor("#2ecc71")
          .setTitle("🧹 Mesajlar Temizlendi!")
          .setDescription(`**${amount}** adet mesaj başarıyla silindi.`)
          .addFields(
            { name: "👤 İşlem Yapan", value: `${user.tag}`, inline: true },
            { name: "📍 Kanal", value: `<#${channel.id}>`, inline: true },
          )
          .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
          .setTimestamp();
  
        // Tepki embed mesajı
        const confirmation = await interaction.reply({
          embeds: [embed],
          ephemeral: false
        });
  
        // Embed 5 saniye sonra silinsin
        setTimeout(() => {
          interaction.deleteReply().catch(() => {});
        }, 5000);
  
      } catch (err) {
        console.error("Silme hatası:", err);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setTitle("❌ Hata Oluştu!")
              .setDescription("Mesajlar silinirken bir hata meydana geldi.")
              .addFields({ name: "Hata", value: `\`\`\`${err.message}\`\`\`` })
          ],
          ephemeral: true,
        });
      }
    }
  };
  