const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require('croxydb');

module.exports = {
  name: "yasaklı-kelime",
  description: 'Yasaklı kelimeyi ayarlarsınız ya da sıfırlarsınız!',
  type: 1,
  options: [
    {
      name: "kelime",
      description: "Lütfen bir kelime girin (Yasaklı kelimeyi ayarlamak için)!",
      type: 3,
      required: false,
    },
    {
      name: "sıfırla",
      description: "Yasaklı kelimeyi sıfırlamak için bunu işaretleyin!",
      type: 5,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) 
      return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Mesajları Yönet Yetkin Yok!", ephemeral: true });

    const kelime = interaction.options.getString("kelime");
    const sıfırla = interaction.options.getBoolean("sıfırla");

    if (sıfırla) {
      db.delete(`yasaklı_kelime_${interaction.guild.id}`);
      return interaction.reply({ content: "<a:yeilonay:1221172106637611169>  | Başarıyla yasaklı kelime sistemini sıfırladım!" });
    }
    if (kelime) {
      db.push(`yasaklı_kelime_${interaction.guild.id}`, kelime);
      return interaction.reply({ content: `<a:yeilonay:1221172106637611169>  | Başarıyla yasaklı kelimeyi **${kelime}** olarak ayarladım!` });
    }

    return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Lütfen bir kelime girin veya yasaklı kelimeyi sıfırlayın!" });
  },
};