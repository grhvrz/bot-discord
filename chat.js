const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

// Fungsi untuk menangani pengiriman dan balasan pesan
function handleChat(client) {
    // ID channel untuk relay pesan
    const relayChannelId = '1321311607871111249';

    // Menangani command !pesan untuk mengirim pesan ke target
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        // Cek apakah pesan dikirim di channel relay dan apakah itu command !pesan
        if (message.channel.id === relayChannelId && message.content.startsWith('!pesan')) {
            const args = message.content.split(' ').slice(1);
            const targetId = args.shift();
            const content = args.join(' ');

            // Validasi input
            if (!targetId || !content) {
                return message.reply('Format salah! Gunakan: `!pesan <id_target> <isi_pesan>`');
            }

            try {
                // Mengirim pesan ke target user melalui DM
                const targetUser = await client.users.fetch(targetId);
                await targetUser.send(content);
                message.reply(`Pesan berhasil dikirim ke user dengan ID: ${targetId}`);
            } catch (error) {
                console.error('Gagal mengirim pesan:', error);
                message.reply('Gagal mengirim pesan. Pastikan ID benar dan bot memiliki akses.');
            }
        }
    });

    // Menangani pesan yang diterima melalui DM dari user
    client.on('messageCreate', async (message) => {
        // Periksa apakah pesan datang dari DM
        if (message.channel.type === 'DM' && !message.author.bot) {
            console.log(`Pesan DM diterima dari ${message.author.tag}: ${message.content}`);

            // Mengambil channel relay berdasarkan ID
            const relayChannel = await client.channels.fetch(relayChannelId);
            if (!relayChannel) {
                console.error('Channel relay tidak ditemukan.');
                return;
            }

            // Kirim pesan ke channel relay dalam format yang diinginkan
            const relayMessage = `**Pesan Balasan**\nPENGIRIM: ${message.author.tag} (${message.author.id})\nPESAN: ${message.content || 'Pesan kosong'}\nWAKTU: ${moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')}`;
            
            try {
                await relayChannel.send(relayMessage);
                console.log('Pesan berhasil dikirim ke channel relay.');
            } catch (error) {
                console.error('Error mengirim pesan ke channel relay:', error);
            }
        }
    });
}

// Ekspor fungsi handler untuk digunakan di file utama
module.exports = { handleChat };



