const { MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');
const path = './settings.json'; // Lokasi file pengaturan

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

async function handleLogs(client) {
    console.log('handleLogs dipanggil');
    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.content.startsWith('!setuplogs')) return;

        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Perintah ini hanya dapat digunakan oleh administrator.');
        }

        // Memuat pengaturan yang sudah ada
        let settings = loadSettings();
        const guildId = message.guild.id;

        if (settings[guildId] && settings[guildId].welcomeChannel && settings[guildId].goodbyeChannel) {
            return message.reply('Pengaturan logs sudah diatur sebelumnya. Jika ingin mengubahnya, ketik perintah lagi!');
        }

        const filter = (response) => response.author.id === message.author.id;
        message.reply('Silakan pilih channel untuk logs.');

        const channelCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });
        channelCollector.on('collect', async (channelMessage) => {
            const mentionedChannel = channelMessage.mentions.channels.first();
            if (!mentionedChannel) {
                return message.reply('Kamu harus mention channel yang valid!');
            }

            if (!settings[guildId]) settings[guildId] = {};
            settings[guildId].welcomeChannel = mentionedChannel.id;

            message.reply('Silakan ketik pesan welcome.');
            const welcomeCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });
            welcomeCollector.on('collect', async (welcomeMessage) => {
                settings[guildId].welcomeMessage = welcomeMessage.content;

                message.reply('Silakan ketik pesan goodbye.');
                const goodbyeCollector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });
                goodbyeCollector.on('collect', async (goodbyeMessage) => {
                    settings[guildId].goodbyeMessage = goodbyeMessage.content;
                    settings[guildId].goodbyeChannel = mentionedChannel.id;

                    saveSettings(settings);
                    message.reply('Setup logs berhasil! Pengaturan telah disimpan.');
                });
            });
        });
    });

    client.on('guildMemberAdd', async (member) => {
        const settings = loadSettings();
        const guildSettings = settings[member.guild.id];
        if (guildSettings?.welcomeChannel && guildSettings?.welcomeMessage) {
            const channel = member.guild.channels.cache.get(guildSettings.welcomeChannel);
            if (channel) {
                try {
                    await channel.send(`${guildSettings.welcomeMessage} <@${member.user.id}>`);
                } catch (err) {
                    console.error('Gagal mengirim pesan welcome:', err);
                }
            } else {
                console.error('Channel welcome tidak ditemukan.');
            }
        }
    });

    client.on('guildMemberRemove', async (member) => {
        const settings = loadSettings();
        const guildSettings = settings[member.guild.id];
        console.log(`Handling member leave for guild ${member.guild.id}`); // Debug log

        if (guildSettings?.goodbyeChannel && guildSettings?.goodbyeMessage) {
            const channel = member.guild.channels.cache.get(guildSettings.goodbyeChannel);
            if (channel) {
                try {
                    console.log(`Sending goodbye message to channel ${guildSettings.goodbyeChannel}`);
                    await channel.send(`${guildSettings.goodbyeMessage} <@${member.user.id}>`);
                } catch (err) {
                    console.error('Gagal mengirim pesan goodbye:', err);
                }
            } else {
                console.error('Channel goodbye tidak ditemukan atau tidak bisa diakses.');
            }
        } else {
            console.error('Pengaturan untuk goodbye tidak ditemukan atau tidak lengkap.');
        }
    });

    client.on('guildDelete', async (guild) => {
        const settings = loadSettings();
        if (settings[guild.id]) {
            delete settings[guild.id];
            saveSettings(settings);
            console.log(`Pengaturan untuk server ${guild.id} telah dihapus.`);
        }
    });
}

module.exports = { handleLogs };



