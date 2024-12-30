const moment = require('moment-timezone');

function handleMention(client) {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return; // Abaikan pesan dari bot

        const targetUserId = '488988053931556864'; // ID user target

        if (message.mentions.has(targetUserId)) {
            const targetUser = await client.users.fetch(targetUserId);
            const member = message.guild.members.cache.get(targetUserId);

            if (!member) return; // Abaikan jika user tidak ditemukan di server

            // Periksa status presensi
            const presenceStatus = member.presence?.status || 'offline';

            // Bot hanya akan membalas jika statusnya adalah offline
            if (presenceStatus === 'offline') {
                message.reply('Sepertinya user yang kamu maksud sedang offline.');

                const senderName = message.author.username;
                const content = message.content;
                const timestamp = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
                const dmMessage = `**Nama Pengirim:** ${senderName}\n**Pesan:** ${content}\n**Tanggal dan Waktu:** ${timestamp}`;

                try {
                    await targetUser.send(dmMessage);
                } catch (err) {
                    console.error(`Gagal mengirim pesan ke ${targetUser.tag}:`, err);
                }
            } else {
                console.log(`User ${targetUser.tag} sedang ${presenceStatus}, tidak membalas pesan.`);
            }
        }
    });
}

module.exports = { handleMention };






