const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");

module.exports = {
    name: "rol-oluştur",
    description: "Yeni bir rol oluşturursunuz!",
    type: 1,
    options: [
        {
            name: "isim",
            description: "Oluşturulacak rolün adı",
            type: 3,
            required: true
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Rolleri Yönet Yetkiniz Yok!", ephemeral: true }).catch(console.error);
        }

        const isim = interaction.options.getString("isim").trim();

        if (!isim) {
            return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Lütfen geçerli bir rol adı girin.", ephemeral: true }).catch(console.error);
        }

        // Renk seçimi için menü
        const renkSecimMenusu = new StringSelectMenuBuilder()
            .setCustomId("renk_secim")
            .setPlaceholder("Rol için bir renk seçin")
            .addOptions([
                new StringSelectMenuOptionBuilder().setLabel("🔴 Kırmızı").setValue("#ff0000"),
                new StringSelectMenuOptionBuilder().setLabel("🟢 Yeşil").setValue("#00ff00"),
                new StringSelectMenuOptionBuilder().setLabel("🔵 Mavi").setValue("#0000ff"),
                new StringSelectMenuOptionBuilder().setLabel("🟡 Sarı").setValue("#ffff00"),
                new StringSelectMenuOptionBuilder().setLabel("🟣 Mor").setValue("#800080"),
                new StringSelectMenuOptionBuilder().setLabel("⚫ Siyah").setValue("#000000"),
                new StringSelectMenuOptionBuilder().setLabel("⚪ Beyaz").setValue("#ffffff"),
                new StringSelectMenuOptionBuilder().setLabel("🎲 Rastgele Renk").setValue("random"),
            ]);

        const row = new ActionRowBuilder().addComponents(renkSecimMenusu);

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`🛠 | **${isim}** adlı rol oluşturulacak. Lütfen bir renk seçin.`);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true }).catch(console.error);

        // Seçim yanıtını bekle
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

        collector.on("collect", async (i) => {
            if (i.customId === "renk_secim") {
                let secilenRenk = i.values[0];

                if (secilenRenk === "random") {
                    secilenRenk = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
                }

                try {
                    const yeniRol = await interaction.guild.roles.create({
                        name: isim,
                        color: secilenRenk,
                        reason: `Yeni rol oluşturuldu: ${isim}`,
                    });

                    const embedSuccess = new EmbedBuilder()
                        .setColor(secilenRenk)
                        .setDescription(`<a:yeilonay:1221172106637611169>  | **${isim}** rolü oluşturuldu! 🎨 Seçilen renk: **${secilenRenk}**`);

                    await i.update({ embeds: [embedSuccess], components: [] }).catch(console.error);
                } catch (error) {
                    console.error("Rol oluşturulurken bir hata oluştu:", error);

                    let hataMesaji = "<a:carpi:1227670096462221363>  | Rol oluşturulurken bir hata oluştu.";
                    if (error.status === 503) hataMesaji = "<a:carpi:1227670096462221363>  | Discord API şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.";
                    if (error.code === 50013) hataMesaji = "<a:carpi:1227670096462221363>  | Botun yeterli yetkisi yok. Lütfen botun rolünü kontrol edin.";

                    await i.update({ content: hataMesaji, components: [], ephemeral: true }).catch(console.error);
                }

                collector.stop();
            }
        });

        collector.on("end", async (collected, reason) => {
            if (reason === "time") {
                await interaction.editReply({ content: "<a:carpi:1227670096462221363>  | Zaman aşımına uğradı. Komutu tekrar kullanın.", components: [], ephemeral: true }).catch(console.error);
            }
        });
    },
};
