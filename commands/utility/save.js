 
// 💾 ELYXIUM BOT v1.0 - SAVE COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const { downloadProfilePic, saveStatus, downloadMedia, listSavedFiles, clearDownloads, getDownloadStats } = require('../../utils/mediaDownloader');
const { createBox, athexBadge } = require('../../utils/embedBuilder');

 
// ⚡ COMMAND CONFIG
 
module.exports = {
    name: 'save',
    description: 'Save profile pictures, status, and media files',
    category: 'utility',
    usage: 'save [dp/status/media/list/clear/stats]',
    aliases: ['download', 'dl', 'get', 'savedp', 'savestatus', 'grab'],

     
     
     
    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        
        try {
            // No args - show help
            if (!args || args.length === 0) {
                await showSaveHelp(sock, chatId, config);
                return;
            }

            const subCommand = args[0].toLowerCase();

            // Save DP
            if (subCommand === 'dp' || subCommand === 'pp' || subCommand === 'pic' || subCommand === 'profile') {
                await handleSaveDP(sock, msg, chatId, args);
                return;
            }

            // Save Status
            if (subCommand === 'status' || subCommand === 'story') {
                await handleSaveStatus(sock, msg, chatId);
                return;
            }

            // Save Media
            if (subCommand === 'media' || subCommand === 'file' || subCommand === 'msg') {
                await handleSaveMedia(sock, msg, chatId);
                return;
            }

            // List saved files
            if (subCommand === 'list' || subCommand === 'files' || subCommand === 'saved') {
                await handleListFiles(sock, chatId, args);
                return;
            }

            // Clear downloads
            if (subCommand === 'clear' || subCommand === 'delete' || subCommand === 'clean') {
                await handleClearDownloads(sock, chatId, args);
                return;
            }

            // Stats
            if (subCommand === 'stats' || subCommand === 'info') {
                await handleStats(sock, chatId);
                return;
            }

            // Help
            if (subCommand === 'help') {
                await showSaveHelp(sock, chatId, config);
                return;
            }

            // If replying to a message with media
            if (msg.message?.extendedTextMessage?.contextInfo?.stanzaId) {
                const quotedMsg = msg.message.extendedTextMessage.contextInfo;
                await handleSaveQuoted(sock, msg, chatId, quotedMsg);
                return;
            }

            // Unknown subcommand
            await sock.sendMessage(chatId, {
                text: `❌ *Unknown option!*\n\nUse *${config.prefix}save help* for all options.\n\n⚡ ATHEX & ALTHEA ⚡`
            });

        } catch (error) {
            console.error('❌ Save Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *FAILED TO SAVE!*\nSomething went wrong.\n\n⚡ ATHEX & ALTHEA ⚡'
            });
        }
    }
};

 
// 🖼️ SAVE DP
 
const handleSaveDP = async (sock, msg, chatId, args) => {
    let targetJid = null;
    let targetName = 'User';

    // Check for mentioned user
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    
    if (mentionedJid && mentionedJid.length > 0) {
        targetJid = mentionedJid[0];
        targetName = '@' + targetJid.split('@')[0];
    }
    // Self
    else if (args.length > 1 && (args[1].toLowerCase() === 'me' || args[1].toLowerCase() === 'self')) {
        targetJid = chatId;
        targetName = 'You';
    }
    // Phone number
    else if (args.length > 1 && !isNaN(args[1].replace(/[^0-9]/g, ''))) {
        const cleanNumber = args[1].replace(/[^0-9]/g, '');
        targetJid = cleanNumber + '@s.whatsapp.net';
        targetName = '+' + cleanNumber;
    }
    // Default: self
    else {
        targetJid = chatId;
        targetName = 'You';
    }

    // Send loading
    const loadingMsg = await sock.sendMessage(chatId, {
        text: `\`\`\`🖼️ Downloading ${targetName}'s DP...\`\`\``
    });

    // Download DP
    const result = await downloadProfilePic(sock, chatId, targetJid);

    if (!result.success) {
        await sock.sendMessage(chatId, {
            text: `❌ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`,
            edit: loadingMsg.key
        });
    } else {
        // Delete loading message (image already sent by downloadProfilePic)
        await sock.sendMessage(chatId, {
            delete: loadingMsg.key
        });
    }
};

 
// 📸 SAVE STATUS
 
const handleSaveStatus = async (sock, msg, chatId) => {
    // Check if replying to a status message
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
    
    if (quotedMsg && quotedMsg.stanzaId) {
        // Try to get the quoted message
        try {
            const quoted = await sock.loadMessageFromWA({
                remoteJid: chatId,
                id: quotedMsg.stanzaId
            });
            
            if (quoted) {
                const result = await saveStatus(sock, chatId, quoted);
                if (!result.success) {
                    await sock.sendMessage(chatId, {
                        text: `❌ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
                    });
                }
                return;
            }
        } catch (err) {
            // Message not found
        }
    }

    await sock.sendMessage(chatId, {
        text: `
 
    📸 STATUS SAVER 📸          
                                  
   Reply to a status/story       
   with *${config.prefix}save status*       
   to save it!                   
                                  
   Or use:                       
   *${config.prefix}save dp* for profile pic  
   *${config.prefix}save media* for files    
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
    });
};

 
// 📥 SAVE MEDIA
 
const handleSaveMedia = async (sock, msg, chatId) => {
    // Check if replying to a media message
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
    
    if (quotedMsg && quotedMsg.stanzaId) {
        try {
            const quoted = await sock.loadMessageFromWA({
                remoteJid: chatId,
                id: quotedMsg.stanzaId
            });
            
            if (quoted) {
                const loadingMsg = await sock.sendMessage(chatId, {
                    text: '```📥 Downloading media...```'
                });
                
                const result = await downloadMedia(sock, chatId, quoted);
                
                if (!result.success) {
                    await sock.sendMessage(chatId, {
                        text: `❌ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`,
                        edit: loadingMsg.key
                    });
                } else {
                    await sock.sendMessage(chatId, {
                        delete: loadingMsg.key
                    });
                }
                return;
            }
        } catch (err) {
            // Message not found
        }
    }

    await sock.sendMessage(chatId, {
        text: `❌ *No media found!*\n\nReply to a media message with *!save media* to download it.\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

 
// 💬 SAVE QUOTED MESSAGE
 
const handleSaveQuoted = async (sock, msg, chatId, contextInfo) => {
    try {
        const quoted = await sock.loadMessageFromWA({
            remoteJid: chatId,
            id: contextInfo.stanzaId
        });
        
        if (quoted) {
            const loadingMsg = await sock.sendMessage(chatId, {
                text: '```📥 Downloading...```'
            });
            
            const messageType = Object.keys(quoted.message || {})[0];
            
            if (messageType === 'imageMessage') {
                const result = await downloadMedia(sock, chatId, quoted);
                if (result.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
                    });
                }
            } else if (messageType === 'videoMessage') {
                const result = await downloadMedia(sock, chatId, quoted);
                if (result.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
                    });
                }
            } else {
                const result = await saveStatus(sock, chatId, quoted);
                if (result.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
                    });
                }
            }
            
            await sock.sendMessage(chatId, {
                delete: loadingMsg.key
            });
        }
    } catch (err) {
        await sock.sendMessage(chatId, {
            text: '❌ *Failed to load quoted message!*\nMessage might be too old.\n\n⚡ ATHEX & ALTHEA ⚡'
        });
    }
};

 
// 📋 LIST SAVED FILES
 
const handleListFiles = async (sock, chatId, args) => {
    let type = 'all';
    
    if (args.length > 1) {
        const arg = args[1].toLowerCase();
        if (arg === 'dp' || arg === 'profile') type = 'dp';
        else if (arg === 'status' || arg === 'story') type = 'status';
        else if (arg === 'media' || arg === 'files') type = 'media';
    }

    const files = listSavedFiles(type);
    
    let totalFiles = 0;
    totalFiles += files.profilePics.length;
    totalFiles += files.statusSaves.length;
    totalFiles += files.media.length;

    if (totalFiles === 0) {
        await sock.sendMessage(chatId, {
            text: '📂 *No saved files found!*\n\nSave some files first with *!save dp* or *!save status*.\n\n⚡ ATHEX & ALTHEA ⚡'
        });
        return;
    }

    let fileList = ' \n';
    fileList += '    📂 SAVED FILES 📂          \n';
    fileList += '                                  \n';

    if (files.profilePics.length > 0) {
        fileList += '   🖼️ Profile Pictures:           \n';
        files.profilePics.forEach((file, i) => {
            fileList += `   ${String(i + 1).padEnd(2)}. ${truncate(file.name, 22).padEnd(23)} \n`;
        });
        fileList += '                                  \n';
    }

    if (files.statusSaves.length > 0) {
        fileList += '   📸 Status Saves:               \n';
        files.statusSaves.forEach((file, i) => {
            fileList += `   ${String(i + 1).padEnd(2)}. ${truncate(file.name, 22).padEnd(23)} \n`;
        });
        fileList += '                                  \n';
    }

    if (files.media.length > 0) {
        fileList += '   📥 Media Files:                \n';
        files.media.forEach((file, i) => {
            fileList += `   ${String(i + 1).padEnd(2)}. ${truncate(file.name, 22).padEnd(23)} \n`;
        });
        fileList += '                                  \n';
    }

    fileList += `   📊 Total Files: ${String(totalFiles).padEnd(13)} \n`;
    fileList += '                                  \n';
    fileList += ' \n';
    fileList += '⚡ Powered by ATHEX & ALTHEA ⚡';

    await sock.sendMessage(chatId, { text: fileList });
};

 
// 🗑️ CLEAR DOWNLOADS
 
const handleClearDownloads = async (sock, chatId, args) => {
    let type = 'all';
    
    if (args.length > 1) {
        const arg = args[1].toLowerCase();
        if (arg === 'dp' || arg === 'profile') type = 'dp';
        else if (arg === 'status' || arg === 'story') type = 'status';
        else if (arg === 'media' || arg === 'files') type = 'media';
    }

    // Confirmation for all
    if (type === 'all') {
        await sock.sendMessage(chatId, {
            text: `⚠️ *Are you sure?*\n\nThis will delete ALL saved files!\n\nType *!save clear confirm* to proceed.\n\n⚡ ATHEX & ALTHEA ⚡`
        });
        
        if (args.length > 2 && args[2] === 'confirm') {
            const result = clearDownloads('all');
            await sock.sendMessage(chatId, {
                text: `✅ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
            });
        }
        return;
    }

    const result = clearDownloads(type);
    await sock.sendMessage(chatId, {
        text: `✅ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

 
// 📊 STATS
 
const handleStats = async (sock, chatId) => {
    const stats = getDownloadStats();

    const statsMessage = `
 
    📊 DOWNLOAD STATS 📊        
                                  
   📥 Total Downloads: ${String(stats.totalDownloads).padEnd(10)} 
   🖼️  Profile Pics: ${String(stats.profilePics).padEnd(11)} 
   📸 Status Saves: ${String(stats.statusSaves).padEnd(11)} 
   📁 Media Files: ${String(stats.mediaDownloads).padEnd(12)} 
   💾 Total Size: ${stats.totalSizeDisplay.padEnd(14)} 
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: statsMessage });
};

 
// ❓ HELP
 
const showSaveHelp = async (sock, chatId, config) => {
    const helpText = `
 
    💾 SAVE COMMAND HELP 💾      
                                  
   📋 COMMANDS:                  
                                  
   ${config.prefix}save dp [@user/me]        
   → Save profile picture        
                                  
   ${config.prefix}save status              
   → Save replied status/story   
                                  
   ${config.prefix}save media               
   → Save replied media file     
                                  
   ${config.prefix}save list [type]         
   → List saved files            
   → Types: dp, status, media    
                                  
   ${config.prefix}save clear [type]        
   → Delete saved files          
                                  
   ${config.prefix}save stats               
   → View download statistics    
                                  
   📁 Files saved in:            
   /downloads/profile_pics/      
   /downloads/status_saves/      
   /downloads/media/             
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: helpText });
};

 
// ✂️ TRUNCATE TEXT
 
const truncate = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

 
// ⚡ ELYXIUM BOT v1.0 - Save Command Ready!
// ⚡ Powered by ATHEX & ALTHEA
 