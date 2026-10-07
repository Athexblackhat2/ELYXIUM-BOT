 
// 🔴 ELYXIUM BOT v1.0 - FAKE OFFLINE COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const { StatusController, singleTickMode, StatusModes } = require('../../utils/statusManager');
const { createBox, athexBadge } = require('../../utils/embedBuilder');

 
// 🔴 GLOBAL STATUS CONTROLLER
 
let statusController = null;

const getController = (sock) => {
    if (!statusController) {
        statusController = new StatusController(sock);
    }
    return statusController;
};

 
// ⚡ COMMAND CONFIG
 
module.exports = {
    name: 'fakeoffline',
    description: 'Appear offline while actually being online - invisible mode',
    category: 'status',
    usage: 'fakeoffline [on/off/invisible/hidden]',
    aliases: ['offline', 'invisible', 'hide', 'ghost', 'foffline', 'fo'],

     
     
     
    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        const userId = msg.key.remoteJid;
        const controller = getController(sock);

        try {
            // No args - activate fake offline
            if (!args || args.length === 0) {
                await activateFakeOffline(sock, chatId, userId, controller);
                return;
            }

            const subCommand = args[0].toLowerCase();

            // ON
            if (subCommand === 'on' || subCommand === 'enable' || subCommand === 'start' || subCommand === 'true') {
                await activateFakeOffline(sock, chatId, userId, controller);
                return;
            }

            // OFF
            if (subCommand === 'off' || subCommand === 'disable' || subCommand === 'stop' || subCommand === 'false') {
                await deactivateFakeOffline(sock, chatId, userId, controller);
                return;
            }

            // Invisible mode
            if (subCommand === 'invisible' || subCommand === 'inv' || subCommand === 'ghost') {
                await activateInvisibleMode(sock, chatId, userId, controller);
                return;
            }

            // Busy mode
            if (subCommand === 'busy' || subCommand === 'dnd') {
                await activateBusyMode(sock, chatId, userId, controller);
                return;
            }

            // Hide last seen
            if (subCommand === 'hidelastseen' || subCommand === 'hls' || subCommand === 'noseen') {
                await hideLastSeen(sock, chatId, controller);
                return;
            }

            // Show last seen
            if (subCommand === 'showlastseen' || subCommand === 'sls' || subCommand === 'seen') {
                await showLastSeen(sock, chatId, controller);
                return;
            }

            // Status
            if (subCommand === 'status' || subCommand === 'info') {
                await showStatus(sock, chatId, controller);
                return;
            }

            // Toggle
            if (subCommand === 'toggle' || subCommand === 'switch') {
                await toggleFakeOffline(sock, chatId, userId, controller);
                return;
            }

            // Help
            if (subCommand === 'help') {
                await showHelp(sock, chatId, config);
                return;
            }

            // Unknown
            await sock.sendMessage(chatId, {
                text: `❌ *Unknown option!*\n\nUse *${config.prefix}fakeoffline help* for all options.\n\n⚡ ATHEX & ALTHEA ⚡`
            });

        } catch (error) {
            console.error('❌ FakeOffline Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *FAILED TO SET STATUS!*\nSomething went wrong.\n\n⚡ ATHEX & ALTHEA ⚡'
            });
        }
    }
};

 
// 🔴 ACTIVATE FAKE OFFLINE
 
const activateFakeOffline = async (sock, chatId, userId, controller) => {
    const result = await controller.setFakeOffline(userId);

    if (result.success) {
        await sock.sendMessage(chatId, {
            text: `
 
   🔴 FAKE OFFLINE ACTIVE! 🔴   
                                  
   📱 Status: OFFLINE             
   🎭 Reality: YOU'RE ONLINE!    
                                  
   ✨ FEATURES:                   
   ✅ Appear Offline Always       
   ✅ Single Tick Messages        
   ✅ Seen Receipts Hidden        
   ✅ You Can Still Chat!         
                                  
   💡 TIP:                        
   People think you're offline    
   but you can read & reply!      
   Ultimate ghost mode! 👻       
                                  
   ⚡ ELYXIUM BOT v1.0 ⚡        
 
⚡ Powered by ATHEX & ALTHEA ⚡`
        });

        // Add reaction
        await sock.sendMessage(chatId, {
            react: {
                text: '🔴',
                key: { remoteJid: chatId, id: 'fakeoffline' }
            }
        });

        console.log(`🔴 Fake Offline activated for: ${userId}`);
    } else {
        await sock.sendMessage(chatId, {
            text: `❌ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    }
};

 
// 🟢 DEACTIVATE FAKE OFFLINE
 
const deactivateFakeOffline = async (sock, chatId, userId, controller) => {
    const result = await controller.setRealOnline(userId);

    if (result.success) {
        await sock.sendMessage(chatId, {
            text: `
 
    🟢 STATUS RESTORED! 🟢      
                                  
   📱 Status: ONLINE (Normal)     
   🎭 Reality: VISIBLE            
                                  
   All status features disabled.  
   You're visible again! 👋       
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
        });

        console.log(`🟢 Status restored for: ${userId}`);
    } else {
        await sock.sendMessage(chatId, {
            text: `❌ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    }
};

 
// 👻 ACTIVATE INVISIBLE MODE
 
const activateInvisibleMode = async (sock, chatId, userId, controller) => {
    const result = await controller.setInvisible(userId);

    if (result.success) {
        await sock.sendMessage(chatId, {
            text: `
 
    👻 INVISIBLE MODE! 👻       
                                  
   📱 Status: COMPLETELY HIDDEN   
   🎭 Reality: YOU'RE A GHOST!   
                                  
   ✨ FEATURES:                   
   ✅ No One Can See You          
   ✅ No Online Status            
   ✅ No Last Seen                
   ✅ No Read Receipts            
   ✅ Complete Privacy! 🔒        
                                  
   💡 You're a WhatsApp ghost!    
   Nobody knows you're there!     
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
        });
    }
};

 
// ⏰ ACTIVATE BUSY MODE
 
const activateBusyMode = async (sock, chatId, userId, controller) => {
    const result = await controller.setBusy(userId);

    if (result.success) {
        await sock.sendMessage(chatId, {
            text: `
 
    ⏰ BUSY MODE ACTIVE! ⏰      
                                  
   📱 Status: BUSY                
   🎭 Reality: ACTIVE             
                                  
   ✨ FEATURES:                   
   ✅ Appear Busy/DND             
   ✅ Calls Auto-Declined         
   ✅ Messages Still Come         
                                  
   💡 Perfect for "I'm busy"      
   without actually being busy!   
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
        });
    }
};

 
// 👁️ HIDE LAST SEEN
 
const hideLastSeen = async (sock, chatId, controller) => {
    const result = await controller.hideLastSeen();

    if (result.success) {
        await sock.sendMessage(chatId, {
            text: `
 
   👁️  LAST SEEN HIDDEN! 👁️   
                                  
   Nobody can see when you        
   were last online!              
                                  
   🔒 Maximum Privacy!            
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
        });
    }
};

 
// 👁️ SHOW LAST SEEN
 
const showLastSeen = async (sock, chatId, controller) => {
    const result = await controller.showLastSeen();

    if (result.success) {
        await sock.sendMessage(chatId, {
            text: `
 
   👁️  LAST SEEN VISIBLE! 👁️  
                                  
   People can now see your        
   last seen timestamp!           
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
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
   👁️  Last Seen: ${status.lastSeenHidden ? 'HIDDEN 🔒' : 'VISIBLE 👁️'.padEnd(9)} 
   📡 Presence: ${status.presence.toUpperCase().padEnd(14)} 
   📱 Single Tick: ${singleTickMode.isEnabled() ? '✅ ON' : '❌ OFF'.padEnd(11)} 
                                  
   🎯 Available Modes:           
   • Fake Online  • Fake Offline 
   • Invisible    • Busy/DND      
                                  
   ⚡ ELYXIUM BOT v1.0 ⚡        
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: statusMessage });
};

 
// 🔄 TOGGLE FAKE OFFLINE
 
const toggleFakeOffline = async (sock, chatId, userId, controller) => {
    const result = await controller.toggleFakeStatus(userId);

    if (result.success) {
        const status = controller.getStatus();
        const modeEmojis = {
            'fakeonline': '🟢',
            'fakeoffline': '🔴',
            'invisible': '👻',
            'busy': '⏰',
            'online': '🟢',
            'offline': '🔴'
        };
        const emoji = modeEmojis[status.mode] || '🔄';
        
        await sock.sendMessage(chatId, {
            text: `${emoji} *STATUS TOGGLED!*\n\nNow: ${status.modeName}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    }
};

 
// ❓ HELP
 
const showHelp = async (sock, chatId, config) => {
    const helpText = `
 
   🔴 FAKE OFFLINE HELP 🔴      
                                  
   📋 COMMANDS:                  
                                  
   ${config.prefix}fakeoffline              
   → Activate fake offline       
                                  
   ${config.prefix}fakeoffline on           
   → Enable fake offline         
                                  
   ${config.prefix}fakeoffline off          
   → Disable & reset status      
                                  
   ${config.prefix}fakeoffline invisible    
   → Complete ghost mode 👻      
                                  
   ${config.prefix}fakeoffline busy         
   → Busy/DND mode ⏰            
                                  
   ${config.prefix}fakeoffline hidelastseen 
   → Hide last seen timestamp    
                                  
   ${config.prefix}fakeoffline showlastseen 
   → Show last seen timestamp    
                                  
   ${config.prefix}fakeoffline status       
   → View current status         
                                  
   ${config.prefix}fakeoffline toggle       
   → Switch between modes        
                                  
   🎯 MODES:                     
   🔴 Fake Offline               
   👻 Invisible (Ghost)          
   ⏰ Busy/DND                   
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: helpText });
};

 
// ⚡ ELYXIUM BOT v1.0 - Fake Offline Ready!
// ⚡ Powered by ATHEX & ALTHEA
 