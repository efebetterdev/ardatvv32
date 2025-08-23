const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "kick",
  description: "Belirttiğin kullanıcıyı sunucudan atarsın.",
  type: 1,
  options: [
    {
      name: "user",
      description: "Atılacak kullanıcıyı seçin.",
      type: 6,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const noPermEmoji = "<a:carpi:1227670096462221363>";
    const successEmoji = "<a:yeilonay:1221172106637611169>";
    const user = interaction.options.getMember("user");

    // Kullanıcının yetkisi var mı kontrol et
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({
        content: `${noPermEmoji}  | Üzgünüm, bu komutu kullanmak için **Üyeleri At** yetkisine sahip olmalısın.`,
        ephemeral: true,
      });
    }

    // Kullanıcı geçerli mi kontrol et
    if (!user) {
      return interaction.reply({
        content: `${noPermEmoji}  | Geçerli bir kullanıcı belirtmelisin!`,
        ephemeral: true,
      });
    }

    // Kicklenmek istenen kişinin yetkisi var mı kontrol et
    if (user.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({
        content: `${noPermEmoji}  | Bu kullanıcıyı atamıyorum çünkü kendisi de **üyeleri atma** yetkisine sahip!`,
        ephemeral: true,
      });
    }

    // Sunucu sahibi mi kontrol et (isteğe bağlı güvenlik)
    if (user.id === interaction.guild.ownerId) {
      return interaction.reply({
        content: `${noPermEmoji}  | Sunucu sahibini atamazsın!`,
        ephemeral: true,
      });
    }

    try {
      await user.kick();

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: "Kullanıcı Atıldı", iconURL: interaction.guild.iconURL() })
        .setDescription(`${successEmoji}  | ${user} adlı kullanıcı sunucudan başarıyla atıldı.`)
        .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `İşlemi yapan: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      let errorMessage = `${noPermEmoji}  | Kullanıcıyı atarken bir hata oluştu.`;
      if (error.code === 50013) {
        errorMessage = `${noPermEmoji}  | Bu kullanıcıyı atmak için yeterli yetkim yok!`;
      }

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Hata!")
        .setDescription(errorMessage)
        .setFooter({ text: `İşlemi yapan: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
