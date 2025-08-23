const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "uyarı-ayar",
  description: "Uyarı ayarları yapılandırmasını yapar.",
  type: 1,
  options: [
    {
      name: "mute-rol",
      description: "Mute rolünü belirleyin.",
      type: 8,
      required: true
    },
    {
      name: "jail-rol",
      description: "Jail rolünü belirleyin.",
      type: 8,
      required: true
    },
    {
      name: "mod-rol",
      description: "Uyarı yetkilisini ayarlarsınız.",
      type: 8,
      required: true
    },
    {
      name: "log-kanal",
      description: "Uyarı işlemlerini kaydedecek log kanalını belirleyin.",
      type: 7,
      required: true
    }
  ],

  run: async (client, interaction) => {
    // Kullanıcı yetkisi kontrolü
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Bu komutu kullanabilmek için yeterli yetkiye sahip değilsiniz.", ephemeral: true });
    }

    // Parametreleri alıyoruz
    const muteRole = interaction.options.getRole("mute-rol");
    const jailRole = interaction.options.getRole("jail-rol");
    const modRole = interaction.options.getRole("mod-rol");
    const logChannel = interaction.options.getChannel("log-kanal");

    // Veritabanında ayarları kaydediyoruz
    db.set(`Mute_${interaction.guild.id}`, muteRole.id);
    db.set(`Jail_${interaction.guild.id}`, jailRole.id);
    db.set(`Mod_${interaction.guild.id}`, modRole.id);
    db.set(`logChannel_${interaction.guild.id}`, logChannel.id);

    // Embed mesajı ile yanıt gönderiyoruz
    const embed = new EmbedBuilder()
      .setColor("Aqua")
      .setTitle("<a:yeilonay:1221172106637611169>  Uyarı Ayarları Güncellendi")
      .setDescription("Uyarı ayarları başarıyla güncellendi.")
      .addFields(
        { name: "Mute Rolü", value: `<@&${muteRole.id}>`, inline: true },
        { name: "Jail Rolü", value: `<@&${jailRole.id}>`, inline: true },
        { name: "Mod Rolü", value: `<@&${modRole.id}>`, inline: true },
        { name: "Log Kanalı", value: `<#${logChannel.id}>`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ format: "png", dynamic: true, size: 2048 }) });

    // Sonuç mesajı
    interaction.reply({ embeds: [embed] });

    // Uyarı sistemini aktif ettiğimizi belirtiyoruz
    db.set(`warnayar_${interaction.guild.id}`, true);
  }
};
