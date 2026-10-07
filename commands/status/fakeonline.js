 
// 🟢 ELYXIUM BOT v1.0 - FAKE ONLINE COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const { StatusController, singleTickMode, StatusModes } = require('../../utils/statusManager');
const { createBox, athexBadge } = require('../../utils/embedBuilder');

 
// 🟢 GLOBAL STATUS CONTROLLER
 
let statusController = null;

const getController = (sock) => {
    if (!statusController) {
        statusController = new StatusController(sock);
    }
    return statusController;
};

 
// ⚡ COMMAND CONFIG
 
module.exports = {
    name: 'fakeonline',
    description: 'Appear online even when offline - messages show single tick',
    category: 'status',
    usage: 'fakeonline [on/off/single]',
    aliases: ['online', 'appear', 'green', 'active', 'fonline', 'fo'],

     
     
     
    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        const userId = msg.key.remoteJid;
        const controller = getController(sock);

        try {
            // No args - activate fake online
            if (!args || args.length === 0) {
                await activateFakeOnline(sock, chatId, userId, controller);
                return;
            }

            const subCommand = args[0].toLowerCase();

            // ON
            if (subCommand === 'on' || subCommand === 'enable' || subCommand === 'start' || subCommand === 'true') {
                await activateFakeOnline(sock, chatId, userId, controller);
                return;
            }

            // OFF
            if (subCommand === 'off' || subCommand === 'disable' || subCommand === 'stop' || subCommand === 'false') {
                await deactivateFakeOnline(sock, chatId, userId, controller);
                return;
            }

            // Single tick mode
            if (subCommand === 'single' || subCommand === 'tick' || subCommand === 'singletick') {
                await enableSingleTick(sock, chatId);
                return;
            }

            // Double tick mode
            if (subCommand === 'double' || subCommand === 'doubletick') {
                await enableDoubleTick(sock, chatId);
                return;
            }

            // Status
            if (subCommand === 'status' || subCommand === 'info') {
                await showStatus(sock, chatId, controller);
                return;
            }

            // Toggle
            if (subCommand === 'toggle' || subCommand === 'switch') {
                await toggleFakeOnline(sock, chatId, userId, controller);
                return;
            }

            // Help
            if (subCommand === 'help') {
                await showHelp(sock, chatId, config);
                return;
            }

            // Unknown
            await sock.sendMessage(chatId, {
                text: `❌ *Unknown option!*\n\nUse *${config.prefix}fakeonline help* for all options.\n\n⚡ ATHEX & ALTHEA ⚡`
            });

        } catch (error) {
            console.error('❌ FakeOnline Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *FAILED TO SET STATUS!*\nSomething went wrong.\n\n⚡ ATHEX & ALTHEA ⚡'
            });
        }
    }
};

 
// 🟢 ACTIVATE FAKE ONLINE
 
const activateFakeOnline = async (sock, chatId, userId, controller) => {
    const result = await controller.setFakeOnline(userId);

    if (result.success) {
        await sock.sendMessage(chatId, {
            text: `
 
    🟢 FAKE ONLINE ACTIVE! 🟢   
                                  
   📱 Status: ONLINE              
   🎭 Reality: YOU CONTROL IT!   
                                  
   ✨ FEATURES:                   
   ✅ Single Tick Messages        
   ✅ Always Appear Online        
   ✅ Seen Receipts Active        
   ✅ Messages Still Deliver      
                                  
   💡 TIP:                        
   People see you online but      
   messages show single tick!     
   Perfect for ignoring! 😎      
                                  
   ⚡ ELYXIUM BOT v1.0 ⚡        
 
⚡ Powered by ATHEX & ALTHEA ⚡`
        });

        // Add reaction
        await sock.sendMessage(chatId, {
            react: {
                text: '🟢',
                key: msg.key || { remoteJid: chatId, id: 'fakeonline' }
            }
        });

        console.log(`🟢 Fake Online activated for: ${userId}`);
    } else {
        await sock.sendMessage(chatId, {
            text: `❌ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    }
};

 
// 🔴 DEACTIVATE FAKE ONLINE
 
const deactivateFakeOnline = async (sock, chatId, userId, controller) => {
    const result = await controller.setRealOnline(userId);

    if (result.success) {
        await sock.sendMessage(chatId, {
            text: `
 
    ✅ STATUS RESET! ✅          
                                  
   📱 Status: REAL ONLINE         
   🎭 Reality: NORMAL             
                                  
   All status features disabled.  
   Back to normal WhatsApp!       
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
        });

        console.log(`✅ Status reset for: ${userId}`);
    } else {
        await sock.sendMessage(chatId, {
            text: `❌ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    }
};

 
// 📱 ENABLE SINGLE TICK
 
const enableSingleTick = async (sock, chatId) => {
    const result = singleTickMode.enable();

    if (result.success) {
        await sock.sendMessage(chatId, {
            text: `
 
   📱 SINGLE TICK MODE 📱        
                                  
   ✅ Single Tick: ENABLED        
                                  
   All your messages will show    
   SINGLE TICK only! ✓            
                                  
   Even after you read them!      
   Maximum privacy achieved! 🔒   
                                  
   ⚡ ATHEX & ALTHEA ⚡          
 `
        });
    }
};

 
// ✅ ENABLE DOUBLE TICK
 
const enableDoubleTick = async (sock, chatId) => {
    const result = singleTickMode.disable();

    if (result.success) {
        await sock.sendMessage(chatId, {
            text: `
 
   ✅ DOUBLE TICK MODE ✅        
                                  
   Normal message receipts        
   restored! ✓✓                   
                                  
   ⚡ ATHEX & ALTHEA ⚡          
 `
        });
    }
};

 
// 📊 SHOW STATUS
 
const showStatus = async (sock, chatId, controller) => {
    const status = controller.getStatus();

    const statusMessage = `
 
    📊 STATUS REPORT 📊         
                                  
   🎭 Mode: ${status.modeName.padEnd(20)} 
   🤖 Fake Active: ${status.isFake ? '✅ YES' : '❌ NO'.padEnd(13)} 
   👁️  Last Seen: ${status.lastSeenHidden ? 'HIDDEN' : 'VISIBLE'.padEnd(13)} 
   📡 Presence: ${status.presence.toUpperCase().padEnd(14)} 
   📱 Single Tick: ${singleTickMode.isEnabled() ? '✅ ON' : '❌ OFF'.padEnd(11)} 
                                  
   ⚡ ELYXIUM BOT v1.0 ⚡        
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: statusMessage });
};

 
// 🔄 TOGGLE FAKE ONLINE
 
const toggleFakeOnline = async (sock, chatId, userId, controller) => {
    const result = await controller.toggleFakeStatus(userId);

    if (result.success) {
        const status = controller.getStatus();
        const emoji = status.mode === StatusModes.FAKE_ONLINE ? '🟢' : '🔴';
        
        await sock.sendMessage(chatId, {
            text: `${emoji} *STATUS TOGGLED!*\n\nNow: ${status.modeName}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    }
};

 
// ❓ HELP
 
const showHelp = async (sock, chatId, config) => {
    const helpText = `
 
   🟢 FAKE ONLINE HELP 🟢       
                                  
   📋 COMMANDS:                  
                                  
   ${config.prefix}fakeonline               
   → Activate fake online        
                                  
   ${config.prefix}fakeonline on            
   → Enable fake online          
                                  
   ${config.prefix}fakeonline off           
   → Disable & reset status      
                                  
   ${config.prefix}fakeonline single        
   → Single tick mode only       
                                  
   ${config.prefix}fakeonline double        
   → Normal double tick mode     
                                  
   ${config.prefix}fakeonline status        
   → View current status         
                                  
   ${config.prefix}fakeonline toggle        
   → Switch between modes        
                                  
   💡 TIPS:                      
   • Appear online 24/7          
   • Messages stay single tick   
   • Perfect for ghosting! 👻    
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: helpText });
};

 
// ⚡ ELYXIUM BOT v1.0 - Fake Online Ready!
// ⚡ Powered by ATHEX & ALTHEA
 