 
// 👻 ELYXIUM BOT v1.0 - STATUS MANAGER (REAL)
// ⚡ REAL PRESENCE + KEEP-ALIVE
// ⚡ Powered by ATHEX & ALTHEA
 

const config = require('../config.json');
const { getOwnerData, updateOwnerSetting } = require('../middleware/ownerCheck');

const PresenceTypes = {
    ONLINE: 'available',
    OFFLINE: 'unavailable',
};

const StatusModes = {
    FAKE_ONLINE: 'fakeonline',
    FAKE_OFFLINE: 'fakeoffline',
    REAL_ONLINE: 'online',
    REAL_OFFLINE: 'offline',
};

class StatusController {
    constructor(sock) {
        this.sock = sock;
        this.currentMode = StatusModes.REAL_ONLINE;
        this.isFakeActive = false;
        this.keepAlive = null;
    }

    // ✅ REAL FAKE ONLINE — keeps sending presence
    async setFakeOnline(userId) {
        try {
            this.currentMode = StatusModes.FAKE_ONLINE;
            this.isFakeActive = true;

            // Clear old interval
            if (this.keepAlive) clearInterval(this.keepAlive);

            // Immediately set online
            await this.sock.sendPresenceUpdate(PresenceTypes.ONLINE);

            // Keep alive every 30 seconds
            this.keepAlive = setInterval(async () => {
                try {
                    await this.sock.sendPresenceUpdate(PresenceTypes.ONLINE);
                } catch (e) {}
            }, 30000);

            updateOwnerSetting(userId, 'fakeStatus', 'fakeonline');

            return {
                success: true,
                message: '🟢 *FAKE ONLINE ACTIVATED!*\n\n✅ Always appear online\n✅ Keep-alive every 30s\n✅ Single tick messages\n\n⚡ ATHEX & ALTHEA ⚡',
                mode: this.currentMode
            };
        } catch (error) {
            return { success: false, message: '❌ Failed!' };
        }
    }

    // ✅ REAL FAKE OFFLINE — stops keep-alive, sets unavailable
    async setFakeOffline(userId) {
        try {
            this.currentMode = StatusModes.FAKE_OFFLINE;
            this.isFakeActive = true;

            // Stop keep-alive
            if (this.keepAlive) {
                clearInterval(this.keepAlive);
                this.keepAlive = null;
            }

            // Set offline
            await this.sock.sendPresenceUpdate(PresenceTypes.OFFLINE);
            updateOwnerSetting(userId, 'fakeStatus', 'fakeoffline');

            return {
                success: true,
                message: '🔴 *FAKE OFFLINE ACTIVATED!*\n\n✅ Appear offline\n✅ Actually online\n✅ Single tick\n\n⚡ ATHEX & ALTHEA ⚡',
                mode: this.currentMode
            };
        } catch (error) {
            return { success: false, message: '❌ Failed!' };
        }
    }

    // ✅ RESET TO REAL ONLINE
    async setRealOnline(userId) {
        try {
            this.currentMode = StatusModes.REAL_ONLINE;
            this.isFakeActive = false;

            if (this.keepAlive) {
                clearInterval(this.keepAlive);
                this.keepAlive = null;
            }

            await this.sock.sendPresenceUpdate(PresenceTypes.ONLINE);
            updateOwnerSetting(userId, 'fakeStatus', 'online');

            return {
                success: true,
                message: '✅ *STATUS RESET!* Real online restored.\n⚡ ATHEX & ALTHEA ⚡',
                mode: this.currentMode
            };
        } catch (error) {
            return { success: false, message: '❌ Failed!' };
        }
    }

    getStatus() {
        const names = {
            fakeonline: '🟢 Fake Online',
            fakeoffline: '🔴 Fake Offline',
            online: '🟢 Real Online',
            offline: '🔴 Real Offline',
        };
        return {
            mode: this.currentMode,
            modeName: names[this.currentMode] || 'Unknown',
            isFake: this.isFakeActive,
            keepAliveActive: !!this.keepAlive,
        };
    }

    async toggleFakeStatus(userId) {
        return this.currentMode === StatusModes.FAKE_ONLINE
            ? await this.setFakeOffline(userId)
            : await this.setFakeOnline(userId);
    }
}

const singleTickMode = {
    enabled: false,
    enable() { this.enabled = true; return { success: true, message: '📱 Single tick ON' }; },
    disable() { this.enabled = false; return { success: true, message: '✅ Double tick ON' }; },
    isEnabled() { return this.enabled; }
};

module.exports = {
    StatusController,
    singleTickMode,
    PresenceTypes,
    StatusModes,
};