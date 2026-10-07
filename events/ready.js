 
// 🟢 ELYXIUM BOT v1.0 - READY EVENT
// ⚡ Powered by ATHEX & ALTHEA
 

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const config = require('../config.json');
const { loadUsers } = require('../middleware/ownerCheck');

 
// 📊 BOT STATS
 
const getBotStats = () => {
    const users = loadUsers();
    const commandsPath = path.join(__dirname, '..', 'commands');
    
    let totalCommands = 0;
    
    // Count commands
    const countCommands = (dir) => {
        if (!fs.existsSync(dir)) return;
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const itemPath = path.join(dir, item);
            if (fs.statSync(itemPath).isDirectory()) {
                countCommands(itemPath);
            } else if (item.endsWith('.js')) {
                totalCommands++;
            }
        }
    };
    
    countCommands(commandsPath);
    
    return {
        totalUsers: users.length,
        totalCommands: totalCommands,
        antiCall: config.features.antiCall.enabled ? 'ON' : 'OFF',
        autoSeen: config.features.autoSeen ? 'ON' : 'OFF',
        autoReact: config.features.autoReact ? 'ON' : 'OFF'
    };
};

 
// 📱 SET BOT STATUS
 
const setBotStatus = async (sock) => {
    try {
        // Set online status
        await sock.sendPresenceUpdate('available');
        
        // Set status message (about)
        await sock.updateProfileStatus(
            `🔥 ELYXIUM BOT v1.0 | ⚡ Powered by ATHEX & ALTHEA | !menu`
        );
        
        console.log(chalk.green('📱 Bot status updated!'));
    } catch (error) {
        console.error(chalk.red('❌ Error setting status:'), error);
    }
};

 
// 🖨️ PRINT STARTUP BANNER
 
const printStartupBanner = (stats) => {
    console.log(chalk.cyan.bold('\n╔══════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('                                        '));
    console.log(chalk.green.bold('       🟢 BOT IS NOW ONLINE! 🟢        '));
    console.log(chalk.cyan.bold('                                        '));
    console.log(chalk.cyan.bold('╠══════════════════════════════════════╣'));
    console.log(chalk.cyan.bold('                                        '));
    console.log(chalk.yellow.bold(`   📋 Total Commands : ${String(stats.totalCommands).padEnd(2)}              `));
    console.log(chalk.yellow.bold(`   👥 Registered Users: ${String(stats.totalUsers).padEnd(2)}              `));
    console.log(chalk.yellow.bold(`   🚫 Anti-Call      : ${stats.antiCall.padEnd(5)}               `));
    console.log(chalk.yellow.bold(`   👁️  Auto-Seen      : ${stats.autoSeen.padEnd(5)}               `));
    console.log(chalk.yellow.bold(`   ⚡ Auto-React     : ${stats.autoReact.padEnd(5)}               `));
    console.log(chalk.cyan.bold('                                        '));
    console.log(chalk.cyan.bold('╠══════════════════════════════════════╣'));
    console.log(chalk.cyan.bold('                                        '));
    console.log(chalk.magenta.bold('     ⚡ POWERED BY ATHEX & ALTHEA ⚡    '));
    console.log(chalk.cyan.bold('                                        '));
    console.log(chalk.cyan.bold('╚══════════════════════════════════════╝\n'));
    
    console.log(chalk.green('✅ All systems operational!'));
    console.log(chalk.green(`✅ ${stats.totalCommands} commands loaded!`));
    console.log(chalk.green(`✅ Serving ${stats.totalUsers} registered users!\n`));
    
    console.log(chalk.white.bold('📱 Waiting for commands...\n'));
};

 
// 📊 LOG SYSTEM INFO
 
const logSystemInfo = () => {
    const memory = process.memoryUsage();
    
    console.log(chalk.gray('─'.repeat(46)));
    console.log(chalk.gray('📊 SYSTEM INFORMATION'));
    console.log(chalk.gray('─'.repeat(46)));
    console.log(chalk.white(`🖥️  Platform : ${process.platform}`));
    console.log(chalk.white(`📦 Node.js   : ${process.version}`));
    console.log(chalk.white(`💾 Memory    : ${Math.round(memory.heapUsed / 1024 / 1024)}MB / ${Math.round(memory.heapTotal / 1024 / 1024)}MB`));
    console.log(chalk.white(`⏰ Started   : ${new Date().toLocaleString()}`));
    console.log(chalk.gray('─'.repeat(46) + '\n'));
};

 
// 🔌 EVENT EXECUTE
 
const execute = async (sock, config) => {
    try {
        // Get stats
        const stats = getBotStats();
        
        // Set bot status
        await setBotStatus(sock);
        
        // Log system info
        logSystemInfo();
        
        // Print startup banner
        printStartupBanner(stats);
        
        // ✅ FIXED: Notification loop disabled (causes errors)
        // Users will get menu when they send !register or !menu
        
        console.log(chalk.green('✅ Bot ready to receive commands!\n'));
        
    } catch (error) {
        console.error(chalk.red('❌ Ready Event Error:'), error);
    }
};

 
// 📤 EXPORTS
 
module.exports = { execute };

 
// ⚡ ELYXIUM BOT v1.0 - Ready Event Complete!
// ⚡ Powered by ATHEX & ALTHEA
 