const { Client, EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "adam-asmaca",
  description: "Adam asmaca oynayın!",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    const words = [
      { word: "javascript", hint: "Programlama dili" },
      { word: "python", hint: "Programlama dili" },
      { word: "discord", hint: "Sohbet platformu" },
      { word: "programlama", hint: "Bir meslek" },
      { word: "bilgisayar", hint: "Bir cihaz" },
      { word: "telefon", hint: "Günlük kullanılan bir cihaz" },
      { word: "klavye", hint: "Bilgisayar ekipmanı" },
      { word: "fare", hint: "Bilgisayar ekipmanı" },
      { word: "internet", hint: "Bağlantı sağlayan bir araç" },
      { word: "yazılım", hint: "Bilgisayar ile ilgili bir terim" },
      { word: "gitar", hint: "Bir müzik aleti" },
      { word: "futbol", hint: "Popüler bir spor dalı" },
      { word: "pizza", hint: "Bir yiyecek" },
      { word: "hamburger", hint: "Popüler bir fast-food" },
      { word: "kitap", hint: "Bilgi kaynağı" },
      { word: "robot", hint: "Mekanik bir varlık" },
      { word: "kamera", hint: "Fotoğraf çekme cihazı" },
      { word: "uçak", hint: "Havada hareket eden taşıt" },
      { word: "araba", hint: "Kara taşıtı" },
      { word: "tren", hint: "Ray üzerinde hareket eden taşıt" },
      { word: "güneş", hint: "Güneş sisteminin merkezi" },
      { word: "ay", hint: "Dünya'nın uydusu" },
      { word: "yıldız", hint: "Gökyüzünde parlayan bir nesne" },
      { word: "deniz", hint: "Büyük su kütlesi" },
      { word: "orman", hint: "Ağaçlarla kaplı alan" },
      { word: "kalem", hint: "Yazı yazma aracı" },
      { word: "defter", hint: "Yazı yazmak için kullanılan bir araç" },
      { word: "televizyon", hint: "Ekranlı bir cihaz" },
      { word: "kedi", hint: "Evcil bir hayvan" },
      { word: "köpek", hint: "Evcil bir hayvan" },
      { word: "kartal", hint: "Yırtıcı bir kuş" },
      { word: "uçurtma", hint: "Havada uçurulan oyuncak" },
      { word: "çikolata", hint: "Tatlı bir yiyecek" },
      { word: "balık", hint: "Suda yaşayan canlı" },
      { word: "kutu", hint: "Eşyaları koymak için kullanılan bir nesne" },
      { word: "saat", hint: "Zamanı gösteren bir araç" },
      { word: "elma", hint: "Bir meyve" },
      { word: "karpuz", hint: "Yaz mevsimi meyvesi" },
      { word: "muz", hint: "Sarı bir meyve" },
      { word: "çilek", hint: "Kırmızı ve tatlı bir meyve" },
      { word: "masa", hint: "Üzerinde çalışılan bir mobilya" },
      { word: "sandalye", hint: "Oturmak için kullanılan bir mobilya" },
      { word: "bisiklet", hint: "Pedallı bir taşıt" },
      { word: "motor", hint: "Taşıtın hareket etmesini sağlayan parça" },
      { word: "kaplumbağa", hint: "Yavaş hareket eden bir hayvan" },
      { word: "penguen", hint: "Kutup hayvanı" },
      { word: "kömür", hint: "Isınma amacıyla kullanılan bir madde" },
      { word: "çay", hint: "Sıcak bir içecek" },
      { word: "kahve", hint: "Kafeinli bir içecek" },
      { word: "bal", hint: "Arıların yaptığı tatlı besin" },
      { word: "dondurma", hint: "Soğuk bir tatlı" },
      { word: "kütüphane", hint: "Kitap okuma yeri" },
      { word: "müze", hint: "Tarihi eserlerin sergilendiği yer" },
      { word: "sinema", hint: "Film izleme yeri" },
      { word: "tiyatro", hint: "Sahne sanatları" },
      { word: "konser", hint: "Müzik etkinliği" },
      { word: "festival", hint: "Kültürel etkinlik" },
      { word: "spor", hint: "Fiziksel aktivite" },
      { word: "yüzme", hint: "Su sporlarından biri" },
      { word: "koşu", hint: "Kardiyo egzersizi" },
      { word: "yoga", hint: "Zihin ve beden egzersizi" },
      { word: "meditasyon", hint: "Zihinsel rahatlama" },
      { word: "resim", hint: "Sanat dalı" },
      { word: "heykel", hint: "Üç boyutlu sanat eseri" },
      { word: "fotoğraf", hint: "Görüntü yakalama sanatı" },
      { word: "müzik", hint: "Ses sanatı" },
      { word: "şarkı", hint: "Müzik eseri" },
      { word: "dans", hint: "Ritmik hareketler" },
      { word: "opera", hint: "Müzikal tiyatro" },
      { word: "bale", hint: "Dans türü" },
      { word: "film", hint: "Sinema eseri" },
      { word: "dizi", hint: "Televizyon programı" },
      { word: "belgesel", hint: "Gerçek olayların anlatımı" },
      { word: "haber", hint: "Güncel olaylar" },
      { word: "gazete", hint: "Haber kaynağı" },
      { word: "dergi", hint: "Periyodik yayın" },
      { word: "roman", hint: "Kurgusal hikaye" },
      { word: "hikaye", hint: "Kısa kurgusal anlatı" },
      { word: "şiir", hint: "Duygusal anlatım" },
      { word: "masal", hint: "Geleneksel hikaye" },
      { word: "efsane", hint: "Mitolojik hikaye" },
      { word: "mitoloji", hint: "Efsaneler bilimi" },
      { word: "tarih", hint: "Geçmiş olaylar" },
      { word: "coğrafya", hint: "Yer bilimi" },
    ];

    const chosen = words[Math.floor(Math.random() * words.length)];
    const chosenWord = chosen.word;
    const hint = chosen.hint;

    let remainingAttempts = 6;
    let guessedLetters = [];
    let displayWord = chosenWord.replace(/./g, "_");

    const hangmanStages = [
      "```\n\n\n\n\n_____\n```",                
      "```\n  |\n  |\n  |\n  |\n_____\n```",    
      "```\n  _______\n  |\n  |\n  |\n  |\n_____\n```", 
      "```\n  _______\n  |     |\n  |\n  |\n  |\n_____\n```", 
      "```\n  _______\n  |     |\n  |     O\n  |\n  |\n_____\n```", 
      "```\n  _______\n  |     |\n  |     O\n  |    /|\\\n  |\n_____\n```", 
      "```\n  _______\n  |     |\n  |     O\n  |    /|\\\n  |    / \\\n_____\n```" 
    ];

    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle("Adam Asmaca")
      .setDescription(
        `İpucu: **${hint}**\n${hangmanStages[6 - remainingAttempts]}\nKelime: \`${displayWord}\`\nKalan Hakkınız: ${remainingAttempts}`
      )
      .setFooter({ text: "Harf tahmin etmek için bir mesaj gönderin!" });

    const gameMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

    const filter = (msg) => msg.author.id === interaction.user.id && /^[a-zA-ZçöüğışÇÖÜĞİŞ]+$/.test(msg.content);
    const collector = gameMessage.channel.createMessageCollector({ filter, time: 120000 });

    collector.on("collect", (msg) => {
      const guess = msg.content.toLowerCase();

      if (guessedLetters.includes(guess)) {
        msg.reply("❌ Bu harfi zaten tahmin ettiniz!");
        return;
      }

    
      if (guess === chosenWord) {
        embed.setDescription(
          `🎉 Tebrikler, kelimeyi doğru tahmin ettiniz!\nKelime: \`${chosenWord}\``
        );
        interaction.editReply({ embeds: [embed] });
        collector.stop();
        return;
      }

      guessedLetters.push(guess);

      if (chosenWord.includes(guess)) {
        let newDisplay = "";
        for (let i = 0; i < chosenWord.length; i++) {
          if (guessedLetters.includes(chosenWord[i])) {
            newDisplay += chosenWord[i];
          } else {
            newDisplay += "_";
          }
        }
        displayWord = newDisplay;

        if (!displayWord.includes("_")) {
          embed.setDescription(
            `🎉 Tebrikler, kelimeyi doğru tahmin ettiniz!\nKelime: \`${displayWord}\``
          );
          interaction.editReply({ embeds: [embed] });
          collector.stop();
          return;
        }
      } else {
        remainingAttempts--;

        if (remainingAttempts === 0) {
          embed.setDescription(
            `${hangmanStages[6]}\n💀 Maalesef, tüm haklarınızı kaybettiniz!\nKelime: \`${chosenWord}\``
          );
          interaction.editReply({ embeds: [embed] });
          collector.stop();
          return;
        }
      }

      embed.setDescription(
        `İpucu: **${hint}**\n${hangmanStages[6 - remainingAttempts]}\nKelime: \`${displayWord}\`\nKalan Hakkınız: ${remainingAttempts}`
      );
      interaction.editReply({ embeds: [embed] });
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time") {
        embed.setDescription(
          `${hangmanStages[6]}\n⏰ Süre doldu! Kelime: \`${chosenWord}\``
        );
        interaction.editReply({ embeds: [embed] });
      }
    });
  },
};


