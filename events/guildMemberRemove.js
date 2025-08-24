const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");
const moment = require("moment");
require("moment-duration-format");

module.exports = {
    name: "guildMemberRemove",
    run: async (client, member) => {
        try {
         
            const hgbb1 = db.fetch(`hgbb1_${member.guild.id}`);
            if (!hgbb1 || !hgbb1.channel) {
                return;
            }
            
            const kanal = member.guild.channels.cache.get(hgbb1.channel);
            if (!kanal || !kanal.isTextBased()) {
                console.error(`Kanal bulunamadı veya metin kanalı değil: ${hgbb1.channel}`);
                return;
            }

            if (!kanal.permissionsFor(client.user).has(["SendMessages", "EmbedLinks"])) {
                console.error(`Botun kanalda mesaj gönderme yetkisi yok: ${kanal.id}`);
                return;
            }

         
            const inviterId = db.fetch(`inviter_${member.id}_${member.guild.id}`);
            let inviterData = {
                tag: "Bilinmiyor",
                id: null,
                remainingInvites: 0
            };
            
            if (inviterId) {
                const inviter = await client.users.fetch(inviterId).catch(() => null);
                inviterData.tag = inviter ? inviter.tag : `ID: ${inviterId}`;
                inviterData.id = inviterId;
                
                let totalInvites = db.fetch(`inviteCount_${inviterId}_${member.guild.id}`) || 0;
                inviterData.remainingInvites = Math.max(totalInvites - 1, 0);
                db.set(`inviteCount_${inviterId}_${member.guild.id}`, inviterData.remainingInvites);
                
                if (member.user.bot) {
                    inviterData.tag += " (Bot)";
                }
            }

            const joinDate = moment(member.joinedAt);
            const membershipDuration = moment.duration(moment().diff(joinDate));
            const formattedDuration = membershipDuration.format("y [yıl], M [ay], d [gün], h [saat], m [dakika]");

            
            const roles = member.roles.cache
                .filter(role => role.id !== member.guild.id) 
                .sort((a, b) => b.position - a.position)
                .first(5)
                .map(role => role.toString());

           
            const ayrilmaEmbed = new EmbedBuilder()
                .setColor("#FF4D4D")
                .setAuthor({ 
                    name: `${member.user.tag} sunucudan ayrıldı`, 
                    iconURL: member.user.displayAvatarURL({ dynamic: true, size: 256 }) 
                })
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .setImage("https://hizliresim.com/3ieu447") 
                .addFields(
                    { 
                        name: "📊 Üye Bilgileri", 
                        value: [
                            `• Hesap Oluşturma: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                            `• Katılma Tarihi: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                            `• Üyelik Süresi: ${formattedDuration}`,
                            `• Bot: ${member.user.bot ? "✅" : "❌"}`,
                            `• ID: \`${member.id}\``
                        ].join("\n"),
                        inline: true
                    },
                    { 
                        name: "📌 Sunucu Bilgileri", 
                        value: [
                            `• Toplam Üye: ${member.guild.memberCount}`,
                            `• Sunucu Sahibi: <@${member.guild.ownerId}>`,
                            `• Roller (${roles.length}): ${roles.join(", ") || "Yok"}`
                        ].join("\n"),
                        inline: true
                    },
                    {
                        name: "🎟️ Davet Bilgileri",
                        value: [
                            `• Davet Eden: ${inviterData.tag}`,
                            `• Kalan Davetler: ${inviterData.remainingInvites}`,
                            `• Davet Eden ID: ${inviterData.id ? `\`${inviterData.id}\`` : "Bilinmiyor"}`
                        ].join("\n")
                    }
                )
                .setFooter({ 
                    text: `${member.guild.name} • ${new Date().getFullYear()}`, 
                    iconURL: member.guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL()
                })
                .setTimestamp();

            
            await kanal.send({ 
                content: `👋 ${member.user.tag} (\`${member.id}\`) sunucudan ayrıldı!`, 
                embeds: [ayrilmaEmbed] 
            });

        } catch (err) {
            console.error(`[MEMBER_LEAVE_ERROR] Sunucu: ${member.guild.id} - Üye: ${member.id} - Hata:`, err);
            
            
            const hgbb1 = db.fetch(`hgbb1_${member.guild.id}`);
            if (hgbb1?.channel) {
                const kanal = member.guild.channels.cache.get(hgbb1.channel);
                if (kanal && kanal.isTextBased()) {
                    await kanal.send({
                        content: `⚠️ **${member.user.tag}** sunucudan ayrıldı, ancak ayrıntılı bilgi gösterilirken bir hata oluştu.`
                    }).catch(console.error);
                }
            }
        }
    }
};


client.on('guildMemberRemove', async member => {
  const sayac = db.fetch(`sayac_${member.guild.id}`);
  if (!sayac || !sayac.sayi || !sayac.kanal) return;

  const kalan = sayac.sayi - member.guild.memberCount || 0;
  const kanal = client.channels.cache.get(sayac.kanal);
  if (!kanal) return;

  try {
    await kanal.send(`Güle güle <@${member.id}>! Sensiz şimdi **${member.guild.memberCount}** kişiyiz... \n **${sayac.sayi}** kişiye ulaşmamıza **${kalan}** kişi kaldı!`);
  } catch (error) {
    console.error(`Mesaj gönderilemedi: ${error}`);
  }
});
