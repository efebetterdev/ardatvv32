const { 
  Client, EmbedBuilder, PermissionsBitField, ModalBuilder, 
  TextInputBuilder, TextInputStyle, ActionRowBuilder, 
ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "ban",
  description: 'Belirtilen kullanıcıyı sunucudan yasaklarsın.',
  type: 1,
  options: [
      {
          name: "user",
          description: "Yasaklanacak kullanıcıyı seçin.",
          type: 6,
          required: true
      }
  ],
  run: async (client, interaction) => {
      try {
          if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
              return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Üyeleri yasaklama yetkin yok!", ephemeral: true });
          }

          const user = interaction.options.getUser('user');
          const member = interaction.guild.members.cache.get(user.id);

          if (!member) {
              return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Bu kullanıcı sunucuda bulunmuyor.", ephemeral: true });
          }

          if (!member.bannable) {
              return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Kullanıcıyı yasaklamak için yeterli yetkim yok.", ephemeral: true });
          }

          const modal = new ModalBuilder()
              .setCustomId('banReasonModal')
              .setTitle('Ban Sebebi');

          const reasonInput = new TextInputBuilder()
              .setCustomId('banReason')
              .setLabel("Hangi sebepten dolayı yasaklanacak?")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true);

          const actionRow = new ActionRowBuilder().addComponents(reasonInput);
          modal.addComponents(actionRow);

          await interaction.showModal(modal);

          const filter = (i) => i.customId === 'banReasonModal' && i.user.id === interaction.user.id;

          interaction.awaitModalSubmit({ filter, time: 60000 })
              .then(async modalInteraction => {
                  const reason = modalInteraction.fields.getTextInputValue('banReason');

                  try {
                      await user.send(`⛔ **${interaction.guild.name}** sunucusundan yasaklandınız! Sebep: ${reason}`);
                  } catch (err) {
                      console.warn("<a:uyari:1225959324426174475>  Kullanıcıya DM atılamadı.");
                  }

                  await member.ban({ reason: reason });

                  const banEmbed = new EmbedBuilder()
                      .setColor("Red")
                      .setDescription(`**${user}** adlı üyeyi **${reason}** sebebiyle yasakladım.`)
                      .setImage('https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif?cid=790b761144jirz2i8mxj17gw5lj3xrcdts1uuq5llqpoo35n&ep=v1_gifs_search&rid=giphy.gif&ct=g') 
                      .setTimestamp();

                  const unbanButton = new ButtonBuilder()
                      .setCustomId("unban")
                      .setLabel("Banı Kaldır")
                      .setStyle(ButtonStyle.Primary);

                  const deleteButton = new ButtonBuilder()
                      .setCustomId("delete")
                      .setEmoji("🗑️")
                      .setStyle(ButtonStyle.Danger);

                  const buttonRow = new ActionRowBuilder().addComponents(unbanButton, deleteButton);

                  const message = await modalInteraction.reply({ embeds: [banEmbed], components: [buttonRow] });

                  const collector = message.createMessageComponentCollector({ time: 300000 });

                  collector.on('collect', async i => {
                      if (i.user.id !== interaction.user.id) {
                          return i.reply({ content: "<a:carpi:1227670096462221363>  | Bu butonları sadece komutu kullanan kişi yönetebilir!", ephemeral: true });
                      }

                      if (i.customId === "unban") {
                          try {
                              await interaction.guild.bans.remove(user.id);
                              await i.reply({ content: `<a:yeilonay:1221172106637611169>  | **${user.tag}** adlı kullanıcının yasağı kaldırıldı.`, ephemeral: true });
                          } catch (err) {
                              await i.reply({ content: "<a:carpi:1227670096462221363>  | Kullanıcının yasağını kaldıramadım.", ephemeral: true });
                          }
                      }
                      else if (i.customId === "delete") {
                          await message.delete();
                      }
                  });
              })
              .catch(() => {
                  interaction.followUp({ content: "<a:carpi:1227670096462221363>  | Ban işlemi zaman aşımına uğradı veya iptal edildi.", ephemeral: true });
              });

      } catch (error) {
          console.error("Ban komutunda hata:", error);
          if (!interaction.replied && !interaction.deferred) {
              interaction.reply({ content: "<a:carpi:1227670096462221363>  | Bir hata oluştu, lütfen tekrar dene.", ephemeral: true });
          }
      }
  }
};