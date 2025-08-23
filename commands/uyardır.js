const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "uyandır",
  description: "Kulaklığı kapalı kullanıcıyı sunucudaki sesli kanallarda dolaştırarak uyandırır.",
  type: 1,
  options: [
    {
      name: "kullanıcı",
      description: "Uyandırılacak kullanıcıyı seç.",
      type: 6, // USER
      required: true,
    }
  ],

  run: async (client, interaction) => {
    const targetMember = interaction.options.getMember("kullanıcı");

    // Kullanıcı ses kanalında mı?
    if (!targetMember || !targetMember.voice.channel) {
      return interaction.reply({
        content: "❌ | Bu komut sadece **ses kanalında olan kullanıcılar** için kullanılabilir.",
        ephemeral: true
      });
    }

    // Kullanıcının kulaklığı açık mı?
    if (!targetMember.voice.deaf) {
      return interaction.reply({
        content: "ℹ️ | Kullanıcının kulaklığı açık, uyandırmaya gerek yok.",
        ephemeral: true
      });
    }

    const originalChannel = targetMember.voice.channel;

    const voiceChannels = interaction.guild.channels.cache
      .filter(c =>
        c.type === 2 &&
        c.id !== originalChannel.id &&
        c.permissionsFor(targetMember).has(PermissionsBitField.Flags.Connect)
      )
      .map(c => c);

    if (voiceChannels.length < 1) {
      return interaction.reply({
        content: "❌ | Kullanıcıyı taşıyabileceğim başka bir ses kanalı bulamıyorum.",
        ephemeral: true
      });
    }

    await interaction.reply(`🔄 | ${targetMember} kullanıcısı uyandırılıyor...`);

    for (const channel of voiceChannels) {
      try {
        if (!targetMember.voice.channel) {
          return interaction.followUp({
            content: "❌ | Kullanıcı artık bir sesli kanalda değil.",
            ephemeral: true
          });
        }

        await targetMember.voice.setChannel(channel);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch {
        return interaction.followUp({
          content: "❌ | Kullanıcı bir sesli kanalda değil.",
          ephemeral: true
        });
      }
    }

    try {
      if (targetMember.voice.channel) {
        await targetMember.voice.setChannel(originalChannel);
      }
    } catch {
      return interaction.followUp({
        content: "❌ | Kullanıcı geri taşınamadı çünkü bir sesli kanalda değil.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("🔊 Kullanıcı Uyandırıldı")
      .setDescription(`${targetMember} kullanıcısı başarıyla ses kanallarında dolaştırıldı ve geri getirildi.`)
      .setFooter({ text: `İşlemi yapan: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    interaction.followUp({ embeds: [embed] });
  }
};
