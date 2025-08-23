const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "giriş-çıkış-kapat",
  description: "Giriş Çıkış Sistemini devre dışı bırakır.",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ 
        content: "<a:carpi:1227670096462221363>  | Bu komutu kullanabilmek için **Kanalları Yönet** yetkisine sahip olmalısın!", 
        ephemeral: true 
      });
    }

    const kanalID = db.get(`hgbb_${interaction.guild.id}`);
    
    if (!kanalID) {
      return interaction.reply({ 
        content: "<a:uyari:1225959324426174475>  | Giriş çıkış sistemi zaten kapalı!", 
        ephemeral: true 
      });
    }

    db.delete(`hgbb_${interaction.guild.id}`);
    db.delete(`hgbb1_${interaction.guild.id}`);

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle("🔧 Giriş Çıkış Sistemi Kapatıldı!")
      .setDescription(`<a:yeilonay:1221172106637611169>  | **${interaction.guild.name}** sunucusunda giriş çıkış mesajları kapatıldı!`)
      .setFooter({ text: "Sistemi tekrar açmak için giriş-çıkış-ayarla komutunu kullanabilirsiniz." });

    interaction.reply({ embeds: [embed] });
  }
};
