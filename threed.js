const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = './threed.json'; // Lokasi file pengaturan

// Fungsi untuk memuat pengaturan dari file
function loadSettings() {
    try {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (error) {
        console.error('Gagal memuat settings.json:', error.message);
        return {}; // Kembali ke objek kosong jika file tidak ada atau error
    }
}

// Fungsi untuk menyimpan pengaturan ke file
function saveSettings(settings) {
    try {
        fs.writeFileSync(path, JSON.stringify(settings, null, 4), 'utf8');
    } catch (error) {
        console.error('Gagal menyimpan settings.json:', error.message);
    }
}

async function handleThreed(client) {
    console.log('handleThreed dipanggil');
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        // Perintah !setupthreed
        if (message.content.startsWith('!setupthreed')) {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply('Perintah ini hanya dapat digunakan oleh administrator.');
            }

            let settings = loadSettings();
            const guildId = message.guild.id;

            if (settings[guildId]?.threedChannel) {
                return message.reply(
                    `Fitur Threed sudah diatur untuk <#${settings[guildId].threedChannel}>. Ketik perintah ini lagi untuk mengubahnya.`
                );
            }

            const filter = (response) => response.author.id === message.author.id;

            message.reply('Silakan mention channel yang akan diaktifkan fitur Threed.');
            const channelCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });

            channelCollector.on('collect', async (channelMessage) => {
                const mentionedChannel = channelMessage.mentions.channels.first();
                if (!mentionedChannel) {
                    return message.reply('Kamu harus mention channel yang valid!');
                }

                message.reply('Silakan masukkan judul default untuk thread.');
                const titleCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });

                titleCollector.on('collect', async (titleMessage) => {
                    const threadTitle = titleMessage.content;

                    if (!settings[guildId]) settings[guildId] = {};
                    settings[guildId].threedChannel = mentionedChannel.id;
                    settings[guildId].threadTitle = threadTitle;

                    saveSettings(settings);
                    message.reply(
                        `Fitur Threed berhasil diatur untuk channel ${mentionedChannel} dengan judul thread "${threadTitle}". Bot akan membuat thread untuk setiap pesan di channel tersebut.`
                    );
                });
            });
        }
    });

    client.on('messageCreate', async (message) => {
        const settings = loadSettings();
        const guildSettings = settings[message.guild.id];

        if (message.author.bot) return;

        // Buat thread jika pesan dikirim di channel yang diatur
        if (guildSettings?.threedChannel && message.channel.id === guildSettings.threedChannel) {
            try {
                const threadName = guildSettings.threadTitle || 'Thread Baru';
        
                await message.startThread({
                    name: threadName,
                    reason: 'Pesan baru di channel yang diatur untuk fitur Threed',
                });
                console.log(`Thread dibuat untuk pesan di channel ${message.channel.id} dengan judul "${threadName}".`);
            } catch (error) {
                console.error(`Gagal membuat thread di channel ${message.channel.id}:`, error);
            }
        }        
    });

    client.on('guildDelete', async (guild) => {
        const settings = loadSettings();
        if (settings[guild.id]) {
            delete settings[guild.id];
            saveSettings(settings);
            console.log(`Pengaturan Threed untuk server ${guild.id} telah dihapus.`);
        }
    });
}

module.exports = { handleThreed };