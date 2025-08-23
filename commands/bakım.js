const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const BAKIM_JSON_PATH = path.join(__dirname, "..", "bakim.json");

// Komutu GÖREBİLECEK ve KULLANABİLECEK kullanıcı ID'leri
const YETKILI_IDLER = ["808741421229539348", "SAHIP_ID_2"]; // Sadece bu ID'ler komutu görebilecek

module.exports = {
  name: "bakım",
  description: "[BOT OWNER] Botu bakım moduna alır veya çıkarır",
  type: 1,
  options: [
    {
      name: "durum",
      description: "Bakım modunu aç/kapat",
      type: 3,
      required: true,
      choices: [
        { name: "Aç", value: "ac" },
        { name: "Kapat", value: "kapat" },
      ],
    },
    {
      name: "sebep",
      description: "Bakım sebebi (isteğe bağlı)",
      type: 3,
      required: false,
    },
  ],

  
  async visible(client, interaction) {
    return YETKILI_IDLER.includes(interaction.user.id);
  },

  run: async (client, interaction) => {
    
    if (!YETKILI_IDLER.includes(interaction.user.id)) {
      return interaction.reply({
        content: "❌ Bu komut sadece bot sahiplerine özeldir!",
        ephemeral: true,
      });
    }

    const durum = interaction.options.getString("durum");
    const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi";

    if (durum === "ac") {
      const data = {
        aktif: true,
        sebep,
        baslangic: new Date().toISOString(),
      };
      fs.writeFileSync(BAKIM_JSON_PATH, JSON.stringify(data, null, 2));

      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("🔧 **BAKIM MODU AKTİF**")
        .setDescription(
          `**Sebep:** ${sebep}\n\n` +
          `> ⚠️ **Bot şu anda bakım modunda!**\n` +
          `> Sadece yetkili kişiler komutları kullanabilir.\n\n` +
          `**Başlangıç:** <t:${Math.floor(Date.now()/1000)}:R>`
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      client.user.setPresence({
        status: "dnd",
        activities: [{ name: "🔧 Bakım Modu Aktif", type: 3 }],
      });

    } else if (durum === "kapat") {
      const data = {
        aktif: false,
        sebep: "",
      };
      fs.writeFileSync(BAKIM_JSON_PATH, JSON.stringify(data, null, 2));

      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("✅ **BAKIM MODU KAPATILDI**")
        .setDescription("Bot artık normal şekilde çalışıyor.")
        .setFooter({ text: `Bakım süresi: ${Math.floor((Date.now() - new Date(require(BAKIM_JSON_PATH).baslangic).getTime())/60000)} dakika` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      client.user.setPresence({
        status: "online",
        activities: [{ name: "/yardım", type: 2 }],
      });
    }
  },
};