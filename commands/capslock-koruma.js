const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "capslock-engel",
  description: "CapsLock Engel Sistemini Açıp Kapatırsın!",
  type: 1,
  options: [
    {
      type: 3,
      name: "seçenek",
      description: "Sistemi kapatacak mısın yoksa açacak mısın?",
      required: true,
      choices: [
        { name: "Aç", value: "ac" },
        { name: "Kapat", value: "kapat" }
      ]
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Rolleri Yönet Yetkin Yok!", ephemeral: true });
    }

    const seçenek = interaction.options.getString("seçenek");
    const capslockSystem = db.fetch(`capslockengel_${interaction.guild.id}`);

    if (seçenek === "ac") {
      if (capslockSystem) {
        const capslockSystemDate = db.fetch(`capslockSystemDate_${interaction.guild.id}`);
        if (capslockSystemDate) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder().setDescription(`<a:carpi:1227670096462221363>  | Bu sistem <t:${parseInt(capslockSystemDate / 1000)}:R> önce açılmış!`)
            ]
          });
        }
      }
      db.set(`capslockengel_${interaction.guild.id}`, true);
      db.set(`capslockSystemDate_${interaction.guild.id}`, Date.now());
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Random")
            .setDescription("<a:yeilonay:1221172106637611169>  | Başarılı bir şekilde sistem açıldı!")
            .setImage("https://i.hizliresim.com/gkrz199.gif")
        ]
      });
    }

    if (seçenek === "kapat") {
      if (!capslockSystem) {
        return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Bu sistem zaten kapalı!", ephemeral: true });
      }
      db.delete(`capslockengel_${interaction.guild.id}`);
      db.delete(`capslockSystemDate_${interaction.guild.id}`);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Random")
            .setDescription("<a:yeilonay:1221172106637611169>  | Başarılı bir şekilde sistem kapatıldı!")
        ]
      });
    }
  }
};
