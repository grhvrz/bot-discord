const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = './configlink.json'; // Lokasi file pengaturan

// Fungsi untuk memuat pengaturan dari file
function loadSettings() {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify({}), 'utf8');
    }
    try {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (error) {
        console.error('Gagal memuat configlink.json:', error.message);
        return {}; // Kembali ke objek kosong jika file tidak valid
    }
}

// Fungsi untuk menyimpan pengaturan ke file
function saveSettings(settings) {
    try {
        fs.writeFileSync(path, JSON.stringify(settings, null, 4), 'utf8');
    } catch (error) {
        console.error('Gagal menyimpan configlink.json:', error.message);
    }
}

async function handleAntiLink(client) {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        // Perintah !blockyt
        if (message.content.startsWith('!blockyt')) {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply('Perintah ini hanya dapat digunakan oleh administrator.');
            }

            let settings = loadSettings();
            const guildId = message.guild.id;

            if (settings[guildId]?.antiLinkChannel) {
                return message.reply(
                    `Anti-link YouTube sudah diatur untuk <#${settings[guildId].antiLinkChannel}>. Ketik perintah ini lagi untuk mengubahnya.`
                );
            }

            const filter = (response) => response.author.id === message.author.id;

            message.reply('Silakan mention channel tempat anti-link YouTube akan diaktifkan.');
            const channelCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });

            channelCollector.on('collect', async (channelMessage) => {
                const mentionedChannel = channelMessage.mentions.channels.first();
                if (!mentionedChannel) {
                    return message.reply('Kamu harus mention channel yang valid!');
                }

                if (!settings[guildId]) settings[guildId] = {};
                settings[guildId].antiLinkChannel = mentionedChannel.id;

                message.reply('Silakan ketik pesan balasan untuk pelanggar.');
                const messageCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });

                messageCollector.on('collect', async (replyMessage) => {
                    settings[guildId].antiLinkMessage = replyMessage.content;

                    saveSettings(settings);
                    message.reply(`Anti-link YouTube berhasil diaktifkan di ${mentionedChannel}. Bot akan memantau channel tersebut.`);
                });
            });
        }

        // Perintah !blockdc
        if (message.content.startsWith('!blockdc')) {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply('Perintah ini hanya dapat digunakan oleh administrator.');
            }

            let settings = loadSettings();
            const guildId = message.guild.id;

            if (settings[guildId]?.antiLinkDCChannel) {
                return message.reply(
                    `Anti-link Discord sudah diatur untuk <#${settings[guildId].antiLinkDCChannel}>. Ketik perintah ini lagi untuk mengubahnya.`
                );
            }

            const filter = (response) => response.author.id === message.author.id;

            message.reply('Silakan mention channel tempat anti-link Discord akan diaktifkan.');
            const channelCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });

            channelCollector.on('collect', async (channelMessage) => {
                const mentionedChannel = channelMessage.mentions.channels.first();
                if (!mentionedChannel) {
                    return message.reply('Kamu harus mention channel yang valid!');
                }

                if (!settings[guildId]) settings[guildId] = {};
                settings[guildId].antiLinkDCChannel = mentionedChannel.id;

                message.reply('Silakan ketik pesan balasan untuk pelanggar.');
                const messageCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });

                messageCollector.on('collect', async (replyMessage) => {
                    settings[guildId].antiLinkDCMessage = replyMessage.content;

                    saveSettings(settings);
                    message.reply(`Anti-link Discord berhasil diaktifkan di ${mentionedChannel}. Bot akan memantau channel tersebut.`);
                });
            });
        }
    });

    client.on('messageCreate', async (msg) => {
        const settings = loadSettings();
        const guildSettings = settings[msg.guild.id];

        if (!guildSettings) return;

        // Regex untuk mendeteksi link YouTube, TikTok, dan Discord
        const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/\S+/gi;
        const tiktokRegex = /(https?:\/\/)?(www\.)?(tiktok\.com)\/\S+/gi;
        const discordRegex = /(https?:\/\/)?(www\.)?(discord\.gg|discord\.com)\/\S+/gi;

        // Cek apakah channel anti-link YouTube atau Discord sudah diatur
        if (msg.author.bot) return;

        // Cek untuk link YouTube atau TikTok di channel anti-link YouTube
        if (msg.channel.id === guildSettings.antiLinkChannel && (youtubeRegex.test(msg.content) || tiktokRegex.test(msg.content))) {
            try {
                await msg.channel.send({
                    content: guildSettings.antiLinkMessage,
                    allowed_mentions: { replied_user: false },
                    reply: { messageReference: msg.id },
                });
                await msg.delete();

                const member = msg.guild.members.cache.get(msg.author.id);
                if (member) {
                    try {
                        await member.timeout(30 * 1000, 'Mengirim link YouTube atau TikTok di channel yang dilarang.');
                    } catch (error) {
                        console.log('Bot tidak memiliki izin untuk memberikan timeout kepada member:', error.message);
                    }
                }
            } catch (error) {
                console.error(`Gagal menangani pelanggar di guild ${msg.guild.id}, channel ${msg.channel.id}:`, error);
            }
        }

        // Cek untuk link Discord di channel anti-link Discord
        if (msg.channel.id === guildSettings.antiLinkDCChannel && discordRegex.test(msg.content)) {
            try {
                await msg.channel.send({
                    content: guildSettings.antiLinkDCMessage,
                    allowed_mentions: { replied_user: false },
                    reply: { messageReference: msg.id },
                });
                await msg.delete();

                const member = msg.guild.members.cache.get(msg.author.id);
                if (member) {
                    try {
                        await member.timeout(30 * 1000, 'Mengirim link Discord di channel yang dilarang.');
                    } catch (error) {
                        console.log('Bot tidak memiliki izin untuk memberikan timeout kepada member:', error.message);
                    }
                }
            } catch (error) {
                console.error(`Gagal menangani pelanggar di guild ${msg.guild.id}, channel ${msg.channel.id}:`, error);
            }
        }
    });

    client.on('guildDelete', async (guild) => {
        const settings = loadSettings();
        if (settings[guild.id]) {
            delete settings[guild.id];
            saveSettings(settings);
            console.log(`Pengaturan anti-link untuk server ${guild.id} telah dihapus.`);
        }
    });
}

module.exports = { handleAntiLink };



