const { AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('canvas');
const weather = require('weather-js');

// Türkiye şehirleri için plaka bilgileri (tüm şehirler dahil)
const cityData = {
  'adana': { plaka: 1, name: 'Adana' },
  'adiyaman': { plaka: 2, name: 'Adıyaman' },
  'afyon': { plaka: 3, name: 'Afyonkarahisar' },
  'afyonkarahisar': { plaka: 3, name: 'Afyonkarahisar' },
  'agri': { plaka: 4, name: 'Ağrı' },
  'amasya': { plaka: 5, name: 'Amasya' },
  'ankara': { plaka: 6, name: 'Ankara' },
  'antalya': { plaka: 7, name: 'Antalya' },
  'artvin': { plaka: 8, name: 'Artvin' },
  'aydin': { plaka: 9, name: 'Aydın' },
  'balikesir': { plaka: 10, name: 'Balıkesir' },
  'batman': { plaka: 72, name: 'Batman' },
  'bayburt': { plaka: 69, name: 'Bayburt' },
  'bilecik': { plaka: 11, name: 'Bilecik' },
  'bingol': { plaka: 12, name: 'Bingöl' },
  'bitlis': { plaka: 13, name: 'Bitlis' },
  'bolu': { plaka: 14, name: 'Bolu' },
  'burdur': { plaka: 15, name: 'Burdur' },
  'bursa': { plaka: 16, name: 'Bursa' },
  'canakkale': { plaka: 17, name: 'Çanakkale' },
  'cankiri': { plaka: 18, name: 'Çankırı' },
  'corum': { plaka: 19, name: 'Çorum' },
  'denizli': { plaka: 20, name: 'Denizli' },
  'diyarbakir': { plaka: 21, name: 'Diyarbakır' },
  'edirne': { plaka: 22, name: 'Edirne' },
  'elazig': { plaka: 23, name: 'Elazığ' },
  'erzincan': { plaka: 24, name: 'Erzincan' },
  'erzurum': { plaka: 25, name: 'Erzurum' },
  'eskisehir': { plaka: 26, name: 'Eskişehir' },
  'gaziantep': { plaka: 27, name: 'Gaziantep' },
  'giresun': { plaka: 28, name: 'Giresun' },
  'gumushane': { plaka: 29, name: 'Gümüşhane' },
  'hakkari': { plaka: 30, name: 'Hakkari' },
  'hatay': { plaka: 31, name: 'Hatay' },
  'isparta': { plaka: 32, name: 'Isparta' },
  'mersin': { plaka: 33, name: 'Mersin' },
  'istanbul': { plaka: 34, name: 'İstanbul' },
  'izmir': { plaka: 35, name: 'İzmir' },
  'kars': { plaka: 36, name: 'Kars' },
  'kastamonu': { plaka: 37, name: 'Kastamonu' },
  'kayseri': { plaka: 38, name: 'Kayseri' },
  'kirklareli': { plaka: 39, name: 'Kırklareli' },
  'kirsehir': { plaka: 40, name: 'Kırşehir' },
  'kocaeli': { plaka: 41, name: 'Kocaeli' },
  'konya': { plaka: 42, name: 'Konya' },
  'kutahya': { plaka: 43, name: 'Kütahya' },
  'malatya': { plaka: 44, name: 'Malatya' },
  'manisa': { plaka: 45, name: 'Manisa' },
  'kahramanmaras': { plaka: 46, name: 'Kahramanmaraş' },
  'mardin': { plaka: 47, name: 'Mardin' },
  'mugla': { plaka: 48, name: 'Muğla' },
  'mus': { plaka: 49, name: 'Muş' },
  'nevsehir': { plaka: 50, name: 'Nevşehir' },
  'nigde': { plaka: 51, name: 'Niğde' },
  'ordu': { plaka: 52, name: 'Ordu' },
  'rize': { plaka: 53, name: 'Rize' },
  'sakarya': { plaka: 54, name: 'Sakarya' },
  'samsun': { plaka: 55, name: 'Samsun' },
  'siirt': { plaka: 56, name: 'Siirt' },
  'sinop': { plaka: 57, name: 'Sinop' },
  'sivas': { plaka: 58, name: 'Sivas' },
  'tekirdag': { plaka: 59, name: 'Tekirdağ' },
  'tokat': { plaka: 60, name: 'Tokat' },
  'trabzon': { plaka: 61, name: 'Trabzon' },
  'tunceli': { plaka: 62, name: 'Tunceli' },
  'sanliurfa': { plaka: 63, name: 'Şanlıurfa' },
  'usak': { plaka: 64, name: 'Uşak' },
  'van': { plaka: 65, name: 'Van' },
  'yozgat': { plaka: 66, name: 'Yozgat' },
  'zonguldak': { plaka: 67, name: 'Zonguldak' },
  'aksaray': { plaka: 68, name: 'Aksaray' },
  'karabuk': { plaka: 78, name: 'Karabük' },
  'karaman': { plaka: 70, name: 'Karaman' },
  'kirikkale': { plaka: 71, name: 'Kırıkkale' },
  'osmaniye': { plaka: 80, name: 'Osmaniye' },
  'duzce': { plaka: 81, name: 'Düzce' }
};

// Hava durumu ikonları
const weatherIcons = {
  'Sunny': '☀️', 'Clear': '🌙', 'Mostly Sunny': '⛅',
  'Partly Sunny': '⛅', 'Mostly Cloudy': '☁️', 'Cloudy': '☁️',
  'Rain': '🌧️', 'Rain Showers': '🌧️', 'Light Rain': '🌦️',
  'Thunderstorm': '⛈️', 'Snow': '❄️', 'Fog': '🌫️'
};

function normalizeCityName(city) {
  return city.toLowerCase()
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u');
}

module.exports = {
  name: 'hava-durumu',
  description: 'Belirtilen şehirdeki hava durumunu görsel olarak gösterir.',
  options: [
    {
      name: 'şehir',
      description: 'Hava durumu alınacak şehir',
      type: 3,
      required: true,
      autocomplete: true
    }
  ],

  autocomplete: async (interaction) => {
    const focusedValue = interaction.options.getFocused();
    if (!focusedValue) {
      await interaction.respond(
        Object.entries(cityData)
          .slice(0, 25)
          .map(([key, data]) => ({ name: data.name, value: key }))
      );
      return;
    }

    const normalizedInput = normalizeCityName(focusedValue);
    
    const filtered = Object.entries(cityData)
      .filter(([key, data]) => 
        normalizeCityName(key).includes(normalizedInput) || 
        normalizeCityName(data.name).includes(normalizedInput))
      .slice(0, 25)
      .map(([key, data]) => ({ name: data.name, value: key }));

    await interaction.respond(filtered);
  },

  run: async (client, interaction) => {
    const inputCity = interaction.options.getString('şehir').toLowerCase();
    const normalizedCity = normalizeCityName(inputCity);
    
    const cityEntry = Object.entries(cityData).find(
      ([key, data]) => key === normalizedCity || normalizeCityName(data.name) === normalizedCity
    );

    if (!cityEntry) {
      return interaction.reply({ 
        content: 'Geçersiz şehir adı! Lütfen Türkiye\'deki bir şehir adı girin.', 
        ephemeral: true 
      });
    }

    const [cityKey, cityInfo] = cityEntry;
    
    try {
      weather.find({search: `${cityInfo.name}, Turkey`, degreeType: 'C'}, async (err, result) => {
        if (err || !result || result.length === 0) {
          console.error('Hava durumu hatası:', err);
          return interaction.reply({
            content: `"${cityInfo.name}" şehrinin hava durumu alınamadı. Daha sonra tekrar deneyin.`,
            ephemeral: true
          });
        }

        const weatherData = result[0];
        const current = weatherData.current;
        const location = weatherData.location;
        
        const windDirection = current.winddisplay.split(' ')[1] || 'Bilinmiyor';
        
        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, '#1a2a6c');
        gradient.addColorStop(1, '#b21f1f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(location.name.toUpperCase(), 50, 50);
        ctx.font = '24px Arial';
        ctx.fillText(`Plaka: ${cityInfo.plaka}`, 50, 85);

        const weatherIcon = weatherIcons[current.skytext] || '🌤️';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(`${weatherIcon} ${current.temperature}°C`, 550, 70);
        ctx.font = '20px Arial';
        ctx.fillText(current.skytext, 550, 100);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(50, 150, 700, 200, 20);
        ctx.fill();

        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Hava Durumu Detayları', 60, 180);

        const details = [
          `Nem: ${current.humidity}%`,
          `Hissedilen: ${current.feelslike}°C`,
          `Rüzgar: ${current.winddisplay}`,
          `Basınç: ${current.pressure} hPa`,
          `Nem Oranı: ${current.humidity}%`,
          `Min/Max: ${weatherData.forecast[0].low}°C / ${weatherData.forecast[0].high}°C`
        ];

        ctx.font = '18px Arial';
        for (let i = 0; i < details.length; i++) {
          const x = i % 2 === 0 ? 100 : 450;
          const y = 220 + Math.floor(i / 2) * 40;
          ctx.fillText(details[i], x, y);
        }

        const now = new Date();
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`Son güncelleme: ${now.toLocaleString('tr-TR')}`, 50, 380);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'hava-durumu.png' });
        await interaction.reply({ files: [attachment] });
      });
    } catch (error) {
      console.error('Hava durumu hatası:', error);
      await interaction.reply({
        content: `"${cityInfo.name}" şehrinin hava durumu alınamadı. Daha sonra tekrar deneyin.`,
        ephemeral: true
      });
    }
  }
};