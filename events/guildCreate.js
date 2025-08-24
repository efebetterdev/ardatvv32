const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
} = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: Events.GuildCreate,

  run: async (client, guild) => {
    const kanal = config["log"];

    try {
      
      const fetchedGuild = await guild.fetch();
      const owner = await fetchedGuild.fetchOwner();

      // === 1. LOG MESAJI SUNUCUYA EKLENME ===
      const embed = new EmbedBuilder()
        .setDescription(`**Bir Sunucuya Eklendim!**
> **Sunucu İsmi:** ${guild.name}
> **Sunucu ID:** ${guild.id} 
> **Kurucu:** ${owner.user.tag}
> **Kurucu ID:** ${owner.id}
> **Üye Sayısı:** ${guild.memberCount}
> **Toplam Sunucu:** ${client.guilds.cache.size}`)
        .setColor("#2B2D31");

      const channel = client.channels.cache.get(kanal);
      if (channel) {
        channel.send({ embeds: [embed] }).catch(error =>
          console.error("Log mesajı gönderilemedi:", error)
        );
      } else {
        console.error(`Log kanalı bulunamadı: ${kanal}`);
      }

      // === 2. DM MESAJI SUNUCU SAHİBİNE ===
      const dmEmbed = new EmbedBuilder()
        .setTitle(`✅ ${client.user.username} Hizmete Hazır!`)
        .setDescription(
          `Selam, beni **${guild.name}** adlı sunucuya ekledin!\n\nHerhangi bir konuda destek almak istersen, aşağıdaki butona tıklayarak destek sunucumuza ulaşabilirsin.\n\n> Bu mesajı sadece sen alıyorsun çünkü sunucu sahibisin. Seviliyorsun, byy :)`
        )
        .setImage(
          "https://cdn.discordapp.com/avatars/1245719534200033446/d9d9ec2479b48809e5c347b6f6b39994.webp?size=1024"
        )
        .setColor("#2B2D31");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("🎉 Destek Sunucusu")
          .setStyle(ButtonStyle.Link)
          .setURL("https://discord.gg/nMeEdX7KuY")
      );

      await owner.user
        .send({ embeds: [dmEmbed], components: [row] })
        .catch(err => {
          console.warn(
            `[${client.user.username}] DM gönderilemedi: ${owner.user.tag}`
          );
          console.error("DM Hatası:", err);
        });

    } catch (error) {
      console.error(`[${client.user.username}] guildCreate sırasında genel hata:`, error);
    }
  },
};
