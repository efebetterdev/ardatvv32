const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb")
module.exports = {
  name: "reklam-engel",
  description: " Reklam Engel Sistemini Açıp Kapatırsın!",
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

  run: async(client, interaction) => {
    const { user, guild, options } = interaction;
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({content: "<a:carpi:1227670096462221363>  | Rolleri Yönet Yetkin Yok!", ephemeral: true})
 
    const reklamEngelSystemTrue = options.getString("seçenek");
    const reklamEngelSystem = db.fetch(`reklamengel_${interaction.guild.id}`)

    switch(reklamEngelSystemTrue) {
      case "ac": {
                const reklamEngelSystem = db.fetch(`reklamengel_${interaction.guild.id}`)
        const reklamEngelSystemDate = db.fetch(`reklamengelDate_${interaction.guild.id}`)
        
        if (reklamEngelSystem && reklamEngelSystemDate) {
            const date = new EmbedBuilder()
            .setDescription(`<a:carpi:1227670096462221363>  | Bu sistem <t:${parseInt(reklamEngelSystemDate.date / 1000)}:R> önce açılmış!`)
            .setColor("Red")

        return interaction.reply({ embeds: [date] })
        }
  
        db.set(`reklamengel_${interaction.guild.id}`, true)
		db.set(`reklamengelDate_${interaction.guild.id}`, { date: Date.now() })
        const embed = new EmbedBuilder()
        .setDescription(`<a:yeilonay:1221172106637611169>  | Başarılı bir şekilde sistem açıldı!`)
        .setImage("https://media.tenor.com/XeIdtr6QSjIAAAAM/shuna.gif")
        .setColor("Green")

        return interaction.reply({ embeds: [embed] });
      }
  
      case "kapat": {
        if(!reklamEngelSystem) return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Bu sistem zaten kapalı?" });
  
        db.delete(`reklamengel_${interaction.guild.id}`)
		db.delete(`reklamengelDate_${interaction.guild.id}`)
        const embed = new EmbedBuilder()
        .setDescription(`<a:yeilonay:1221172106637611169>  | Başarılı bir şekilde sistem kapatıldı!`)
        .setImage("https://media.tenor.com/XeIdtr6QSjIAAAAM/shuna.gif")
        .setColor("Green")

        return interaction.reply({ embeds: [embed] });
      }
    }

  }

};