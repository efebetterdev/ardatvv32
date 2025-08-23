const {
    Client,
    EmbedBuilder,
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
  } = require("discord.js");
  
  module.exports = {
    name: "sunucupp",
    description: "Sunucunun avatarını gösterir!",
    type: 1,
    options: [],
  
    run: async (client, interaction) => {
      const icon = interaction.guild.iconURL({ dynamic: true, size: 4096 });
  
      if (!icon) {
        return interaction.reply({
          content: "❌ Bu sunucunun bir simgesi yok!",
          ephemeral: true,
        });
      }
  
      const embed = new EmbedBuilder()
        .setColor("#ff66cc")
        .setTitle(`🌟 ${interaction.guild.name} • Sunucu Avatarı`)
        .setDescription(`🔗 [Avatar Bağlantısı](${icon})\n❤️ Sunucu simgesine bir göz atalım:`)
        .setImage(icon)
        .setFooter({
          text: `Sunucu ID: ${interaction.guild.id} | Üye Sayısı: ${interaction.guild.memberCount}`,
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();
  
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("🔗 Avatarı Yeni Sekmede Aç")
          .setStyle(ButtonStyle.Link)
          .setURL(icon)
      );
  
      await interaction.reply({
        embeds: [embed],
        components: [row],
      });
    },
  };
  