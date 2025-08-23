const { Client } = require("discord.js");
const canvafy = require("canvafy");

module.exports = {
  name: "tweet",
  description: "Bir tweet oluşturmanızı sağlar.",
  type: 1,
  options: [
    {
      name: "mesaj",
      description: "Tweet içeriğini yazın.",
      type: 3, // STRING
      required: true
    },
    {
      name: "ephemeral",
      description: "Yanıt gizli olsun mu? (true = gizli, false = açık)",
      type: 5, // BOOLEAN
      required: false
    }
  ],

  run: async (client, interaction) => {
    const mesaj = interaction.options.getString("mesaj");
    const ephemeralOption = interaction.options.getBoolean("ephemeral") || false;

    await interaction.deferReply({ ephemeral: ephemeralOption });

    const avatarURL = interaction.user.displayAvatarURL({ format: "png", dynamic: true, size: 512 });

    try {
      const tweetImage = await new canvafy.Tweet()
        .setTheme("dark") // dark veya light
        .setUser({
          displayName: interaction.member.displayName,
          username: interaction.user.username,
        })
        .setVerified(true)
        .setComment(mesaj)
        .setAvatar(avatarURL)
        .build();

      await interaction.editReply({
        files: [{
          attachment: tweetImage,
          name: `tweet-${interaction.user.id}.png`,
        }]
      });
    } catch (error) {
      console.error("Tweet oluşturulurken bir hata oluştu:", error);
      await interaction.editReply({ content: "<a:uyari:1225959324426174475>  Tweet oluşturulamadı. Lütfen tekrar deneyin." });
    }
  }
};
