 
// 💀 ELYXIUM BOT v1.0 - HACK COMMAND (ULTIMATE SHOCK)
// ⚡ REAL DP + NAME + BIO + LIVE DATA
// ⚡ Powered by ATHEX & ALTHEA
 

const { executeHack, executeQuickHack, greenRainEffect } = require('../../utils/hackEngine');

const hackModes = {
    full: { name: 'Full Hack', emoji: '💀', description: 'Complete realistic hack with DP', duration: '~2 sec' },
    fast: { name: 'Instant Hack', emoji: '⚡', description: 'One-message blast with DP', duration: '~0.1 sec' },
    quick: { name: 'Quick Hack', emoji: '⚡', description: 'One-message blast with DP', duration: '~0.1 sec' },
    instant: { name: 'Instant Hack', emoji: '⚡', description: 'One-message blast with DP', duration: '~0.1 sec' },
    rain: { name: 'Matrix Rain', emoji: '🌧️', description: 'Green code rain effect', duration: '~0.5 sec' },
    matrix: { name: 'Matrix Rain', emoji: '🌧️', description: 'Green code rain effect', duration: '~0.5 sec' },
};

module.exports = {
    name: 'hack',
    description: 'Fake hack with REAL victim DP, name & bio — ULTIMATE SHOCK!',
    category: 'fun',
    usage: 'hack [@user/number] [fast/instant/rain]',
    aliases: ['hackprank', 'terminal', 'matrix', 'rain', 'shock'],

    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;

        try {
            let targetJid = null;
            let targetNumber = 'Unknown';
            let victimName = 'Unknown';
            let victimBio = '';
            let hackMode = 'full';

            // === PARSE MODE ===
            const modeKeys = ['fast', 'quick', 'instant', 'rain', 'matrix'];
            for (const key of modeKeys) {
                if (args.includes(key)) {
                    hackMode = key === 'matrix' ? 'rain' : key;
                    args = args.filter(a => a !== key);
                    break;
                }
            }
            // full mode
            if (args.includes('full')) {
                hackMode = 'full';
                args = args.filter(a => a !== 'full');
            }

            // === PARSE TARGET ===
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            
            if (mentioned?.length > 0) {
                targetJid = mentioned[0];
                targetNumber = targetJid.split('@')[0];

                // Get REAL victim info
                try {
                    const contact = await sock.getContactById(targetJid);
                    victimName = contact?.name || contact?.pushName || targetNumber;
                    try {
                        const status = await sock.fetchStatus(targetJid);
                        victimBio = status?.status || '';
                    } catch (e) {}
                } catch (e) {
                    victimName = targetNumber;
                }
            } else if (args[0] && !modeKeys.includes(args[0]) && args[0] !== 'full') {
                targetNumber = args[0].replace(/[^0-9]/g, '') || args[0];
                targetJid = targetNumber + '@s.whatsapp.net';
                try {
                    const contact = await sock.getContactById(targetJid);
                    victimName = contact?.name || contact?.pushName || targetNumber;
                } catch (e) {
                    victimName = targetNumber;
                }
            } else {
                targetNumber = 'localhost';
                victimName = 'Your Device (Self Hack 😂)';
            }

            // === HEADER ===
            const mode = hackModes[hackMode] || hackModes['full'];
            const modeLabel = `${mode.emoji} ${mode.name}`;
            
            await sock.sendMessage(chatId, {
                text: ` \n    💀 HACK INITIATED! 💀        \n    🎯 ${victimName.slice(0, 26).padEnd(26)} \n    ${modeLabel.padEnd(26)} \n    ⏱️  ${mode.duration.padEnd(26)} \n `
            });

            // === EXECUTE ===
            if (hackMode === 'fast' || hackMode === 'quick' || hackMode === 'instant') {
                await executeQuickHack(sock, chatId, targetNumber, victimName, victimBio);
            } else if (hackMode === 'rain') {
                await greenRainEffect(sock, chatId, 6);
                await sock.sendMessage(chatId, { text: '😂 *PEO PEO PEO!* FAHHHH YOU hacked!\n⚡ ATHEX & ALTHEA ⚡' });
            } else {
                await executeHack(sock, chatId, targetNumber, victimName, victimBio);
            }

            // Reaction
            await sock.sendMessage(chatId, { react: { text: '💀', key: msg.key } });

        } catch (error) {
            console.error('❌ Hack:', error);
            await sock.sendMessage(chatId, { text: '❌ Hack failed! Firewall too strong! 😂\n⚡ ATHEX & ALTHEA ⚡' });
        }
    }
};
