 
// 🖼️ ELYXIUM BOT v1.0 - AVATAR COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const { createBox, athexBadge } = require('../../utils/embedBuilder');
const { downloadProfilePic } = require('../../utils/mediaDownloader');

 
// ⚡ COMMAND CONFIG
 
module.exports = {
    name: 'avatar',
    description: 'Get user profile picture in high quality',
    category: 'utility',
    usage: 'avatar [@user/number/self]',
    aliases: ['dp', 'pic', 'photo', 'profile', 'pp', 'picture', 'displaypic'],

     
     
     
    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        
        try {
            let targetJid = null;
            let targetName = '';

            // Check for mentioned user
            const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            
            if (mentionedJid && mentionedJid.length > 0) {
                // Get first mentioned user
                targetJid = mentionedJid[0];
                targetName = '@' + targetJid.split('@')[0];
            }
            
            // Check if number provided in args
            else if (args && args.length > 0) {
                const arg = args[0];
                
                // Self avatar
                if (arg.toLowerCase() === 'me' || arg.toLowerCase() === 'self' || arg.toLowerCase() === 'my') {
                    targetJid = chatId;
                    targetName = 'You';
                }
                // Phone number
                else if (!isNaN(arg.replace(/[^0-9]/g, '')) && arg.replace(/[^0-9]/g, '').length >= 7) {
                    const cleanNumber = arg.replace(/[^0-9]/g, '');
                    targetJid = cleanNumber + '@s.whatsapp.net';
                    targetName = '+' + cleanNumber;
                }
                // Group participant
                else if (arg.startsWith('@')) {
                    targetJid = arg.replace('@', '') + '@s.whatsapp.net';
                    targetName = arg;
                }
            }
            
            // Default: message sender
            else {
                targetJid = chatId;
                targetName = 'You';
            }

            // Send loading message
            const loadingMsg = await sock.sendMessage(chatId, {
                text: `\`\`\`🖼️ Fetching ${targetName}'s avatar...\`\`\``
            });

            // Try to get profile picture
            let profilePicUrl = null;
            
            try {
                profilePicUrl = await sock.profilePictureUrl(targetJid, 'image');
            } catch (err) {
                // No profile picture
                await sock.sendMessage(chatId, {
                    text: `
 
    🖼️ AVATAR NOT FOUND 🖼️     
                                  
   ${targetName} doesn't have      
   a profile picture!             
                                  
   😢 No DP to show!             
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`,
                    edit: loadingMsg.key
                });
                return;
            }

            if (!profilePicUrl) {
                await sock.sendMessage(chatId, {
                    text: '❌ *Failed to fetch avatar!*\nUser might have privacy settings enabled.\n\n⚡ ATHEX & ALTHEA ⚡',
                    edit: loadingMsg.key
                });
                return;
            }

            // Delete loading message
            await sock.sendMessage(chatId, {
                delete: loadingMsg.key
            });

            // Get user info for name
            let displayName = targetName;
            try {
                if (targetJid !== chatId) {
                    const contact = await sock.getContactById(targetJid);
                    if (contact) {
                        displayName = contact.name || contact.pushName || targetName;
                    }
                }
            } catch (err) {
                // Use fallback name
            }

            // Build caption
            const caption = `
 
    🖼️ PROFILE PICTURE 🖼️      
                                  
   👤 ${displayName.padEnd(28)} 
   📱 ${targetJid.split('@')[0].padEnd(28)} 
                                  
   ⚡ ELYXIUM BOT v1.0 ⚡        
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

            // Send avatar image
            await sock.sendMessage(chatId, {
                image: { url: profilePicUrl },
                caption: caption,
                mimetype: 'image/jpeg'
            });

            // Add reaction
            await sock.sendMessage(chatId, {
                react: {
                    text: '🖼️',
                    key: msg.key
                }
            });

            // Also save to downloads (optional)
            try {
                await downloadProfilePic(sock, chatId, targetJid);
            } catch (saveErr) {
                // Saving failed, but image was shown
            }

        } catch (error) {
            console.error('❌ Avatar Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *FAILED TO GET AVATAR!*\nUser might have restricted access.\n\n⚡ ATHEX & ALTHEA ⚡'
            });
        }
    }
};

 
// ⚡ ELYXIUM BOT v1.0 - Avatar Command Ready!
// ⚡ Powered by ATHEX & ALTHEA
 