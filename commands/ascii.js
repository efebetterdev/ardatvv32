const { Client, EmbedBuilder } = require("discord.js"); 
const figlet = require("figlet");  // figlet modülünü kullanacağız

module.exports = {
  name: "ascii",
  description: "Girilen metni ASCII yazısı olarak gösterir!",
  type: 1,
  options: [
    {
      name: "yazi",
      description: "ASCII olarak dönüştürmek istediğiniz yazıyı girin!",
      type: 3,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const yazi = interaction.options.getString("yazi");

    
    figlet(yazi, (err, asciiText) => {
      if (err) {
        console.log(err);
        return interaction.reply("Bir hata oluştu. Lütfen tekrar deneyin.");
      }

      
      const asciiEmbed = new EmbedBuilder()
        .setColor("Random")
        .setTitle("ASCII Yazısı")
        .setDescription(`\`\`\`${asciiText}\`\`\``)
        .setFooter({ text: "ASCII yazısı başarıyla oluşturuldu!" });

      interaction.reply({ embeds: [asciiEmbed] });
    });
  },
};
