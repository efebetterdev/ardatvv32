const db = require("croxydb");
const { PermissionFlagsBits, EmbedBuilder, Events, PermissionsBitField } = require("discord.js");
const Discord = require("discord.js");

module.exports = {
    name: "messageCreate",
    once: false,
    run: async (client, message) => {
        try {
            if (message.author.bot || !message.guild) return;

            const xp = db.fetch(`xpPos_${message.author.id}${message.guild.id}`) || 0;
            const level = db.fetch(`levelPos_${message.author.id}${message.guild.id}`) || 0;
            const levellog = db.fetch(`level_log_${message.guild.id}`);
            const acikmi = db.fetch(`acikmiLevel_${message.guild.id}`);
            
            if (acikmi) {
                if (xp >= 99) {
                    db.subtract(`xpPos_${message.author.id}${message.guild.id}`, xp);
                    db.add(`levelPos_${message.author.id}${message.guild.id}`, 1);

                    client.channels.cache.get(levellog)?.send(`${message.author} GG! Yeni seviyen: **${level + 1}**`);
                } else {
                    db.add(`xpPos_${message.author.id}${message.guild.id}`, 1);
                }
            }

            if (await db.get(`afk_${message.author.id}`)) {
                const afkDate = await db.fetch(`afkDate_${message.author.id}`);
                const sebep = await db.fetch(`afk_${message.author.id}`);
                if (afkDate && sebep) {
                    message.reply(`${message.author} Hoş geldin! **${sebep}** sebebiyle <t:${parseInt(afkDate.date / 1000)}:R> afk'ydın.`);
                    db.delete(`afk_${message.author.id}`);
                    db.delete(`afkDate_${message.author.id}`);
                }
            }

            const kullanıcı = message.mentions.users.first();
            if (kullanıcı) {
                const sebep = await db.get(`afk_${kullanıcı.id}`);
                if (sebep) {
                    message.reply(`❔ | Etiketlediğin kullanıcı **${sebep}** sebebiyle afk modunda!`);
                }
            }

            
            const kufur = db.fetch(`kufurengel_${message.guild.id}`);
            if (kufur) {
                const kufurler = [ "sikik", "sikeyim", "sikiyim", "piç", "yarrak", "oç", "göt", "orospu", "sikim",
        "pezevenk", "ibne", "top", "mal", "salak", "aptal", "gerizekalı", "hödük",
        "dangalak", "şerefsiz", "it", "kaltak", "yavşak", "taşşak", "sürtük",
        "haysiyetsiz", "adi", "puşt", "şıllık", "lavuk", "sikimsonik", "bok", "sokuk",
        "godoş", "domal", "döl", "taşak", "lanet olası", "ananı avradını", "sülaleni",
        "soysuz", "kancık", "namussuz", "edebsiz", "rezil", "alçak", "dümbük",
        "fahişe", "sapkın", "manyak", "zibidi", "sapık", "züppe", "zındık", "kahpe",
        "orospu çocuğu", "şıllık", "sikerim", "ananı sikerim", "babanı sikerim",
        "ananı avradını sikerim", "ananın amına koyayım", "ananı bacını sikerim",
        "orospu evladı", "sikeyim seni", "götünü sikeyim", "karını sikerim",
        "kardeşini sikerim", "ananın nikahını sikerim", "ananın memelerini sikerim",
        "ananın amına sokayım", "ananın amına vurayım", "ananın amını sikerim",
        "ananı sikerim orospu", "ananı sikerim pezevenk", "ananın amına sıçayım",
        "ananın amına beton dökeyim", "ananın amına inşaat yapayım",
        "ananın amına asfalt dökeyim", "ananın amına yol yapayım", "ananın amına bina yapayım",
        "ananın amına gökdelen dikeceğim", "ananın amına AVM yapayım",
        "ananın amına otoban yapayım", "ananın amına yol çekeyim", "ananın amına metro yapayım",
        "ananın amına ray döşeyeyim", "ananın amına tramvay yapayım", "ananın amına köprü yapayım",
        "ananın amına feribot koyayım", "ananın amına uçak indirsinler",
        "ananın amına havaalanı yapayım", "ananın amına hava trafik kulesi dikeyim",
        "ananın amına pist yapayım", "ananın amına tünel yapayım",
        "ananın amına hidroelektrik santral yapayım", "ananın amına baraj yapayım",
        "ananın amına termik santral kurayım", "ananın amına güneş panelleri koyayım",
        "ananın amına rüzgar türbini dikeceğim", "ananın amına su kanalı açayım",
        "ananın amına nükleer santral kurayım", "ananın amına radyoaktif madde gömeyim",
        "ananın amına CERN hızlandırıcısı kurayım", "ananın amına teleskop yerleştireyim",
        "ananın amına Mars'a giden roket fırlatayım", "ananın amına uzay üssü yapayım",
        "ananın amına ISS kurayım", "ananın amına astronot eğitme merkezi açayım",
        "ananın amına gezegenler arası asansör yapayım", "ananın amına Elon Musk'ın roketlerini dikeceğim",
        "ananın amına Starship iniş yapsın", "ananın amına Ay'a iniş yapayım",
        "ananın amına NASA üssü kurayım", "ananın amına SpaceX fırlatma rampası yapayım",
        "31"

                ];
                if (kufurler.some(word => message.content.toLowerCase().includes(word))) {
                    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                        message.delete();
                        message.channel.send(`${message.author}, küfür etmek yasaktır!`).then(msg => setTimeout(() => msg.delete(), 5000));
                    }
                }
            }

           
            const reklamlar = db.fetch(`reklamengel_${message.guild.id}`);
            if (reklamlar) {
                const linkler = [".com", ".net", ".org", "https://", "http://", ".gg"];
                if (linkler.some(alo => message.content.toLowerCase().includes(alo))) {
                    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                        message.delete();
                        message.channel.send(`${message.author}, reklam yapmak yasaktır!`).then(msg => setTimeout(() => msg.delete(), 5000));
                    }
                }
            }

            
            const data = db.fetch(`yasaklı_kelime_${message.guild.id}`);
            if (data) {
                if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    const yasakliKelimeler = data.map(kelime => kelime.toLowerCase());
                    if (yasakliKelimeler.some(kelime => message.content.toLowerCase().includes(kelime))) {
                        message.delete();
                        message.channel.send(`${message.author}, yasaklı kelime kullanmayınız!`).then(msg => setTimeout(() => msg.delete(), 5000));
                    }
                }
            }

            
            const saas = db.fetch(`saas_${message.guild.id}`);
            if (saas) {
                const selaamlar = ["sa", "slm", "sea", "selam", "selamünaleyküm"];
                if (selaamlar.includes(message.content.toLowerCase())) {
                    message.channel.send(`<@${message.author.id}> aleyküm selam, hoş geldin!`);
                }
            }

           
            if (message.content.length > 4) {
                if (db.fetch(`capslockengel_${message.guild.id}`)) {
                    if (message.content === message.content.toUpperCase() && !message.mentions.users.first()) {
                        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                            message.delete();
                            message.channel.send(`${message.author}, büyük harf kullanımı engelleniyor!`).then(msg => setTimeout(() => msg.delete(), 5000));
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Bir hata oluştu:', err);
        }
    }
};