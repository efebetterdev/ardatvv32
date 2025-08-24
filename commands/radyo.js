const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createAudioPlayer, createAudioResource, joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  name: "radyo",
  description: "Radyo dinle veya durdur!",
  type: 1,

  run: async (client, interaction) => {
    const channel = interaction.member.voice.channel;
    if (!channel) return interaction.reply({ content: "Bir sesli kanala katılmalısınız!", ephemeral: true });

    const radioStations = {
      "seymen": " ",
      "kralpop": " ",
      "extra": " ",
      "alem": " ",
      "slowturk": " ",
      "show": " ",
      "turkiyemfm": " ",
      "turkuvaz": " ",
      "ankara": " ",
      "kralfm": " ",
      "efkar": " ",
      "turkfm": " ",
      "powerturk": " "
    };

    const embed = new EmbedBuilder()
      .setTitle("🎧 Mükemmel Radyo Deneyimi")
      .setDescription("Aşağıdan istediğiniz radyoyu seçebilirsiniz!")
      .setColor("Blue")
      .setThumbnail("https://cdn.akakce.com/z/nns/nns-ns-8070bt-tasinabilir-nostaljik-bluetooth-hoparlor-usb.jpg");

    // Butonlar satırı
    const buttons1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("kralpop").setLabel("👑 Kral Pop").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("extra").setLabel("📻 Radyo Extra").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("alem").setLabel("🎵 Radyo alem").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("slowturk").setLabel("🎶 Slow Türk").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("turkiyemfm").setLabel("🎧 turkiyemfm").setStyle(ButtonStyle.Danger)
    );

    // Diğer buton satırları
    const buttons2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("show").setLabel("😎 Show Radyo").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("turkuvaz").setLabel("📡 Radyo Turkuvaz").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("seymen").setLabel("🎵 Radyo Seymen").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("ankara").setLabel("🏛️ Ankara Radyo").setStyle(ButtonStyle.Primary)
    );

    const buttons3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("kralfm").setLabel("🎤 Kral FM").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("turkfm").setLabel("📻 Türk FM").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("powerturk").setLabel("⚡ Power Türk").setStyle(ButtonStyle.Primary)
    );

    const buttons4 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("efkar").setLabel("🎶 Efkar Radyo").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("durdur").setLabel("🛑 Durdur").setStyle(ButtonStyle.Danger)
    );

    // Yanıtı zamanında gönderme
    try {
      await interaction.deferReply({ ephemeral: false });
      await interaction.editReply({ embeds: [embed], components: [buttons1, buttons2, buttons3, buttons4] });
    } catch (e) {
      console.error('Yanıt verme hatası:', e);
      return interaction.reply({ content: "Etkileşimde bir hata oluştu!", ephemeral: true });
    }

    // Etkileşim toplayıcı
    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 900000 });

    collector.on('collect', async (i) => {
      try {
        // Etkileşimin önceden yanıtlanıp yanıtlanmadığını kontrol et
        if (i.replied || !i.isButton()) return;

        if (!i.member.voice.channel) return i.reply({ content: "Bir sesli kanala katılmalısınız!", ephemeral: true });

        const connection = joinVoiceChannel({
          channelId: i.member.voice.channel.id,
          guildId: i.guild.id,
          adapterCreator: i.guild.voiceAdapterCreator,
        });

        if (i.customId === "durdur") {
          const existingConnection = getVoiceConnection(i.guild.id);
          if (existingConnection) {
            existingConnection.destroy();
            return i.update({ content: "🔇 Radyo durduruldu.", components: [] });
          }
          return;
        }

        const resource = createAudioResource(radioStations[i.customId]);
        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);

        // Etkileşimi güncelle
        await i.update({ content: `📻 **Şu an çalan radyo:** ${i.customId}`, components: [buttons1, buttons2, buttons3, buttons4] });
      } catch (e) {
        console.error('Etkileşimde bir hata oluştu:', e);
        return i.reply({ content: "Bir hata oluştu, lütfen tekrar deneyin.", ephemeral: true });
      }
    });
  }
};
