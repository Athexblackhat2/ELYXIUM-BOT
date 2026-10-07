 
// 🚫 ELYXIUM BOT v1.0 - ANTI CALL ENGINE (REAL)
// ⚡ ACTUAL CALL REJECTION
// ⚡ Powered by ATHEX & ALTHEA
 

const config = require('../config.json');
const { getOwnerData, updateOwnerSetting } = require('../middleware/ownerCheck');

const generateFakeIP = () => `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

const declineMessages = {
    default: '🚫 *CALL DECLINED!*\n\nThis user has Anti-Call enabled.\n⚡ ELYXIUM BOT | ATHEX & ALTHEA ⚡',
    funny: '📞 *CALL REJECTED!*\n\nOops! Protected by ELYXIUM BOT!\nTry sending a message instead 😂\n⚡ ATHEX & ALTHEA ⚡',
    rude: '🚫 *CALL BLOCKED!*\n\nDON\'T CALL THIS NUMBER!\nBACK OFF! 😡\n⚡ ATHEX & ALTHEA ⚡',
    ghost: '👻 *GHOST MODE!*\n\nThis number doesn\'t exist!\nBAOOOOO! 👻\n⚡ ATHEX & ALTHEA ⚡',
    hacker: `💻 *CALL INTERCEPTED!*\n\nIP Logged: ${generateFakeIP()}\nYour Location Is Tracked! 📍\n⚡ ATHEX & ALTHEA ⚡`,
};

const callLog = [];

class AntiCallController {
    constructor(sock) {
        this.sock = sock;
        this.enabled = true;
        this.mode = 'reject';
        this.messageStyle = 'default';
        this.totalCallsBlocked = 0;
        this.totalCallsReceived = 0;
        this.autoReply = true;
    }

    // ✅ REAL CALL HANDLER
    async handleCall(call) {
        this.totalCallsReceived++;
        
        if (call.status !== 'offer') return { handled: false };
        if (!this.enabled) return { handled: false };

        try {
            // ✅ ACTUALLY REJECT THE CALL
            await this.sock.rejectCall(call.id, call.from);
            this.totalCallsBlocked++;

            // Send auto-reply
            if (this.autoReply) {
                const msg = declineMessages[this.messageStyle] || declineMessages.default;
                await this.sock.sendMessage(call.from, { text: msg }).catch(() => {});
            }

            callLog.push({
                from: call.from,
                status: 'blocked',
                mode: this.mode,
                timestamp: new Date().toISOString()
            });

            if (callLog.length > 500) callLog.shift();

            console.log(`🚫 Call blocked: ${call.from} (Total: ${this.totalCallsBlocked})`);
            return { handled: true, caller: call.from };

        } catch (error) {
            console.error('AntiCall error:', error.message);
            return { handled: false };
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setMode(mode) {
        const valid = ['reject', 'silent', 'busy', 'ghost'];
        if (valid.includes(mode)) {
            this.mode = mode;
            if (mode === 'silent') this.autoReply = false;
            else this.autoReply = true;
            return { success: true };
        }
        return { success: false };
    }

    setMessageStyle(style) {
        if (declineMessages[style]) {
            this.messageStyle = style;
            return { success: true };
        }
        return { success: false };
    }

    getStats() {
        return {
            enabled: this.enabled,
            mode: this.mode,
            style: this.messageStyle,
            totalBlocked: this.totalCallsBlocked,
            totalReceived: this.totalCallsReceived,
            autoReply: this.autoReply,
        };
    }

    getAntiCallMenu() {
        const s = this.getStats();
        return `🚫 *ANTI-CALL SETTINGS*\n\nStatus: ${s.enabled ? '✅ ACTIVE' : '❌ OFF'}\nMode: ${s.mode}\nStyle: ${s.style}\n\n📊 Blocked: ${s.totalBlocked}\n📞 Received: ${s.totalReceived}\n💬 Auto-Reply: ${s.autoReply ? 'ON' : 'OFF'}\n\n⚡ ATHEX & ALTHEA ⚡`;
    }
}

module.exports = { AntiCallController, declineMessages, generateFakeIP };