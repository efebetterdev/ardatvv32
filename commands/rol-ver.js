const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "rol-ver",
    description: 'Birine rol verir!',
    type: 1,
    options: [
        {
            name: "user",
            description: "Rolü verilecek kullanıcıyı seçin!",
            type: 6,
            required: true
        },
        {
            name: "rol",
            description: "Lütfen bir rol etiketleyin!",
            type: 8,
            required: true
        },
    ],
    run: async (client, interaction) => {

        // Kullanıcının "Rolleri Yönet" yetkisi olup olmadığını kontrol ediyoruz
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Rolleri Yönet Yetkiniz Yok!", ephemeral: true });
        }

        const rol = interaction.options.getRole('rol');
        const user = interaction.options.getMember('user');

        // Eğer kullanıcı veya rol geçerli değilse hata mesajı veriyoruz
        if (!rol || !user) {
            return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Geçerli bir kullanıcı veya rol seçin!", ephemeral: true });
        }

        const botRole = interaction.guild.members.cache.get(client.user.id).roles.highest;

        // Botun rolü, hedef rolün üzerinde olmalı
        if (rol.position >= botRole.position) {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription("<a:carpi:1227670096462221363>  | Bunu yapmak için rolüm yetersiz. Rolümü daha yukarı taşır mısın? 👉👈");

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            // Hedef kullanıcıya rolü ekliyoruz
            await user.roles.add(rol);
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`<a:yeilonay:1221172106637611169>  | Başarıyla ${user} kullanıcısına **${rol.name}** rolü verildi!`);

            interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Rol verme sırasında bir hata oluştu:', error);
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription("<a:carpi:1227670096462221363>  | Rol verme sırasında bir hata oluştu. Lütfen tekrar deneyin veya botun yetkilerini kontrol edin.");

            interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
