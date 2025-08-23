const { Client, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'emojiçek',
  description: 'Belirtilen sunucudaki tüm emojileri bu sunucuya ekler.',
  type: 1,
  options: [
    {
      name: 'sunucuid',
      description: 'Emoji çekilecek sunucunun ID\'si.',
      type: 3,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const sourceServerId = interaction.options.getString('sunucuid');
    const targetServer = interaction.guild;
    const delay = 3000; 

    let initialMessage;

    try {
      // Önce botun bu sunucuda olup olmadığını kontrol et
      const sourceServer = await client.guilds.fetch(sourceServerId).catch(() => null);
      
      if (!sourceServer) {
        return interaction.reply({ 
          content: 'Bot belirtilen sunucuda bulunmuyor veya sunucu ID geçersiz!', 
          ephemeral: true 
        });
      }

      // Sunucu bilgilerini kontrol et
      if (!sourceServer.available) {
        return interaction.reply({ 
          content: 'Belirtilen sunucu şu anda kullanılamıyor!', 
          ephemeral: true 
        });
      }

      const emojis = await sourceServer.emojis.fetch();
      const targetEmojis = await targetServer.emojis.fetch();

      const startEmbed = new EmbedBuilder()
        .setTitle('Emoji Çekme Başladı')
        .setDescription(`"${sourceServer.name}" sunucusundan emojiler çekiliyor...`)
        .setImage("https://i.hizliresim.com/t7avr37.gif")
        .setColor('Yellow');

      initialMessage = await interaction.reply({ embeds: [startEmbed], fetchReply: true });

      let addedCount = 0;
      let skippedCount = 0;
      let failedCount = 0;
      const failedEmojis = [];

      for (const emoji of emojis.values()) {
        const emojiUrl = emoji.url || emoji.imageURL();  
        const emojiName = emoji.name;

        console.log(`İşleniyor: ${emojiName}`);

        if (targetEmojis.some(e => e.name === emojiName)) {
          console.log(`Emoji ${emojiName} zaten mevcut, atlanıyor.`);
          skippedCount++;
          continue;
        }

        try {
          await new Promise(resolve => setTimeout(resolve, delay)); 
          await targetServer.emojis.create({
            attachment: emojiUrl,
            name: emojiName,
          });
          console.log(`Emoji ${emojiName} başarıyla eklendi.`);
          addedCount++;
        } catch (error) {
          console.error(`Emoji ${emojiName} eklenirken bir hata oluştu:`, error);
          failedCount++;
          failedEmojis.push(emojiName);
          continue;
        }
      }

      const completeEmbed = new EmbedBuilder()
        .setTitle('Emoji Çekme Tamamlandı')
        .setDescription([
          `**"${sourceServer.name}" sunucusundan emoji çekme işlemi tamamlandı!**`,
          `✅ **Eklendi:** ${addedCount}`,
          `⏩ **Atlandı:** ${skippedCount}`,
          `❌ **Başarısız:** ${failedCount}`,
          failedCount > 0 ? `\n**Başarısız Olan Emojiler:** ${failedEmojis.join(', ')}` : ''
        ].join('\n'))
        .setImage("https://i.hizliresim.com/t7avr37.gif")
        .setColor(failedCount > 0 ? 'Orange' : 'Green')
        .setFooter({
          text: `Kullanıldığı zaman: ${new Date().toLocaleString()}`,
          iconURL: interaction.guild.iconURL({ dynamic: true, size: 16 })
        });

      await initialMessage.delete().catch(() => {});
      await interaction.followUp({ embeds: [completeEmbed] });

    } catch (error) {
      console.error('Bir hata oluştu:', error);
      if (initialMessage) {
        await initialMessage.delete().catch(() => {});
      }
      
      let errorMessage = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      if (error.code === 10004) {
        errorMessage = 'Bot belirtilen sunucuda bulunmuyor veya sunucu ID geçersiz!';
      } else if (error.code === 50001) {
        errorMessage = 'Botun bu sunucudaki emojileri görme yetkisi yok!';
      }

      interaction.followUp({ 
        content: errorMessage, 
        ephemeral: true 
      });
    }
  }
};