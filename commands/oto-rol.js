const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "oto-rol",
  description: "Yeni gelen üyelere otomatik rol ve bot rolü verir.",
  type: 1,
  options: [
    {
      name: "rol",
      description: "Lütfen bir rol etiketleyin!",
      type: 8,
      required: true,
    },
    {
      name: "bot-rol",
      description: "Lütfen bir bot rolü etiketleyin!",
      type: 8,
      required: true,
    },
  ],
  run: async (client, interaction) => {
   
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({
        content: "<a:carpi:1227670096462221363>  | Rolleri Yönet yetkiniz yok!",
        ephemeral: true,
      });
    }

    
    const rol = interaction.options.getRole("rol");
    const bot = interaction.options.getRole("bot-rol");

    
    db.set(`botrol_${interaction.guild.id}`, bot.id);
    db.set(`otorol_${interaction.guild.id}`, rol.id);

    
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Oto-Rol Sistemi Başarıyla Ayarlandı!")
      .setDescription(`<a:yeilonay:1221172106637611169>  | Oto-rol başarıyla ${rol} olarak ayarlandı.\nBot rolü ise ${bot} olarak ayarlandı!`)
      .setFooter({
        text: "Yeni gelen üyeler, belirtilen rollerle karşılanacaktır.",
      });

    interaction.reply({ embeds: [embed] });
  },
};
