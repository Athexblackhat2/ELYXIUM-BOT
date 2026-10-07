 
// 👤 ELYXIUM BOT v1.0 - USERINFO COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const { createBox, athexBadge } = require('../../utils/embedBuilder');

 
// ⚡ COMMAND CONFIG
 
module.exports = {
    name: 'userinfo',
    description: 'Get detailed information about a user',
    category: 'utility',
    usage: 'userinfo [@user/number/self]',
    aliases: ['whois', 'ui', 'user', 'info', 'profile', 'about'],

     
     
     
    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        
        try {
            let targetJid = null;
            let targetName = 'User';

            // Check for mentioned user
            const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            
            if (mentionedJid && mentionedJid.length > 0) {
                targetJid = mentionedJid[0];
                targetName = '@' + targetJid.split('@')[0];
            }
            
            // Check if number provided in args
            else if (args && args.length > 0) {
                const arg = args[0];
                
                if (arg.toLowerCase() === 'me' || arg.toLowerCase() === 'self' || arg.toLowerCase() === 'my') {
                    targetJid = chatId;
                    targetName = 'You';
                }
                else if (!isNaN(arg.replace(/[^0-9]/g, '')) && arg.replace(/[^0-9]/g, '').length >= 7) {
                    const cleanNumber = arg.replace(/[^0-9]/g, '');
                    targetJid = cleanNumber + '@s.whatsapp.net';
                    targetName = '+' + cleanNumber;
                }
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

            // Send loading
            const loadingMsg = await sock.sendMessage(chatId, {
                text: '```🔍 Fetching user information...```'
            });

            // Gather user info
            const userInfo = await gatherUserInfo(sock, targetJid);

            // Build response
            const infoMessage = buildUserInfoMessage(userInfo, targetJid, config);

            // Delete loading and send info
            await sock.sendMessage(chatId, {
                text: infoMessage,
                edit: loadingMsg.key
            });

            // Add reaction
            await sock.sendMessage(chatId, {
                react: {
                    text: '👤',
                    key: msg.key
                }
            });

        } catch (error) {
            console.error('❌ UserInfo Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *FAILED TO GET USER INFO!*\nSomething went wrong.\n\n⚡ ATHEX & ALTHEA ⚡'
            });
        }
    }
};

 
// 🔍 GATHER USER INFO
 
const gatherUserInfo = async (sock, jid) => {
    const info = {
        name: 'Unknown',
        pushName: 'Unknown',
        number: jid.split('@')[0],
        jid: jid,
        isBusiness: false,
        isVerified: false,
        hasProfilePic: false,
        profilePicUrl: null,
        status: 'Not available',
        isOnline: false,
        lastSeen: null,
        isBlocked: false,
        isContact: false,
        deviceInfo: null,
        premium: false,
        about: ''
    };

    try {
        // Get contact info
        const contact = await sock.getContactById(jid);
        
        if (contact) {
            info.name = contact.name || contact.pushName || 'Unknown';
            info.pushName = contact.pushName || 'Unknown';
            info.isBusiness = contact.isBusiness || false;
            info.isVerified = contact.isVerified || false;
            info.isContact = contact.isContact || false;
        }
    } catch (err) {
        // Contact not saved
    }

    // Check profile picture
    try {
        info.profilePicUrl = await sock.profilePictureUrl(jid, 'image');
        info.hasProfilePic = true;
    } catch (err) {
        info.hasProfilePic = false;
    }

    // Get about/status
    try {
        const status = await sock.fetchStatus(jid);
        if (status) {
            info.status = status.status || 'Not available';
        }
    } catch (err) {
        // Status not available
    }

    // Check online presence
    try {
        const presence = await sock.presenceSubscribe(jid);
        if (presence) {
            info.isOnline = presence.lastKnownPresence === 'available' || 
                           presence.lastKnownPresence === 'composing';
        }
    } catch (err) {
        // Presence info not available
    }

    // Get business profile if applicable
    if (info.isBusiness) {
        try {
            const businessProfile = await sock.getBusinessProfile(jid);
            if (businessProfile) {
                info.businessName = businessProfile.description || '';
                info.businessCategory = businessProfile.category || '';
                info.businessAddress = businessProfile.address || '';
                info.businessEmail = businessProfile.email || '';
                info.businessWebsite = businessProfile.website || [];
            }
        } catch (err) {
            // Business info not available
        }
    }

    return info;
};

 
// 🏗️ BUILD USER INFO MESSAGE
 
const buildUserInfoMessage = (userInfo, targetJid, config) => {
    const number = userInfo.number;
    const name = userInfo.name || userInfo.pushName || 'Unknown';
    const isGroup = targetJid.includes('@g.us');
    
    let message = '';

    message += ' \n';
    message += '       👤 USER INFORMATION 👤     \n';
    message += '                                  \n';
    
    // Name
    message += `   📛 Name: ${truncate(name, 20).padEnd(21)} \n`;
    
    // Number
    message += `   📱 Number: +${number.padEnd(18)} \n`;
    
    // JID type
    const jidType = isGroup ? 'Group' : 'User';
    message += `   🆔 Type: ${jidType.padEnd(20)} \n`;
    
    // Profile Picture
    const dpStatus = userInfo.hasProfilePic ? '✅ Yes' : '❌ No';
    message += `   🖼️ DP: ${dpStatus.padEnd(21)} \n`;
    
    // Status/About
    if (userInfo.status && userInfo.status !== 'Not available') {
        message += `   💬 Status: ${truncate(userInfo.status, 17).padEnd(18)} \n`;
    }
    
    // Online status
    const onlineStatus = userInfo.isOnline ? '🟢 Online' : '⚫ Offline';
    message += `   📡 Status: ${onlineStatus.padEnd(18)} \n`;
    
    // Last seen
    if (userInfo.lastSeen) {
        const lastSeenStr = formatLastSeen(userInfo.lastSeen);
        message += `   👁️ Last Seen: ${truncate(lastSeenStr, 15).padEnd(16)} \n`;
    }
    
    // Contact status
    const contactStatus = userInfo.isContact ? '✅ Saved' : '❌ Not Saved';
    message += `   📇 Contact: ${contactStatus.padEnd(17)} \n`;
    
    // Verified
    if (userInfo.isVerified) {
        message += `   ✅ Verified Account             \n`;
    }
    
    // Business
    if (userInfo.isBusiness) {
        message += `   💼 Business Account             \n`;
        if (userInfo.businessCategory) {
            message += `   📂 ${truncate(userInfo.businessCategory, 24).padEnd(27)} \n`;
        }
    }
    
    // Premium
    if (userInfo.premium) {
        message += `   ⭐ Premium User                 \n`;
    }
    
    message += '                                  \n';
    
    // Timestamp
    const now = new Date().toLocaleString();
    message += `   🕐 ${now.padEnd(28)} \n`;
    
    message += '                                  \n';
    message += '   ⚡ ELYXIUM BOT v1.0 ⚡        \n';
    message += ' \n';
    message += '⚡ Powered by ATHEX & ALTHEA ⚡';

    return message;
};

 
// ⏰ FORMAT LAST SEEN
 
const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
};

 
// ✂️ TRUNCATE TEXT
 
const truncate = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

 
// ⚡ ELYXIUM BOT v1.0 - UserInfo Command Ready!
// ⚡ Powered by ATHEX & ALTHEA
 