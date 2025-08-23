const { Client, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage, registerFont } = require("canvas");
const moment = require("moment");
const path = require("path");
moment.locale("tr");

// Color scheme configuration
const colorScheme = {
  primary: "#1a1a2e",
  secondary: "#16213e",
  text: "#ffffff",
  accent: "#4cc9f0",
  backgroundGradient: ["#1a1a2e", "#16213e"],
  infoBox: "rgba(0, 0, 0, 0.3)",
  status: {
    online: "#3ba55c",
    idle: "#faa81a",
    dnd: "#ed4245",
    offline: "#747f8d"
  }
};

// Font registration
try {
  registerFont(path.join(__dirname, 'fonts', 'Poppins-Bold.ttf'), { family: 'Poppins', weight: 'bold' });
  registerFont(path.join(__dirname, 'fonts', 'Poppins-Regular.ttf'), { family: 'Poppins' });
} catch {
  console.log('Özel fontlar yüklenemedi, varsayılan fontlar kullanılacak');
}

// Custom roundRect function
function roundRect(ctx, x, y, width, height, radius) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  return ctx;
}

module.exports = {
  name: "kullanıcı-bilgi",
  description: "Kullanıcı hakkında detaylı bilgi gösterir",
  type: 1,
  options: [
    {
      name: "kullanıcı",
      description: "Bilgilerini görmek istediğiniz kullanıcı",
      type: 6,
      required: false
    },
    {
      name: "gizli",
      description: "Sadece senin görebileceğin bir mesaj olarak gönder",
      type: 5,
      required: false
    }
  ],

  run: async (client, interaction) => {
    try {
      const ephemeral = interaction.options.getBoolean("gizli") || false;
      await interaction.deferReply({ ephemeral });

      const user = interaction.options.getUser("kullanıcı") || interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);

      if (!member) {
        return interaction.editReply({
          content: "<a:carpi:1227670096462221363>  Bu kullanıcı sunucuda bulunamadı",
          ephemeral: true
        });
      }

      // Canvas setup with larger dimensions
      const canvas = createCanvas(1100, 750);
      const ctx = canvas.getContext("2d");

      // Draw background
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGradient.addColorStop(0, colorScheme.backgroundGradient[0]);
      bgGradient.addColorStop(1, colorScheme.backgroundGradient[1]);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw decorative elements
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 6 + 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Corner decorations
      ctx.strokeStyle = "rgba(100, 200, 255, 0.2)";
      ctx.lineWidth = 2;
      const cornerSize = 30;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(40, 40);
      ctx.lineTo(40 + cornerSize, 40);
      ctx.moveTo(40, 40);
      ctx.lineTo(40, 40 + cornerSize);
      // Top-right
      ctx.moveTo(canvas.width - 40, 40);
      ctx.lineTo(canvas.width - 40 - cornerSize, 40);
      ctx.moveTo(canvas.width - 40, 40);
      ctx.lineTo(canvas.width - 40, 40 + cornerSize);
      // Bottom-left
      ctx.moveTo(40, canvas.height - 40);
      ctx.lineTo(40 + cornerSize, canvas.height - 40);
      ctx.moveTo(40, canvas.height - 40);
      ctx.lineTo(40, canvas.height - 40 - cornerSize);
      // Bottom-right
      ctx.moveTo(canvas.width - 40, canvas.height - 40);
      ctx.lineTo(canvas.width - 40 - cornerSize, canvas.height - 40);
      ctx.moveTo(canvas.width - 40, canvas.height - 40);
      ctx.lineTo(canvas.width - 40, canvas.height - 40 - cornerSize);
      ctx.stroke();

      // Main info box
      ctx.fillStyle = colorScheme.infoBox;
      roundRect(ctx, 40, 40, canvas.width - 80, canvas.height - 80, 15);
      ctx.fill();
      // Border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      roundRect(ctx, 40, 40, canvas.width - 80, canvas.height - 80, 15);
      ctx.stroke();

      // Date and time
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "16px 'Poppins', 'Arial'";
      const dateText = moment().format("DD MMMM YYYY - dddd");
      const timeText = moment().format("HH:mm:ss");
      const dateWidth = ctx.measureText(dateText).width;
      const timeWidth = ctx.measureText(timeText).width;
      ctx.fillText(dateText, canvas.width - dateWidth - 60, 70);
      ctx.fillText(timeText, canvas.width - timeWidth - 60, 95);

      // Avatar position adjusted to be more centered
      const avatarX = 80; // Increased from 40 to 80 (moved right)
      const avatarY = 80;
      const avatarSize = 160;
      const avatarRadius = 80;

      // Draw user avatar
      try {
        const avatar = await loadImage(user.displayAvatarURL({ 
          extension: 'png', 
          size: 256,
          forceStatic: true 
        }));
        
        // Avatar shadow
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 5;
        ctx.beginPath();
        ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius + 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();
        ctx.restore();
        
        // Avatar with border
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        // Vignette effect
        const gradient = ctx.createRadialGradient(
          avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius / 2,
          avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius
        );
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.5)");
        ctx.fillStyle = gradient;
        ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
        
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
        
        // Status indicator
        ctx.beginPath();
        ctx.arc(avatarX + avatarRadius + 50, avatarY + avatarRadius + 50, 18, 0, Math.PI * 2, true);
        ctx.fillStyle = colorScheme.status[member.presence?.status || 'offline'];
        ctx.fill();
        ctx.strokeStyle = "#1a1a2e";
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Inner white ring
        ctx.beginPath();
        ctx.arc(avatarX + avatarRadius + 50, avatarY + avatarRadius + 50, 14, 0, Math.PI * 2, true);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
      } catch (error) {
        console.error("Avatar yüklenirken hata:", error);
        // Fallback avatar
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        roundRect(ctx, avatarX, avatarY, avatarSize, avatarSize, avatarRadius);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px 'Arial'";
        ctx.textAlign = "center";
        ctx.fillText("Avatar", avatarX + avatarRadius, avatarY + avatarRadius - 10);
        ctx.fillText("Yüklenemedi", avatarX + avatarRadius, avatarY + avatarRadius + 20);
      }

      // Draw header - adjusted position to align with moved avatar
      const headerX = avatarX + avatarSize + 30; // 80 + 160 + 30 = 270
      ctx.fillStyle = colorScheme.text;
      ctx.font = "bold 36px 'Poppins', 'Arial'";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 5;
      ctx.fillText(`${user.username}`, headerX, 100);
      
      if (user.discriminator !== '0') {
        ctx.font = "24px 'Poppins', 'Arial'";
        ctx.fillText(`#${user.discriminator}`, headerX + ctx.measureText(user.username).width + 10, 100);
      }
      
      ctx.font = "20px 'Poppins', 'Arial'";
      ctx.fillStyle = "#aaaaaa";
      ctx.fillText("Kullanıcı Profil Bilgileri", headerX, 130);
      ctx.shadowBlur = 0;
      
      // Divider line - adjusted position
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headerX, 150);
      ctx.lineTo(canvas.width - 60, 150);
      ctx.stroke();

      // Prepare user info
      const statusMap = {
        online: "🟢 Çevrimiçi",
        idle: "🌙 Boşta",
        dnd: "⛔ Rahatsız Etmeyin",
        offline: "⚫ Çevrimdışı"
      };
      
      const flags = user.flags?.toArray() || [];
      const badgeNames = {
        ActiveDeveloper: "👨‍💻 Aktif Geliştirici",
        BugHunterLevel1: "🐛 Hata Avcısı",
        BugHunterLevel2: "🐛 Hata Avcısı Seviye 2",
        PremiumEarlySupporter: "🌟 Erken Destekçi",
        Partner: "🤝 Discord Partneri",
        Staff: "👨‍💼 Discord Ekibi",
        HypeSquadOnlineHouse1: "⚡ HypeSquad Bravery",
        HypeSquadOnlineHouse2: "💖 HypeSquad Brilliance",
        HypeSquadOnlineHouse3: "✨ HypeSquad Balance",
        Hypesquad: "⚡ HypeSquad Etkinlikleri",
        CertifiedModerator: "<:admin:1296904503966044190>Sertifikalı Moderator",
        VerifiedDeveloper: "✔️ Onaylı Geliştirici"
      };
      
      const badges = flags.map(flag => badgeNames[flag] || flag).join(", ") || "Yok";
      
      const userInfo = [
        { title: "👤 Kullanıcı", value: user.tag },
        { title: "🆔 ID", value: user.id },
        { title: "📛 Takma Ad", value: member.nickname || "Yok" },
        { title: "🎖️ Rozetler", value: badges },
        { title: " Hesap Oluşturulma", value: moment(user.createdAt).format("LL LTS") },
        { title: "⏳ Hesap Yaşı", value: moment(user.createdAt).fromNow(true) + " önce" },
        { title: "📆 Sunucuya Katılma", value: moment(member.joinedAt).format("LL LTS") },
        { title: "⏱️ Sunucuda Süre", value: moment(member.joinedAt).fromNow(true) + " önce" },
        { title: "📊 Durum", value: statusMap[member.presence?.status] || "Bilinmiyor" },
        { title: "📱 Cihaz", value: getActiveDevices(member.presence) || "Bilinmiyor" },
        { title: "🎭 Rol Sayısı", value: (member.roles.cache.size - 1).toString() },
        { title: "👑 En Yüksek Rol", value: member.roles.highest.name || "Yok" },
        { title: "💎 Boost Durumu", value: member.premiumSince ? 
          `${moment(member.premiumSince).fromNow()} (${moment(member.premiumSince).format("LL")})` : "Boost yok" },
        { title: "<:bot:1382376704265424941> Bot", value: user.bot ? "Evet" : "Hayır" }
      ];

      // Draw user info with adjusted layout
      const startX = headerX; // Use headerX instead of fixed 250
      let currentY = 180;
      const boxWidth = canvas.width - startX - 60;
      const boxHeight = 32;
      const gap = 5;
      const titleWidth = 220;
      const valueStartX = startX + titleWidth + 15;
      const maxValueWidth = boxWidth - titleWidth - 30;

      ctx.font = "18px 'Poppins', 'Arial'";
      
      userInfo.forEach((info, index) => {
        // Alternating background colors
        ctx.fillStyle = index % 2 === 0 ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)";
        roundRect(ctx, startX, currentY, boxWidth, boxHeight, 5);
        ctx.fill();
        
        // Title
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "bold 18px 'Poppins', 'Arial'";
        ctx.fillText(info.title, startX + 15, currentY + 22);
        
        // Value with text wrapping
        ctx.fillStyle = colorScheme.text;
        ctx.font = "18px 'Poppins', 'Arial'";
        
        const words = info.value.split(' ');
        let line = '';
        let lineCount = 0;
        const maxLines = 2;
        const lineHeight = 22;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxValueWidth && n > 0) {
            if (lineCount < maxLines - 1) {
              ctx.fillText(line, valueStartX, currentY + 22 + (lineCount * lineHeight));
              line = words[n] + ' ';
              lineCount++;
            } else {
              line = line.substring(0, line.length - 3) + '...';
              break;
            }
          } else {
            line = testLine;
          }
        }
        
        ctx.fillText(line, valueStartX, currentY + 22 + (lineCount * lineHeight));
        currentY += boxHeight + gap + (lineCount > 0 ? lineHeight * lineCount : 0);
      });

      // Helper function for device detection
      function getActiveDevices(presence) {
        if (!presence?.clientStatus) return null;
        const deviceMap = {
          desktop: "🖥️ Masaüstü",
          mobile: "📱 Mobil",
          web: "🌐 Web"
        };
        return Object.keys(presence.clientStatus).map(device => deviceMap[device] || device).join(", ");
      }

      // Create and send attachment
      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `${user.username}_bilgi.png` });
      await interaction.editReply({ files: [attachment] });

    } catch (error) {
      console.error("Kullanıcı bilgi komutunda hata:", error);
      await interaction.editReply({
        content: "<a:carpi:1227670096462221363>  Bilgileri işlerken bir hata oluştu",
        ephemeral: true
      });
    }
  }
};