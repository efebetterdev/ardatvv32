const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const db = require("croxydb");

let lastUnix = null;
let isChecking = false;

async function kontrolEt(client) {
  if (isChecking) return;
  isChecking = true;

  try {
    const response = await axios.get("https://rudsdev.xyz/api/deprem", {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const deprem = response.data[0];
    if (!deprem || deprem.unix === lastUnix) return;

    lastUnix = deprem.unix;

    const embed = new EmbedBuilder()
      .setColor("#e74c3c")
      .setTitle("📢 Yeni Deprem Tespit Edildi!")
      .setDescription(
        `**Yer:** ${deprem.yer} ${deprem.sehir}\n📍 **Büyüklük:** ${deprem.buyukluk} ML\n⛏️ **Derinlik:** ${deprem.derinlik} km\n⏰ **Zaman:** ${deprem.tarih} - ${deprem.saat}`
      )
      .setTimestamp();

    const allData = db.all();
    const kanallar = Object.entries(allData)
      .filter(([key]) => key.startsWith("depremKanal_"))
      .map(([key, value]) => ({
        guildId: key.split("_")[1],
        channelId: value
      }));

    for (const { guildId, channelId } of kanallar) {
      try {
        const guild = await client.guilds.fetch(guildId).catch(() => null);
        const channel = guild?.channels.cache.get(channelId);
        if (channel?.isTextBased()) {
          await channel.send({ embeds: [embed] });
        }
      } catch (err) {
        console.error(`[${guildId}/${channelId}] kanalına mesaj gönderilemedi:`, err.message);
      }
    }
  } catch (err) {
    console.error("Deprem kontrol hatası:", err.message);
  } finally {
    isChecking = false;
  }
}

module.exports = { kontrolEt };
