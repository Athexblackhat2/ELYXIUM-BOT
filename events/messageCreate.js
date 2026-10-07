 
// 📨 ELYXIUM BOT v1.0 - MESSAGE HANDLER
// ⚡ Powered by ATHEX & ALTHEA
 

const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const { isOwner, registerOwner, getOwnerData, incrementStats, quickCheck } = require('../middleware/ownerCheck');
const { sendMenu, sendHelp } = require('../menu');
const { ReactController } = require('../utils/autoReact');

let reactController = null;

const getReactController = (sock) => {
    if (!reactController) {
        reactController = new ReactController(sock);
    }
    return reactController;
};

const commands = new Map();

const loadCommands = () => {
    const commandsPath = path.join(__dirname, '..', 'commands');
    
    if (!fs.existsSync(commandsPath)) {
        console.log('❌ Commands folder not found!');
        return;
    }
    
    const categories = fs.readdirSync(commandsPath);
    
    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        
        if (!fs.statSync(categoryPath).isDirectory()) continue;
        
        const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            try {
                const command = require(path.join(categoryPath, file));
                commands.set(command.name, command);
                console.log(`📂 Command Loaded: !${command.name} (${category})`);
            } catch (err) {
                console.log(`❌ Failed to load ${file}: ${err.message}`);
            }
        }
    }
    
    console.log(`✅ Total Commands Loaded: ${commands.size}`);
};

 
// 🔍 PARSE COMMAND
 
const parseCommand = (messageText) => {
    if (!messageText || !messageText.startsWith(config.bot.prefix)) return null;
    
    const args = messageText.slice(config.bot.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    return { commandName, args };
};

 
// 👁️ AUTO SEEN
 
const autoSeen = async (sock, msg) => {
    try {
        if (config.features.autoSeen) {
            await sock.readMessages([msg.key]);
        }
    } catch (error) {
        // Silently fail
    }
};

 
// ⚡ AUTO REACT
 
const autoReact = async (sock, msg) => {
    try {
        const senderId = msg.key.remoteJid;
        const ownerData = getOwnerData(senderId);
        
        if (ownerData && ownerData.features && ownerData.features.autoReact) {
            const controller = getReactController(sock);
            const emoji = ownerData.features.reactEmoji || config.defaults.autoReactEmoji || '⚡';
            
            await sock.sendMessage(senderId, {
                react: {
                    text: emoji,
                    key: msg.key
                }
            });
        }
    } catch (error) {
        // Silently fail
    }
};

 
  COMMAND
 
const executeCommand = async (sock, msg, commandName, args) => {
    const senderId = msg.key.remoteJid;
    const command = commands.get(commandName);
    
    if (!command) {
        await sock.sendMessage(senderId, {
            text: `❌ Unknown command: *${config.bot.prefix}${commandName}*\n\nUse *${config.bot.prefix}menu* to see all commands.`
        });
        return;
    }
    
    try {
        await command.execute(sock, msg, args, config);
        console.log(`⚡ Command: ${config.bot.prefix}${commandName} from ${senderId}`);
    } catch (error) {
        console.error(`❌ Error: ${commandName}:`, error);
        await sock.sendMessage(senderId, {
            text: `❌ Error: ${error.message}`
        });
    }
};

 
// 📨 MAIN MESSAGE HANDLER
 
const messageHandler = async (sock, msg) => {
    try {
        if (!msg.message) return;
        if (msg.key.remoteJid === 'status@broadcast') return;
        
        const senderId = msg.key.remoteJid;
        
        // Get message text
        let messageText = '';
        const messageType = Object.keys(msg.message)[0];
        
        if (messageType === 'conversation') {
            messageText = msg.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
            messageText = msg.message.extendedTextMessage.text;
        } else if (messageType === 'imageMessage') {
            messageText = msg.message.imageMessage.caption || '';
        }
        
        // ✅ AUTO SEEN - Always
        await autoSeen(sock, msg);
        
        // ✅ AUTO REACT - If enabled (for non-command messages too!)
        await autoReact(sock, msg);
        
        if (!messageText) return;
        
        // Parse command
        const parsed = parseCommand(messageText);
        
        // If not a command - silently ignore (but react already done above)
        if (!parsed) return;
        
        // It's a command
        console.log(`⚡ ${config.bot.prefix}${parsed.commandName} from ${senderId}`);
        
        // Commands that don't need registration
        if (parsed.commandName === 'register' || parsed.commandName === 'menu' || parsed.commandName === 'help') {
            await executeCommand(sock, msg, parsed.commandName, parsed.args);
            return;
        }
        
        // Protected commands - need owner check
        if (!quickCheck(senderId)) {
            await sock.sendMessage(senderId, {
                text: ` \n    ⚠️  ACCESS DENIED  ⚠️   \n                                  \n   DON'T TRY...                  \n   IT'S NOT NORMAL!              \n                                  \n   THIS IS THE POWER OF          \n   ⚡ ATHEX & ALTHEA ⚡         \n                                  \n `
            });
            return;
        }
        
        await executeCommand(sock, msg, parsed.commandName, parsed.args);
        
    } catch (error) {
        // Silently fail
    }
};

 
// 🔌 EVENT EXECUTE
 
const execute = (sock, config) => {
    loadCommands();
    
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        await messageHandler(sock, msg);
    });
    
    console.log('📨 Message Handler Ready!');
    console.log('🔒 Privacy Mode: ONLY commands processed');
    console.log('⚡ Auto React: ENABLED\n');
};

module.exports = { execute };