async function handleReply(client) {
    console.log('handleReply dipanggil'); // Debug log
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        // Daftar kata kunci dan balasan menggunakan Map
        const keywordReplies = new Map([
            ['halo', 'Halo! Ada yang bisa saya bantu?'],
            ['hallo', 'Halo! Ada yang bisa saya bantu?'],
            ['help', 'Saya bisa membantu Anda! Apa yang bisa saya lakukan?'],
            ['p', 'Salam bego di ajarin sopan santun ga si'],
            ['bosen', 'makanya keluar jangan main hp mulu'],
            ['ajg', 'lu tainya bego'],
            ['roblox', 'Ayo, Login nih gw'],
            ['memek', 'Kasar banget ajg gak disekolahin ya lu'],
            ['kontol', 'Kasar banget ajg gak disekolahin ya lu'],
            ['gta', 'Gass ajg cari tcw gw bantai ade-adean lu semua'],
            ['pb', 'Login burning hall gw acak acak'],
            ['bot', 'apa si bat bot bat bot'],
            ['assalamualaikum', 'waalaikumsalam ahli surga'],
            ['bug', 'Tergantung kalo orangnya bug botnya juga ikut bug'],
            ['info', 'info apa nih, pb, gta, atau roblox??'],
            ['selamat pagi', 'selamat pagi juga'],
            ['selamat malam', 'selamat malam juga'],
            ['selamat siang', 'selamat siang juga'],
            ['bego', 'lu lebih bego goblok'],
            ['tolol', 'lu lebih tolol'],
            // Tambahkan lebih banyak kata kunci dan balasan di sini
        ]);

        const words = message.content.toLowerCase().split(/\s+/);

        // Cari kata kunci dalam pesan
        for (const word of words) {
            if (keywordReplies.has(word)) {
                await message.reply(keywordReplies.get(word)); // Balas sesuai kata kunci
                break;
            }
        }
    });
}

module.exports = { handleReply };


