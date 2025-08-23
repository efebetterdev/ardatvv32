const { PermissionsBitField, EmbedBuilder, ChannelType } = require('discord.js');
const db = require('croxydb');

module.exports = {
  name: 'sayaç',
  description: 'Sunucuda sayaç sistemini ayarlar.',
  type: 1,
  options: [
    {
      name: 'kanal',
      description: 'Sayaç bildiriminin yapılacağı kanal',
      type: 7,
      required: true,
      channel_types: [ChannelType.GuildText]
    },
    {
      name: 'sayı',
      description: 'Sayaç hedef sayısı',
      type: 4,
      required: true
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: 'Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın.', ephemeral: true });
    }

    const kanal = interaction.options.getChannel('kanal');
    const sayi = interaction.options.getInteger('sayı');
    const üyeSayısı = interaction.guild.memberCount;

    if (sayi < üyeSayısı) {
      return interaction.reply({
        content: `Girdiğiniz sayı, sunucudaki mevcut üye sayısından büyük olmalıdır. Mevcut üye sayısı: **${üyeSayısı}**`,
        ephemeral: true
      });
    }

    db.set(`sayac_${interaction.guild.id}`, {
      sayi: sayi,
      kanal: kanal.id
    });

    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setColor('Red')
      .setDescription(`╔▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
║
║ • Ayarlanan Kanal: ${kanal}
║
║ • Ayarlanan Sayı: ${sayi}
║
║ • Sayaç Sistemi Aktif Edildi, Hedefimize Ulaşmak İçin **${sayi - üyeSayısı}** Kişi Kaldı 
║
╚▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`)
      .setFooter({ text: `${client.user.username} Sayaç Sistemi`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};