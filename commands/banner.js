const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { DiscordBanners } = require("discord-banners");

module.exports = {
    name: "banner",
    description: "Kullanıcının banner'ını şık ve kullanıcı dostu şekilde gösterir.",
    type: 1,
    options: [
        {
            name: "kullanıcı",
            description: "Banner'ını görüntülemek istediğin kullanıcıyı seç.",
            type: 6,
            required: true,
        },
    ],
    run: async (client, interaction) => {
        const target = interaction.options.getUser("kullanıcı");
        const discordBanners = new DiscordBanners(client);
        let bannerURL;
        let hasBanner = true;

        try {
            bannerURL = await discordBanners.getBanner(target.id, { dynamic: true });

         
            if (!bannerURL || bannerURL.startsWith('#')) {
                hasBanner = false;
                bannerURL = "https://rudsdev.xyz/api/banner?renk=5865F2&style=soft";
            }
        } catch (error) {
            console.error("Banner alınırken hata:", error.message || error);
            hasBanner = false;
            bannerURL = "https://rudsdev.xyz/api/banner?renk=5865F2&style=soft";
        }

        const embed = new EmbedBuilder()
            .setColor(hasBanner ? 0x5865F2 : 0xED4245)
            .setAuthor({
                name: `${target.username} için özel bir vitrin`,
                iconURL: target.displayAvatarURL({ dynamic: true }),
            })
            .setTitle(hasBanner ? "🎨 Muhteşem bir banner keşfettik!" : "🌈 Henüz bir banner yok!")
            .setDescription(
                hasBanner
                    ? `✨ **${target.username}**, senin banner'ın gerçekten etkileyici görünüyor! Aşağıda detaylıca inceleyebilirsin.`
                    : `🙃 **${target.username}**, şu anda özel bir banner'ın yok ama merak etme, senin yerini dolduracak hoş bir görsel hazırladık!`
            )
            .setImage(bannerURL)
            .addFields(
                {
                    name: "👤 Kullanıcı",
                    value: `<@${target.id}> (\`${target.tag}\`)`,
                    inline: true,
                },
                {
                    name: "🆔 Kullanıcı ID",
                    value: `\`${target.id}\``,
                    inline: true,
                }
            )
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: `Komutu kullanan: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        const buttons = new ActionRowBuilder();
        try {
            new URL(bannerURL); 
            buttons.addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(bannerURL)
                    .setLabel("📥 Banner'ı Gör / İndir"),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.gg/nMeEdX7KuY")
                    .setLabel("💬 Destek Sunucusu")
            );
        } catch {
            // URL geçersizse sadece destek sunucusu butonunu ekle
            buttons.addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.gg/nMeEdX7KuY")
                    .setLabel("💬 Destek Sunucusu")
            );
        }

        return interaction.reply({
            embeds: [embed],
            components: [buttons],
        });
    },
};