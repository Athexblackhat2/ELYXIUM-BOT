 
// 💣 ELYXIUM BOT v1.0 - SPAM ENGINE (ADAPTIVE)
// ⚡ AUTO-SPEED ADJUST — Powered by ATHEX & ALTHEA
 

const config = require('../config.json');

const defaultMessages = [
    '🔥 ELYXIUM BOT SPAM ATTACK! 🔥', '⚡ Powered by ATHEX & ALTHEA ⚡',
    '💀 You just got spammed! 💀', '😂 Fahhhhhhhhhhhhhhhhhhhh!',
    '👻 Ghost mode activated!', '🎯 Target locked and loaded!',
    '💣 Bombing your chat!', '🤖 Bot attack in progress...',
    '⚠️ Warning: Too many messages!', '🔫 Pew pew pew!',
    '🌟 ELYXIUM on fire!', '💪 Can\'t stop the spam!',
];

const funnyMessages = [
    '🐓 Cock-a-doodle-doo!', '🦆 Quack quack quack!', '🐮 Moooooooo!',
    '🐷 Oink oink!', '🐸 Ribbit ribbit!', '🦁 Rawrrrrr!',
    '🐶 Woof woof!', '🐱 Meow meow!',
];

const annoyingMessages = [
    '🔔 Ding dong!', '📱 Notification!', '🔔 You have a message!',
    '📬 Mail delivered!', '🔔 Ding ding ding!', '📱 Buzz buzz!',
];

const emojiSpam = [
    '😂😂😂😂😂', '🔥🔥🔥🔥🔥', '💀💀💀💀💀', '⚡⚡⚡⚡⚡', '👻👻👻👻👻',
];

const getRandomMessage = (list = defaultMessages) => list[Math.floor(Math.random() * list.length)];

const shuffleArray = (array) => {
    const s = [...array];
    for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
    }
    return s;
};

class SpamController {
    constructor(sock, chatId) {
        this.sock = sock;
        this.chatId = chatId;
        this.isActive = false;
        this.messageCount = 0;
        this.totalMessages = 0;
        this.messages = defaultMessages;
        this.startTime = null;
        this.failCount = 0;
    }

    async start(count = 100, customMessages = null) {
        if (this.isActive) return { success: false, message: '⚠️ Already running! Use !spam stop first.' };

        this.isActive = true;
        this.totalMessages = count;
        this.messageCount = 0;
        this.startTime = Date.now();
        this.failCount = 0;
        if (customMessages?.length > 0) this.messages = customMessages;

        await this.sock.sendMessage(this.chatId, {
            text: `💣 *SPAM ATTACK!*\n📊 ${count} msgs\n⚡ Adaptive speed\n☠️ ATHEX & ALTHEA ☠️`
        });

        this.fireBurstMode();
        return { success: true };
    }

    async fireBurstMode() {
        const BURST_SIZE = 99;
        const BURST_GAP = 1000;

        while (this.isActive && this.messageCount < this.totalMessages) {
            const remaining = this.totalMessages - this.messageCount;
            const burstTarget = Math.min(BURST_SIZE, remaining);
            let burstSent = 0;

            while (burstSent < burstTarget && this.isActive) {
                // ✅ ADAPTIVE BATCH SIZE
                const batchSize = this.failCount > 5 ? 8 : this.failCount > 3 ? 12 : this.failCount > 1 ? 18 : 25;
                const miniCount = Math.min(batchSize, burstTarget - burstSent);
                const batch = [];
                let miniFails = 0;

                for (let i = 0; i < miniCount; i++) {
                    batch.push(
                        this.sock.sendMessage(this.chatId, { text: getRandomMessage(this.messages) }).catch(() => { miniFails++; })
                    );
                }

                await Promise.all(batch);
                burstSent += miniCount;
                this.messageCount += miniCount;

                // ✅ ADAPTIVE FAIL TRACKING
                if (miniFails > miniCount / 2) this.failCount += 2;
                else if (miniFails > 0) this.failCount += 1;
                else this.failCount = Math.max(0, this.failCount - 1);

                // ✅ ADAPTIVE DELAY
                const delay = this.failCount > 5 ? 500 : this.failCount > 3 ? 200 : this.failCount > 1 ? 100 : 10;
                if (burstSent < burstTarget) {
                    await new Promise(r => setTimeout(r, delay));
                }
            }

            const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
            const speed = elapsed > 0 ? Math.round(this.messageCount / elapsed) : 0;

            await this.sock.sendMessage(this.chatId, {
                text: `💥 ${this.messageCount}/${this.totalMessages} | ⚡ ${speed}/s | 🕐 ${elapsed}s`
            }).catch(() => {});

            console.log(`💥 ${this.messageCount}/${this.totalMessages} | ${speed}/s | fails:${this.failCount}`);

            if (this.messageCount < this.totalMessages && this.isActive) {
                await new Promise(r => setTimeout(r, BURST_GAP));
            }
        }

        if (this.messageCount >= this.totalMessages) await this.stop();
    }

    async stop() {
        this.isActive = false;
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
        const speed = duration > 0 ? Math.round(this.messageCount / duration) : 0;

        await this.sock.sendMessage(this.chatId, {
            text: `✅ *DONE!*\n📊 ${this.messageCount} msgs\n⏱️ ${duration}s | ⚡ ${speed}/s\n☠️ ATHEX & ALTHEA ☠️`
        });

        return { success: true, stats: { sent: this.messageCount, total: this.totalMessages, duration, speed } };
    }

    getStatus() {
        if (!this.isActive) return { active: false };
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
        return {
            active: true, sent: this.messageCount, total: this.totalMessages,
            remaining: this.totalMessages - this.messageCount,
            elapsed, speed: elapsed > 0 ? Math.round(this.messageCount / elapsed) : 0,
            fails: this.failCount
        };
    }

    async pause() { this.isActive = false; await this.sock.sendMessage(this.chatId, { text: '⏸️ *PAUSED*' }); return { success: true }; }
    async resume() {
        if (this.isActive) return { success: false };
        this.isActive = true;
        await this.sock.sendMessage(this.chatId, { text: '▶️ *RESUMED*' });
        this.fireBurstMode();
        return { success: true };
    }
}

const spamPresets = {
    quick: { name: 'Quick', count: 99, icon: '⚡', messages: defaultMessages },
    normal: { name: 'Normal', count: 198, icon: '💣', messages: defaultMessages },
    fast: { name: 'Fast', count: 495, icon: '🔥', messages: defaultMessages },
    ultra: { name: 'Ultra', count: 990, icon: '💀', messages: [...defaultMessages, ...funnyMessages] },
    extreme: { name: 'Extreme', count: 1980, icon: '👑', messages: [...defaultMessages, ...funnyMessages] },
    legendary: { name: 'Legendary', count: 4950, icon: '🤯', messages: [...defaultMessages, ...funnyMessages, ...annoyingMessages] },
    insane: { name: 'Insane', count: 9900, icon: '☠️', messages: [...defaultMessages, ...emojiSpam] },
    god: { name: 'GOD MODE 💥', count: 10000, icon: '💥', messages: [...defaultMessages, ...funnyMessages, ...annoyingMessages, ...emojiSpam] },
    funny: { name: 'Funny', count: 99, icon: '😂', messages: funnyMessages },
    annoying: { name: 'Annoying', count: 99, icon: '🔔', messages: annoyingMessages },
    emoji: { name: 'Emoji Rain', count: 99, icon: '🎨', messages: emojiSpam },
};

const spamHistory = [];
const trackSpam = (userId, stats) => { spamHistory.push({ userId, timestamp: new Date().toISOString(), ...stats }); if (spamHistory.length > 100) spamHistory.shift(); };
const getSpamHistory = (userId = null) => userId ? spamHistory.filter(h => h.userId === userId) : spamHistory;

const quickSpam = async (sock, chatId, count = 99) => {
    const c = new SpamController(sock, chatId);
    c.start(count);
    return new Promise(r => { const chk = setInterval(() => { if (!c.isActive) { clearInterval(chk); r(c.getStatus()); } }, 500); });
};

const targetedSpam = async (sock, chatId, targetUser, count = 99) => {
    const msgs = [`👋 @${targetUser.split('@')[0]}!`, `🎯 @${targetUser.split('@')[0]}!`, `💣 @${targetUser.split('@')[0]}!`];
    const c = new SpamController(sock, chatId);
    return await c.start(count, msgs);
};

module.exports = {
    SpamController, quickSpam, targetedSpam, spamPresets,
    defaultMessages, funnyMessages, annoyingMessages, emojiSpam,
    trackSpam, getSpamHistory, getRandomMessage, shuffleArray
};