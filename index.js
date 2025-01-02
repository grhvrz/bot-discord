const { Client, GatewayIntentBits, PermissionsBitField, ActivityType } = require('discord.js');
require('dotenv').config(); // Memuat variabel lingkungan
const { handleMention } = require('./pesan');
const { handleReply } = require('./replay');
const { handleTakeRole } = require('./getrole');
const { handleLogs } = require('./logs');

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

    // Mengatur aktivitas bot
    client.user.setActivity('DONGKRAK', { type: ActivityType.Playing });


    // memanggil function
    handleMention(client);
    handleReply(client);
    handleTakeRole(client);
    handleLogs(client);
});


// Login dengan token
client.login(process.env.TOKEN).catch((err) => {
    console.error('Gagal login:', err);
});

module.exports = { client }; 







