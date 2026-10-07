const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '..', '..', 'data', 'autostatus.json');

function getSettings() {
    try { return JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (e) { return {}; }
}

function saveSettings(data) {
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'autostatus',
    description: 'Auto seen + react + comment on WhatsApp statuses',
    category: 'status',
    usage: 'autostatus on/off/status',
    aliases: ['as', 'statusseen', 'autoseen'],

    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        const userId = chatId.split('@')[0];
        const settings = getSettings();
        const sub = args[0]?.toLowerCase();

        if (sub === 'on' || sub === 'enable' || sub === 'start') {
            settings[userId] = true;
            saveSettings(settings);
            await sock.sendMessage(chatId, {
                text: `👁️ *AUTO STATUS SEEN: ON*\n\n✅ Auto Seen\n⚡ Auto React\n💬 Auto Comment\n\nAb sabke status pe seen + react + comment hoga!\n\n⚡ ATHEX & ALTHEA ⚡`
            });
        } else if (sub === 'off' || sub === 'disable' || sub === 'stop') {
            settings[userId] = false;
            saveSettings(settings);
            await sock.sendMessage(chatId, {
                text: `👁️ *AUTO STATUS SEEN: OFF*\n\n❌ Auto Seen Disabled\n❌ Auto React Disabled\n❌ Auto Comment Disabled\n\nAb statuses pe kuch nahi hoga!\n\n⚡ ATHEX & ALTHEA ⚡`
            });
        } else if (sub === 'status' || sub === 'info') {
            const isOn = settings[userId] === true;
            await sock.sendMessage(chatId, {
                text: `👁️ *AUTO STATUS: ${isOn ? '✅ ON' : '❌ OFF'}*\n\nUse *!autostatus on* to enable\nUse *!autostatus off* to disable\n\n⚡ ATHEX & ALTHEA ⚡`
            });
        } else {
            await sock.sendMessage(chatId, {
                text: `👁️ *AUTO STATUS*\n\n*!autostatus on* — Enable\n*!autostatus off* — Disable\n*!autostatus status* — Check\n\n⚡ ATHEX & ALTHEA ⚡`
            });
        }
    }
};