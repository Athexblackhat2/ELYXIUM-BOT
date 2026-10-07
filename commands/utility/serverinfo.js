 
// 📊 ELYXIUM BOT v1.0 - SERVERINFO COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const { createBox, athexBadge } = require('../../utils/embedBuilder');

 
// ⚡ COMMAND CONFIG
 
module.exports = {
    name: 'serverinfo',
    description: 'Get detailed information about current group/server',
    category: 'utility',
    usage: 'serverinfo',
    aliases: ['groupinfo', 'si', 'server', 'group', 'gc', 'chat'],

     
     
     
    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        
        try {
            // Check if it's a group
            if (!chatId.includes('@g.us')) {
                await sock.sendMessage(chatId, {
                    text: `
 
    📊 SERVER INFO 📊           
                                  
   ⚠️ This command only works   
   in group chats!               
                                  
   Please use *${config.prefix}userinfo*     
   for personal info.            
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
                });
                return;
            }

            // Send loading
            const loadingMsg = await sock.sendMessage(chatId, {
                text: '```📊 Fetching server information...```'
            });

            // Gather group info
            const groupInfo = await gatherGroupInfo(sock, chatId);

            // Build response
            const infoMessage = buildGroupInfoMessage(groupInfo, config);

            // Send info
            await sock.sendMessage(chatId, {
                text: infoMessage,
                edit: loadingMsg.key
            });

            // Add reaction
            await sock.sendMessage(chatId, {
                react: {
                    text: '📊',
                    key: msg.key
                }
            });

        } catch (error) {
            console.error('❌ ServerInfo Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *FAILED TO GET SERVER INFO!*\nSomething went wrong.\n\n⚡ ATHEX & ALTHEA ⚡'
            });
        }
    }
};

 
// 🔍 GATHER GROUP INFO
 
const gatherGroupInfo = async (sock, groupId) => {
    const info = {
        id: groupId,
        name: 'Unknown Group',
        description: '',
        owner: 'Unknown',
        ownerJid: null,
        createdAt: null,
        createdBy: null,
        memberCount: 0,
        adminCount: 0,
        botAdmin: false,
        isAnnouncement: false,
        isEphemeral: false,
        ephemeralDuration: 0,
        restrict: false,
        antilink: false,
        profilePic: null,
        hasProfilePic: false,
        subject: '',
        subjectOwner: '',
        subjectTime: null,
        members: [],
        admins: [],
        features: []
    };

    try {
        // Get group metadata
        const metadata = await sock.groupMetadata(groupId);
        
        if (metadata) {
            info.id = metadata.id;
            info.name = metadata.subject || 'Unknown Group';
            info.description = metadata.desc || '';
            info.ownerJid = metadata.owner || null;
            info.createdAt = metadata.creation || null;
            info.memberCount = metadata.participants?.length || 0;
            info.restrict = metadata.restrict || false;
            info.isAnnouncement = metadata.announce || false;
            info.isEphemeral = metadata.ephemeralDuration > 0;
            info.ephemeralDuration = metadata.ephemeralDuration || 0;
            info.members = metadata.participants || [];
            
            // Get admins
            info.admins = metadata.participants?.filter(p => p.admin) || [];
            info.adminCount = info.admins.length;
            
            // Get owner name
            if (info.ownerJid) {
                const ownerMember = metadata.participants?.find(p => p.id === info.ownerJid);
                if (ownerMember) {
                    info.owner = ownerMember.name || ownerMember.pushName || info.ownerJid.split('@')[0];
                } else {
                    try {
                        const ownerContact = await sock.getContactById(info.ownerJid);
                        info.owner = ownerContact?.name || ownerContact?.pushName || info.ownerJid.split('@')[0];
                    } catch (err) {
                        info.owner = info.ownerJid.split('@')[0];
                    }
                }
            }
            
            // Check if bot is admin
            const botId = sock.user?.id;
            if (botId) {
                info.botAdmin = info.admins.some(a => a.id === botId);
            }
            
            // Get creator
            if (metadata.subjectOwner) {
                info.subjectOwner = metadata.subjectOwner;
            }
            if (metadata.subjectTime) {
                info.subjectTime = metadata.subjectTime;
            }
            
            // Features
            if (metadata.features) {
                info.features = metadata.features;
            }
        }

        // Get group profile picture
        try {
            info.profilePic = await sock.profilePictureUrl(groupId, 'image');
            info.hasProfilePic = true;
        } catch (err) {
            info.hasProfilePic = false;
        }

        // Get group invite code (if admin)
        if (info.botAdmin) {
            try {
                const inviteCode = await sock.groupInviteCode(groupId);
                info.inviteCode = inviteCode;
            } catch (err) {
                // Bot doesn't have permission
            }
        }

    } catch (err) {
        console.error('❌ Group Metadata Error:', err);
    }

    return info;
};

 
// 🏗️ BUILD GROUP INFO MESSAGE
 
const buildGroupInfoMessage = (groupInfo, config) => {
    let message = '';

    message += ' \n';
    message += '     📊 SERVER INFORMATION 📊    \n';
    message += '                                  \n';
    
    // Group Name
    message += `   📛 Name: ${truncate(groupInfo.name, 20).padEnd(21)} \n`;
    
    // Group ID (short)
    const shortId = groupInfo.id.split('@')[0].substring(0, 15);
    message += `   🆔 ID: ${shortId.padEnd(22)} \n`;
    
    // Owner
    message += `   👑 Owner: ${truncate(groupInfo.owner, 19).padEnd(20)} \n`;
    
    // Members
    message += `   👥 Members: ${String(groupInfo.memberCount).padEnd(17)} \n`;
    
    // Admins
    message += `   🛡️  Admins: ${String(groupInfo.adminCount).padEnd(17)} \n`;
    
    // Bot Admin Status
    const botAdminStatus = groupInfo.botAdmin ? '✅ Yes' : '❌ No';
    message += `   🤖 Bot Admin: ${botAdminStatus.padEnd(16)} \n`;
    
    // Profile Picture
    const dpStatus = groupInfo.hasProfilePic ? '✅ Yes' : '❌ No';
    message += `   🖼️ Group DP: ${dpStatus.padEnd(16)} \n`;
    
    // Description
    if (groupInfo.description) {
        message += `   📝 Desc: ${truncate(groupInfo.description, 18).padEnd(19)} \n`;
    }
    
    // Created At
    if (groupInfo.createdAt) {
        const createdDate = new Date(groupInfo.createdAt * 1000).toLocaleDateString();
        message += `   📅 Created: ${createdDate.padEnd(17)} \n`;
    }
    
    // Announcement mode
    const announceStatus = groupInfo.isAnnouncement ? '🔒 ON' : '🔓 OFF';
    message += `   📢 Announce: ${announceStatus.padEnd(16)} \n`;
    
    // Restrict mode
    const restrictStatus = groupInfo.restrict ? '🔒 ON' : '🔓 OFF';
    message += `   🔐 Restrict: ${restrictStatus.padEnd(16)} \n`;
    
    // Ephemeral
    if (groupInfo.isEphemeral && groupInfo.ephemeralDuration > 0) {
        const duration = formatDuration(groupInfo.ephemeralDuration);
        message += `   ⏰ Disappear: ${duration.padEnd(15)} \n`;
    }
    
    // Invite code
    if (groupInfo.inviteCode) {
        message += `   🔗 Invite: ${truncate(groupInfo.inviteCode, 18).padEnd(19)} \n`;
    }
    
    // Features
    if (groupInfo.features && groupInfo.features.length > 0) {
        message += '                                  \n';
        message += '   ✨ Features:                   \n';
        groupInfo.features.slice(0, 3).forEach(feature => {
            message += `   • ${truncate(feature, 24).padEnd(27)} \n`;
        });
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

 
// ⏱️ FORMAT DURATION (seconds)
 
const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return `${Math.floor(seconds / 604800)}w`;
};

 
// ✂️ TRUNCATE TEXT
 
const truncate = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

 
// ⚡ ELYXIUM BOT v1.0 - ServerInfo Command Ready!
// ⚡ Powered by ATHEX & ALTHEA
 