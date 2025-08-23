const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "sa-as",
  description: "Selam Sistemini Açıp Kapatırsın!",
  type: 1,
  options: [
    {
      type: 3,
      name: "seçenek",
      description: "Sistemi kapatacak mısın yoksa açacak mısın?",
      required: true,
      choices: [
        {
          name: "Aç",
          value: "ac"
        },
        {
          name: "Kapat",
          value: "kapat"
        }
      ]
    }
  ],

  run: async (client, interaction) => {
    const { guild, options, member } = interaction;
    
    if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({
        content: "<a:carpi:1227670096462221363>  | Rolleri Yönet Yetkin Yok!",
        ephemeral: true
      });
    }

    const saasSystemTrue = options.getString("seçenek");
    const saasSystem = !!db.get(`saas_${guild.id}`); // Veriyi boolean olarak al

    if (saasSystemTrue === "ac") {
      if (saasSystem) {
        return interaction.reply({
          content: "<a:carpi:1227670096462221363> | Bu sistem zaten açık!"
        });
      }

      db.set(`saas_${guild.id}`, true);
      return interaction.reply({
        content: "<a:yeilonay:1221172106637611169>  | Başarılı bir şekilde sistem açıldı!"
      });
    }

    if (saasSystemTrue === "kapat") {
      if (!saasSystem) {
        return interaction.reply({
          content: "<a:carpi:1227670096462221363>  | Bu sistem zaten kapalı!"
        });
      }

      db.delete(`saas_${guild.id}`);
      return interaction.reply({
        content: "<a:yeilonay:1221172106637611169> | Başarılı bir şekilde sistem kapatıldı!"
      });
    }
  }
};
