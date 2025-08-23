const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "herkese-rol-ver-bot",
    description: "Sunucudaki üyelere rol verir ve isteğe bağlı olarak botlara özel rol ekler.",
    type: 1,
    options: [
        {
            name: "rol",
            description: "Üyelere eklenecek rolü seçin.",
            type: 8,
            required: true,
        },
        {
            name: "bot_rol",
            description: "Botlara eklenecek rolü seçin (isteğe bağlı).",
            type: 8,
            required: false,
        },
    ],
    run: async (client, interaction) => {
        const startTime = Date.now();

        // Helper function to safely reply or follow up
        const safeReply = async (options) => {
            if (interaction.replied || interaction.deferred) {
                return interaction.followUp(options);
            }
            return interaction.reply(options);
        };

        // Helper function to safely edit or reply
        const safeEditReply = async (options) => {
            if (interaction.deferred || interaction.replied) {
                return interaction.editReply(options);
            }
            return interaction.reply(options);
        };

        try {
            // Permission check
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                const embed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("⛔ Yetki Hatası")
                    .setDescription("<a:carpi:1227670096462221363> Bu komutu kullanmak için `Rolleri Yönet` iznine sahip olmalısınız!");
                return await safeReply({ embeds: [embed], ephemeral: true });
            }

            const role = interaction.options.getRole("rol");
            const botRole = interaction.options.getRole("bot_rol");

            // Role validation
            if (!role) {
                const embed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("❌ Hata")
                    .setDescription("<a:carpi:1227670096462221363> Geçerli bir üye rolü seçmelisiniz.");
                return await safeReply({ embeds: [embed], ephemeral: true });
            }

            // Bot role position check
            if (
                interaction.guild.members.me.roles.highest.position < role.position ||
                (botRole && interaction.guild.members.me.roles.highest.position < botRole.position)
            ) {
                const embed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("⚠️ Rol Hatası")
                    .setDescription(
                        "<a:carpi:1227670096462221363> Botun rolü verilen rollerden aşağıda, işlem yapılamaz. Lütfen botun rolünü yükseltin!"
                    );
                return await safeReply({ embeds: [embed], ephemeral: true });
            }

            // Defer the reply for long-running operations
            await interaction.deferReply({ ephemeral: false });

            // Fetch members
            await interaction.guild.members.fetch();

            // Filter members and bots
            const membersToAdd = interaction.guild.members.cache.filter(
                (member) => !member.user.bot && !member.roles.cache.has(role.id)
            );
            const botsToAssign = botRole
                ? interaction.guild.members.cache.filter(
                      (member) => member.user.bot && !member.roles.cache.has(botRole.id)
                  )
                : new Map();

            const totalToAdd = membersToAdd.size;
            const totalBotsAssigned = botsToAssign.size;

            // If no members or bots to process
            if (totalToAdd === 0 && totalBotsAssigned === 0) {
                const embed = new EmbedBuilder()
                    .setColor("#FFFF00")
                    .setTitle("ℹ️ Bilgi")
                    .setDescription("<a:carpi:1227670096462221363> İşlem yapılacak üye veya bot bulunamadı.");
                return await safeEditReply({ embeds: [embed] });
            }

            // Initial progress message
            const initialEmbed = new EmbedBuilder()
                .setColor("#0099FF")
                .setTitle("⏳ İşlem Başlatıldı")
                .setDescription(`
                    <:saat:1362926664031670574> Rol dağıtımı başladı...
                    **Tahmini İşlemler:**
                    👥 Üyelere eklenecek: ${totalToAdd}
                    🤖 Botlara eklenecek: ${totalBotsAssigned}
                `);
            await safeEditReply({ embeds: [initialEmbed] });

            // Process roles in batches
            async function processBatch(batch, role) {
                const promises = batch.map((member) =>
                    member.roles
                        .add(role)
                        .catch((error) => console.error(`Rol eklenemedi: ${member.user.tag}:`, error))
                );
                await Promise.all(promises);
            }

            // Assign roles to members
            const membersArrayAdd = [...membersToAdd.values()];
            for (let i = 0; i < membersArrayAdd.length; i += 100) {
                await processBatch(membersArrayAdd.slice(i, i + 100), role);
                await new Promise((resolve) => setTimeout(resolve, 1500)); // Rate limit delay
            }

            // Assign roles to bots if botRole is provided
            if (botRole) {
                const botsArrayAssign = [...botsToAssign.values()];
                for (let i = 0; i < botsArrayAssign.length; i += 100) {
                    await processBatch(botsArrayAssign.slice(i, i + 100), botRole);
                    await new Promise((resolve) => setTimeout(resolve, 1500)); // Rate limit delay
                }
            }

            // Completion message
            const completionTime = ((Date.now() - startTime) / 1000).toFixed(2);
            const completionEmbed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle("✅ İşlem Başarıyla Tamamlandı")
                .setDescription(`
                    <a:yeilonay:1221172106637611169> Rol dağıtım işlemi tamamlandı!
                    **İşlem Detayları:**
                `)
                .addFields(
                    { name: "👥 Üyelere Rol Verildi", value: `${totalToAdd} kişi`, inline: true },
                    { name: "🤖 Botlara Rol Verildi", value: `${totalBotsAssigned} bot`, inline: true },
                    { name: "⏱️ İşlem Süresi", value: `${completionTime} saniye`, inline: true },
                    { name: "Üye Rolü", value: `${role}`, inline: true },
                    { name: "Bot Rolü", value: botRole ? `${botRole}` : "Belirtilmedi", inline: true }
                )
                .setFooter({
                    text: `${interaction.guild.name} • ${new Date().toLocaleString()}`,
                    iconURL: interaction.guild.iconURL(),
                })
                .setThumbnail("https://cdn.discordapp.com/emojis/1221172106637611169.gif");

            await interaction.followUp({ embeds: [completionEmbed] });

        } catch (error) {
            console.error("Hata oluştu:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("❌ Kritik Hata")
                .setDescription("<a:carpi:1227670096462221363> Rol dağıtım işlemi sırasında beklenmedik bir hata oluştu!")
                .addFields({
                    name: "Hata Detayı",
                    value: `\`\`\`${error.message.substring(0, 1000)}\`\`\``,
                })
                .setFooter({ text: "Lütfen yöneticileri bilgilendirin" });

            await safeEditReply({ embeds: [errorEmbed] });
        }
    },
};