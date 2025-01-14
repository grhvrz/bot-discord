const { Client, GatewayIntentBits, PermissionsBitField, ActivityType } = require('discord.js');
require('dotenv').config(); // Memuat variabel lingkungan
const { handleMention } = require('./pesan');
const { handleReply } = require('./replay');
const { handleLogs } = require('./logs');
const { handleAntiLink } = require('./configlink');
const { handleThreed } = require('./threed');

// Membuat instance client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

// Event ketika bot siap
client.once('ready', () => {
    console.log(`Bot sudah online sebagai ${client.user.tag}`);

    // Daftar aktivitas
    const activities = [
        { name: 'DONGKRAK', type: ActivityType.Playing },
        { name: 'ALL THE MODS', type: ActivityType.Playing },
        { name: 'MFX', type: ActivityType.Playing }
    ];

    let currentActivity = 0; // Index aktivitas saat ini

    // Fungsi untuk mengganti aktivitas
    const changeActivity = () => {
        const activity = activities[currentActivity];
        client.user.setActivity(activity.name, { type: activity.type });

        // Pindah ke aktivitas berikutnya, ulang ke awal jika sudah di akhir
        currentActivity = (currentActivity + 1) % activities.length;
    };

    // Panggil fungsi pertama kali
    changeActivity();

    // Ganti aktivitas setiap 10 detik
    setInterval(changeActivity, 10000);


    // memanggil function
    handleMention(client);
    handleReply(client);
    handleLogs(client);
    handleAntiLink(client);
    handleThreed(client);
});


// Login dengan token
client.login(process.env.TOKEN).catch((err) => {
    console.error('Gagal login:', err);
});

module.exports = { client }; 







