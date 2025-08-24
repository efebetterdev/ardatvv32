const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");
const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");

module.exports = {
  name: "guildMemberAdd",
  run: async (client, member) => {
    const guild = member.guild;
    const guildId = guild.id;

    try {
      /** =======================
       * HOŞGELDİN / DAVET / SAYAC
       * ======================= */
      const hgbb = db.get(`hgbb_${guildId}`);
      const sayacMessage = db.get(`sayacmessage_${guildId}`);
      const memberCount = guild.memberCount.toLocaleString();

      let inviter = null;
      let inviteCode = null;
      let totalInvites = 0;

      const guildMe = await guild.members.fetchMe();
      if (!guildMe.permissions.has(PermissionsBitField.Flags.ManageGuild)) return;

      const oldInvites = db.get(`invites_${guildId}`) || {};
      const newInvites = await guild.invites.fetch().catch(() => null);
      if (!newInvites) return;

      for (const [code, invite] of newInvites) {
        const oldUses = oldInvites[code]?.uses || 0;
        if (invite.uses > oldUses) {
          inviter = invite.inviter;
          inviteCode = code;
          break;
        }
      }

     
      const updatedInvites = {};
      newInvites.forEach((invite) => {
        updatedInvites[invite.code] = {
          uses: invite.uses,
          inviter: invite.inviter?.id,
        };
      });
      db.set(`invites_${guildId}`, updatedInvites);

      if (inviter) {
        totalInvites = [...newInvites.values()]
          .filter((i) => i.inviter?.id === inviter.id)
          .reduce((sum, i) => sum + (i.uses || 0), 0);
      }

      const channel = hgbb?.channel && guild.channels.cache.get(hgbb.channel);
      if (channel?.isTextBased()) {
        const tagUser = `<@${member.user.id}>`;
        const tagInviter = inviter ? `<@${inviter.id}>` : "Bilinmiyor";

        const msgText = sayacMessage?.joinMsg
          ?.replace("{member}", tagUser)
          ?.replace("{guild.memberCount}", memberCount)
          ?.replace("{guild.name}", guild.name)
          ?.replace("{owner.name}", `<@${guild.ownerId}>`)
          ?.replace("{inviter}", tagInviter)
          ?.replace("{inviteCount}", `${totalInvites}`);

        const embed = new EmbedBuilder()
          .setColor("#57F287")
          .setAuthor({
            name: `${member.user.username} aramıza katıldı!`,
            iconURL: member.user.displayAvatarURL({ dynamic: true }),
            url: `https://discord.com/users/${member.user.id}`,
          })
          .setDescription(
            msgText ||
              `${tagUser} **${guild.name}** sunucusuna hoş geldin!\n\n💎 Seninle birlikte **${memberCount}** üyeye ulaştık!\n**Davet Eden:** ${tagInviter}`
          )
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setImage("https://hizliresim.com/3ieu447")
          .addFields(
            {
              name: "📆 Hesap Oluşturulma",
              value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
              inline: true,
            },
            {
              name: "🎯 Katılma Sırası",
              value: `#${guild.memberCount}`,
              inline: true,
            },
            {
              name: "🤖 Bot Mu?",
              value: member.user.bot ? "Evet" : "Hayır",
              inline: true,
            },
            {
              name: "📨 Toplam Davet",
              value: `${totalInvites}`,
              inline: true,
            }
          )
          .setFooter({
            text: `${guild.name} • ${moment().format("DD MMMM YYYY")}`,
            iconURL: guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
          })
          .setTimestamp();

        await channel.send({ content: tagUser, embeds: [embed] });
      }

      /** ================
       * OTO TAG SİSTEMİ
       * ================ */
      const tag = db.get(`ototag_${guildId}`);
      if (tag) {
        try {
          const newNickname = `${tag} | ${member.displayName}`.substring(0, 32);
          await member.setNickname(newNickname);
        } catch (err) {
          console.error("Kullanıcı adı değiştirilirken hata oluştu:", err);
        }
      }

      /** ================
       * OTO ROL SİSTEMİ
       * ================ */
      const acc = member.user.bot ? db.get(`botrol_${guildId}`) : db.get(`otorol_${guildId}`);
      if (acc) {
        try {
          const role = member.guild.roles.cache.get(acc);
          const botMember = await member.guild.members.fetch(client.user.id);

          if (
            !role ||
            !botMember.permissions.has(PermissionsBitField.Flags.ManageRoles) ||
            role.position >= botMember.roles.highest.position
          ) {
            console.log("Botun rol atama yetkisi yok veya rol pozisyonu uygun değil.");
          } else {
            await member.roles.add(role);

            const roleLogChannel = db.get(`roleLogChannel_${guildId}`);
            if (roleLogChannel) {
              const logChannel = member.guild.channels.cache.get(roleLogChannel);
              if (logChannel) {
                const embed = new EmbedBuilder()
                  .setTitle("Yeni Rol Eklendi! 🔑")
                  .setDescription(`**${member.user.tag}** adlı üyeye ${role} rolü verildi! 🎯`)
                  .setColor("#FFD700")
                  .setFooter({
                    text: "Rol Verildi",
                    iconURL: member.user.displayAvatarURL({ dynamic: true }),
                  })
                  .setTimestamp();

                await logChannel.send({ embeds: [embed] });
              }
            }
          }
        } catch (err) {
          console.error("Rol eklenirken hata oluştu:", err);
        }
      }

      /** =======================
       * HESAP KORUMA SİSTEMİ
       * ======================= */
      const hesapKoruma1 = db.get(`hesapkoruma1_${guildId}`);
      const hesapkorumaSystem = db.get(`hesapkoruma_${guildId}`);
      if (hesapKoruma1 && hesapkorumaSystem) {
        const logChannel = member.guild.channels.cache.get(hesapKoruma1.channel);
        const isRisky = new Date().getTime() - member.user.createdAt.getTime() < 1296000000; // 15 gün
        if (isRisky) {
          try {
            await member.ban({ reason: "Yeni riskli hesap ⛔" });
            if (logChannel) {
              const embed = new EmbedBuilder()
                .setDescription(
                  `<a:uyari:1225959324426174475>  | **${member.user.tag}**, Hesabı yeni olduğu için sunucudan yasaklandı! ⛔`
                )
                .setColor("#FEE75C")
                .setFooter({
                  text: member.user.tag,
                  iconURL: member.user.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp();

              await logChannel.send({ embeds: [embed] });
            }
          } catch (err) {
            console.error("Hesap koruma sırasında hata oluştu:", err);
          }
        }
      }

      /** ================
       * SAYAC SİSTEMİ
       * ================ */
      const sayac = db.get(`sayac_${guildId}`);
      if (sayac && sayac.sayi && sayac.kanal) {
        const kalan = sayac.sayi - guild.memberCount || 0;
        const kanal = client.channels.cache.get(sayac.kanal);
        if (kanal) {
          await kanal.send(
            `Hoşgeldin **${member.user.tag}**! Seninle beraber **${guild.memberCount}** kişi olduk! \n **${sayac.sayi}** kişiye ulaşmamıza sadece **${kalan}** kişi kaldı!`
          );
        }
      }
    } catch (error) {
      console.error("guildMemberAdd eventinde beklenmeyen hata:", error);
    }
  },
};
