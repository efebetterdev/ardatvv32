const { Client, AttachmentBuilder } = require("discord.js");
const db = require("croxydb");
const { createCanvas, loadImage } = require('canvas');
const { join } = require('path');

module.exports = {
  name: "afk",
  description: "AFK moduna geçersiniz",
  type: 1,
  options: [
    {
      name: "sebep",
      description: "AFK olma sebebinizi yazın",
      type: 3,
      required: true
    },
  ],

  run: async(client, interaction) => {
    const sebep = interaction.options.getString('sebep');
    const user = interaction.user;
    

    db.set(`afk_${user.id}`, sebep);
    db.set(`afkDate_${user.id}`, { date: Date.now() });
    db.set(`afkUsername_${user.id}`, user.username);

    const canvas = createCanvas(1000, 400);
    const ctx = canvas.getContext('2d');

   
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 5 + 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }


    try {
      const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
      
   
      ctx.beginPath();
      ctx.arc(200, 200, 120, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      ctx.drawImage(avatar, 80, 80, 240, 240);
      ctx.restore();
      
     
      ctx.strokeStyle = '#4cc9f0';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(200, 200, 120, 0, Math.PI * 2, true);
      ctx.stroke();
    } catch (err) {
      console.error('Avatar yüklenirken hata:', err);
    }

    
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    
    
    ctx.font = 'bold 50px "Arial"';
    ctx.fillText('AFK MODU', 400, 120);
    
 
    ctx.strokeStyle = '#4cc9f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(400, 140);
    ctx.lineTo(700, 140);
    ctx.stroke();

   
    ctx.font = 'italic 35px "Arial"';
    ctx.fillText(`${user.username}`, 400, 190);

    
    ctx.font = '30px "Arial"';
    wrapText(ctx, `🔹 Sebep: ${sebep}`, 400, 240, 500, 35);

    
    ctx.font = '25px "Arial"';
    const now = new Date();
    ctx.fillText(`⏰ ${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`, 400, 330);

    ctx.font = 'italic 20px "Arial"';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('Birisi seni etiketlediğinde AFK olduğunu hatırlatacağım!', 400, 370);

    
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'afk-card.png' });

    
    interaction.reply({ 
      content: ``,
      files: [attachment]
    });
  }
};

// Düzeltilmiş Metin kaydırma fonksiyonu
function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  const maxLines = 3;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      if (lineCount < maxLines) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
        lineCount++;
      } else {
        // Maksimum satır sayısına ulaşıldı, son satıra ... ekle
        context.fillText(line.trim() + '...', x, y);
        return;
      }
    } else {
      line = testLine;
    }
  }
  
  // Kalan metni çiz
  if (lineCount < maxLines) {
    context.fillText(line.trim(), x, y);
  }
}