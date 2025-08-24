const { Events, ChannelType, PermissionsBitField } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

const userVoiceJoinTimes = {};

module.exports = {
  name: Events.VoiceStateUpdate,

  run: async (client, oldState, newState) => {
    const guildId = newState.guild.id;
    const userId = newState.member?.id;
    const member = newState.member;

    if (!db.get(`ozelodasistemi_${guildId}`)) return;

    const sohbetSesKanalId = db.get(`ozelodasistemi_${guildId}`);
    const ozelOdaKategoriId = db.get(`ozelOdaSystemCategory_${guildId}`)?.category;

    
    if (
      newState.channelId === sohbetSesKanalId &&
      oldState.channelId !== sohbetSesKanalId &&
      member &&
      !member.user.bot
    ) {
      const odaIsim = `║👤 ${member.displayName}`.slice(0, 100);

      const ozelOda = await newState.guild.channels.create({
        name: odaIsim,
        type: ChannelType.GuildVoice,
        parent: ozelOdaKategoriId || null,
        permissionOverwrites: [
          {
            id: newState.guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: member.id,
            allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });

      await db.set(`oda_${member.id}_${guildId}`, ozelOda.id);
      await newState.setChannel(ozelOda);
    }

    
    if (newState.channel && !member.user.bot) {
      userVoiceJoinTimes[userId] = Date.now();
    }

 
    if (!newState.channel && oldState.channel && !member.user.bot) {
      const joinTime = userVoiceJoinTimes[userId];
      if (joinTime) {
        const durationMs = Date.now() - joinTime;
        const xpToAdd = Math.floor(durationMs / 60000) * config.sesXp;

        if (xpToAdd > 0) {
          db.add(`xpPos_${userId}_${guildId}`, xpToAdd);
        }
        delete userVoiceJoinTimes[userId];
      }
    }


    const isOldPrivateRoom = Object.values(db.all()).find((entry) => {
      return (
        entry.ID.startsWith("oda_") &&
        entry.data === oldState.channelId
      );
    });

    if (isOldPrivateRoom && oldState.channel?.members.size === 0) {
      try {
        await oldState.channel.delete();
        db.delete(`oda_${member.id}_${guildId}`);
      } catch (err) {
        console.error("Kanal silinirken hata:", err);
      }
    }
  },
};
