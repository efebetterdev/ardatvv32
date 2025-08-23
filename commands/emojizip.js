const { Client, PermissionsBitField, EmbedBuilder } = require("discord.js");
const AdmZip = require("adm-zip");
const axios = require("axios");
const fs = require("fs").promises;

module.exports = {
  name: "emoji-zip",
  description: "Sunucudaki tüm emojileri ZIP dosyası olarak kanala gönderir.",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    // Sunucu sahibi veya yönetici izni kontrolü
    const hasPermission = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || 
                         interaction.user.id === interaction.guild.ownerId;

    if (!hasPermission) {
      return interaction.reply({
        content: "Bu komutu kullanmak için sunucu sahibi veya yönetici olmalısınız!",
        ephemeral: true,
      });
    }

    // Botun emoji görme izni kontrolü
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ViewGuildInsights)) {
      return interaction.reply({
        content: "Botun 'Sunucu Emojilerini Görüntüleme' iznine ihtiyacı var!",
        ephemeral: true,
      });
    }

    await interaction.deferReply(); // İşlem uzun sürebilir

    try {
      const zip = new AdmZip();
      const emojis = interaction.guild.emojis.cache;

      if (emojis.size === 0) {
        return interaction.editReply({
          content: "Bu sunucuda emoji bulunmuyor!",
        });
      }

      // Geçici klasör oluştur
      const tempDir = `./temp_emojis_${interaction.guild.id}`;
      await fs.mkdir(tempDir, { recursive: true });

      // Emojileri indir ve ZIP'e ekle
      for (const emoji of emojis.values()) {
        const emojiUrl = emoji.url;
        const extension = emoji.animated ? ".gif" : ".png";
        const fileName = `${emoji.name}_${emoji.id}${extension}`;
        const filePath = `${tempDir}/${fileName}`;

        // Emojiyi indir
        const response = await axios({
          url: emojiUrl,
          method: "GET",
          responseType: "arraybuffer",
        });

        // Dosyaya kaydet
        await fs.writeFile(filePath, response.data);

        // ZIP'e ekle
        zip.addLocalFile(filePath);
      }

      // ZIP dosyasını oluştur
      const zipFileName = `emojis_${interaction.guild.id}.zip`;
      zip.writeZip(zipFileName);

      // Embed oluştur
      const embed = new EmbedBuilder()
        .setColor("#7289DA")
        .setTitle("Sunucu Emojileri")
        .setDescription(`${emojis.size} emoji ZIP dosyasına sıkıştırıldı!`);

      // ZIP dosyasını kanala gönder
      await interaction.editReply({
        embeds: [embed],
        files: [zipFileName],
      });

      // Temizleme
      await fs.rm(tempDir, { recursive: true, force: true });
      await fs.unlink(zipFileName);

    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "Emojileri indirirken hata oluştu. Tekrar deneyin.",
      });
    }
  },
};