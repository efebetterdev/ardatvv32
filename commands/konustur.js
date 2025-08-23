const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const googleTTS = require('google-tts-api');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus, 
  VoiceConnectionStatus, 
  entersState, 
  StreamType 
} = require('@discordjs/voice');
const fetch = require('node-fetch');
const { PassThrough } = require('stream');

const queueMap = new Map();

module.exports = {
  name: "konus",
  description: "Metni sesli kanalda söyler.",
  options: [
    {
      name: 'metin',
      description: 'Seslendirmek istediğiniz metin',
      type: 3,
      required: true
    }
  ],

  run: async (client, interaction) => {
    const metin = interaction.options.getString('metin');
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ 
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription('<a:carpi:1227670096462221363>  Sesli bir kanalda olmanız gerekiyor!')
        ],
        ephemeral: true 
      });
    }

    if (metin.length > 200) {
      return interaction.reply({ 
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription('<a:carpi:1227670096462221363>  Metin 200 karakterden uzun olamaz!')
        ],
        ephemeral: true 
      });
    }

    if (!queueMap.has(interaction.guild.id)) {
      queueMap.set(interaction.guild.id, {
        queue: [],
        playing: false,
        connection: null,
        player: createAudioPlayer()
      });
    }

    const serverQueue = queueMap.get(interaction.guild.id);
    serverQueue.queue.push(metin);

    try {
      if (!serverQueue.connection) {
        serverQueue.connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        serverQueue.connection.subscribe(serverQueue.player);

        serverQueue.connection.on(VoiceConnectionStatus.Disconnected, async () => {
          try {
            await Promise.race([
              entersState(serverQueue.connection, VoiceConnectionStatus.Signalling, 5_000),
              entersState(serverQueue.connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
          } catch (error) {
            if (serverQueue.connection.state.status !== VoiceConnectionStatus.Destroyed) {
              serverQueue.connection.destroy();
            }
            queueMap.delete(interaction.guild.id);
          }
        });
      }

      if (!serverQueue.playing) {
        playNextInQueue(interaction.guild.id);
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Ses Kanında Okunacak Metin')
        .setDescription(`Bana yazdığın cümleyi ses kanalına okuyorum:\n\n${metin}`)
        .setFooter({ text: `Talep eden: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Hata:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('<a:carpi:1227670096462221363>  Bir hata oluştu, lütfen daha sonra tekrar deneyin.');
      
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};

async function playNextInQueue(guildId) {
  const serverQueue = queueMap.get(guildId);

  if (!serverQueue || serverQueue.queue.length === 0) {
    if (serverQueue) {
      serverQueue.playing = false;

      setTimeout(() => {
        if (
          serverQueue.queue.length === 0 && 
          serverQueue.connection &&
          serverQueue.connection.state.status !== VoiceConnectionStatus.Destroyed
        ) {
          try {
            serverQueue.connection.destroy();
          } catch (e) {
            console.warn("Bağlantı zaten yok edilmiş:", e.message);
          }
          queueMap.delete(guildId);
        }
      }, 300000); // 5 dakika
    }
    return;
  }

  serverQueue.playing = true;
  const metin = serverQueue.queue.shift();

  try {
    const url = googleTTS.getAudioUrl(metin, {
      lang: 'tr',
      slow: false,
      host: 'https://translate.google.com',
    });

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const audioStream = new PassThrough();
    response.body.pipe(audioStream);

    const resource = createAudioResource(audioStream, {
      inputType: StreamType.Arbitrary,
    });

    serverQueue.player.play(resource);

    serverQueue.player.once(AudioPlayerStatus.Idle, () => {
      playNextInQueue(guildId);
    });

    serverQueue.player.once('error', error => {
      console.error('Ses oynatıcı hatası:', error);
      playNextInQueue(guildId);
    });

  } catch (error) {
    console.error('Ses oluşturma hatası:', error);
    playNextInQueue(guildId);
  }
}
