const { ActivityType, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
  name: 'ready',
  once: true,

  run: async (client) => {
    console.log(`${client.user.tag} Aktif! 💕`);

    client.user.setPresence({
      activities: [{ name: "/Yardım", type: ActivityType.Custom }], 
      status: 'online', 
    });

    try {
      
      const botStartTime = Date.now();
      db.set('botAcilis_', botStartTime);


      const activities = [
        { name: "/yardım", type: ActivityType.Playing },
        { name: "Gelişmiş Güvenlik Sistemleriyle Sunucunu Güvene Al", type: ActivityType.Playing },
        { name: "Moderasyon Sistemleriyle Sunucunu Kolay Yönet", type: ActivityType.Playing },
        { name: "Coded By Efe Better Dev", type: ActivityType.Playing },
        { name: "Vds sponsorluk aranıyor efebetter.dev", type: ActivityType.Playing },
        { name: "Vds olmadıgı için 7/24 aktif degil bot ", type: ActivityType.Playing },
        // { name: "Twitch", type: ActivityType.Streaming, url: "https://www.twitch.tv/blewys_" },
      ];

      
      const setRandomActivity = () => {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        client.user.setPresence({ activities: [activity], status: 'online' });
      };

  
      const updateActivityWithCounts = () => {
        const guildCount = client.guilds.cache.size;
        const memberCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const currentActivity = { name: `Sunucu: ${guildCount} | Üye: ${memberCount}`, type: ActivityType.Playing };
        client.user.setPresence({ activities: [currentActivity], status: 'online' });
      };

     
      setRandomActivity();
      setInterval(() => {
        Math.random() < 0.5 ? setRandomActivity() : updateActivityWithCounts();
      }, 10000); 

      
      const channelId = '1276899166701752320';

      const channel = await client.channels.fetch(channelId);

      if (!channel) {
        console.error("Kanal bulunamadı.");
        return;
      }

     
      const startDate = new Date(botStartTime);
      const formattedDate = startDate.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', hour12: false });

     
      const startupEmbed = new EmbedBuilder()
        .setTitle(":tada: Bot Aktif :tada:")
        .setDescription(`**Bot başarıyla aktif oldu!**\n\nHerhangi bir yardım için /yardım komutunu kullanabilirsiniz.\nAktif olduğu tarih ve saat: **${formattedDate}**\nToplam Sunucu: ${client.guilds.cache.size}\nToplam Üye: ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`)
        .setColor("#00FF00")
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: 'Bot tarafından gönderildi', iconURL: client.user.displayAvatarURL() });

      await channel.send({ embeds: [startupEmbed] });


    } catch (error) {
      console.error("Bot hazır olurken bir hata oluştu:", error);

      
      const errorChannelId = '1276899166701752320'; 
      const errorChannel = await client.channels.fetch(errorChannelId);

      if (errorChannel) {
        const errorEmbed = new EmbedBuilder()
          .setTitle("❌ Hata")
          .setDescription(`Bot başlama mesajı gönderilirken bir hata oluştu:\n\`${error.message}\``)
          .setColor("Red")
          .setTimestamp();

        await errorChannel.send({ embeds: [errorEmbed] });
      }
    }
  }
};
