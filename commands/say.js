const {
  Client,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "say",
  description: "Sunucuda toplam üye, bot ve sahte üye sayısını gösterir.",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    await interaction.guild.members.fetch();

    const totalMembers = interaction.guild.memberCount;
    const realMembers = interaction.guild.members.cache.filter(m => !m.user.bot).size;
    const botCount = interaction.guild.members.cache.filter(m => m.user.bot).size;
    const fakeMembers = interaction.guild.members.cache.filter(m => Date.now() - m.user.createdAt < 15 * 24 * 60 * 60 * 1000).size;
    const adminMembers = interaction.guild.members.cache.filter(m => m.permissions.has(PermissionsBitField.Flags.Administrator)).size;

    const guildIcon = interaction.guild.iconURL({ dynamic: true }) || "https://i.hizliresim.com/n5271mq.jpg";

    const embed = new EmbedBuilder()
      .setColor("#00bfff")
      .setAuthor({
        name: `${interaction.guild.name} • Sunucu İstatistikleri`,
        iconURL: guildIcon
      })
      .setThumbnail(guildIcon)
      .setDescription(
        `> <:kullanici:1382373832144326656> **Toplam Üye Sayısı**: \`${totalMembers}\`\n` +
        `> 🧍‍♂️ **Gerçek Kullanıcılar**: \`${realMembers}\`\n` +
        `> <:bot:1382376704265424941> **Botlar**: \`${botCount}\`\n` +
        `> <:admin:1296904503966044190>**Yönetici Yetkisi Olanlar**: \`${adminMembers}\`\n\n` +
        `❗ **Sahte Üye Sayısı**: \`${fakeMembers}\`\n` +
        `📌 *Sahte üyeler: Son 15 gün içinde açılmış hesaplar olarak değerlendirilir.*`
      )
      .setFooter({
        text: `${interaction.user.tag} tarafından istendi • ${config["bot-adi"]}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
