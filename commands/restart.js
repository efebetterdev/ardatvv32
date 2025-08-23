const { Client, PermissionsBitField } = require("discord.js");

// Bot sahibinin kullanıcı ID'sini burada belirtin
const BOT_OWNER_ID = '808741421229539348';

module.exports = {
    name: "restart",
    description: "Botu yeniden başlatır.",
    type: 1,
    run: async (client, interaction) => {
        // Komutu kullanan kişinin bot sahibi olup olmadığını kontrol et
        if (interaction.user.id !== BOT_OWNER_ID) {
            return interaction.reply({ content: "Bu kod sadece bot sahbi özel", ephemeral: true });
        }

        // Kullanıcıya botun yeniden başlatılmakta olduğunu bildir
        await interaction.reply({ content: "Bot yeniden başlatılıyor...", ephemeral: true });
        process.exit(); // Botu kapat ve yeniden başlat
    }
};