 
// 📝 ELYXIUM BOT v1.0 - REGISTER COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const { registerOwner, getOwnerData, isOwner, loadUsers } = require('../../middleware/ownerCheck');
const { createBox, athexBadge } = require('../../utils/embedBuilder');

 
// ⚡ COMMAND CONFIG
 
module.exports = {
    name: 'register',
    description: 'Register yourself as owner to use ELYXIUM BOT',
    category: 'system',
    usage: 'register [name]',
    aliases: ['reg', 'signup', 'join', 'activate', 'start', 'setup'],

     
     
     
    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        const userId = msg.key.remoteJid;

        try {
            // Check if already registered
            if (isOwner(userId)) {
                const ownerData = getOwnerData(userId);
                await showAlreadyRegistered(sock, chatId, ownerData, config);
                return;
            }

            // Sub commands
            if (args && args.length > 0) {
                const subCommand = args[0].toLowerCase();

                // Check status
                if (subCommand === 'status' || subCommand === 'info' || subCommand === 'check') {
                    await showRegistrationStatus(sock, chatId, userId, config);
                    return;
                }

                // Unregister
                if (subCommand === 'unregister' || subCommand === 'delete' || subCommand === 'remove') {
                    await handleUnregister(sock, chatId, userId, config);
                    return;
                }

                // Help
                if (subCommand === 'help') {
                    await showHelp(sock, chatId, config);
                    return;
                }

                // Use as name
                const name = args.join(' ');
                await registerNewUser(sock, chatId, userId, name, config);
                return;
            }

            // Get push name as default
            let defaultName = 'User';
            try {
                const contact = await sock.getContactById(userId);
                defaultName = contact?.pushName || contact?.name || 'User';
            } catch (err) {
                // Use default
            }

            // Register with default name
            await registerNewUser(sock, chatId, userId, defaultName, config);

        } catch (error) {
            console.error('❌ Register Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *REGISTRATION FAILED!*\nSomething went wrong. Try again.\n\n⚡ ATHEX & ALTHEA ⚡'
            });
        }
    }
};

 
// 📝 REGISTER NEW USER
 
const registerNewUser = async (sock, chatId, userId, name, config) => {
    // Send welcome animation
    const welcomeMsg = await sock.sendMessage(chatId, {
        text: '```⚡ Initializing ELYXIUM Registration...```'
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    await sock.sendMessage(chatId, {
        text: '```🔐 Creating secure profile...```',
        edit: welcomeMsg.key
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Register the user
    const result = registerOwner(userId, name);

    if (result.success) {
        const userData = result.user;

        const welcomeMessage = `
 
   🎉 REGISTRATION SUCCESSFUL! 🎉 
                                  
   👤 Name: ${truncate(userData.ownerName, 20).padEnd(21)} 
   📱 ID: ${truncate(userId.split('@')[0], 20).padEnd(21)} 
   📅 Since: ${new Date(userData.linkedAt).toLocaleDateString().padEnd(17)} 
                                  
   ⚡ WELCOME TO ELYXIUM! ⚡     
                                  
   🎯 YOUR FEATURES:             
   ✅ Auto Seen + React           
   ✅ Owner Protection            
   ✅ Anti-Call Shield            
   ✅ Status Faker                
   ✅ Media Downloader            
   ✅ 4 Prank Commands            
                                  
   📋 Use *${config.prefix}menu* to start!    
                                  
   ⚡ POWERED BY ⚡             
   ATHEX & ALTHEA               
 `;

        // Delete animation and send welcome
        await sock.sendMessage(chatId, {
            text: welcomeMessage,
            edit: welcomeMsg.key
        });

        // Send menu after 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { sendMenu } = require('../../menu');
        await sendMenu(sock, chatId);

        // Add reaction
        await sock.sendMessage(chatId, {
            react: {
                text: '🎉',
                key: { remoteJid: chatId, id: 'register' }
            }
        });

        console.log(`✅ New user registered: ${name} (${userId})`);

    } else {
        await sock.sendMessage(chatId, {
            text: `❌ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`,
            edit: welcomeMsg.key
        });
    }
};

 
// ✅ ALREADY REGISTERED
 
const showAlreadyRegistered = async (sock, chatId, ownerData, config) => {
    const message = `
 
   ✅ ALREADY REGISTERED! ✅     
                                  
   👤 ${truncate(ownerData.ownerName, 26).padEnd(27)} 
   📱 ${truncate(ownerData.userId.split('@')[0], 26).padEnd(27)} 
   📅 Since: ${new Date(ownerData.linkedAt).toLocaleDateString().padEnd(17)} 
                                  
   📊 Your Stats:                
   ⚡ Commands: ${String(ownerData.stats.commandsUsed).padEnd(18)} 
   💣 Spam Sent: ${String(ownerData.stats.spamSent).padEnd(17)} 
                                  
   🎯 Active Features:           
   ${ownerData.features.antiCall ? '✅' : '❌'} Anti-Call                 
   ${ownerData.features.autoReact ? '✅' : '❌'} Auto React               
   ${ownerData.features.fakeStatus.padEnd(22)} 
                                  
   Use *${config.prefix}menu* for commands!     
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: message });
};

 
// 📊 REGISTRATION STATUS
 
const showRegistrationStatus = async (sock, chatId, userId, config) => {
    if (isOwner(userId)) {
        const ownerData = getOwnerData(userId);
        await showAlreadyRegistered(sock, chatId, ownerData, config);
    } else {
        await sock.sendMessage(chatId, {
            text: `
 
   ❌ NOT REGISTERED! ❌         
                                  
   You haven't registered yet!    
                                  
   Use *${config.prefix}register* to start   
   using ELYXIUM BOT!            
                                  
   Optional: *${config.prefix}register <name>*  
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
        });
    }
};

 
// 🗑️ UNREGISTER
 
const handleUnregister = async (sock, chatId, userId, config) => {
    if (!isOwner(userId)) {
        await sock.sendMessage(chatId, {
            text: '❌ *You are not registered!*\n\nUse *!register* to start.\n\n⚡ ATHEX & ALTHEA ⚡'
        });
        return;
    }

    // Confirmation message
    await sock.sendMessage(chatId, {
        text: `
 
   ⚠️  CONFIRM DELETE? ⚠️      
                                  
   This will remove your         
   ELYXIUM BOT registration!     
                                  
   All settings will be lost!    
                                  
   Type *!register unregister    
   confirm* to proceed.          
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
    });

    // Check for confirmation in next message (handled by messageCreate event)
    // For now, show warning only
};

 
// ❓ HELP
 
const showHelp = async (sock, chatId, config) => {
    const helpText = `
 
   📝 REGISTER HELP 📝          
                                  
   📋 COMMANDS:                  
                                  
   ${config.prefix}register                 
   → Register with your name     
                                  
   ${config.prefix}register <name>          
   → Register with custom name   
   → Example: ${config.prefix}register Ali    
                                  
   ${config.prefix}register status          
   → Check registration status   
                                  
   ${config.prefix}register unregister      
   → Delete your registration    
                                  
   💡 After registering:         
   • Use *${config.prefix}menu* for commands   
   • All features unlocked!      
   • Your settings are saved     
                                  
   ⚡ ATHEX & ALTHEA ⚡         
 `;

    await sock.sendMessage(chatId, { text: helpText });
};

 
// ✂️ TRUNCATE TEXT
 
const truncate = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

 
// ⚡ ELYXIUM BOT v1.0 - Register Command Ready!
// ⚡ Powered by ATHEX & ALTHEA
 