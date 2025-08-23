const { Client, EmbedBuilder } = require("discord.js");

// Sabit Atatürk resimlerini içeren dizi
function getAtaturkResimleri() {
  return [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAKPSllbwHiKzmOxzP6lbJ5d3__lySb04Z1a6oIoFGSADbvzDps6AImI3uRg&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYmeNv6BW_tdV2zuumhUZz30c5Hw9XKxUxn0ZxZvMIXMyVrfOsTBMKC4NYtHM&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTovIma3A6zjzN8i_wG_2o_hGNKgImWnCyA1TqAza01W_cDlpt3t_tuO4ZxHw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAniTEDJPaBqtgxsDJHtltYQyGRiqYAMcI1U0uFkiI3hrErtzx7jfoed7fvg&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1CK3mGej9aMiBgZP0WSN0dwvp3zLsauhs2WjhOfxoSMIlNuqrshHpozYspQ&s"
  ];
}

module.exports = {
  name: "ataturkresmi",
  description: "Rastgele Atatürk Resmi Gönderir.",
  type: 1,

  run: async (client, interaction) => {
    try {
      
      const resimler = getAtaturkResimleri();
      const randomResim = resimler[Math.floor(Math.random() * resimler.length)];

      const embed = new EmbedBuilder()
        .setColor("#3498db")
        .setTitle("Rastgele Atatürk Resmi")
        .setDescription("ATATÜRK RESİMLERİ")
        .setImage(randomResim) 
        .setFooter({ text: "Her zaman ileri!" });

      interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (err) {
      console.error("Bir hata oluştu:", err);

      interaction.reply({
        content: "<a:carpi:1227670096462221363>  | Atatürk resmi alınırken bir hata oluştu.",
        ephemeral: true,
      });
    }
  },
};