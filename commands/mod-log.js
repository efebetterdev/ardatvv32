const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "mod-log",
    description: "Moderasyon kanalını ayarlar veya sıfırlarsın!",
    type: 1,
    options: [
        {
            name: "ayarla",
            description: "Mod logunu ayarlarsın!",
            type: 1,
            options: [
                {
                    name: "kanal",
                    description: "Mod logunu ayarlarsın!",
                    type: 7,
                    required: true,
                    channel_types: [0]
                }
            ]
        },
        {
            name: "sıfırla",
            description: "Mod logunu sıfırlarsın!",
            type: 1
        }
    ],
    run: async (client, interaction) => {

        // Kullanıcıya kanalları yönetme yetkisi yoksa hata mesajı gönder
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Kanalları Yönet Yetkin Yok!", ephemeral: true });
        }

        const subCommand = interaction.options.getSubcommand();

        if (subCommand === "ayarla") {
            const kanal2 = interaction.options.getChannel('kanal');

            // Kanal türünün doğru olduğundan emin ol
            if (kanal2.type !== 0) {  // Eğer kanal bir metin kanalı değilse
                return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Lütfen bir metin kanalı seçin!", ephemeral: true });
            }

            // Mod log kanalını veritabanına kaydet
            db.set(`modlogK_${interaction.guild.id}`, kanal2.id);

            // Log kanalına bir bilgilendirme mesajı gönder
            kanal2.send({
                content: `🔧 | Mod log kanalı olarak <#${kanal2.id}> ayarlandı!`
            }).catch(err => {
                console.error('Kanal mesajı gönderilemedi:', err);
            });

            // Kullanıcıya başarıyla ayarlandığını bildiren bir embed gönder
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setDescription(`<a:yeilonay:1221172106637611169>  | Moderasyon kanalı <#${kanal2.id}> olarak ayarlandı!`);

            interaction.reply({ embeds: [embed] });

        } else if (subCommand === "sıfırla") {
            // Mod log kanalını veritabanından sil
            db.delete(`modlogK_${interaction.guild.id}`);

            // Kullanıcıya başarıyla sıfırlandığını bildiren bir embed gönder
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setDescription(`<a:yeilonay:1221172106637611169>  | Moderasyon kanalı sıfırlandı!`);

            interaction.reply({ embeds: [embed] });
        }
    },
};