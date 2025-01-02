const { EmbedBuilder, PermissionsBitField } = require('discord.js');

// Fungsi untuk menangani peran yang diambil
async function handleTakeRole(client) {
    console.log('handleTakeRole dipanggil');
    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.content.startsWith('!takerole')) return;

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Perintah ini hanya dapat digunakan oleh Administrator.');
        }

        const filter = (response) => response.author.id === message.author.id;

        // Langkah 1: Memilih channel
        const askChannel = async () => {
            message.reply('Silakan mention channel tempat pesan akan dikirim.');
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000 });
            const mentionedChannel = collected.first().mentions.channels.first();
            if (!mentionedChannel) {
                message.reply('Kamu harus mention channel yang valid. Ulangi langkah ini.');
                return await askChannel();
            }
            return mentionedChannel;
        };

        // Langkah 2: Memasukkan title
        const askTitle = async () => {
            message.reply('Tuliskan Title Yang akan di tampilkan:');
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000 });
            return collected.first().content;
        };

        // Langkah 3: Memasukkan emoji
        const askEmojis = async () => {
            message.reply('Masukkan daftar emoji yang akan digunakan (bisa lebih dari satu).');
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000 });
            const emojis = collected.first().content.split(',').map((e) => e.trim());
            return emojis;
        };

        // Langkah 4: Memasukkan role
        const askRoles = async (emojis) => {
            message.reply('Masukkan daftar role untuk emoji (Jumlah samakan dengan emoji).');
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000 });
            const roleMentions = collected.first().content.split(',').map((r) => r.trim());
            if (emojis.length !== roleMentions.length) {
                message.reply('Jumlah emoji dan role harus sama. Ulangi langkah ini.');
                return await askRoles(emojis);
            }

            const roles = roleMentions.map((r) => {
                const role = message.guild.roles.cache.find((role) => role.name === r || role.id === r.replace(/<@&|>/g, ''));
                if (!role) {
                    message.reply(`Role "${r}" tidak ditemukan di server. Ulangi langkah ini.`);
                }
                return role;
            });

            if (roles.includes(undefined)) {
                return await askRoles(emojis);
            }

            return roles;
        };

        // Mulai proses
        const mentionedChannel = await askChannel();
        const title = await askTitle();
        const emojis = await askEmojis();
        const roles = await askRoles(emojis);

        // Membuat embed
        const embed = new EmbedBuilder()
            .setTitle(title) // Gunakan title yang diinput admin
            .setColor('#00FF00');

        try {
            // Kirim pesan ke channel yang disebut
            const sentMessage = await mentionedChannel.send({ embeds: [embed] });

            // Tambahkan emoji ke pesan
            for (const emoji of emojis) {
                await sentMessage.react(emoji);
            }

            // Event collector untuk reaction
            const reactionCollector = sentMessage.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && !user.bot,
                dispose: true,
            });

            // Tambahkan role
            reactionCollector.on('collect', async (reaction, user) => {
                const member = reaction.message.guild.members.cache.get(user.id);
                const roleIndex = emojis.indexOf(reaction.emoji.name);
                if (member && roleIndex !== -1) {
                    await member.roles.add(roles[roleIndex]).catch(console.error);
                }
            });

            // Hapus role jika reaction dihapus
            reactionCollector.on('remove', async (reaction, user) => {
                const member = reaction.message.guild.members.cache.get(user.id);
                const roleIndex = emojis.indexOf(reaction.emoji.name);
                if (member && roleIndex !== -1) {
                    await member.roles.remove(roles[roleIndex]).catch(console.error);
                }
            });

            message.reply(`Pesan berhasil dikirim ke ${mentionedChannel}!`);
        } catch (err) {
            console.error('Gagal menambahkan reaksi atau mengirim pesan:', err);
            message.reply('Terjadi kesalahan. Pastikan bot memiliki izin yang cukup.');
        }
    });

    // Event saat bot online kembali
    client.once('ready', async () => {
        console.log('Bot Online!');
    });
}

module.exports = { handleTakeRole };