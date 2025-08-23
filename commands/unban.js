const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "unban",
    description: "Kullanıcının yasağını kaldırır!",
    type: 1,
    options: [
        {
            name: "id",
            description: "Kullanıcı ID'sini girin!",
            type: 3, // String
            required: true
        },
    ],
    run: async (client, interaction) => {
        console.log(`Komut çalıştırıldı: /unban, Kullanıcı: ${interaction.user.tag}, Sunucu: ${interaction.guild.name}`);

        // Botun yetkisini kontrol et
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            console.log("Hata: Botun BanMembers yetkisi yok.");
            return interaction.reply({ 
                content: "<a:carpi:1227670096462221363> | Botun üyeleri yasaklama yetkisi yok!", 
                ephemeral: true 
            });
        }

        // Kullanıcının yetkisini kontrol et
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            console.log("Hata: Kullanıcının BanMembers yetkisi yok.");
            return interaction.reply({ 
                content: "<a:carpi:1227670096462221363> | Üyeleri yasaklama yetkin yok!", 
                ephemeral: true 
            });
        }

        const userId = interaction.options.getString("id");
        console.log(`Girilen Kullanıcı ID: ${userId}`);

        // ID'nin geçerli bir formatta olduğunu kontrol et
        if (!/^\d{17,20}$/.test(userId)) {
            console.log("Hata: Geçersiz kullanıcı ID formatı.");
            return interaction.reply({ 
                content: "<a:carpi:1227670096462221363> | Geçersiz kullanıcı ID formatı! Lütfen 17-20 haneli bir ID girin.", 
                ephemeral: true 
            });
        }

        try {
            // Ban kontrolü
            console.log(`Yasak kontrolü yapılıyor: ${userId}`);
            const ban = await interaction.guild.bans.fetch(userId).catch(() => null);

            if (!ban) {
                console.log(`Hata: Kullanıcı (${userId}) yasaklı değil.`);
                return interaction.reply({ 
                    content: "<a:carpi:1227670096462221363> | Belirtilen ID'ye sahip kullanıcı yasaklı değil!", 
                    ephemeral: true 
                });
            }

            // Yasağı kaldır
            console.log(`Yasak kaldırılıyor: ${userId}`);
            await interaction.guild.members.unban(userId);

            const successEmbed = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`<a:yeilonay:1221172106637611169> | Başarıyla <@${userId}> adlı kullanıcının yasağını kaldırdım.`)
                .setImage("https://media1.tenor.com/m/vai_KB4fOVEAAAAC/tensei.gif");

            console.log("Başarı embed'i gönderildi.");
            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error("Hata Detayı:", error.message, error.stack);

            const errorEmbed = new EmbedBuilder()
                .setColor("Red")
                .setDescription("<a:carpi:1227670096462221363> | Yasağı kaldırmaya çalışırken bir hata oluştu.")
                .setFooter({ text: `Hata: ${error.code === 10026 ? "Kullanıcı yasaklı değil veya geçersiz ID" : error.message}` });

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};