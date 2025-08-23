const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "wkanalsilme",
  description: "Belirli bir kelimeyi içeren tüm kanalları siler.",
  type: 1,
  options: [
    {
      name: "kelime",
      description: "Silinecek kanallarda aranacak kelimeyi girin.",
      type: 3,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const kelime = interaction.options.getString("kelime");
    const guild = interaction.guild;

    // Kullanıcının yetkilerini kontrol et
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: "Bu komutu kullanmak için kanalları yönetme yetkisine sahip olmalısınız.",
        ephemeral: true,
      });
    }

    // Tüm kanalları al
    const channels = guild.channels.cache;

    // Kelimeyi içeren kanalları sil
    channels.forEach(channel => {
      if (channel.name.includes(kelime)) {
        channel.delete()
          .then(() => {
            console.log(`Kanal silindi: ${channel.name}`);
          })
          .catch(err => {
            console.error(`Kanal silinirken hata oluştu: ${err}`);
          });
      }
    });

    // Embed oluşturma
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle("Kanallar Silindi!")
      .setDescription(`"${kelime}" kelimesini içeren tüm kanallar silindi.`)
      .setFooter({ text: `Komutu kullanan: ${interaction.user.tag}` });

    // Embed yanıtı
    interaction.reply({ embeds: [embed] });
  },
};
