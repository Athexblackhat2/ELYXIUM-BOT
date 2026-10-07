 
// ⚡ ELYXIUM BOT v1.0 - SET REACT COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const { ReactController, emojiCollections, reactionRules } = require('../../utils/autoReact');
const { updateOwnerSetting, getOwnerData } = require('../../middleware/ownerCheck');
const { createBox, athexBadge } = require('../../utils/embedBuilder');

let reactController = null;

const getController = (sock) => {
    if (!reactController) {
        reactController = new ReactController(sock);
    }
    return reactController;
};

module.exports = {
    name: 'setreact',
    description: 'Set auto-react emoji and mode for all incoming messages',
    category: 'status',
    usage: 'setreact [emoji/mode/on/off/status]',
    aliases: ['react', 'autoreact', 'emoji', 'reaction', 'sr', 'ar'],

     
    
     
    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        const userId = msg.key.remoteJid;
        const controller = getController(sock);

        try {
            // No args - show status
            if (!args || args.length === 0) {
                await showReactStatus(sock, chatId, controller, config);
                return;
            }

            const subCommand = args[0];

            // Check if it's an emoji
            if (isEmoji(subCommand)) {
                await setCustomEmoji(sock, chatId, userId, subCommand, controller);
                return;
            }

            const subLower = subCommand.toLowerCase();

            // ON
            if (subLower === 'on' || subLower === 'enable' || subLower === 'start') {
                await enableAutoReact(sock, chatId, userId, controller);
                return;
            }

            // OFF
            if (subLower === 'off' || subLower === 'disable' || subLower === 'stop') {
                await disableAutoReact(sock, chatId, userId, controller);
                return;
            }

            // Toggle
            if (subLower === 'toggle' || subLower === 'switch') {
                await toggleAutoReact(sock, chatId, userId, controller);
                return;
            }

            // Status
            if (subLower === 'status' || subLower === 'info') {
                await showReactStatus(sock, chatId, controller, config);
                return;
            }

            // Mode change
            if (subLower === 'mode') {
                await handleModeChange(sock, chatId, controller, args);
                return;
            }

            // Collection view
            if (subLower === 'collection' || subLower === 'list' || subLower === 'collections') {
                await handleCollectionView(sock, chatId, controller, args);
                return;
            }

            // Use collection
            if (subLower === 'use' || subLower === 'set') {
                await handleUseCollection(sock, chatId, controller, args);
                return;
            }

            // Keyword management
            if (subLower === 'keyword' || subLower === 'keywords') {
                await handleKeywords(sock, chatId, controller, args);
                return;
            }

            // Add keyword
            if (subLower === 'addkeyword' || subLower === 'addkw') {
                await handleAddKeyword(sock, chatId, controller, args);
                return;
            }

            // Remove keyword
            if (subLower === 'removekeyword' || subLower === 'rmkw') {
                await handleRemoveKeyword(sock, chatId, controller, args);
                return;
            }

            // Stats
            if (subLower === 'stats' || subLower === 'history') {
                await handleStats(sock, chatId, controller);
                return;
            }

            // Help
            if (subLower === 'help') {
                await showHelp(sock, chatId, config);
                return;
            }

            // Reset
            if (subLower === 'reset' || subLower === 'default') {
                await handleReset(sock, chatId, userId, controller, config);
                return;
            }

            // Unknown - treat as emoji
            await setCustomEmoji(sock, chatId, userId, subCommand, controller);

        } catch (error) {
            console.error('❌ SetReact Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *FAILED TO SET REACTION!*\nSomething went wrong.\n\n⚡ ATHEX & ALTHEA ⚡'
            });
        }
    }
};

 
// 🎨 SET CUSTOM EMOJI
 
const setCustomEmoji = async (sock, chatId, userId, emoji, controller) => {
    const result = controller.setCustomEmoji(emoji);
    
    if (result.success) {
        updateOwnerSetting(userId, 'reactEmoji', emoji);

        await sock.sendMessage(chatId, {
            text: `
 
   ⚡ AUTO REACT UPDATED! ⚡     
                                  
   ${emoji} Custom Emoji Set!            
                                  
   All incoming messages will     
   now get ${emoji} reaction!          
                                  
   Mode: ${controller.mode.toUpperCase().padEnd(22)} 
                                  
   ⚡ ELYXIUM BOT v1.0 ⚡        
 
⚡ Powered by ATHEX & ALTHEA ⚡`
        });

        // Demo the reaction
        await sock.sendMessage(chatId, {
            react: {
                text: emoji,
                key: { remoteJid: chatId, id: 'setreact_demo' }
            }
        });
    } else {
        await sock.sendMessage(chatId, {
            text: `❌ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    }
};

 
// ✅ ENABLE AUTO REACT
 
const enableAutoReact = async (sock, chatId, userId, controller) => {
    controller.enabled = true;
    updateOwnerSetting(userId, 'autoReact', true);

    const emoji = controller.customEmoji || '⚡';

    await sock.sendMessage(chatId, {
        text: `
 
   ✅ AUTO REACT ENABLED! ✅     
                                  
   ${emoji} Reacting to all messages!    
                                  
   Mode: ${controller.mode.toUpperCase().padEnd(22)} 
   Emoji: ${controller.customEmoji.padEnd(20)} 
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
    });
};

 
// ❌ DISABLE AUTO REACT
 
const disableAutoReact = async (sock, chatId, userId, controller) => {
    controller.enabled = false;
    updateOwnerSetting(userId, 'autoReact', false);

    await sock.sendMessage(chatId, {
        text: `
 
   ❌ AUTO REACT DISABLED! ❌    
                                  
   No more auto reactions!        
                                  
   Use *!setreact on* to enable.  
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
    });
};

 
// 🔄 TOGGLE AUTO REACT
 
const toggleAutoReact = async (sock, chatId, userId, controller) => {
    const result = controller.toggle();
    updateOwnerSetting(userId, 'autoReact', result.enabled);

    const emoji = result.enabled ? '✅' : '❌';
    await sock.sendMessage(chatId, {
        text: `${emoji} ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

 
// 📊 SHOW STATUS
 
const showReactStatus = async (sock, chatId, controller, config) => {
    const menu = controller.getReactMenu();
    await sock.sendMessage(chatId, { text: menu });
};

 
// 🎯 MODE CHANGE
 
const handleModeChange = async (sock, chatId, controller, args) => {
    if (args.length < 2) {
        await sock.sendMessage(chatId, {
            text: `❌ *Please specify a mode!*\n\nAvailable: *single, random, multi, keyword, smart*\n\nExample: *!setreact mode keyword*\n\n⚡ ATHEX & ALTHEA ⚡`
        });
        return;
    }

    const mode = args[1].toLowerCase();
    const result = controller.setMode(mode);

    if (result.success) {
        const modeEmojis = {
            single: '1️⃣',
            random: '🎲',
            multi: '🎨',
            keyword: '🔑',
            smart: '🧠'
        };

        await sock.sendMessage(chatId, {
            text: `${modeEmojis[mode] || '✅'} *MODE CHANGED!*\n\nNew Mode: *${mode.toUpperCase()}*\n\n${getModeDescription(mode)}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    } else {
        await sock.sendMessage(chatId, {
            text: `❌ ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    }
};

 
// 📦 COLLECTION VIEW
 
const handleCollectionView = async (sock, chatId, controller, args) => {
    // If specific collection requested
    if (args.length > 1) {
        const collectionName = args[1].toLowerCase();
        const collection = controller.getEmojiCollection(collectionName);
        
        if (collection) {
            await sock.sendMessage(chatId, {
                text: `📦 *${collectionName.toUpperCase()}* Collection\n\n${collection.join(' ')}\n\nUse *!setreact use ${collectionName}* to apply.\n\n⚡ ATHEX & ALTHEA ⚡`
            });
            return;
        }
    }

    // Show all collections
    const collections = controller.listCollections();
    
    let collectionList = ' \n';
    collectionList += '   📦 EMOJI COLLECTIONS 📦      \n';
    collectionList += '                                  \n';
    
    collections.forEach(c => {
        collectionList += `   ${c.preview.substring(0, 20).padEnd(22)} \n`;
        collectionList += `   → ${c.name} (${c.count} emojis)${' '.repeat(Math.max(0, 10 - c.name.length))} \n`;
    });
    
    collectionList += '                                  \n';
    collectionList += '   Use: !setreact use <name>     \n';
    collectionList += '                                  \n';
    collectionList += ' \n';
    collectionList += '⚡ Powered by ATHEX & ALTHEA ⚡';

    await sock.sendMessage(chatId, { text: collectionList });
};

 
// 🎨 USE COLLECTION
 
const handleUseCollection = async (sock, chatId, controller, args) => {
    if (args.length < 2) {
        await sock.sendMessage(chatId, {
            text: `❌ *Please specify a collection!*\n\nUse *!setreact collections* to see all.\n\n⚡ ATHEX & ALTHEA ⚡`
        });
        return;
    }

    const collectionName = args[1].toLowerCase();
    const collection = controller.getEmojiCollection(collectionName);
    
    if (collection) {
        controller.setMode('random');
        const randomEmoji = collection[Math.floor(Math.random() * collection.length)];
        controller.setCustomEmoji(randomEmoji);
        
        await sock.sendMessage(chatId, {
            text: `✅ *Collection Applied!*\n\n📦 ${collectionName.toUpperCase()}\n🎨 ${collection.join(' ')}\n🎲 Mode: Random\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    } else {
        await sock.sendMessage(chatId, {
            text: `❌ *Collection not found!*\n\nUse *!setreact collections* to see all.\n\n⚡ ATHEX & ALTHEA ⚡`
        });
    }
};

 
// 🔑 KEYWORDS
 
const handleKeywords = async (sock, chatId, controller) => {
    const keywords = controller.listKeywords();
    
    if (keywords.length === 0) {
        await sock.sendMessage(chatId, {
            text: '🔑 *No custom keywords set!*\n\nUse *!setreact addkeyword <word> <emoji>* to add.\n\n⚡ ATHEX & ALTHEA ⚡'
        });
        return;
    }

    let keywordList = ' \n';
    keywordList += '   🔑 KEYWORD REACTIONS 🔑      \n';
    keywordList += '                                  \n';
    
    keywords.forEach(k => {
        keywordList += `   ${k.emoji} ${truncate(k.keyword, 18).padEnd(19)} \n`;
    });
    
    keywordList += '                                  \n';
    keywordList += `   Total: ${String(keywords.length).padEnd(22)} \n`;
    keywordList += '                                  \n';
    keywordList += ' \n';
    keywordList += '⚡ Powered by ATHEX & ALTHEA ⚡';

    await sock.sendMessage(chatId, { text: keywordList });
};

 
// ➕ ADD KEYWORD
 
const handleAddKeyword = async (sock, chatId, controller, args) => {
    if (args.length < 3) {
        await sock.sendMessage(chatId, {
            text: `❌ *Usage:* *!setreact addkeyword <word> <emoji>*\n\nExample: *!setreact addkeyword hello 👋*\n\n⚡ ATHEX & ALTHEA ⚡`
        });
        return;
    }

    const keyword = args[1].toLowerCase();
    const emoji = args[2];
    const result = controller.addKeyword(keyword, emoji);

    await sock.sendMessage(chatId, {
        text: `${result.success ? '✅' : '❌'} ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

 
// ➖ REMOVE KEYWORD
 
const handleRemoveKeyword = async (sock, chatId, controller, args) => {
    if (args.length < 2) {
        await sock.sendMessage(chatId, {
            text: `❌ *Usage:* *!setreact removekeyword <word>*\n\nExample: *!setreact removekeyword hello*\n\n⚡ ATHEX & ALTHEA ⚡`
        });
        return;
    }

    const keyword = args[1].toLowerCase();
    const result = controller.removeKeyword(keyword);

    await sock.sendMessage(chatId, {
        text: `${result.success ? '✅' : '❌'} ${result.message}\n\n⚡ ATHEX & ALTHEA ⚡`
    });
};

 
// 📊 STATS
 
const handleStats = async (sock, chatId, controller) => {
    const stats = controller.getStats();

    const statsMessage = `
 
   📊 REACT STATISTICS 📊       
                                  
   📥 Total Reactions: ${String(stats.total).padEnd(10)} 
   📅 Today: ${String(stats.today).padEnd(16)} 
   🎯 Mode: ${stats.mode.padEnd(18)} 
                                  
   🏆 Top Emojis:                
${buildTopEmojis(stats.topEmoji)}
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: statsMessage });
};

 
// 🏆 BUILD TOP EMOJIS
 
const buildTopEmojis = (topEmoji) => {
    let text = '';
    const entries = Object.entries(topEmoji).slice(0, 5);
    
    entries.forEach(([emoji, count], i) => {
        text += `   ${String(i + 1)}. ${emoji} - ${count} times${' '.repeat(Math.max(0, 12 - String(count).length))} \n`;
    });
    
    if (entries.length === 0) {
        text += '   No reactions yet!             \n';
    }
    
    return text;
};

 
// 🔄 RESET
 
const handleReset = async (sock, chatId, userId, controller, config) => {
    controller.setMode('single');
    controller.setCustomEmoji(config.defaults.autoReactEmoji || '⚡');
    controller.enabled = true;
    updateOwnerSetting(userId, 'reactEmoji', config.defaults.autoReactEmoji || '⚡');
    updateOwnerSetting(userId, 'autoReact', true);

    await sock.sendMessage(chatId, {
        text: `
 
   🔄 SETTINGS RESET! 🔄        
                                  
   Mode: SINGLE                   
   Emoji: ${controller.customEmoji.padEnd(20)} 
   Status: ENABLED                
                                  
   All custom keywords cleared.   
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
    });
};

 
// ❓ HELP
 
const showHelp = async (sock, chatId, config) => {
    const helpText = `
 
   ⚡ SET REACT HELP ⚡          
                                  
   📋 COMMANDS:                  
                                  
   ${config.prefix}setreact <emoji>          
   → Set custom reaction emoji   
   → Example: ${config.prefix}setreact 🔥      
                                  
   ${config.prefix}setreact on/off          
   → Enable/disable auto react   
                                  
   ${config.prefix}setreact mode <name>     
   → Change reaction mode        
   → single/random/multi/        
     keyword/smart               
                                  
   ${config.prefix}setreact collections     
   → View emoji collections      
                                  
   ${config.prefix}setreact use <name>      
   → Apply emoji collection      
                                  
   ${config.prefix}setreact addkeyword      
   → Add keyword reaction        
   → ${config.prefix}setreact addkw hi 👋     
                                  
   ${config.prefix}setreact status          
   → View current settings       
                                  
   ${config.prefix}setreact stats           
   → View reaction statistics    
                                  
   ${config.prefix}setreact reset           
   → Reset to default settings   
                                  
   🎯 MODES:                     
   1️⃣  Single - One emoji       
   🎲 Random - Random emoji      
   🎨 Multi - 2-3 emojis         
   🔑 Keyword - Smart detection  
   🧠 Smart - AI powered         
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;

    await sock.sendMessage(chatId, { text: helpText });
};

 
// 🔍 CHECK IF STRING IS EMOJI
 
const isEmoji = (str) => {
    const emojiRegex = /[\p{Emoji}]/u;
    return emojiRegex.test(str) && str.length <= 4;
};

 
// 📝 GET MODE DESCRIPTION
 
const getModeDescription = (mode) => {
    const descriptions = {
        single: 'Always reacts with the same emoji',
        random: 'Randomly picks from emoji collection',
        multi: 'Reacts with 2-3 emojis at once',
        keyword: 'Reacts based on message keywords',
        smart: 'AI-powered smart reactions'
    };
    return descriptions[mode] || 'Custom mode';
};

 
// ✂️ TRUNCATE TEXT
 
const truncate = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

 
// ⚡ ELYXIUM BOT v1.0 - SetReact Command Ready!
// ⚡ Powered by ATHEX & ALTHEA
 