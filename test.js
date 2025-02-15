const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');

// ID Grup yang akan ditambahkan
const groupId = "120363399792877563@g.us"; // Ganti dengan ID grup yang tepat

// Fungsi untuk membaca nomor dari CSV atau TXT
function readPhoneNumbers(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const phoneNumbers = fileContent
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(number => number.replace(/[^0-9]/g, '')) // Hapus karakter selain angka
            .map(number => {
                // Pastikan nomor dimulai dengan 62
                if (number.startsWith('0')) {
                    return `62${number.substring(1)}`;
                } else if (!number.startsWith('62')) {
                    return `62${number}`;
                }
                return number;
            });

        return phoneNumbers;
    } catch (error) {
        console.error("❌ Gagal membaca file:", error);
        return [];
    }
}

// Path ke file CSV atau TXT
const filePath = path.join(__dirname, 'nomor.csv'); // Sesuaikan dengan lokasi file CSV
const phoneNumbers = readPhoneNumbers(filePath);

if (phoneNumbers.length === 0) {
    console.log("❌ Tidak ada nomor yang valid di file!");
    process.exit(1);
}

// Daftar profil Chrome yang akan digunakan
const profiles = ['aaaa', 'sdaa', 'v', 'kontol', 'asd'];

// Fungsi untuk memulai Venom bot di setiap profil
profiles.forEach(profile => {
    venom.create({
        session: `whatsapp-bot-session-${profile}`,
        headless: false,  // Jika ingin melihat browser
        folderSession: `E:/whatsapp-bot/sessions/${profile}`,
        args: [
            `--user-data-dir=C:/Users/KESH/AppData/Local/Google/Chrome/User Data`,
            `--profile-directory=${profile}`
        ]
    }).then(client => start(client, profile)).catch(error => console.log("Error while creating Venom client: ", error));
});

// Fungsi untuk menambahkan peserta ke grup
async function start(client, profile) {
    console.log(`✅ WhatsApp Web connected on profile: ${profile}`);

    // Membuat array promise untuk menambahkan semua peserta
    const promises = phoneNumbers.map(phone => {
        return client.addParticipant(groupId, `${phone}@c.us`)
            .then(() => {
                console.log(`✅ Berhasil menambahkan ${phone} ke grup dengan profil ${profile}`);
            })
            .catch(err => {
                console.log(`❌ Gagal menambahkan ${phone} ke grup dengan profil ${profile}:`, err.message);
            });
    });

    // Tunggu hingga semua promise selesai
    await Promise.all(promises);

    // Setelah semua proses selesai, tutup browser
    console.log(`✅ Semua nomor telah diproses dengan profil ${profile}.`);
    client.close();
}
