const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  ChannelType,
  Colors
} = require("discord.js");
const croxy = require("croxydb");

const COLOR_OPTIONS = [
  { name: "Mavi (Varsayılan)", value: "Blue" },
  { name: "Kırmızı", value: "Red" },
  { name: "Yeşil", value: "Green" },
  { name: "Sarı", value: "Yellow" },
  { name: "Pembe", value: "Pink" },
  { name: "Turuncu", value: "Orange" },
  { name: "Mor", value: "Purple" },
  { name: "Turkuaz", value: "Aqua" },
  { name: "Altın", value: "Gold" },
  { name: "Koyu Kırmızı", value: "DarkRed" },
  { name: "Koyu Mavi", value: "DarkBlue" },
  { name: "Koyu Yeşil", value: "DarkGreen" },
  { name: "Koyu Mor", value: "DarkPurple" },
  { name: "Siyah", value: "DarkButNotBlack" }
];

module.exports = {
  name: "yaz",
  description: "Bot üzerinden belirlenen kanala mesaj gönderir! (Günde max 2 kullanım)",
  type: ApplicationCommandType.ChatInput,
  cooldown: 3,
  default_member_permissions: PermissionFlagsBits.ManageMessages,
  options: [
    {
      name: "mesaj",
      description: "Gönderilecek mesaj",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "kanal",
      description: "Mesajın gönderileceği kanal",
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
      required: false,
    },
    {
      name: "embed",
      description: "Mesajı embed olarak gönder",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
    {
      name: "başlık",
      description: "Embed için başlık (sadece embed kullanılıyorsa)",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "renk",
      description: "Embed rengi",
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: COLOR_OPTIONS
    },
    {
      name: "etiket",
      description: "Mesajla birlikte etiketlenecek rol/kullanıcı (ID veya @etiket)",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.editReply({
        content: "⛔ Bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısınız!",
      });
    }

    const userId = interaction.user.id;
    const today = new Date().toLocaleDateString();
    const dbKey = `yaz_${userId}_${today}`;
    const usageCount = croxy.get(dbKey) || 0;

    if (usageCount >= 2) {
      return interaction.editReply({
        content: "⛔ Bu komutu günde en fazla 2 kez kullanabilirsiniz. Lütfen yarın tekrar deneyin.",
      });
    }

    const channel = interaction.options.getChannel("kanal") || interaction.channel;
    const message = interaction.options.getString("mesaj");
    const useEmbed = interaction.options.getBoolean("embed") || false;
    const title = interaction.options.getString("başlık");
    const colorName = interaction.options.getString("renk") || "Blue";
    const mention = interaction.options.getString("etiket");

    const colorMap = {
      Blue: Colors.Blue,
      Red: Colors.Red,
      Green: Colors.Green,
      Yellow: Colors.Yellow,
      Pink: Colors.Fuchsia,
      Orange: Colors.Orange,
      Purple: Colors.Purple,
      Aqua: Colors.Aqua,
      Gold: Colors.Gold,
      DarkRed: Colors.DarkRed,
      DarkBlue: Colors.DarkBlue,
      DarkGreen: Colors.DarkGreen,
      DarkPurple: Colors.DarkPurple,
      DarkButNotBlack: Colors.DarkButNotBlack
    };

    const selectedColor = colorMap[colorName] || Colors.Blue;

    if (!channel.isTextBased()) {
      return interaction.editReply({
        content: "⚠️ Belirtilen kanal bir metin kanalı değil!",
      });
    }

    if (!channel.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)) {
      return interaction.editReply({
        content: "⚠️ Bu kanala mesaj gönderme yetkim yok!",
      });
    }

    try {
      let content = "";
      if (mention) {
        if (!mention.match(/^<@!?(\d+)>|(\d+)$/)) {
          return interaction.editReply({
            content: "⚠️ Geçersiz etiket formatı! Lütfen bir kullanıcı/rol etiketi veya ID girin.",
          });
        }
        content += mention + " ";
      }

      if (useEmbed) {
        const embed = new EmbedBuilder()
          .setColor(selectedColor)
          .setDescription(message)
          .setFooter({ text: `${interaction.user.tag} tarafından gönderildi` })
          .setTimestamp();

        if (title) embed.setTitle(title);

        await channel.send({ 
          content: content || null,
          embeds: [embed] 
        });
      } else {
        await channel.send(content + message);
      }

      // Kullanım sayısını güncelle
      croxy.set(dbKey, usageCount + 1);

      // 24 saat sonra silinmesi için zamanlayıcı
      setTimeout(() => {
        croxy.delete(dbKey);
      }, 86400000);

      await interaction.editReply({
        content: `✅ Mesaj başarıyla ${channel} kanalına gönderildi. (Renk: ${colorName})\nKalan kullanım hakkınız: ${1 - usageCount}/2`,
      });
    } catch (error) {
      console.error("Mesaj gönderilirken hata:", error);
      await interaction.editReply({
        content: "⚠️ Mesaj gönderilirken bir hata oluştu: " + error.message,
      });
    }
  },
};
