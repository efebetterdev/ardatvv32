const { AttachmentBuilder } = require("discord.js");
const Canvas = require("canvas");

module.exports = {
  name: "ship",
  description: "İki kullanıcı arasındaki aşk yüzdesini gösterir.",
  type: 1,
  options: [
    {
      name: "kullanıcı",
      description: "Aşkla bağlanmak istediğiniz kişi.",
      type: 6,
      required: true
    }
  ],

  run: async (client, interaction) => {
    const user1 = interaction.user;
    const user2 = interaction.options.getUser("kullanıcı");

    const canvas = Canvas.createCanvas(753, 370);
    const ctx = canvas.getContext("2d");


    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, "#2e003e");
    bgGradient.addColorStop(1, "#55003a");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 40 + 10;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, "rgba(255, 182, 193, 0.35)");
      gradient.addColorStop(1, "rgba(255, 182, 193, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ffcc66";
    ctx.fillRect(0, 0, canvas.width, 50);

    const topHearts = "💖 💘 💝 💞 💗 💓 💌 💍";
    ctx.font = "18px serif";
    ctx.fillStyle = "#fff";
    const textWidth = ctx.measureText(topHearts).width;
    ctx.fillText(topHearts, (canvas.width - textWidth) / 2, 32);

   
    const avatar1 = await Canvas.loadImage(user1.displayAvatarURL({ extension: "jpg", size: 256 }));
    const avatar2 = await Canvas.loadImage(user2.displayAvatarURL({ extension: "jpg", size: 256 }));

    const drawCircularAvatar = (x, y, img) => {
      const radius = 70;
      const gradient = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
      gradient.addColorStop(0, "#ff66cc");
      gradient.addColorStop(1, "#ffddee");

      ctx.beginPath();
      ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
      ctx.restore();
    };

    const avatarY = 160;
    const avatarX1 = 140;
    const avatarX2 = 613;

   
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(user1.username, avatarX1, avatarY - 85);
    ctx.fillStyle = "#00ffff";
    ctx.fillText(user2.username, avatarX2, avatarY - 85);

    drawCircularAvatar(avatarX1, avatarY, avatar1);
    drawCircularAvatar(avatarX2, avatarY, avatar2);

    
    ctx.font = "22px serif";
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = "white";
      ctx.fillText("🤍", 10, 90 + i * 24);
      ctx.fillText("🤍", 725, 90 + i * 24);
    }

   
    const percent = Math.floor(Math.random() * 101);
    const percentHeight = Math.floor((percent / 100) * 180);
    const barX = (canvas.width - 50) / 2;
    const barY = 80;
    const barWidth = 50;
    const barHeight = 180;

    const barGradient = ctx.createLinearGradient(0, barY, 0, barY + barHeight);
    barGradient.addColorStop(0, "#ffb6c1");
    barGradient.addColorStop(1, "#ff1493");

    ctx.fillStyle = barGradient;
    ctx.fillRect(barX, barY + (barHeight - percentHeight), barWidth, percentHeight);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    
    let heart = "💔";
    if (percent >= 85) heart = "💘";
    else if (percent >= 40) heart = "💖";

    ctx.fillStyle = "white";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(`${percent}%`, barX + barWidth / 2, barY + barHeight + 20);

    ctx.font = "20px serif";
    ctx.fillText("💝", barX + 60, barY + 30);
    ctx.fillText("💖", barX + 60, barY + 90);
    ctx.fillText("💘", barX + 60, barY + 150);

    ctx.font = "38px serif";
    ctx.fillText(heart, canvas.width / 2, barY + barHeight + 80);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "ship.png" });
    interaction.reply({ files: [attachment] });
  }
};
