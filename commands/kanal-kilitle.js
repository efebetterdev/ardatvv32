const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "kilitle",
  description: "Kanalı mesaj gönderilmesine kapatır veya açar.",
  type: 1,
  options: [
    {
      name: "durum",
      description: "Kanalın durumunu belirleyin.",
      type: 3, 
      required: true,
      choices: [
        {
          name: "Açık",
          value: "acik",
        },
        {
          name: "Kapalı",
          value: "kapali",
        },
      ],
    },
  ],

  run: async (client, interaction) => {
    try {
      // Kullanıcının yetkisini kontrol et
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FF0000")
              .setTitle("<a:carpi:1227670096462221363>  | Hata")
              .setDescription("Kanalları yönet yetkin yok!"),
          ],
          ephemeral: true,
        });
      }

      const durum = interaction.options.getString("durum");
      const channel = interaction.channel;

      // Kanal izinlerini kontrol et ve güncelle
      if (durum === "kapali") {
        if (!channel.permissionsFor(interaction.guild.id).has(PermissionsBitField.Flags.SendMessages)) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("#FFD700")
                .setTitle("<:kilit:1372649443353952316> | Uyarı")
                .setDescription("Kanal zaten mesaj gönderimine kapalı!"),
            ],
            ephemeral: true,
          });
        }

        await channel.permissionOverwrites.edit(interaction.guild.id, {
          SendMessages: false,
        });

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#00FF00")
              .setTitle("<a:yeilonay:1221172106637611169>  | Başarılı")
              .setDescription("Kanal başarıyla mesaj gönderimine kapatıldı!"),
          ],
        });
      } else if (durum === "acik") {
        if (channel.permissionsFor(interaction.guild.id).has(PermissionsBitField.Flags.SendMessages)) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("#FFD700")
                .setTitle("🔓 | Uyarı")
                .setDescription("Kanal zaten mesaj gönderimine açık!"),
            ],
            ephemeral: true,
          });
        }

        await channel.permissionOverwrites.edit(interaction.guild.id, {
          SendMessages: true,
        });

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#00FF00")
              .setTitle("<a:yeilonay:1221172106637611169>  | Başarılı")
              .setDescription("Kanal başarıyla mesaj gönderimine açıldı!"),
          ],
        });
      } else {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FF0000")
              .setTitle("<a:carpi:1227670096462221363>  | Hata")
              .setDescription("Geçersiz bir durum belirttiniz!"),
          ],
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Kanal durumu değiştirirken bir hata oluştu:", error);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("<a:carpi:1227670096462221363>  | Hata")
            .setDescription("Bir hata oluştu, lütfen daha sonra tekrar deneyin."),
        ],
        ephemeral: true,
      });
    }
  },
};