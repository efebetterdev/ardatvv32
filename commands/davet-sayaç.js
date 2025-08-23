const { Client, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
  name: "invite",
  description: "Davet istatistikleri ve sıralama komutu",
  type: 1,
  options: [
    {
      name: "tip",
      description: "Ne görmek istiyorsunuz?",
      type: 3, // STRING type
      required: true,
      choices: [
        {
          name: "Kullanıcı Davetleri",
          value: "user"
        },
        {
          name: "Toplu Davet Sıralaması",
          value: "top"
        }
      ]
    },
    {
      name: "kullanıcı",
      description: "Davet bilgilerini görmek istediğiniz kullanıcıyı seçin",
      type: 6, // USER type
      required: false,
    },
    {
      name: "limit",
      description: "Toplu listede kaç kişi gösterilsin? (Varsayılan: 10)",
      type: 4, // INTEGER type
      required: false,
      min_value: 1,
      max_value: 1000
    }
  ],

  run: async (client, interaction) => {
    try {
      await interaction.deferReply();
      
      const type = interaction.options.getString("tip");
      const target = interaction.options.getUser("kullanıcı") || interaction.user;
      const limit = interaction.options.getInteger("limit") || 10;

      if (type === "user") {
        // Bireysel kullanıcı istatistikleri
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
          return await interaction.editReply({
            content: "Belirtilen kullanıcı sunucuda bulunamıyor.",
            flags: MessageFlags.Ephemeral
          });
        }

        const invites = await interaction.guild.invites.fetch().catch(() => null);
        if (!invites) {
          return await interaction.editReply({
            content: "Davet bilgileri alınırken bir hata oluştu.",
            flags: MessageFlags.Ephemeral
          });
        }

        const userInvites = invites.filter(invite => invite.inviter?.id === target.id);
        
        let totalInvites = 0;
        let joined = 0;
        let left = 0;
        let fake = 0;

        userInvites.forEach(invite => {
          const uses = invite.uses || 0;
          totalInvites += uses;
          joined += uses;
        });

        // Yeni hesapları tespit et
        const members = await interaction.guild.members.fetch();
        members.forEach(m => {
          const accountAge = Date.now() - m.user.createdTimestamp;
          const isNewAccount = accountAge < 7 * 24 * 60 * 60 * 1000; // 7 günden yeni
          if (userInvites.some(invite => invite.uses && invite.inviter.id === target.id)) {
            if (isNewAccount) fake++;
          }
        });

        // Ayrılanları kontrol et
        try {
          const auditLogs = await interaction.guild.fetchAuditLogs({ type: 20, limit: 100 });
          const leaves = auditLogs.entries.filter(entry => 
            entry.executor?.id === target.id && 
            (Date.now() - entry.createdTimestamp) < 30 * 24 * 60 * 60 * 1000 // 30 gün içinde
          );
          left = leaves.size;
        } catch (e) {
          console.error("Audit log hatası:", e);
          left = 0;
        }

        const validInvites = Math.max(0, joined - left - fake);

        const embed = new EmbedBuilder()
          .setColor("Random")
          .setTitle(`${target.username} - Davet İstatistikleri`)
          .setThumbnail(target.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: "Toplam Davet", value: `${totalInvites}`, inline: true },
            { name: "Giren Üye", value: `${joined}`, inline: true },
            { name: "Ayrılan Üye", value: `${left}`, inline: true },
            { name: "Sahte Hesaplar", value: `${fake}`, inline: true },
            { name: "Geçerli Davet", value: `**${validInvites}**`, inline: true },
            { name: "Davet Linkleri", value: userInvites.size > 0 ? 
              userInvites.map(inv => `[${inv.code}](${inv.url}): ${inv.uses || 0}`).join("\n") : 
              "Bulunamadı", inline: false }
          )
          .setFooter({
            text: `Sordu: ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          });

        await interaction.editReply({ embeds: [embed] });

      } else if (type === "top") {
        // Toplu davet sıralaması
        const invites = await interaction.guild.invites.fetch().catch(() => null);
        if (!invites) {
          return await interaction.editReply({
            content: "Davet bilgileri alınırken bir hata oluştu.",
            flags: MessageFlags.Ephemeral
          });
        }

        // Tüm davet verenleri ve sayılarını topla
        const inviteData = {};
        invites.forEach(invite => {
          if (!invite.inviter) return;
          if (!inviteData[invite.inviter.id]) {
            inviteData[invite.inviter.id] = {
              user: invite.inviter,
              total: 0,
              invites: new Set() // Benzersiz davet kodları
            };
          }
          inviteData[invite.inviter.id].total += invite.uses || 0;
          inviteData[invite.inviter.id].invites.add(invite.code);
        });

        // Sıralama yap
        const sorted = Object.values(inviteData)
          .sort((a, b) => b.total - a.total)
          .slice(0, limit);

        if (sorted.length === 0) {
          return await interaction.editReply({
            content: "Hiç davet verisi bulunamadı.",
            flags: MessageFlags.Ephemeral
          });
        }

        const embed = new EmbedBuilder()
          .setColor("Random")
          .setTitle(`${interaction.guild.name} - Top ${limit} Davet Sıralaması`)
          .setDescription("En çok üye davet eden kullanıcılar")
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

        sorted.forEach((data, index) => {
          embed.addFields({
            name: `${index + 1}. ${data.user.tag}`,
            value: `Toplam: **${data.total}** davet\nLinkler: ${data.invites.size} farklı davet linki`,
            inline: false
          });
        });

        embed.setFooter({
          text: `Toplam ${invites.size} davet linki tespit edildi`,
        });

        await interaction.editReply({ embeds: [embed] });
      }

    } catch (error) {
      console.error("Davet komutu hatası:", error);
      await interaction.editReply({
        content: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        flags: MessageFlags.Ephemeral
      });
    }
  },
};