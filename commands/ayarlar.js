const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config.json");

module.exports = {
    name: "ayarlar",
    description: "Sunucu ayarlarına bakarsın!",
    type: 1, 
    options: [],

    run: async (client, interaction, db) => {
        try {
           
            if (!interaction.guild) {
                return interaction.reply({
                    content: "Bu komut yalnızca bir sunucuda kullanılabilir!",
                    ephemeral: true,
                });
            }

            const systems = [
                { name: "Botlist Sistemi", key: `botekle_${interaction.guild.id}` },
                { name: "Buton Rol Sistemi", key: `buton_rol${interaction.guild.id}` },
                { name: "Capslock Sistemi", key: `capslockengel_${interaction.guild.id}` },
                { name: "Görsel Engel Sistemi", key: `görselengel_${interaction.guild.id}` },
                { name: "Giriş Çıkış Sistemi", key: `hgbb_${interaction.guild.id}` },
                { name: "Küfür Engel Sistemi", key: `kufurengel_${interaction.guild.id}` },
                { name: "Mod Log Sistemi", key: `modlogK_${interaction.guild.id}` },
                { name: "Mute Sistemi", key: `yetkili_${interaction.guild.id}` },
                { name: "Oto Rol Sistemi", key: `otorol_${interaction.guild.id}` },
                { name: "Oto Tag Sistemi", key: `ototag_${interaction.guild.id}` },
                { name: "Özel Oda Sistemi", key: `ozelodasistemi_${interaction.guild.id}` },
                { name: "Reklam Engel Sistemi", key: `reklamengel_${interaction.guild.id}` },
                { name: "Destek Sistemi", key: `ticketKanal_${interaction.guild.id}` },
                { name: "Timeout Sistemi", key: `timeoutSistemi_${interaction.guild.id}` },
                { name: "Yasaklı Kelime Sistemi", key: `yasaklı_kelime_${interaction.guild.id}` },
                { name: "Uyarı Sistemi", key: `warnayar_${interaction.guild.id}` },
            ];

            const fields = systems.map(system => ({
                name: `**${system.name}**`,
                value: db.fetch(system.key) ? "<:acik:1394342391384772622> | Açık" : "<:kapal:1394342349357711532> | Kapalı",
                inline: true,
            }));

           
            const sayacData = db.fetch(`sayac_${interaction.guild.id}`);
            fields.push({
                name: "**Sayaç Sistemi**",
                value: sayacData
                    ? `<:acik:1394342391384772622> | Açık  ${typeof sayacData === 'object' ? sayacData.target || 'Hedef belirtilmemiş' : sayacData}`
                    : "<:kapal:1394342349357711532> | Kapalı",
                inline: true,
            });

            
            const botName = config["bot-adi"] || "Bot";

            
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setEmoji("1039607063443161158")
                    .setLabel("Mesajı Sil")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId(`clearMessageButton_${interaction.user.id}`)
            );

           
            const embed = new EmbedBuilder()
                .setTitle(`⚙ | ${botName} - Ayarlar Menüsü!`)
                .addFields(fields)
                .setColor("Blue")
                .setTimestamp()
                .setFooter({ text: `Komutu kullanan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

           
            const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

            const filter = (i) => i.customId === `clearMessageButton_${interaction.user.id}` && i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({ filter, time: 60000 });

            collector.on("collect", async (i) => {
                try {
                    
                    await i.message.delete();
                    await i.reply({ content: "Mesaj başarıyla silindi!", ephemeral: true });
              
                    collector.stop("message_deleted");
                } catch (error) {
                    console.error("Mesaj silinirken hata oluştu:", error);
                    await i.reply({ content: "Mesaj silinirken bir hata oluştu!", ephemeral: true });
                }
            });

            collector.on("end", async (collected, reason) => {
          
                if (reason !== "message_deleted") {
                    const disabledRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setEmoji("1039607063443161158")
                            .setLabel("Mesajı Sil")
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId(`clearMessageButton_${interaction.user.id}`)
                            .setDisabled(true)
                    );

                    try {
                      
                        await message.edit({ components: [disabledRow] });
                    } catch (error) {
                        if (error.code === 10008) {
                           
                            return;
                        }
                        console.error("Buton devre dışı bırakılırken hata oluştu:", error);
                    }
                }
            });
        } catch (error) {
            console.error("Komut çalıştırılırken hata oluştu:", error);
            await interaction.reply({
                content: "Komut çalıştırılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
                ephemeral: true,
            });
        }
    },
};