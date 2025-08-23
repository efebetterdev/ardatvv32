const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  name: "snipe",
  description: "Bu kanalda silinen son mesajları gösterir.",
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({
        content: "🚫 Bu komutu kullanabilmek için **Mesajları Yönet** yetkisine sahip olmalısınız!",
        ephemeral: true
      });
    }

    const snipes = client.snipes.get(interaction.channel.id) || [];
    const userSnipes = snipes.filter(snipe => !snipe.author.bot);

    if (userSnipes.length === 0) {
      return interaction.reply({
        content: "📭 Bu kanalda silinen kullanıcı mesajı bulunamadı!",
        ephemeral: true
      });
    }

    const snipe = userSnipes[0];
    const sentTime = `<t:${Math.floor(snipe.timestamp / 1000)}:f>`;
    const timeAgo = `<t:${Math.floor(snipe.timestamp / 1000)}:R>`;

    const embed = new EmbedBuilder()
      .setColor("#ff5252")
      .setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL({ dynamic: true }) })
      .setDescription(snipe.content || "*📝 Mesaj içeriği boştu.*")
      .addFields(
        { name: "🕒 Mesaj Atılma Zamanı", value: sentTime, inline: true },
        { name: "⏳ Silinme Süresi", value: timeAgo, inline: true }
      )
      .setFooter({ text: `🆔 Kullanıcı ID: ${snipe.author.id}` })
      .setTimestamp();

    // Eğer birden fazla snipe varsa, kullanıcı seçim yapabilsin:
    if (userSnipes.length > 1) {
      const options = userSnipes.slice(0, 5).map((s, index) => ({
        label: `${index + 1}. Mesaj`,
        description: s.content?.slice(0, 50) || "Boş mesaj",
        value: index.toString()
      }));

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("snipe_select")
          .setPlaceholder("🔍 Farklı bir silinen mesajı seç...")
          .addOptions(options)
      );

      const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

      const collector = msg.createMessageComponentCollector({
        time: 15000,
        filter: i => i.user.id === interaction.user.id
      });

      collector.on("collect", async i => {
        const selected = parseInt(i.values[0]);
        const chosen = userSnipes[selected];

        const newEmbed = new EmbedBuilder()
          .setColor("#ff5252")
          .setAuthor({ name: chosen.author.tag, iconURL: chosen.author.displayAvatarURL({ dynamic: true }) })
          .setDescription(chosen.content || "*📝 Mesaj içeriği boştu.*")
          .addFields(
            { name: "🕒 Mesaj Atılma Zamanı", value: `<t:${Math.floor(chosen.timestamp / 1000)}:f>`, inline: true },
            { name: "⏳ Silinme Süresi", value: `<t:${Math.floor(chosen.timestamp / 1000)}:R>`, inline: true }
          )
          .setFooter({ text: `🆔 Kullanıcı ID: ${chosen.author.id}` })
          .setTimestamp();

        await i.update({ embeds: [newEmbed] });
      });

      collector.on("end", () => {
        msg.edit({ components: [] }).catch(() => {});
      });

    } else {
      return interaction.reply({ embeds: [embed] });
    }
  },
};

// Event kısmı (client.js veya ana bot dosyana eklemen yeterli)
client.snipes = new Map();

client.on("messageDelete", async message => {
  if (message.partial || !message.guild || !message.channel || message.author?.bot) return;

  const snipes = client.snipes.get(message.channel.id) || [];
  if (snipes.length >= 10) snipes.pop(); // Son 10 mesajla sınırla

  snipes.unshift({
    content: message.content,
    author: message.author,
    timestamp: message.createdTimestamp
  });

  client.snipes.set(message.channel.id, snipes);
});
