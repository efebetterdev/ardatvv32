const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "oto-rol-kapat",
  description: "Oto-Rol sistemini devre dışı bırakır ve ilgili verileri temizler.",
  type: 1,
  options: [],
  run: async (client, interaction) => {
 
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({
        content: "<a:carpi:1227670096462221363>  | Rolleri Yönet yetkiniz yok!",
        ephemeral: true,
      });
    }

   
    const otoRolVerisi = db.fetch(`otorol_${interaction.guild.id}`);
    const botRolVerisi = db.fetch(`botrol_${interaction.guild.id}`);

    if (!otoRolVerisi || !botRolVerisi) {
      return interaction.reply({
        content: "<a:uyari:1225959324426174475>  | Oto-rol sistemi zaten kapalı veya veriler bulunamadı.",
        ephemeral: true,
      });
    }

    db.delete(`otorol_${interaction.guild.id}`);
    db.delete(`botrol_${interaction.guild.id}`);

   
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Oto-Rol Sistemi Kapatıldı!")
      .setDescription("<a:yeilonay:1221172106637611169>  | Oto-Rol başarıyla devre dışı bırakıldı ve tüm ayarlar silindi.")
      .setFooter({
        text: "Oto-rol sistemi hakkında daha fazla bilgi için yardım komutlarına bakabilirsiniz.",
      });

    interaction.reply({ embeds: [embed] });
  },
};
