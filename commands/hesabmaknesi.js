const { Client, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "hesapla",
  description: "Aritmetik hesaplama yapar.",
  type: 1,
  options: [
    {
      name: "işlem",
      description: "Yapmak istediğiniz işlemi seçin.",
      type: 3,
      required: true,
      choices: [
        { name: "Toplama", value: "toplama" },
        { name: "Çıkarma", value: "cikarma" },
        { name: "Çarpma", value: "carpma" },
        { name: "Bölme", value: "bolme" },
        { name: "Modül", value: "modul" },  // Yeni işlem ekledik
        { name: "Üssünü Alma", value: "ussunu" }  // Yeni işlem ekledik
      ]
    },
    {
      name: "sayı1",
      description: "Birinci sayıyı girin.",
      type: 4, // INTEGER
      required: true
    },
    {
      name: "sayı2",
      description: "İkinci sayıyı girin.",
      type: 4, // INTEGER
      required: true
    }
  ],

  run: async (client, interaction) => {
    const işlem = interaction.options.getString("işlem");
    const sayi1 = interaction.options.getInteger("sayı1");
    const sayi2 = interaction.options.getInteger("sayı2");
    let sonuc;

    // Yapılacak işleme göre hesaplama
    switch (işlem) {
      case "toplama":
        sonuc = sayi1 + sayi2;
        break;
      case "cikarma":
        sonuc = sayi1 - sayi2;
        break;
      case "carpma":
        sonuc = sayi1 * sayi2;
        break;
      case "bolme":
        if (sayi2 === 0) {
          return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Sıfıra bölme hatası!" });
        }
        sonuc = sayi1 / sayi2;
        break;
      case "modul":
        if (sayi2 === 0) {
          return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Sıfıra modül hatası!" });
        }
        sonuc = sayi1 % sayi2;
        break;
      case "ussunu":
        sonuc = Math.pow(sayi1, sayi2);  // Üs alma işlemi
        break;
      default:
        return interaction.reply({ content: "<a:carpi:1227670096462221363>  | Geçersiz işlem!" });
    }

    // Embed oluşturma
    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle("Hesaplama Sonucu")
      .setDescription(`**İşlem:** ${sayi1} ${işlem} ${sayi2}\n**Sonuç:** ${sonuc}`)
      .setFooter({ text: "Hesaplama Botu" });

    interaction.reply({ embeds: [embed] });
  }
};
