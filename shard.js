const { ShardingManager, WebhookClient } = require('discord.js');
const config = require('./config.json');

const manager = new ShardingManager('./index.js', { //Burada main dosyanızın adı farklı ise değiştirmeniz gerek.
    token: config.token, //Tokenininin nerde olduğunu buradan ayarlamanız gerekiyor.
    totalShards: 1, //İsterseniz shard sayısını değiştirebilirsiniz. Ama shard sayısı değişmiyor diye biliyorum öyle ayarladım.
});

const webhook = new WebhookClient({ url: "" }); //Boş kısma webhook url gelecek.

manager.on('shardCreate', shard => {
    console.log(`🔄 Shard #${shard.id} başlatılıyor...`);

    shard.on('ready', async () => {
        console.log(`❌ Shard #${shard.id} çalışıyor.`);
        webhook.send(`<:pleasant_OK:1394248357328719964> **Shard #${shard.id} çalışıyor!**`);

        try {
            const pleasant_sunucu = await manager.broadcastEval(c => c.guilds.cache.size);
            const pleasant_üye = await manager.broadcastEval(c => c.users.cache.size);
            const pleasant_topsunucu = pleasant_sunucu.reduce((a, b) => a + b, 0);
            const pleasant_topüye = pleasant_üye.reduce((a, b) => a + b, 0);

            console.log(`🌍 Toplam Sunucu: ${pleasant_topsunucu}, Kullanıcı: ${pleasant_topüye}`);
            webhook.send(`<:pleasant_SERVER:1394248383396315197> **Toplam Sunucu:** ${pleasant_topsunucu}\n<:pleasant_USERS:1394248391424344225> **Toplam Kullanıcı:** ${pleasant_topüye}`);

        } catch (err) {
            console.error("❌ Sunucu veya kullanıcı verisi alınamadı:", err);
            webhook.send(`<:pleasant_X:1334148610614628436> **Hata:** \`\`\`${err.message}\`\`\``);
        }
    });

    shard.on('disconnect', () => webhook.send(`<:pleasant_WARN:1394248366942064660> **Shard #${shard.id} bağlantısı koptu.**`));
    shard.on('reconnecting', () => webhook.send(`<:pleasant_LOADNG:1394248347799388160> **Shard #${shard.id} tekrar bağlanıyor.**`));
    shard.on('error', error => webhook.send(`<:pleasant_X:1334148610614628436> **Shard #${shard.id} hata verdi!**\n\`\`\`${error.message}\`\`\``));
});

manager.spawn().then(() => console.log('✅ Tüm shardlar başlatıldı.'))
    .catch(err => console.error('Shard başlatma hatası:', err));