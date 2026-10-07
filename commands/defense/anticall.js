 
// 🚫 ELYXIUM BOT v1.0 - ANTI-CALL COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const { AntiCallController, declineMessages } = require('../../utils/antiCallEngine');
const { createBox, athexBadge } = require('../../utils/embedBuilder');
const { getOwnerData, updateOwnerSetting } = require('../../middleware/ownerCheck');

let globalController = null;

const getController = (sock) => {
    if (!globalController) {
        globalController = new AntiCallController(sock);
    }
    return globalController;
};

module.exports = {
    name: 'anticall',
    description: 'Auto decline all incoming calls with ATHEX & ALTHEA warning',
    category: 'defense',
    usage: 'anticall [on/off/mode/style/status]',
    aliases: ['callblock', 'nocall', 'blockcall', 'callshield', 'ac'],

    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        const userId = msg.key.remoteJid;
        const controller = getController(sock);

        try {
            // No args - show status
            if (!args || args.length === 0) {
                await showAntiCallStatus(sock, chatId, controller);
                return;
            }

            const subCommand = args[0].toLowerCase();

            // ON/OFF
            if (subCommand === 'on' || subCommand === 'enable' || subCommand === 'start') {
                await handleEnable(sock, chatId, userId);
                return;
            }

            if (subCommand === 'off' || subCommand === 'disable' || subCommand === 'stop') {
                await handleDisable(sock, chatId, userId);
                return;
            }

            // Status
            if (subCommand === 'status' || subCommand === 'info' || subCommand === 'stats') {
                await showAntiCallStatus(sock, chatId, controller);
                return;
            }

            // Mode change
            if (subCommand === 'mode') {
                await handleModeChange(sock, chatId, controller, args);
                return;
            }

            // Style change
            if (subCommand === 'style') {
                await handleStyleChange(sock, chatId, controller, args);
                return;
            }

            // Custom message
            if (subCommand === 'message' || subCommand === 'msg') {
                await handleCustomMessage(sock, chatId, controller, args);
                return;
            }

            // Reset message
            if (subCommand === 'reset') {
                await handleResetMessage(sock, chatId, controller);
                return;
            }

            // Block number
            if (subCommand === 'block') {
                await handleBlockNumber(sock, chatId, controller, args);
                return;
            }

            // Unblock number
            if (subCommand === 'unblock') {
                await handleUnblockNumber(sock, chatId, controller, args);
                return;
            }

            // Blocklist
            if (subCommand === 'blocklist' || subCommand === 'blocked') {
                await handleBlockList(sock, chatId, controller);
                return;
            }

            // Whitelist
            if (subCommand === 'whitelist' || subCommand === 'allow') {
                await handleWhitelist(sock, chatId, controller, args);
                return;
            }

            // Remove whitelist
            if (subCommand === 'unwhitelist' || subCommand === 'unallow') {
                await handleRemoveWhitelist(sock, chatId, controller, args);
                return;
            }

            // Whitelist list
            if (subCommand === 'whitelisted' || subCommand === 'allowed') {
                await handleWhitelistList(sock, chatId, controller);
                return;
            }

            // Call log
            if (subCommand === 'log' || subCommand === 'history') {
                await handleCallLog(sock, chatId, controller, args);
                return;
            }

            // Clear log
            if (subCommand === 'clearlog') {
                await handleClearLog(sock, chatId, controller);
                return;
            }

            // Auto-reply toggle
            if (subCommand === 'autoreply') {
                await handleAutoReply(sock, chatId, controller);
                return;
            }

            // Notify toggle
            if (subCommand === 'notify') {
                await handleNotify(sock, chatId, controller);
                return;
            }

            // Help
            if (subCommand === 'help') {
                await handleAntiCallHelp(sock, chatId, config);
                return;
            }

            // Styles list
            if (subCommand === 'styles') {
                await handleStylesList(sock, chatId);
                return;
            }

            // Modes list
            if (subCommand === 'modes') {
                await handleModesList(sock, chatId);
                return;
            }

            // Unknown
            await sock.sendMessage(chatId, {
                text: `❌ *Unknown option!*\n\nUse *${config.prefix}anticall help* for all commands.\n\n⚡ ATHEX & ALTHEA ⚡`
            });

        } catch (error) {
            console.error('❌ AntiCall Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *ANTI-CALL ERROR!*\nSomething went wrong!\n\n⚡ ATHEX & ALTHEA ⚡'
            });
        }
    }
};

const handleEnable = async (sock, chatId, userId) => {
    updateOwnerSetting(userId, 'antiCall', true);
    
    const message = `

  🚫 ANTI-CALL ENABLED! 🚫    
                                
  Status: ✅ ACTIVE             
  Mode: REJECT                  
                                
  All incoming calls will be   
  automatically declined!       
                                
    Callers will see:            
  "POWERED BY ATHEX & ALTHEA"  

⚡ ELYXIUM BOT v1.0 ⚡`;

    await sock.sendMessage(chatId, { text: message });
};

const handleDisable = async (sock, chatId, userId) => {
    updateOwnerSetting(userId, 'antiCall', false);
    
    const message = `

  ✅ ANTI-CALL DISABLED! ✅   
                                
  Status: ❌ INACTIVE           
                                
  Calls will now come through  
  normally.                    
                                
⚡ ELYXIUM BOT v1.0 ⚡`;

    await sock.sendMessage(chatId, { text: message });
};
const showAntiCallStatus = async (sock, chatId, controller) => {
    const menu = controller.getAntiCallMenu();
    await sock.sendMessage(chatId, { text: menu });
};

const handleModeChange = async (sock, chatId, controller, args) => {
    if (args.length < 2) {
        await sock.sendMessage(chatId, {
            text: `❌ *Please specify a mode!*\n\nAvailable: *reject, silent, busy, ghost*\n\nExample: *!anticall mode ghost*\n\n⚡ ATHEX & ALTHEA ⚡`
        });
        return;
    }

    const mode = args[1].toLowerCase();
    const result = controller.setMode(mode);

    if (result.success) {
        const modeEmojis = { reject: '🚫', silent: '🤫', busy: '📵', ghost: '👻' };
        await sock.sendMessage(chatId, {
            text: `${modeEmojis[mode] || '✅'} *MODE CHANGED!*\n\nNew Mode: *${mode.toUpperCase()}*\n${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    } else {
        await sock.sendMessage(chatId, {
            text: `❌ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    }
};
const handleStyleChange = async (sock, chatId, controller, args) => {
    if (args.length < 2) {
        const styles = Object.keys(declineMessages).join(', ');
        await sock.sendMessage(chatId, {
            text: `❌ *Please specify a style!*\n\nAvailable: *${styles}*\n\nExample: *!anticall style hacker*\n\n⚡ ATHEX & ALTHEA ⚡`
        });
        return;
    }

    const style = args[1].toLowerCase();
    const result = controller.setMessageStyle(style);

    if (result.success) {
        await sock.sendMessage(chatId, {
            text: `✅ *STYLE CHANGED!*\n\nNew Style: *${style.toUpperCase()}*\n\nPreview:\n${declineMessages[style]}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    } else {
        await sock.sendMessage(chatId, {
            text: `❌ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    }
};

const handleCustomMessage = async (sock, chatId, controller, args) => {
    if (args.length < 2) {
        await sock.sendMessage(chatId, {
            text: `❌ *Please provide a message!*\n\nExample: *!anticall message I am busy, call later!*\n\nUse *!anticall reset* to restore default.\n\n⚡ ATHEX & ALTHEA ⚡`
        });
        return;
    }

    const message = args.slice(1).join(' ');
    const result = controller.setCustomMessage(message);

    await sock.sendMessage(chatId, {
        text: `${result.success ? '✅' : '❌'} ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

const handleResetMessage = async (sock, chatId, controller) => {
    const result = controller.resetCustomMessage();
    await sock.sendMessage(chatId, {
        text: `✅ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

const handleBlockNumber = async (sock, chatId, controller, args) => {
    if (args.length < 2) {
        await sock.sendMessage(chatId, {
            text: `❌ *Please provide a number to block!*\n\nExample: *!anticall block 923001234567*\n\n⚡ ATHEX & ALTHEA ⚡`
        });
        return;
    }

    const number = args[1].replace(/[^\d]/g, '');
    const result = controller.blockNumber(number);

    await sock.sendMessage(chatId, {
        text: `${result.success ? '🚫' : '⚠️'} ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

const handleUnblockNumber = async (sock, chatId, controller, args) => {
    if (args.length < 2) {
        await sock.sendMessage(chatId, {
            text: `❌ *Please provide a number to unblock!*\n\nExample: *!anticall unblock 923001234567*\n\n⚡ ATHEX & ALTHEA ⚡`
        });
        return;
    }

    const number = args[1].replace(/[^\d]/g, '');
    const result = controller.unblockNumber(number);

    await sock.sendMessage(chatId, {
        text: `${result.success ? '✅' : '⚠️'} ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

const handleBlockList = async (sock, chatId, controller) => {
    const blocked = controller.getBlockedNumbers();
    
    if (blocked.length === 0) {
        await sock.sendMessage(chatId, {
            text: '📋 *BLOCKLIST EMPTY*\n\nNo numbers are blocked.\n\n⚡ ATHEX & ALTHEA ⚡'
        });
        return;
    }

    let list = '\n';
    list += '   🚫 BLOCKED NUMBERS 🚫      \n';
    list += '                                \n';
    
    blocked.forEach((num, i) => {
        list += `   ${String(i + 1).padEnd(2)}. ${num.padEnd(20)} \n`;
    });
    
    list += '                                \n';
    list += `  Total: ${String(blocked.length).padEnd(20)}\n`;
    list += '                                \n';
    list += '\n';
    list += '⚡ Powered by ATHEX & ALTHEA ⚡';

    await sock.sendMessage(chatId, { text: list });
};

 
// ⭐ WHITELIST NUMBER
 
const handleWhitelist = async (sock, chatId, controller, args) => {
    if (args.length < 2) {
        await sock.sendMessage(chatId, {
            text: `❌ *Please provide a number to whitelist!*\n\nExample: *!anticall whitelist 923001234567*\n\n⚡ ATHEX & ALTHEA ⚡`
        });
        return;
    }

    const number = args[1].replace(/[^\d]/g, '');
    const result = controller.whitelistNumber(number);

    await sock.sendMessage(chatId, {
        text: `${result.success ? '⭐' : '⚠️'} ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

 
// ❌ REMOVE WHITELIST
 
const handleRemoveWhitelist = async (sock, chatId, controller, args) => {
    if (args.length < 2) {
        await sock.sendMessage(chatId, {
            text: `❌ *Please provide a number to remove from whitelist!*\n\nExample: *!anticall unwhitelist 923001234567*\n\n⚡ ATHEX & ALTHEA ⚡`
        });
        return;
    }

    const number = args[1].replace(/[^\d]/g, '');
    const result = controller.removeWhitelist(number);

    await sock.sendMessage(chatId, {
        text: `${result.success ? '✅' : '⚠️'} ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

 
// ⭐ WHITELIST LIST
 
const handleWhitelistList = async (sock, chatId, controller) => {
    const whitelisted = controller.getWhitelistedNumbers();
    
    if (whitelisted.length === 0) {
        await sock.sendMessage(chatId, {
            text: '📋 *WHITELIST EMPTY*\n\nNo numbers are whitelisted.\n\n⚡ ATHEX & ALTHEA ⚡'
        });
        return;
    }

    let list = '\n';
    list += '   ⭐ WHITELISTED NUMBERS ⭐   \n';
    list += '                                \n';
    
    whitelisted.forEach((num, i) => {
        list += `  ${String(i + 1).padEnd(2)}. ${num.padEnd(20)}\n`;
    });
    
    list += '                                \n';
    list += `  Total: ${String(whitelisted.length).padEnd(20)}\n`;
    list += '                                \n';
    list += '\n';
    list += '⚡ Powered by ATHEX & ALTHEA ⚡';

    await sock.sendMessage(chatId, { text: list });
};

 
// 📜 CALL LOG
 
const handleCallLog = async (sock, chatId, controller, args) => {
    const limit = args.length > 1 ? parseInt(args[1]) || 10 : 10;
    const log = controller.getCallLog(limit);
    
    if (log.length === 0) {
        await sock.sendMessage(chatId, {
            text: '📜 *CALL LOG EMPTY*\n\nNo calls have been processed yet.\n\n⚡ ATHEX & ALTHEA ⚡'
        });
        return;
    }

    let logText = '\n';
    logText += '   📜 CALL LOG 📜            \n';
    logText += '                                \n';
    
    log.forEach((entry, i) => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        const status = entry.status === 'blocked' ? '🚫' : '✅';
        const caller = entry.from.split('@')[0].substring(0, 15);
        logText += `   ${status} ${caller.padEnd(15)} ${time.padEnd(8)} \n`;
    });
    
    logText += '                                \n';
    logText += '\n';
    logText += '⚡ Powered by ATHEX & ALTHEA ⚡';

    await sock.sendMessage(chatId, { text: logText });
};

 
// 🗑️ CLEAR LOG
 
const handleClearLog = async (sock, chatId, controller) => {
    const result = controller.clearCallLog();
    await sock.sendMessage(chatId, {
        text: `✅ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

 
// 💬 AUTO-REPLY TOGGLE
 
const handleAutoReply = async (sock, chatId, controller) => {
    const result = controller.toggleAutoReply();
    await sock.sendMessage(chatId, {
        text: `${result.autoReply ? '✅' : '❌'} ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

 
// 🔔 NOTIFY TOGGLE
 
const handleNotify = async (sock, chatId, controller) => {
    const result = controller.toggleNotifyOwner();
    await sock.sendMessage(chatId, {
        text: `${result.notifyOwner ? '✅' : '❌'} ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

 
// 🎨 STYLES LIST
 
const handleStylesList = async (sock, chatId) => {
    const styles = Object.keys(declineMessages);
    
    let styleList = '\n';
    styleList += '   🎨 MESSAGE STYLES 🎨       \n';
    styleList += '                                \n';
    
    const styleEmojis = {
        default: '📋',
        funny: '😂',
        rude: '😡',
        ghost: '👻',
        professional: '💼',
        hacker: '💻'
    };
    
    styles.forEach(style => {
        const emoji = styleEmojis[style] || '📝';
        styleList += `  ${emoji} ${style.padEnd(22)}\n`;
    });
    
    styleList += '                                \n';
    styleList += '  Use: !anticall style <name>  \n';
    styleList += '                                \n';
    styleList += '\n';
    styleList += '⚡ Powered by ATHEX & ALTHEA ⚡';

    await sock.sendMessage(chatId, { text: styleList });
};

 
// 🎯 MODES LIST
 
const handleModesList = async (sock, chatId) => {
    const modesList = `

   🎯 ANTI-CALL MODES 🎯      
                                
  🚫 REJECT                    
  → Decline + send message     
                                
  🤫 SILENT                     
  → Decline without message    
                                
  📵 BUSY                       
  → Show line busy tone        
                                
  👻 GHOST                      
  → Number doesn't exist       
                               
  Use: !anticall mode <name>   
                               

⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: modesList });
};

 
// ❓ HELP
 
const handleAntiCallHelp = async (sock, chatId, config) => {
    const helpText = `
 
   🚫 ANTI-CALL HELP 🚫         
                                  
   📋 COMMANDS:                  
                                  
   ${config.prefix}anticall on/off           
   → Enable/disable shield       
                                  
   ${config.prefix}anticall status          
   → View current settings       
                                  
   ${config.prefix}anticall mode <name>     
   → Change decline mode         
                                  
   ${config.prefix}anticall style <name>    
   → Change message style        
                                  
   ${config.prefix}anticall message <text>  
   → Set custom decline msg      
                                  
   ${config.prefix}anticall block <num>     
   → Block specific number       
                                  
   ${config.prefix}anticall whitelist <num> 
   → Allow calls from number     
                                  
   ${config.prefix}anticall log            
   → View call history           
                                  
   ${config.prefix}anticall help           
   → Show this menu              
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: helpText });
};

 
// ⚡ ELYXIUM BOT v1.0 - AntiCall Command Ready!
// ⚡ Powered by ATHEX & ALTHEA
 