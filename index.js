const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config(); // Memuat variabel lingkungan
const { handleMention } = require('./pesan');
const { handleReply } = require('./replay');
const { handleChat } = require('./chat');
const { handleTakeRole } = require('./getrole');

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

// Fungsi untuk menangani reaksi pada foto di channel tertentu
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Abaikan pesan dari bot

    // ID channel tempat pesan foto dikirim
    const targetChannelId = '1321716046541099082';

    // Cek apakah pesan ada di channel yang tepat
    if (message.channel.id === targetChannelId) {
        // Cek apakah pesan mengandung lampiran gambar (foto)
        if (message.attachments.size > 0) {
            // Memeriksa apakah ada gambar (jenis file gambar)
            const imageAttachment = message.attachments.first();
            const fileExtension = imageAttachment.name.split('.').pop().toLowerCase();
            const validImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp','mp4'];

            if (validImageTypes.includes(fileExtension)) {
                try {
                    // Menambahkan reaksi :white_check_mark: ke pesan
                    await message.react('✅');  // Emoji :white_check_mark:
                } catch (err) {
                    console.error('Gagal menambahkan reaksi:', err);
                }
            }
        }
    }
});

// Event ketika bot siap
client.once('ready', () => {
    console.log(`Bot sudah online sebagai ${client.user.tag}`);

    // Mengatur aktivitas bot
    client.user.setActivity('DONGAK', { type: ActivityType.Playing });

    // memanggil function
    handleMention(client);
    handleReply(client);
    handleChat(client);
    handleTakeRole(client);
});

// Login dengan token
client.login(process.env.TOKEN).catch((err) => {
    console.error('Gagal login:', err);
});

module.exports = { client }; 







