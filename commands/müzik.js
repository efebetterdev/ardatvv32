const { Client, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const axios = require('axios');
const ytdl = require('@distube/ytdl-core');

const YOUTUBE_API_KEY = 'AIzaSyBpkhsQDNCvqm0hpxlai9IYoPZF3YnpUEk';
const SEARCH_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
const PLAYLIST_BASE_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';
const VIDEO_DETAILS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const queue = new Map();

let opusAvailable = true;
try {
    require('@discordjs/opus');
} catch (error) {
    console.warn('Uyarı: @discordjs/opus bulunamadı, opusscript kullanılıyor.');
    opusAvailable = false;
    require('opusscript');
}

async function getRelatedVideos(videoId) {
    try {
        const videoDetails = await getVideoDetails(videoId);
        if (!videoDetails) {
            console.error('Video detayları alınamadı.');
            return [];
        }

        const videoTitle = videoDetails.snippet.title;
        const channelTitle = videoDetails.snippet.channelTitle || '';
        const searchQuery = `${videoTitle} ${channelTitle}`.trim();

        const response = await axios.get(SEARCH_BASE_URL, {
            params: {
                part: 'snippet',
                q: searchQuery,
                type: 'video',
                key: YOUTUBE_API_KEY,
                maxResults: 10
            }
        });

        const relatedVideos = response.data.items
            .filter(item => item.id.videoId && item.id.videoId !== videoId)
            .slice(0, 5);

        if (relatedVideos.length === 0) {
            console.warn('İlgili videolar bulunamadı, daha geniş arama deneniyor.');
            const fallbackResponse = await axios.get(SEARCH_BASE_URL, {
                params: {
                    part: 'snippet',
                    q: videoTitle.split(' ').slice(0, 3).join(' '),
                    type: 'video',
                    key: YOUTUBE_API_KEY,
                    maxResults: 5
                }
            });
            return fallbackResponse.data.items
                .filter(item => item.id.videoId && item.id.videoId !== videoId)
                .slice(0, 5);
        }

        return relatedVideos;
    } catch (error) {
        console.error('İlgili videolar alınırken hata:', error.message);
        if (error.response) console.error('Hata detayları:', error.response.data);
        return [];
    }
}

async function getPlaylistVideos(playlistId) {
    try {
        let videos = [];
        let nextPageToken = null;

        do {
            const response = await axios.get(PLAYLIST_BASE_URL, {
                params: {
                    part: 'snippet',
                    playlistId: playlistId,
                    key: YOUTUBE_API_KEY,
                    maxResults: 50,
                    pageToken: nextPageToken
                }
            });
            videos = videos.concat(response.data.items);
            nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);

        return videos;
    } catch (error) {
        console.error('Çalma listesi alınırken hata:', error.message);
        return [];
    }
}

async function getVideoDetails(videoId) {
    try {
        const response = await axios.get(VIDEO_DETAILS_URL, {
            params: {
                part: 'contentDetails,snippet',
                id: videoId,
                key: YOUTUBE_API_KEY
            }
        });
        return response.data.items[0];
    } catch (error) {
        console.error('Video detayları alınırken hata:', error.message);
        return null;
    }
}

function formatDuration(isoDuration) {
    if (!isoDuration) return 'Bilinmiyor';
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'Bilinmiyor';

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    return `${hours ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song && !serverQueue.autoplay) {
        serverQueue.connection.destroy();
        queue.delete(guild.id);
        serverQueue.textChannel.send("❌ | Kuyruk boş, müzik durduruldu.");
        return;
    }

    if (!song && serverQueue.autoplay) {
        const lastSong = serverQueue.lastPlayed;
        if (!lastSong?.id) {
            serverQueue.textChannel.send("❌ | Önceki şarkı bilgisi yok, otomatik oynatma durduruldu.");
            serverQueue.connection.destroy();
            queue.delete(guild.id);
            return;
        }

        const relatedVideos = await getRelatedVideos(lastSong.id);
        if (relatedVideos.length > 0) {
            song = `https://www.youtube.com/watch?v=${relatedVideos[0].id.videoId}`;
            serverQueue.songs.push(song);
        } else {
            serverQueue.textChannel.send("❌ | Otomatik oynatma için ilgili şarkı bulunamadı.");
            serverQueue.connection.destroy();
            queue.delete(guild.id);
            return;
        }
    }

    try {
        const isPlaylist = song.includes('list=');
        let videoUrl, video, thumbnail, duration;

        if (isPlaylist) {
            const playlistId = new URL(song).searchParams.get('list');
            const playlistVideos = await getPlaylistVideos(playlistId);
            if (playlistVideos.length === 0) {
                serverQueue.textChannel.send("❌ | Çalma listesinde video bulunamadı.");
                if (serverQueue.songs.length > 1) {
                    serverQueue.songs.shift(); // Remove the playlist URL
                    play(guild, serverQueue.songs[0]);
                } else {
                    serverQueue.connection.destroy();
                    queue.delete(guild.id);
                }
                return;
            }

            // Add playlist videos to queue, but only if not already added
            if (serverQueue.songs.length <= 1) {
                for (const item of playlistVideos) {
                    const videoId = item.snippet.resourceId.videoId;
                    serverQueue.songs.push(`https://www.youtube.com/watch?v=${videoId}`);
                }
            }
            videoUrl = serverQueue.songs[0]; // Play the first song in the queue
            const videoDetails = await getVideoDetails(new URL(videoUrl).searchParams.get('v'));
            if (!videoDetails) {
                serverQueue.textChannel.send("❌ | Video detayları alınamadı.");
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
                return;
            }
            video = videoDetails.snippet;
            thumbnail = video.thumbnails.high.url;
            duration = videoDetails.contentDetails.duration;
        } else {
            let videoId;
            if (song.includes('youtube.com/watch?v=')) {
                videoId = new URL(song).searchParams.get('v');
            } else {
                const response = await axios.get(SEARCH_BASE_URL, {
                    params: {
                        part: 'snippet',
                        q: song,
                        type: 'video',
                        key: YOUTUBE_API_KEY,
                        maxResults: 1
                    }
                });
                if (!response.data.items[0]) {
                    serverQueue.textChannel.send("❌ | Şarkı bulunamadı.");
                    serverQueue.songs.shift();
                    play(guild, serverQueue.songs[0]);
                    return;
                }
                videoId = response.data.items[0].id.videoId;
            }

            const videoDetails = await getVideoDetails(videoId);
            if (!videoDetails) {
                serverQueue.textChannel.send("❌ | Video detayları alınamadı.");
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
                return;
            }
            videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            video = videoDetails.snippet;
            thumbnail = video.thumbnails.high.url;
            duration = videoDetails.contentDetails.duration;
        }

        const stream = ytdl(videoUrl, {
            filter: 'audioonly',
            highWaterMark: 1 << 25,
            quality: 'highestaudio'
        });

        let resource;
        try {
            resource = createAudioResource(stream, { inlineVolume: true });
        } catch (error) {
            console.error('Ses kaynağı oluşturulurken hata:', error.message);
            serverQueue.textChannel.send("❌ | Ses kaynağı oluşturulamadı, lütfen tekrar deneyin.");
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
            return;
        }

        resource.volume.setVolume(serverQueue.volume || 0.5);

        const player = serverQueue.player || createAudioPlayer();
        player.play(resource);
        serverQueue.connection.subscribe(player);
        serverQueue.player = player;
        serverQueue.resource = resource;
        serverQueue.lastPlayed = { id: new URL(videoUrl).searchParams.get('v'), title: video.title, duration };

        const songEmbed = new EmbedBuilder()
            .setTitle("🎵 Şarkı Çalınıyor")
            .setDescription(`**[${video.title}](${videoUrl})**`)
            .addFields(
                { name: 'Süre', value: formatDuration(duration), inline: true },
                { name: 'Ses Seviyesi', value: `${Math.round((serverQueue.volume || 0.5) * 100)}%`, inline: true },
                { name: 'Döngü', value: serverQueue.loop ? '✅ Açık' : '❌ Kapalı', inline: true },
                { name: 'Otomatik Oynatma', value: serverQueue.autoplay ? '✅ Açık' : '❌ Kapalı', inline: true }
            )
            .setColor(0xFF0000)
            .setThumbnail(thumbnail)
            .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('pause_resume').setLabel(serverQueue.playing ? '⏸ Duraklat' : '▶ Devam Et').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('skip').setLabel('⏭ Atla').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('volume_down').setLabel('🔉 Ses Kıs').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('volume_up').setLabel('🔊 Ses Yükselt').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('stop').setLabel('⏹ Durdur').setStyle(ButtonStyle.Danger)
        );

        const message = await serverQueue.textChannel.send({
            embeds: [songEmbed],
            components: [buttons]
        });

        serverQueue.currentMessage = message;

        // Buton toplayıcı
        const collector = message.createMessageComponentCollector({ time: 600000 }); // 10 dakika
        collector.on('collect', async (i) => {
            if (!i.isButton()) return;
            const serverQueue = queue.get(i.guild.id);
            if (!serverQueue) {
                await i.reply({ content: "❌ | Aktif müzik kuyruğu yok.", ephemeral: true });
                return;
            }

            await i.deferReply({ ephemeral: true });

            switch (i.customId) {
                case 'pause_resume':
                    if (serverQueue.playing) {
                        serverQueue.player.pause();
                        serverQueue.playing = false;
                        await i.editReply({ content: "⏸ | Müzik duraklatıldı." });
                    } else {
                        serverQueue.player.unpause();
                        serverQueue.playing = true;
                        await i.editReply({ content: "▶ | Müzik devam ediyor." });
                    }
                    break;

                case 'skip':
                    serverQueue.player.stop();
                    await i.editReply({ content: "⏭ | Şarkı atlandı." });
                    break;

                case 'volume_up':
                    if (serverQueue.volume < 1.0) {
                        serverQueue.volume = Math.min(serverQueue.volume + 0.1, 1.0);
                        serverQueue.resource.volume.setVolume(serverQueue.volume);
                        await i.editReply({ content: `🔊 | Ses seviyesi: ${Math.round(serverQueue.volume * 100)}%` });
                    } else {
                        await i.editReply({ content: "🔊 | Ses seviyesi zaten maksimum!" });
                    }
                    break;

                case 'volume_down':
                    if (serverQueue.volume > 0.0) {
                        serverQueue.volume = Math.max(serverQueue.volume - 0.1, 0.0);
                        serverQueue.resource.volume.setVolume(serverQueue.volume);
                        await i.editReply({ content: `🔉 | Ses seviyesi: ${Math.round(serverQueue.volume * 100)}%` });
                    } else {
                        await i.editReply({ content: "🔉 | Ses seviyesi zaten minimum!" });
                    }
                    break;

                case 'stop':
                    serverQueue.songs = [];
                    serverQueue.player.stop();
                    serverQueue.connection.destroy();
                    queue.delete(i.guild.id);
                    await i.editReply({ content: "⏹ | Müzik durduruldu ve kuyruk temizlendi." });
                    collector.stop();
                    return;
            }

            try {
                const newEmbed = new EmbedBuilder()
                    .setTitle("🎵 Şarkı Çalınıyor")
                    .setDescription(`**[${serverQueue.lastPlayed.title}](${videoUrl})**`)
                    .addFields(
                        { name: 'Süre', value: formatDuration(serverQueue.lastPlayed?.duration || 'Bilinmiyor'), inline: true },
                        { name: 'Ses Seviyesi', value: `${Math.round(serverQueue.volume * 100)}%`, inline: true },
                        { name: 'Döngü', value: serverQueue.loop ? '✅ Açık' : '❌ Kapalı', inline: true },
                        { name: 'Otomatik Oynatma', value: serverQueue.autoplay ? '✅ Açık' : '❌ Kapalı', inline: true }
                    )
                    .setColor(0xFF0000)
                    .setThumbnail(thumbnail)
                    .setTimestamp();

                const newButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('pause_resume').setLabel(serverQueue.playing ? '⏸ Duraklat' : '▶ Devam Et').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('skip').setLabel('⏭ Atla').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('volume_down').setLabel('🔉 Ses Kıs').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('volume_up').setLabel('🔊 Ses Yükselt').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('stop').setLabel('⏹ Durdur').setStyle(ButtonStyle.Danger)
                );

                await message.edit({ embeds: [newEmbed], components: [newButtons] });
            } catch (error) {
                console.error('Mesaj güncellenirken hata:', error.message);
            }
        });

        player.on(AudioPlayerStatus.Idle, () => {
            if (serverQueue.loop && serverQueue.songs[0]) {
                play(guild, serverQueue.songs[0]);
            } else {
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            }
        });

        player.on('error', error => {
            console.error('Oynatıcı hatası:', error.message);
            serverQueue.textChannel.send("❌ | Şarkı çalınırken hata oluştu.");
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        });

    } catch (error) {
        console.error('Oynatma fonksiyonunda hata:', error.message);
        serverQueue.textChannel.send("❌ | Şarkı çalınamadı: " + error.message);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    }
}

module.exports = {
    name: "müzikçal",
    description: "Bir şarkıyı veya çalma listesini çalar.",
    type: 1,
    options: [
        {
            name: 'şarkı',
            type: 3,
            description: 'Çalmak istediğiniz şarkının adı, YouTube URL veya çalma listesi URL\'si.',
            required: true
        }
    ],
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const song = interaction.options.getString('şarkı');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.editReply({ content: "❌ | Ses kanalında olmalısınız!" });
        }

        const permissions = voiceChannel.permissionsFor(client.user);
        if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
            return interaction.editReply({ content: "❌ | Bu ses kanalına katılma veya konuşma iznim yok!" });
        }

        let serverQueue = queue.get(interaction.guild.id);
        if (!serverQueue) {
            try {
                serverQueue = {
                    textChannel: interaction.channel,
                    voiceChannel: voiceChannel.id,
                    connection: joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator
                    }),
                    songs: [],
                    volume: 0.5,
                    playing: true,
                    loop: false,
                    autoplay: false,
                    lastPlayed: null
                };
                queue.set(interaction.guild.id, serverQueue);
            } catch (error) {
                console.error('Ses kanalına bağlanırken hata:', error.message);
                return interaction.editReply({ content: "❌ | Ses kanalına bağlanılamadı: " + error.message });
            }
        }

        serverQueue.songs.push(song);
        const isPlaylist = song.includes('list=');
        await interaction.editReply({ 
            content: `✅ | ${isPlaylist ? 'Çalma listesi' : `"${song}"`} kuyruğa eklendi!` 
        });

        if (serverQueue.songs.length === 1) {
            play(interaction.guild, song);
        }
    }
};

module.exports.clientEvents = (client) => {
    client.on('voiceStateUpdate', (oldState, newState) => {
        const serverQueue = queue.get(oldState.guild.id);
        if (!serverQueue) return;

        if (newState.id === client.user.id && !newState.channelId) {
            serverQueue.songs = [];
            serverQueue.player?.stop();
            serverQueue.connection?.destroy();
            queue.delete(oldState.guild.id);
            serverQueue.textChannel?.send("❌ | Bot ses kanalından ayrıldı.");
        }
    });
};