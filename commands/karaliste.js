const { EmbedBuilder } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");

// Path to karaliste.json
const KARALISTE_JSON_PATH = path.join(__dirname, "..", "karaliste.json");

// Authorized user IDs who can use the command
const YETKILI_IDLER = ["808741421229539348", "SAHIP_ID_2"];

module.exports = {
  name: "karaliste",
  description: "[BOT OWNER] Kullanıcıyı kara listeye ekler, çıkarır veya listeler",
  type: 1,
  options: [
    {
      name: "islem",
      description: "Yapılacak işlem: ekle, çıkar veya liste",
      type: 3,
      required: true,
      choices: [
        { name: "Ekle", value: "ekle" },
        { name: "Çıkar", value: "cikar" },
        { name: "Liste", value: "liste" },
      ],
    },
    {
      name: "kullanici",
      description: "Kullanıcı ID'si (ekle/çıkar için gerekli)",
      type: 3,
      required: false,
    },
    {
      name: "sebep",
      description: "Sebep (ekle için isteğe bağlı)",
      type: 3,
      required: false,
    },
  ],

  // Check if the user is authorized to see/use the command
  async visible(client, interaction) {
    return YETKILI_IDLER.includes(interaction.user.id);
  },

  run: async (client, interaction) => {
    // Acknowledge the interaction immediately
    await interaction.deferReply({ ephemeral: true });

    // Check if the user is authorized
    if (!YETKILI_IDLER.includes(interaction.user.id)) {
      return interaction.editReply({
        content: "❌ Bu komut sadece bot sahiplerine özeldir!",
      });
    }

    const islem = interaction.options.getString("islem");
    const kullaniciID = interaction.options.getString("kullanici");
    const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi";

    let karaliste = [];
    try {
      // Check if karaliste.json exists and read it
      if (await fs.access(KARALISTE_JSON_PATH).then(() => true).catch(() => false)) {
        const data = await fs.readFile(KARALISTE_JSON_PATH, "utf-8");
        karaliste = JSON.parse(data);
        if (!Array.isArray(karaliste)) karaliste = [];
      }
    } catch (err) {
      console.error("karaliste.json okunamadı:", err);
      karaliste = [];
    }

    // List blacklist
    if (islem === "liste") {
      if (karaliste.length === 0) {
        return interaction.editReply({
          content: "📋 Kara liste şu anda boş!",
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("Kara Liste Kullanıcıları")
        .setDescription(`Toplam ${karaliste.length} kullanıcı kara listede.`)
        .setColor("#FFA500")
        .setTimestamp()
        .setFooter({
          text: `${interaction.user.tag} tarafından görüntülendi`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        });

      for (const userData of karaliste) {
        let user;
        try {
          user = await client.users.fetch(userData.id);
          embed.addFields({
            name: `Kullanıcı: ${user.tag} (${userData.id})`,
            value: `**Sebep:** ${userData.sebep}\n**Eklenme Tarihi:** <t:${Math.floor(new Date(userData.eklenme) / 1000)}:F>`,
            inline: false,
          });
        } catch (err) {
          console.error(`Kullanıcı alınamadı (${userData.id}):`, err);
          embed.addFields({
            name: `Kullanıcı: Bilinmiyor (${userData.id})`,
            value: `**Sebep:** ${userData.sebep}\n**Eklenme Tarihi:** <t:${Math.floor(new Date(userData.eklenme) / 1000)}:F>`,
            inline: false,
          });
        }
      }

      return interaction.editReply({ embeds: [embed], ephemeral: false });
    }

    // Validate user ID for add/remove operations
    let user;
    if (islem === "ekle" || islem === "cikar") {
      if (!kullaniciID) {
        return interaction.editReply({
          content: "❌ Ekleme veya çıkarma işlemi için kullanıcı ID'si gerekli!",
        });
      }
      try {
        user = await client.users.fetch(kullaniciID);
      } catch (err) {
        console.error("Kullanıcı alınamadı:", err);
        return interaction.editReply({
          content: "❌ Geçersiz kullanıcı ID'si veya kullanıcı bulunamadı!",
        });
      }
    }

    // Add to blacklist
    if (islem === "ekle") {
      if (karaliste.find(u => u.id === kullaniciID)) {
        return interaction.editReply({
          content: "❌ Bu kullanıcı zaten kara listede!",
        });
      }

      // Add user to blacklist
      karaliste.push({
        id: kullaniciID,
        sebep,
        eklenme: new Date().toISOString(),
      });

      try {
        await fs.writeFile(KARALISTE_JSON_PATH, JSON.stringify(karaliste, null, 2));
      } catch (err) {
        console.error("karaliste.json yazılamadı:", err);
        return interaction.editReply({
          content: "❌ Kara listeye eklenirken bir hata oluştu!",
        });
      }

      // Embed for confirmation
      const addedEmbed = new EmbedBuilder()
        .setTitle("Kara Listeye Eklendi")
        .setDescription(`**${user.tag}** başarıyla kara listeye eklendi.`)
        .addFields(
          { name: "Kullanıcı", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Sebep", value: sebep, inline: true },
          { name: "Tarih", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setColor("#00FF00")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${interaction.user.tag} tarafından eklendi`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      // Embed for logging
      const logEmbed = new EmbedBuilder()
        .setTitle("Kara Liste İşlemi: Kullanıcı Eklendi")
        .setDescription(`Bir kullanıcı kara listeye eklendi. Detaylar aşağıdadır:`)
        .addFields(
          { name: "Kullanıcı", value: `${user.tag} (${user.id})`, inline: false },
          { name: "Sebep", value: `\`\`\`${sebep}\`\`\``, inline: false },
          { name: "Ekleyen Yetkili", value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
          { name: "Eklenme Zamanı", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: "Kara Liste Durumu", value: `Toplam ${karaliste.length} kullanıcı`, inline: true }
        )
        .setColor("#FF0000")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setImage("https://global.discourse-cdn.com/funcom/original/3X/4/8/48b5f321cbfd2e203a4034f53bb82b436c00983f.gif")
        .setAuthor({ name: "Kara Liste Sistemi", iconURL: client.user.displayAvatarURL() })
        .setFooter({
          text: `Kara Liste ID: ${Date.now().toString(36).toUpperCase()}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      // Embed for DM to user
      const userDMEmbed = new EmbedBuilder()
        .setTitle("Kara Liste Bildirimi")
        .setDescription(`Sayın ${user.tag},\n\nSunucumuzda kara listeye alındığınızı bildirmek isteriz.`)
        .addFields(
          { name: "Sebep", value: `\`\`\`${sebep}\`\`\``, inline: false },
          { name: "Yetkili", value: `${interaction.user.tag}`, inline: true },
          { name: "Tarih", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: "Not", value: "Bu kararla ilgili itirazınız varsa, sunucu yöneticileriyle iletişime geçebilirsiniz.", inline: false }
        )
        .setColor("#FF0000")
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setImage("https://global.discourse-cdn.com/funcom/original/3X/4/8/48b5f321cbfd2e203a4034f53bb82b436c00983f.gif")
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setFooter({
          text: `Kara Liste ID: ${Date.now().toString(36).toUpperCase()}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      // Attempt to send DM to the user
      try {
        await user.send({ embeds: [userDMEmbed] });
        addedEmbed.addFields({ name: "DM Durumu", value: "Kullanıcıya DM gönderildi", inline: false });
      } catch (dmError) {
        console.error("DM gönderme hatası:", dmError);
        addedEmbed.addFields({ name: "DM Durumu", value: "Kullanıcıya DM gönderilemedi (DM kapalı olabilir)", inline: false });
      }

      // Send confirmation and log embeds
      await interaction.editReply({ embeds: [addedEmbed], ephemeral: false });

    } else if (islem === "cikar") {
      const userData = karaliste.find(u => u.id === kullaniciID);
      if (!userData) {
        return interaction.editReply({
          content: "❌ Bu kullanıcı kara listede değil!",
        });
      }

      karaliste = karaliste.filter(u => u.id !== kullaniciID);

      try {
        await fs.writeFile(KARALISTE_JSON_PATH, JSON.stringify(karaliste, null, 2));
      } catch (err) {
        console.error("karaliste.json yazılamadı:", err);
        return interaction.editReply({
          content: "❌ Kara listeden çıkarılırken bir hata oluştu!",
        });
      }

      const removedEmbed = new EmbedBuilder()
        .setTitle("Kara Listeden Çıkarıldı")
        .setDescription(`**${user.tag}** başarıyla kara listeden çıkarıldı.`)
        .addFields(
          { name: "Kullanıcı", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Tarih", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setColor("#00FF00")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${interaction.user.tag} tarafından çıkarıldı`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      const logEmbed = new EmbedBuilder()
        .setTitle("Kara Liste İşlemi: Kullanıcı Çıkarıldı")
        .setDescription(`Bir kullanıcı kara listeden çıkarıldı. Detaylar aşağıdadır:`)
        .addFields(
          { name: "Kullanıcı", value: `${user.tag} (${user.id})`, inline: false },
          { name: "Eski Kara Liste Sebebi", value: `\`\`\`${userData.sebep}\`\`\``, inline: false },
          { name: "Eklenme Tarihi", value: `<t:${Math.floor(new Date(userData.eklenme) / 1000)}:F>`, inline: true },
          { name: "Çıkaran Yetkili", value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
          { name: "Çıkarılma Zamanı", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: "Kara Liste Durumu", value: `Toplam ${karaliste.length} kullanıcı`, inline: true }
        )
        .setColor("#00AAFF")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setAuthor({ name: "Kara Liste Sistemi", iconURL: client.user.displayAvatarURL() })
        .setFooter({
          text: `Kara Liste ID: ${Date.now().toString(36).toUpperCase()}`,
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

      const userRemovalDMEmbed = new EmbedBuilder()
        .setTitle("Kara Liste Bilgilendirmesi")
        .setDescription(`Sayın ${user.tag},\n\nSunucumuzun kara listesinden çıkarıldığınızı bildirmek isteriz.`)
        .addFields(
          { name: "Yetkili", value: `${interaction.user.tag}`, inline: true },
          { name: "Tarih", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: "Not", value: "Artık sunucumuza tekrar katılabilirsiniz. Hoş geldiniz!", inline: false }
        )
        .setColor("#00AAFF")
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setFooter({
          text: `Kara Liste ID: ${Date.now().toString(36).toUpperCase()}`,
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

      try {
        await user.send({ embeds: [userRemovalDMEmbed] });
        removedEmbed.addFields({ name: "DM Durumu", value: "Kullanıcıya bilgilendirme DM'i gönderildi", inline: false });
      } catch (dmError) {
        console.error("DM gönderme hatası:", dmError);
        removedEmbed.addFields({ name: "DM Durumu", value: "Kullanıcıya DM gönderilemedi (DM kapalı olabilir)", inline: false });
      }

      await interaction.editReply({ embeds: [removedEmbed], ephemeral: false });
    }
  },
};