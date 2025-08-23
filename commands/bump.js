const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "bump",
  description: "Sunucunuzu otomatik tanıtın!",
  type: 1,

  run: async (client, interaction) => {
    try {
      // Tanıtım kanalı kontrolü
      const guildId = interaction.guild.id;
      const tanıtımKanalId = db.get(`tanıtChannel_${guildId}`);
      if (!tanıtımKanalId) {
        return await interaction.reply({
          content: "<a:carpi:1227670096462221363> | Tanıtım kanalı ayarlanmamış! Lütfen önce `/Bump-kanal-ayarla` komutu ile tanıtım kanalını ayarlayın.",
          ephemeral: true
        });
      }

      // Yetki kontrolü
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return await interaction.reply({
          content: "<a:carpi:1227670096462221363> | Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!",
          ephemeral: true
        });
      }

      // Cooldown kontrolü
      const userId = interaction.user.id;
      const cooldownKey = `bumpCooldown_${guildId}_${userId}`;
      const cooldown = db.get(cooldownKey);
      const now = Date.now();
      const waitTime = 3600000; // 1 saat

      if (cooldown && now - cooldown < waitTime) {
        const remaining = waitTime - (now - cooldown);
        const minutes = Math.ceil(remaining / 60000);
        return await interaction.reply({
          content: `<@${userId}> **${minutes} dakika sonra** tekrar deneyin.`,
          ephemeral: true
        });
      }

      await interaction.deferReply({ ephemeral: true });
      db.set(cooldownKey, now);

      // Sunucu bilgilerini al
      const currentGuild = await interaction.guild.fetch();
      const currentGuildIcon = currentGuild.iconURL({ dynamic: true }) || "https://cdn.discordapp.com/embed/avatars/0.png";
      const currentGuildName = currentGuild.name;
      
      // Daha güvenilir davet linki oluşturma
      let inviteLink = await createInvite(interaction.guild);
      
      const guildDescription = currentGuild.description || `${currentGuildName} ile Discord Topluluğunuzu Uçurun!`;

      // Kuruluş tarihi hesaplama
      const createdDate = new Date(currentGuild.createdTimestamp);
      const nowDate = new Date();
      const yearsDiff = nowDate.getFullYear() - createdDate.getFullYear();

      // Butonları oluştur
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Sunucuya Git')
            .setURL(inviteLink)
            .setEmoji('<:reklam:1378369360363655229>')
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel('Botu Ekle')
            .setURL('https://discord.com/oauth2/authorize?client_id=1245719534200033446&permissions=8&scope=bot%20applications.commands')
            .setEmoji('<:bot:1378669863735660584>')
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel('Destek Sunucusu')
            .setURL('https://discord.gg/nMeEdX7KuY')
             .setEmoji('<:Discord_Link81:1378369406798794832>')
            .setStyle(ButtonStyle.Link)
        );

      // Embed oluştur (davet linki artık sadece butonda ve embed footer'ında)
      const embed = new EmbedBuilder()
        .setAuthor({ name: currentGuildName, iconURL: currentGuildIcon })
        .setColor("#f1c40f")
        .setThumbnail(currentGuildIcon)
        .setDescription(
          `**<:zil:1392409783373660252> Öne Çıkaran:**\n<@${interaction.user.id}> \`(${interaction.user.id})\`\n\n` +
          `**<:tac:1392410061254693008>  Sunucu Sahibi:**\n<@${currentGuild.ownerId}> \`(${currentGuild.ownerId})\`\n\n` +
          `**<:api:1384833335314092116> Bir Sonraki Öne Çıkartma:**\n1 saat sonra\n\n` +
          `**<:partner:1285292615956168724>  Sunucu Açıklaması:**\n${guildDescription}\n\n` +
          `**<a:bumkedi:1274003024897114122> Üye Sayısı:**\n${currentGuild.memberCount}\n\n` +
          `**<:news:1382677125986779198>  Kuruluş Tarihi:**\n${yearsDiff} yıl önce (${createdDate.toLocaleDateString()})`
        )
        .setFooter({ text: "Sunucuya katılmak için aşağıdaki butona tıklayın!" })
        .setImage("https://cdn.discordapp.com/avatars/1245719534200033446/bff7fafb5aecf4dec0c6b8f45fc3713a.webp");

      // Tüm sunuculara gönder
      const allGuilds = client.guilds.cache;
      let sentCount = 0;
      let errorCount = 0;

      for (const [guildId, guild] of allGuilds) {
        const tanıtımKanalId = db.get(`tanıtChannel_${guildId}`);
        if (!tanıtımKanalId) continue;

        const channel = guild.channels.cache.get(tanıtımKanalId);
        if (!channel) continue;

        try {
          await channel.send({ 
            embeds: [embed],
            components: [row]
          });
          sentCount++;
        } catch (err) {
          console.error(`❌ ${guild.name} sunucusuna gönderilemedi.`, err);
          errorCount++;
        }
      }

      await interaction.editReply({
        content: ` Tanıtım başarıyla ${sentCount} sunucuya gönderildi! ${errorCount > 0 ? `(${errorCount} sunucuya gönderilemedi)` : ''}`,
      });

    } catch (error) {
      console.error("Bump komutunda hata:", error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Bump gönderilirken bir hata oluştu!",
          ephemeral: true
        });
      } else {
        await interaction.editReply({
          content: "❌ Bump gönderilirken bir hata oluştu!",
        });
      }
    }
  }
};

async function createInvite(guild) {
  try {
    // Önce vanity URL kontrolü
    if (guild.vanityURLCode) {
      return `https://discord.gg/${guild.vanityURLCode}`;
    }

    // Mevcut davetleri kontrol et
    const invites = await guild.invites.fetch();
    if (invites.size > 0) {
      const validInvite = invites.find(inv => inv.maxUses === 0 || inv.maxAge === 0);
      if (validInvite) {
        return `https://discord.gg/${validInvite.code}`;
      }
      return `https://discord.gg/${invites.first().code}`;
    }

    // Yeni davet oluştur
    const channel = guild.channels.cache.find(ch => 
      ch.isTextBased() && 
      ch.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.CreateInstantInvite)
    );
    
    if (channel) {
      const newInvite = await channel.createInvite({ 
        maxAge: 0, // Süresiz
        maxUses: 0 // Limitsiz
      });
      return `https://discord.gg/${newInvite.code}`;
    }

    // Fallback
    return "https://discord.gg";
  } catch (error) {
    console.error("Davet oluşturma hatası:", error);
    return "https://discord.gg";
  }
}