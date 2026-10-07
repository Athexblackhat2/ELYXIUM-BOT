 
// 📋 ELYXIUM BOT v1.0 - MENU COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const { sendMenu, sendHelp, getMenuText } = require('../../menu');
const { createBox, athexBadge } = require('../../utils/embedBuilder');
const { loadUsers } = require('../../middleware/ownerCheck');

module.exports = {
    name: 'menu',
    description: 'Show the main menu with all commands and features',
    category: 'system',
    usage: 'menu [help/commands]',
    aliases: ['help', 'cmds', 'commands', 'features', 'start', 'info'],

    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        const userId = msg.key.remoteJid;

        try {
            if (args && args.length > 0) {
                const subCommand = args[0].toLowerCase();

                if (subCommand === 'help' || subCommand === 'commands' || subCommand === 'cmds') {
                    const { sendHelp } = require('../../menu');
                    await sendHelp(sock, chatId);
                    
                    // Add reaction
                    await sock.sendMessage(chatId, {
                        react: {
                            text: '❓',
                            key: msg.key
                        }
                    });
                    return;
                }

                if (subCommand === 'info' || subCommand === 'about' || subCommand === 'bot') {
                    await showBotInfo(sock, chatId, config);
                    return;
                }

                if (subCommand === 'stats' || subCommand === 'statistics') {
                    await showStats(sock, chatId);
                    return;
                }
            }

            // Send main menu
            await sendMenu(sock, chatId);

            // Add reaction
            await sock.sendMessage(chatId, {
                react: {
                    text: '📋',
                    key: msg.key
                }
            });

            console.log(`📋 Menu shown to: ${userId}`);

        } catch (error) {
            console.error('❌ Menu Error:', error);
            
            // Fallback: send simple text menu
            const { getMenuText } = require('../../menu');
            await sock.sendMessage(chatId, {
                text: getMenuText()
            });
        }
    }
};

 
// 🤖 SHOW BOT INFO
 
const showBotInfo = async (sock, chatId, config) => {
    const uptime = process.uptime();
    const uptimeStr = formatUptime(uptime);
    const memory = process.memoryUsage();
    const memoryMB = (memory.heapUsed / 1024 / 1024).toFixed(2);

    const infoMessage = `
 
    🤖 ELYXIUM BOT v1.0 🤖      
                                  
   📛 Name: ${config.bot.name.padEnd(22)} 
   📦 Version: ${config.bot.version.padEnd(18)} 
   ⚡ Developer: ${truncate(config.bot.developer, 16).padEnd(17)} 
   🏷️  Tagline: ${truncate(config.bot.tagline, 18).padEnd(19)} 
                                  
   📊 SYSTEM:                     
   ⏱️  Uptime: ${uptimeStr.padEnd(18)} 
   💾 Memory: ${String(memoryMB + ' MB').padEnd(16)} 
   🖥️  Platform: ${process.platform.padEnd(15)} 
   📦 Node.js: ${process.version.padEnd(15)} 
                                  
   🛡️  FEATURES:                  
   ✅ Auto Seen + React           
   ✅ Owner Protection            
   ✅ Anti-Call Shield            
   ✅ Status Faker                
   ✅ Media Downloader            
   ✅ 4 Prank Commands            
                                  
   📋 ${String(14).padEnd(2)} Commands Available        
                                  
   ⚡ ATHEX & ALTHEA ⚡         
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: infoMessage });
};

 
// 📊 SHOW STATS
 
const showStats = async (sock, chatId) => {
    const users = loadUsers();
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    const statsMessage = `
 
    📊 BOT STATISTICS 📊        
                                  
   👥 Registered Users: ${String(users.length).padEnd(10)} 
   📋 Total Commands: ${String(14).padEnd(13)} 
   ⏱️  Uptime: ${formatUptime(uptime).padEnd(18)} 
   💾 RAM: ${String((memory.heapUsed / 1024 / 1024).toFixed(1) + ' MB').padEnd(18)} 
                                  
   📂 Active Features:           
   ✅ Auto Seen                  
   ✅ Auto React                 
   ✅ Anti-Call                  
   ✅ Owner Protection           
                                  
   🎯 Commands by Category:      
   🎉 Fun: 6                     
   🛠️  Utility: 4                
   👻 Status: 3                  
   🛡️  Defense: 1                
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: statsMessage });
};

 
// ⏱️ FORMAT UPTIME
 
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

 
// ✂️ TRUNCATE TEXT
 
const truncate = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

 
// ⚡ ELYXIUM BOT v1.0 - Menu Command Ready!
// ⚡ Powered by ATHEX & ALTHEA
 