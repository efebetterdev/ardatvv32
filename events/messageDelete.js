const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: Events.MessageDelete,

  run: async (client, message) => {
    try {
    
      if (message.partial) {
        try {
          message = await message.fetch().catch(() => null);
          if (!message) return; 
        } catch (err) {
          if (err.code === 10008) { 
            console.log("Silinen mesaj artık mevcut değil, işlem iptal edildi.");
            return;
          }
          console.log("Kısmi mesaj alınırken hata oluştu:", err);
          return;
        }
      }

      
      if (!message || !message.guild || message.author?.bot || message.system || !message.content) return;

      
      if (db.has(`modlogK_${message.guild.id}`)) {
        const kanal = db.get(`modlogK_${message.guild.id}`);
        if (!kanal) return;

        try {
          const embed = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`Yeni bir mesaj silindi!`)
            .addFields(
              { name: "**Kullanıcı Tag**", value: message.author?.tag || "Bilinmiyor", inline: false },
              { name: "**ID**", value: message.author?.id || "Bilinmiyor", inline: false },
              { name: "**Silinen Mesaj**", value: "```" + (message.content || "Mesaj boştu.") + "```", inline: false },
              { name: "**Silindiği Zaman**", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
              { name: "**Kanal**", value: `<#${message.channel.id}>`, inline: true }
            )
            .setFooter({ 
              text: message.guild.name || "Bilinmeyen Sunucu", 
              iconURL: message.guild.iconURL() || undefined 
            })
            .setTimestamp();

          const logChannel = client.channels.cache.get(kanal);
          if (logChannel) {
            await logChannel.send({ embeds: [embed] }).catch(console.error);
          }
        } catch (err) {
          console.log("Mod log gönderilemedi:", err);
        }
      }

       
      if (message.mentions?.users?.size > 0) {
        const mentionedUsers = message.mentions.users.filter(user => 
          user && !user.bot && user.id !== message.author?.id && !db.get(`etiketKapat_${user.id}`)
        );

        for (const [userId, user] of mentionedUsers) {
          try {
            let messageContent = message.content;
            if (messageContent.length > 2000) {
              messageContent = messageContent.substring(0, 1997) + "...";
            }

            const dmEmbed = new EmbedBuilder()
              .setAuthor({
                name: message.author?.tag || "Bilinmeyen Kullanıcı",
                iconURL: message.author?.displayAvatarURL() || undefined
              })
              .setTitle("Etiketlenip Sonra Silinen Mesaj")
              .setDescription(`${message.author} adlı kullanıcı sizi etiketlediği bir mesajı sildi.`)
              .addFields(
                { name: "📝 Silinen Mesaj", value: messageContent || "*Mesaj boştu*", inline: false },
                { name: "📍 Kanal", value: `<#${message.channel.id}>`, inline: true },
                { name: "🕒 Yazılma Zamanı", value: `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`, inline: true },
                { name: "🗑️ Silinme Zamanı", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
              )
              .setFooter({
                text: message.guild?.name || "Bilinmeyen Sunucu",
                iconURL: message.guild?.iconURL() || undefined
              })
              .setColor("Red")
              .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`etiketBildirimAc_${user.id}`)
                .setLabel("Etiket Bildirimini Aç")
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId(`etiketBildirimKapat_${user.id}`)
                .setLabel("Etiket Bildirimini Kapat")
                .setStyle(ButtonStyle.Danger)
            );

            await user.send({
              embeds: [dmEmbed],
              content: "Etiket bildirimlerinizi bu mesajdan yönetebilirsiniz:",
              components: [row]
            }).catch(() => console.log(`DM gönderilemedi: ${user.tag}`));
          } catch (err) {
            console.log(`DM gönderilirken hata oluştu: ${user?.tag || "Bilinmeyen Kullanıcı"}`, err);
          }
        }
      }
    } catch (error) {
      console.error("MessageDelete eventinde beklenmeyen hata:", error);
    }
  }
};