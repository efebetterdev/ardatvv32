const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "yavaş-mod",
  description: "Kanalın Yavaş Modunu Ayarlarsın!",
  type: 1,
  options: [
    {
        name:"saniye",
        description:"Yavaş Modu Kaç Saniye Yapıcaksın?",
        type:3,
        required:true
    },
   
   
    
],

  run: async(client, interaction) => {
    const ms = require('rhino-ms')
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({content: "<a:carpi:1227670096462221363>  | Kanalları Yönet Yetkin Yok!", ephemeral: true})


    const zaman = interaction.options.getString('saniye')
    if (zaman < 0 || zaman > 21600) return interaction.reply("<a:carpi:1227670096462221363>  | Süre limiti maksimum **6** saat olabilir.")
    const slowmode = Math.floor(zaman)
    interaction.channel.setRateLimitPerUser(slowmode)

   interaction.reply(`<a:yeilonay:1221172106637611169>  | Yazma süre limiti **${zaman}** saniye olarak ayarlanmıştır.`)


  }

};
