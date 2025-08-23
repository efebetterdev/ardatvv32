const { Client, EmbedBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'emojiekle',
  description: 'Bir emoji veya resmi (statik veya GIF) sunucuya ekler.',
  type: 1,
  options: [
    {
      name: 'isim',
      description: 'Yeni emojinin ismi.',
      type: 3,
      required: true,
    },
    {
      name: 'emoji',
      description: 'Eklenecek emoji (URL veya emoji kodu).',
      type: 3,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    // Kullanıcının yetkilerini kontrol et
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
      return interaction.reply({
        content: '<a:carpi:1227670096462221363>  **Emoji ekleyemezsiniz!**\n> Gerekli yetki: `Emojileri ve Çıkartmaları Yönet`',
        ephemeral: true
      });
    }

    // Botun yetkilerini kontrol et
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
      return interaction.reply({
        content: '<a:carpi:1227670096462221363>  **Emoji ekleyemiyorum!**\n> Botta gerekli yetki yok: `Emojileri ve Çıkartmaları Yönet`\n> Lütfen yetkileri kontrol edin.',
        ephemeral: true
      });
    }

    const emojiName = interaction.options.getString('isim');
    const emojiInput = interaction.options.getString('emoji');

    // Emoji isim kontrolü
    if (!/^[a-zA-Z0-9_]+$/.test(emojiName)) {
      return interaction.reply({
        content: '<a:carpi:1227670096462221363>  **Geçersiz emoji ismi!**\n> Sadece harf, sayı ve alt çizgi kullanabilirsiniz.',
        ephemeral: true
      });
    }

    let emojiUrl;
    if (emojiInput.startsWith('http')) {
      emojiUrl = emojiInput;
    } else if (emojiInput.match(/<a?:.+?:\d+>/)) {
      const emojiCode = emojiInput.split(':').pop().replace('>', '');
      emojiUrl = `https://cdn.discordapp.com/emojis/${emojiCode}.${emojiInput.startsWith('<a:') ? 'gif' : 'png'}`;
    } else {
      return interaction.reply({
        content: '<a:carpi:1227670096462221363>  **Geçersiz emoji formatı!**\n> Lütfen geçerli bir emoji kodu veya URL girin.',
        ephemeral: true
      });
    }

    try {
      // URL doğrulama
      const response = await axios.head(emojiUrl);
      if (!response.headers['content-type'].startsWith('image/')) {
        throw new Error('Geçersiz resim formatı');
      }

      // Emoji boyut kontrolü (256KB'dan küçük olmalı)
      const contentLength = parseInt(response.headers['content-length']);
      if (contentLength > 256 * 1024) {
        return interaction.reply({
          content: '<a:carpi:1227670096462221363>  **Emoji boyutu çok büyük!**\n> Maksimum boyut: 256KB',
          ephemeral: true
        });
      }

      // Emoji ekleme
      const addedEmoji = await interaction.guild.emojis.create({
        attachment: emojiUrl,
        name: emojiName,
      });

      const embed = new EmbedBuilder()
        .setTitle('<a:yeilonay:1221172106637611169>  Emoji Başarıyla Eklendi!')
        .setDescription(`**${emojiName}** adlı emoji oluşturuldu!\n${addedEmoji} \`${addedEmoji}\``)
        .setThumbnail(addedEmoji.url)
        .setColor('#00ff00')
        .setFooter({
          text: `${interaction.user.tag} tarafından eklendi`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Emoji ekleme hatası:', error);

      let errorMessage = '<a:carpi:1227670096462221363>  **Emoji eklenemedi!**\n';
      
      if (error.message.includes('Invalid Form Body')) {
        errorMessage += '> Geçersiz emoji formatı veya boyutu';
      } else if (error.message.includes('Maximum number of emojis reached')) {
        errorMessage += '> Sunucu emoji limiti doldu!';
      } else if (error.code === 'ECONNRESET') {
        errorMessage += '> Ağ bağlantısı hatası, lütfen tekrar deneyin';
      } else if (error.message === 'Geçersiz resim formatı') {
        errorMessage += '> URL geçersiz bir resim içeriyor';
      } else if (error.response?.status === 404) {
        errorMessage += '> Emoji URL\'si geçersiz veya bulunamadı';
      } else {
        errorMessage += '> Bilinmeyen bir hata oluştu';
      }

      interaction.reply({ 
        content: errorMessage + '\n> Lütfen bilgileri kontrol edip tekrar deneyin.', 
        ephemeral: true 
      });
    }
  },
};