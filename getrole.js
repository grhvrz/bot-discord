const { EmbedBuilder, PermissionsBitField } = require('discord.js');

async function handleTakeRole(client) {
    console.log('handleTakeRole dipanggil'); // Debug log
    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.content.startsWith('!takerole')) return;

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Perintah ini hanya dapat digunakan oleh Administrator.');
        }

        const filter = (response) => response.author.id === message.author.id;

        // Langkah 1: Memilih channel
        message.reply('Silakan mention channel tempat pesan akan dikirim.');
        const channelCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });

        channelCollector.on('collect', async (channelMessage) => {
            const mentionedChannel = channelMessage.mentions.channels.first();
            if (!mentionedChannel) {
                return message.reply('Kamu harus mention channel yang valid. Ulangi perintah.');
            }

            // Langkah 2: Memasukkan judul pesan
            message.reply('Tuliskan Title yang anda inginkan');
            const titleCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });

            titleCollector.on('collect', async (titleMessage) => {
                const title = titleMessage.content;

                // Langkah 3: Memilih emoji
                message.reply('Silakan ketik emoji yang akan digunakan.');
                const emojiCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });

                emojiCollector.on('collect', async (emojiMessage) => {
                    const emoji = emojiMessage.content;

                    // Langkah 4: Memilih role
                    message.reply('Silakan mention role yang akan diberikan.');
                    const roleCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });

                    roleCollector.on('collect', async (roleMessage) => {
                        const mentionedRole = roleMessage.mentions.roles.first();
                        if (!mentionedRole) {
                            return message.reply('Kamu harus mention role yang valid. Ulangi perintah.');
                        }

                        // Membuat embed
                        const embed = new EmbedBuilder()
                            .setTitle(title)
                            .setColor('#00FF00')

                        try {
                            // Mengirim pesan ke channel yang disebut
                            const sentMessage = await mentionedChannel.send({ embeds: [embed] });
                            await sentMessage.react(emoji);

                            // Event collector untuk reaction
                            const reactionCollector = sentMessage.createReactionCollector({
                                filter: (reaction, user) => reaction.emoji.name === emoji && !user.bot,
                                dispose: true,
                            });

                            // Tambahkan role
                            reactionCollector.on('collect', async (reaction, user) => {
                                const member = reaction.message.guild.members.cache.get(user.id);
                                if (member) {
                                    await member.roles.add(mentionedRole).catch(console.error);
                                }
                            });

                            // Hapus role jika reaction dihapus
                            reactionCollector.on('remove', async (reaction, user) => {
                                const member = reaction.message.guild.members.cache.get(user.id);
                                if (member) {
                                    await member.roles.remove(mentionedRole).catch(console.error);
                                }
                            });

                            message.reply(`Pesan berhasil dikirim ke ${mentionedChannel}!`);
                        } catch (err) {
                            console.error('Gagal menambahkan reaksi atau mengirim pesan:', err);
                            message.reply('Terjadi kesalahan. Pastikan bot memiliki izin yang cukup.');
                        }
                    });
                });
            });
        });
    });
}

module.exports = { handleTakeRole };

