 
// 💣 ELYXIUM BOT v1.0 - SPAM COMMAND (BURST GOD MODE)
// ⚡ 99 MSGS/SEC BURST — Powered by ATHEX & ALTHEA
 

const { SpamController, spamPresets, defaultMessages, funnyMessages, annoyingMessages, emojiSpam } = require('../../utils/spamEngine');

const activeSessions = new Map();

module.exports = {
    name: 'spam',
    description: 'BURST GOD MODE spam — 99 msgs/sec bursts',
    category: 'fun',
    usage: 'spam [count] [preset]',
    aliases: ['bomb', 'attack', 'blast', 'raid', 'nuke'],

    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        const userId = msg.key.remoteJid;

        try {
            const sub = args[0]?.toLowerCase();

            // STOP
            if (sub === 'stop' || sub === 'cancel') {
                const session = activeSessions.get(userId);
                if (session?.isActive) {
                    const stats = await session.stop();
                    activeSessions.delete(userId);
                    await sock.sendMessage(chatId, {
                        text: `🛑 *STOPPED!*\n📊 ${stats.stats.sent} msgs in ${stats.stats.duration}s\n⚡ ${stats.stats.speed} msg/s\n⚡ ATHEX & ALTHEA ⚡`
                    });
                } else {
                    await sock.sendMessage(chatId, { text: '🤔 No active spam!' });
                }
                return;
            }

            // STATUS
            if (sub === 'status' || sub === 'info') {
                const session = activeSessions.get(userId);
                if (session?.isActive) {
                    const s = session.getStatus();
                    await sock.sendMessage(chatId, {
                        text: `💣 *STATUS*\n📊 ${s.sent}/${s.total} | ⚡ ${s.speed} msg/s\n💥 Bursts: ${s.bursts || 0} | ⏱️ ${s.elapsed}s\n⚡ ATHEX & ALTHEA ⚡`
                    });
                } else {
                    await sock.sendMessage(chatId, { text: '💤 No active spam!' });
                }
                return;
            }

            // PAUSE
            if (sub === 'pause') {
                const session = activeSessions.get(userId);
                if (session?.isActive) await session.pause();
                else await sock.sendMessage(chatId, { text: '🤔 Nothing to pause!' });
                return;
            }

            // RESUME
            if (sub === 'resume') {
                const session = activeSessions.get(userId);
                if (session && !session.isActive) await session.resume();
                else await sock.sendMessage(chatId, { text: '🤔 Nothing to resume!' });
                return;
            }

            // PRESETS LIST
            if (sub === 'presets' || sub === 'list') {
                let list = '*☠️ SPAM PRESETS ☠️*\n\n';
                for (const [key, p] of Object.entries(spamPresets)) {
                    const bursts = Math.ceil(p.count / 99);
                    list += `${p.icon} *${p.name}* — ${p.count} msgs (${bursts} bursts)\n`;
                }
                list += `\n💥 *!spam god* = 10,000 msgs (101 bursts)\n⚡ ATHEX & ALTHEA ⚡`;
                await sock.sendMessage(chatId, { text: list });
                return;
            }

            // CHECK EXISTING
            if (activeSessions.get(userId)?.isActive) {
                await sock.sendMessage(chatId, { text: '⚠️ Spam already running! Use *!spam stop*' });
                return;
            }

            // PARSE ARGS
            let count = 99;
            let messagePack = defaultMessages;

            // Preset
            if (args[0] && spamPresets[args[0].toLowerCase()]) {
                const p = spamPresets[args[0].toLowerCase()];
                count = p.count;
                messagePack = p.messages || defaultMessages;
            }
            // Custom count
            else if (args[0] && !isNaN(args[0])) {
                count = Math.min(parseInt(args[0]), 50000);
            }

            // Message pack
            if (args.includes('funny')) messagePack = funnyMessages;
            if (args.includes('annoying')) messagePack = annoyingMessages;
            if (args.includes('emoji')) messagePack = emojiSpam;

            // WARNING FOR LARGE SPAM
            if (count >= 5000) {
                const bursts = Math.ceil(count / 99);
                const estTime = bursts * 2;
                await sock.sendMessage(chatId, {
                    text: `☠️ *GOD MODE!*\n📊 ${count} msgs\n💥 ${bursts} bursts (99/sec)\n⏱️ Est: ~${estTime}s\n\nStarting in 2s...\n⚡ ATHEX & ALTHEA ⚡`
                });
                await new Promise(r => setTimeout(r, 2000));
            } else if (count >= 500) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *LARGE SPAM!*\n${count} msgs incoming...\n⚡ ATHEX & ALTHEA ⚡`
                });
                await new Promise(r => setTimeout(r, 1000));
            }

            // LAUNCH
            const controller = new SpamController(sock, chatId);
            activeSessions.set(userId, controller);
            await controller.start(count, messagePack);

        } catch (error) {
            console.error('❌ Spam:', error);
            await sock.sendMessage(chatId, { text: '❌ Spam failed!\n⚡ ATHEX & ALTHEA ⚡' });
        }
    }
};