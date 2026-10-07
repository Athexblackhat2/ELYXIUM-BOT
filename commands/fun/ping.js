 
// 🏓 ELYXIUM BOT v1.0 - PING COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const { createBox, athexBadge } = require('../../utils/embedBuilder');

module.exports = {
    name: 'ping',
    description: 'Check bot response speed and latency',
    category: 'fun',
    usage: 'ping',
    aliases: ['pong', 'speed', 'latency'],
    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        const startTime = Date.now();

        try {
            const sentMsg = await sock.sendMessage(chatId, {
                text: '```🏓 Pinging...```'
            });

            const endTime = Date.now();
            const latency = endTime - startTime;

            const wsPing = sock.ws ? sock.ws.ping : null;

            const uptime = process.uptime();
            const uptimeStr = formatUptime(uptime);

            const memory = process.memoryUsage();
            const memoryMB = (memory.heapUsed / 1024 / 1024).toFixed(2);
            const speedRating = getSpeedRating(latency);
            const speedEmoji = getSpeedEmoji(latency);

            // Build response
            const pingMessage = `
 
       🏓 PING! 🏓               
                                  
   📡 Response: ${String(latency).padEnd(16)} 
   ${speedEmoji} Speed: ${speedRating.padEnd(16)} 
                                  
   ⏱️  Uptime: ${uptimeStr.padEnd(16)} 
   💾 Memory: ${String(memoryMB + ' MB').padEnd(16)} 
                                  
   ⚡ ELYXIUM BOT v1.0 ⚡        
   ATHEX & ALTHEA                
 `;

            // Simulate typing delay for realism
            await new Promise(resolve => setTimeout(resolve, 300));

            // Edit the original message or send new one
            await sock.sendMessage(chatId, {
                text: pingMessage,
                edit: sentMsg.key
            });

            // Console log
            console.log(`🏓 Ping: ${latency}ms | ${speedRating} | ${memoryMB}MB`);

        } catch (error) {
            console.error('❌ Ping Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *PING FAILED!*\nSomething went wrong.\n\n⚡ ATHEX & ALTHEA ⚡'
            });
        }
    }
};

const getSpeedRating = (ms) => {
    if (ms < 50) return '⚡ GODLY';
    if (ms < 100) return '🔥 EXCELLENT';
    if (ms < 200) return '✅ GREAT';
    if (ms < 500) return '👌 GOOD';
    if (ms < 1000) return '😐 AVERAGE';
    if (ms < 2000) return '🐌 SLOW';
    return '💀 DEAD';
};

const getSpeedEmoji = (ms) => {
    if (ms < 50) return '⚡';
    if (ms < 100) return '🔥';
    if (ms < 200) return '✅';
    if (ms < 500) return '👌';
    if (ms < 1000) return '😐';
    if (ms < 2000) return '🐌';
    return '💀';
};

const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
};

 
// ⚡ ELYXIUM BOT v1.0 - Ping Command Ready!
// ⚡ Powered by ATHEX & ALTHEA
 