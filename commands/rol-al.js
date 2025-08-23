const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "rol-al",
    description: 'Birinden rol alırsınız!',
    type: 1,
    options: [
        {
            name: "user",
            description: "Rolü alınıcak kullanıcıyı seçin!",
            type: 6,
            required: true
        },
        {
            name: "rol",
            description: "Lütfen bir rol etiketle!",
            type: 8,
            required: true
        },
    ],
    run: async (client, interaction) => {

        // Kullanıcının "Rolleri Yönet" yetkisi olup olmadığını kontrol ediyoruz
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Rolleri Yönet Yetkiniz Yok!", ephemeral: true });
        }

        const rol = interaction.options.getRole('rol');  // Hedef rolü alıyoruz
        const user = interaction.options.getMember('user');  // Hedef kullanıcıyı alıyoruz

        const botRole = interaction.guild.members.cache.get(client.user.id).roles.highest;  // Botun en yüksek rolünü alıyoruz
        const targetRole = rol;
        const targetMember = interaction.guild.members.cache.get(user.id);

        // Eğer botun rolü, hedef rolün üstündeyse işlem yapabiliyoruz
        if (targetRole.position >= botRole.position) {
            return interaction.reply({ 
                content: "<a:carpi:1227670096462221363>  | Rolüm, bu işlemi gerçekleştirebilmek için yeterince yüksek değil. Lütfen rolümü yükseltir misiniz?",
                ephemeral: true 
            });
        }

        try {
            // Rolü hedef kullanıcıdan kaldırıyoruz
            await targetMember.roles.remove(targetRole);
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`<a:yeilonay:1221172106637611169>  | Başarıyla **${user.user.username}** kullanıcısının **${rol.name}** rolü alındı!`);

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            // Hata mesajı daha ayrıntılı olarak kullanıcıya iletiliyor
            console.error('Rol çıkarma sırasında bir hata oluştu:', error);
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`<a:carpi:1227670096462221363>  | Rol çıkarma işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin veya botun yetkilerini kontrol edin.`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
