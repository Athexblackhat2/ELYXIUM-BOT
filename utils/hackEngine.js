 
// 💻 ELYXIUM BOT v1.0 - HACK ENGINE (FULL DISPLAY)
// ⚡ NO READ MORE — ALL MESSAGES FULLY VISIBLE
// ⚡ Powered by ATHEX & ALTHEA
 

const { createProgressBar, athexBadge } = require('./embedBuilder');
const os = require('os');

const generateFakeIP = () => `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

const generateFakePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let p = '';
    for (let i = 0; i < 12; i++) p += chars[Math.floor(Math.random() * chars.length)];
    return p;
};

const deviceModels = ['Samsung Galaxy S24 Ultra', 'iPhone 15 Pro Max', 'Samsung Galaxy S23 Ultra', 'iPhone 14 Pro Max', 'OnePlus 12 Pro', 'Xiaomi 14 Ultra', 'Google Pixel 8 Pro', 'Samsung Galaxy Z Fold 5'];
const androidVersions = ['Android 14', 'Android 13', 'One UI 6.1', 'HyperOS 1.0'];
const iosVersions = ['iOS 17.5', 'iOS 17.4', 'iOS 18.0 Beta'];
const carriers = ['Jazz 4G LTE', 'Telenor 4G', 'Zong 5G', 'Ufone 4G', 'PTCL'];
const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Quetta', 'Multan'];
const facebookNames = ['Ali Khan', 'Ayesha Ahmed', 'Usman Ali', 'Fatima Hassan', 'Bilal Siddiqui', 'Zara Sheikh'];

const getRealSystemData = () => ({
    time: new Date().toLocaleString(),
    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    date: new Date().toLocaleDateString(),
});

const getRealisticHackLines = (target, victimName = 'Unknown', victimBio = '') => {
    const device = deviceModels[Math.floor(Math.random() * deviceModels.length)];
    const isIPhone = device.includes('iPhone');
    const osVersion = isIPhone ? iosVersions[Math.floor(Math.random() * iosVersions.length)] : androidVersions[Math.floor(Math.random() * androidVersions.length)];
    const carrier = carriers[Math.floor(Math.random() * carriers.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const fbName = facebookNames[Math.floor(Math.random() * facebookNames.length)];
    const sys = getRealSystemData();
    const battery = Math.floor(Math.random() * 40) + 15;
    const storage = (Math.random() * 200 + 32).toFixed(1);
    const totalStorage = (Math.random() * 256 + 64).toFixed(0);
    const ip = generateFakeIP();
    const password = generateFakePassword();

    return [
        '💻 *ELYXIUM HACK v1.0* 💻',
        '⚡ ATHEX & ALTHEA ⚡',
        '',
        '🔴 *LIVE SYSTEM ACCESS* 🔴',
        `🕐 TIME: ${sys.time}`,
        `📅 DATE: ${sys.date} (${sys.day})`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━━',
        '👤 *VICTIM PROFILE*',
        '━━━━━━━━━━━━━━━━━━━━━━',
        `📛 Name: ${victimName}`,
        `📝 Bio: ${victimBio || 'Hey there! I am using WhatsApp.'}`,
        `📱 Number: ${target}`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━━',
        '📱 *DEVICE INFO*',
        '━━━━━━━━━━━━━━━━━━━━━━',
        `📱 Device: ${device}`,
        `🔧 OS: ${osVersion}`,
        `📡 Network: ${carrier}`,
        `📍 Location: ${city}, Pakistan`,
        `🌐 IP: ${ip}`,
        `🔋 Battery: ${battery}% ⚠️`,
        `💾 Storage: ${storage}GB / ${totalStorage}GB`,
        `🌡️ Temp: ${(Math.random() * 10 + 35).toFixed(1)}°C 🔥`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━━',
        '🔐 *SECURITY BREACH*',
        '━━━━━━━━━━━━━━━━━━━━━━',
        `🔑 Password: ${password}`,
        `🔓 2FA: BYPASSED ✓`,
        `🔓 Encryption: BROKEN ✓`,
        `📨 Chats: ${Math.floor(Math.random() * 5000) + 500}`,
        `🖼️ Media: ${Math.floor(Math.random() * 2000) + 100}`,
        `🎤 Voice: ${Math.floor(Math.random() * 500) + 50}`,
        `💬 Last Msg: "${Math.random() > 0.5 ? 'I love you ❤️' : 'Where are you? 🤔'}"`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━━',
        '📱 *SOCIAL MEDIA*',
        '━━━━━━━━━━━━━━━━━━━━━━',
        `📘 Facebook: ${fbName} ✓`,
        `📸 Instagram: @${victimName.toLowerCase().replace(/\s/g, '_')} ✓`,
        `🐦 Twitter: @${victimName.toLowerCase().replace(/\s/g, '')} ✓`,
        `👻 Snapchat: ${victimName.toLowerCase().replace(/\s/g, '.')} ✓`,
        `🎵 TikTok: @${victimName.toLowerCase().replace(/\s/g, '')} ✓`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━━',
        '📡 *LIVE SENSORS*',
        '━━━━━━━━━━━━━━━━━━━━━━',
        '📸 Rear Camera: 🟢 ACTIVE',
        '📸 Front Camera: 🟢 ACTIVE',
        '🎤 Microphone: 🟢 RECORDING',
        `📍 GPS: ${city} (LIVE)`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━━',
        '💀 *EXTRACTION*',
        '━━━━━━━━━━━━━━━━━━━━━━',
        `📊 Data: ${(Math.random() * 5 + 1).toFixed(1)} GB`,
        '☁️ Uploading to ELYXIUM Cloud...',
        '✅ UPLOAD COMPLETE!',
        '',
        '  ⚡ ELYXIUM BOT v1.0 ⚡ ',
        '  ATHEX & ALTHEA         ',
    ];
};

// ✅ Split into small chunks (NO Read More)
const splitIntoChunks = (lines) => {
    const chunks = [];
    let current = [];
    let len = 0;
    for (const line of lines) {
        if (len + line.length > 3000) {
            chunks.push(current.join('\n'));
            current = [];
            len = 0;
        }
        current.push(line);
        len += line.length + 1;
    }
    if (current.length > 0) chunks.push(current.join('\n'));
    return chunks;
};

// ✅ FULL HACK — Multiple messages, all fully visible
const executeHack = async (sock, chatId, targetNumber = 'Unknown', victimName = 'Unknown', victimBio = '') => {
    try {
        await sock.sendMessage(chatId, { text: '```🔴 ESTABLISHING SECURE CONNECTION...```' });
        await new Promise(r => setTimeout(r, 400));

        let profilePicUrl = null;
        try {
            profilePicUrl = await sock.profilePictureUrl(targetNumber.includes('@') ? targetNumber : targetNumber + '@s.whatsapp.net', 'image');
        } catch (e) {}

        if (profilePicUrl) {
            await sock.sendMessage(chatId, {
                image: { url: profilePicUrl },
                caption: `📸 *VICTIM DP* | 👤 ${victimName} | 📱 ${targetNumber}\n💀 *HACKING IN PROGRESS...*`
            });
            await new Promise(r => setTimeout(r, 500));
        }

        const lines = getRealisticHackLines(targetNumber, victimName, victimBio);
        const chunks = splitIntoChunks(lines);

        for (let i = 0; i < chunks.length; i++) {
            await sock.sendMessage(chatId, { text: chunks[i] });
            await new Promise(r => setTimeout(r, 500 + Math.random() * 600));
        }

        return true;
    } catch (e) {
        console.error('❌ Hack:', e);
        return false;
    }
};

// ✅ INSTANT HACK — All chunks rapidly
const executeQuickHack = async (sock, chatId, targetNumber = 'Unknown', victimName = 'Unknown', victimBio = '') => {
    let profilePicUrl = null;
    try {
        profilePicUrl = await sock.profilePictureUrl(targetNumber.includes('@') ? targetNumber : targetNumber + '@s.whatsapp.net', 'image');
    } catch (e) {}

    if (profilePicUrl) {
        await sock.sendMessage(chatId, { image: { url: profilePicUrl }, caption: `📸 *VICTIM DP* | 👤 ${victimName}` });
    }

    const lines = getRealisticHackLines(targetNumber, victimName, victimBio);
    const chunks = splitIntoChunks(lines);

    for (const chunk of chunks) {
        await sock.sendMessage(chatId, { text: chunk });
    }

    return true;
};

// 🌧️ GREEN RAIN
const matrixRain = (length = 6) => {
    const chars = '01ABCDEF';
    let rain = '';
    for (let i = 0; i < length; i++) {
        let line = '';
        for (let j = 0; j < 25; j++) line += chars[Math.floor(Math.random() * chars.length)];
        rain += line + '\n';
    }
    return rain;
};

const greenRainEffect = async (sock, chatId, lines = 5) => {
    for (let i = 0; i < lines; i++) {
        await sock.sendMessage(chatId, { text: '```\n' + matrixRain(6) + '```' });
        await new Promise(r => setTimeout(r, 80));
    }
};

module.exports = {
    executeHack,
    executeQuickHack,
    greenRainEffect,
    matrixRain,
    generateFakeIP,
    generateFakePassword,
    getRealisticHackLines,
};