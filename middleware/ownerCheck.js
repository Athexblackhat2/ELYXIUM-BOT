 
// 🔒 ELYXIUM BOT v1.0 - OWNER CHECK
// ⚡ Powered by ATHEX & ALTHEA
 

const fs = require('fs');
const path = require('path');
const config = require('../config.json');

 
// 📁 LOAD USERS
 
const usersFile = path.join(__dirname, '..', 'data', 'users.json');

const loadUsers = () => {
    try {
        const data = fs.readFileSync(usersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

 
// 💾 SAVE USERS
 
const saveUsers = (users) => {
    try {
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('❌ Error saving users:', error);
    }
};

 
// ✅ IS OWNER CHECK
 
const isOwner = (senderId) => {
    const users = loadUsers();
    return users.some(user => user.userId === senderId);
};

 
// 👤 GET OWNER DATA
 
const getOwnerData = (senderId) => {
    const users = loadUsers();
    return users.find(user => user.userId === senderId) || null;
};

 
// 📝 REGISTER NEW OWNER
 
const registerOwner = (senderId, ownerName = 'Unknown') => {
    const users = loadUsers();
    
    // Check if already registered
    if (users.some(user => user.userId === senderId)) {
        return { success: false, message: 'Already registered!' };
    }
    
    // Create new user
    const newUser = {
        userId: senderId,
        ownerName: ownerName,
        linkedAt: new Date().toISOString(),
        features: {
            antiCall: config.features.antiCall.enabled,
            autoReact: config.features.autoReact,
            reactEmoji: config.defaults.autoReactEmoji,
            fakeStatus: config.defaults.fakeStatus
        },
        stats: {
            commandsUsed: 0,
            spamSent: 0
        }
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: '✅ Registered successfully!', user: newUser };
};

 
// 🔄 UPDATE OWNER SETTINGS
 
const updateOwnerSetting = (senderId, setting, value) => {
    const users = loadUsers();
    const userIndex = users.findIndex(user => user.userId === senderId);
    
    if (userIndex === -1) {
        return { success: false, message: 'User not found!' };
    }
    
    // Update setting
    if (setting === 'antiCall') {
        users[userIndex].features.antiCall = value;
    } else if (setting === 'autoReact') {
        users[userIndex].features.autoReact = value;
    } else if (setting === 'reactEmoji') {
        users[userIndex].features.reactEmoji = value;
    } else if (setting === 'fakeStatus') {
        users[userIndex].features.fakeStatus = value;
    }
    
    saveUsers(users);
    return { success: true, message: '✅ Setting updated!', user: users[userIndex] };
};

 
// 📊 INCREMENT STATS
 
const incrementStats = (senderId, stat) => {
    const users = loadUsers();
    const userIndex = users.findIndex(user => user.userId === senderId);
    
    if (userIndex !== -1 && users[userIndex].stats[stat] !== undefined) {
        users[userIndex].stats[stat] += 1;
        saveUsers(users);
    }
};

 
// 🚫 ACCESS DENIED MESSAGE
 
const accessDeniedMessage = `
 
    ⚠️  ACCESS DENIED  ⚠️       
                                  
   DON'T TRY...                  
   IT'S NOT NORMAL!              
                                  
   THIS IS THE POWER OF          
   ⚡ ATHEX & ALTHEA ⚡         
                                  
 
`;

 
// 🔒 MIDDLEWARE - Owner Only Protection
 
const ownerOnly = async (sock, msg, next) => {
    const senderId = msg.key.remoteJid;
    const isFromMe = msg.key.fromMe;
    
    // Check if message is from registered owner
    const ownerData = getOwnerData(senderId);
    
    if (!ownerData && !isFromMe) {
        // Not registered - Send warning
        await sock.sendMessage(senderId, {
            text: config.features.ownerProtection.warningMessage || accessDeniedMessage
        });
        return false;
    }
    
    // Increment command usage stat
    if (ownerData) {
        incrementStats(senderId, 'commandsUsed');
    }
    
    // Pass to next handler
    if (next) {
        return await next(sock, msg);
    }
    
    return true;
};

 
// 🔍 QUICK CHECK - No warning sent
 
const quickCheck = (senderId) => {
    return isOwner(senderId);
};

 
// 📤 EXPORTS
 
module.exports = {
    isOwner,
    getOwnerData,
    registerOwner,
    updateOwnerSetting,
    incrementStats,
    ownerOnly,
    quickCheck,
    accessDeniedMessage,
    loadUsers
};

 
// ⚡ ELYXIUM BOT v1.0 - Owner Check Ready!
// ⚡ Powered by ATHEX & ALTHEA
 