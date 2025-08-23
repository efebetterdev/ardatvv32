const {
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
  } = require("discord.js");
  
  module.exports = {
    name: "sunucubanner",
    description: "Sunucunun bannerını büyük bir şekilde gösterir!",
    type: 1,
    options: [],
  
    run: async (client, interaction) => {
      const guild = interaction.guild;
      const bannerUrl = guild.bannerURL({ dynamic: true, size: 1024 });
  
      if (!bannerUrl) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setTitle("🚫 Sunucu Bannerı Yok!")
              .setDescription("Bu sunucuda ayarlanmış bir **banner** bulunmamakta.")
              .setThumbnail("https://i.imgur.com/O3DHIA5.png")
              .setFooter({
                text: `${guild.name}`,
                iconURL: guild.iconURL({ dynamic: true }),
              })
          ],
          ephemeral: true,
        });
      }
  
      const embed = new EmbedBuilder()
        .setColor("#ff0055")
        .setTitle(`🌆 ${guild.name} - Banner Görünümü`)
        .setDescription(`🔗 [Banner bağlantısı için buraya tıkla](${bannerUrl})`)
        .setImage(bannerUrl)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({
          text: `<:admin:1296904503966044190>Üye Sayısı: ${guild.memberCount.toLocaleString()} • Oluşturulma: ${guild.createdAt.toLocaleDateString("tr-TR")}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        });
  
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("🔽 Bannerı İndir")
          .setStyle(ButtonStyle.Link)
          .setURL(bannerUrl)
      );
  
      await interaction.reply({
        embeds: [embed],
        components: [row],
      });
    }
  };
  