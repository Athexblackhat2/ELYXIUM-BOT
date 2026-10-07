 
// ⚡ ELYXIUM BOT v1.0 - AUTO REACT ENGINE
// ⚡ Powered by ATHEX & ALTHEA
 

const config = require('../config.json');
const { getOwnerData, updateOwnerSetting } = require('../middleware/ownerCheck');
const { createBox, athexBadge } = require('./embedBuilder');

 
// 🎨 EMOJI COLLECTIONS
 
const emojiCollections = {
    // Basic reactions
    basic: ['👍', '❤️', '😂', '😮', '😢', '😡'],
    
    // Cool reactions
    cool: ['⚡', '🔥', '💯', '🌟', '✨', '💪', '🎯', '🚀'],
    
    // Funny reactions
    funny: ['😂', '🤣', '💀', '😭', '🤪', '😎', '🥴', '🤡'],
    
    // Love reactions
    love: ['❤️', '💕', '💗', '💖', '💘', '💝', '🥰', '😍'],
    
    // Angry reactions
    angry: ['😡', '🤬', '💢', '😤', '👿', '💀', '🔪'],
    
    // Sad reactions
    sad: ['😢', '😭', '💔', '🥺', '😿', '😔', '😞'],
    
    // Fire reactions
    fire: ['🔥', '💥', '💣', '🧨', '💨', '🎇', '🎆'],
    
    // Ghost reactions
    ghost: ['👻', '💀', '🎃', '👽', '🤖', '👾', '🕷️'],
    
    // Animal reactions
    animals: ['🐶', '🐱', '🦊', '🐼', '🐨', '🦁', '🐸', '🦄'],
    
    // Food reactions
    food: ['🍕', '🍔', '🌮', '🍩', '🎂', '🍿', '☕', '🧃'],
    
    // ATHEX special
    athex: ['⚡', '🔱', '👑', '💎', '🌟', '🔥', '🛡️', '⚔️'],
};

 
// 🎯 REACTION RULES
 
const reactionRules = {
    // Keyword-based reactions
    keywords: {
        'hello': '👋',
        'hi': '👋',
        'bye': '👋',
        'good morning': '🌅',
        'good night': '🌙',
        'lol': '😂',
        'haha': '😂',
        'love': '❤️',
        'sorry': '🥺',
        'thanks': '🙏',
        'wow': '😮',
        'nice': '👍',
        'cool': '😎',
        'sad': '😢',
        'angry': '😡',
        'fire': '🔥',
        'dead': '💀',
        'ghost': '👻',
        'elyxium': '⚡',
        'athex': '⚡',
        'althea': '⚡',
    },
    
    // Message type reactions
    messageTypes: {
        imageMessage: '🖼️',
        videoMessage: '🎬',
        audioMessage: '🎵',
        stickerMessage: '🎯',
        documentMessage: '📄',
        locationMessage: '📍',
        contactMessage: '👤',
    }
};

 
// ⚡ REACT CONTROLLER CLASS
 
class ReactController {
    constructor(sock) {
        this.sock = sock;
        this.enabled = true;
        this.mode = 'single'; // single, random, multi, keyword
        this.customEmoji = config.defaults.autoReactEmoji || '⚡';
        this.reactToAll = false;
        this.reactToCommands = true;
        this.ignoreBots = true;
        this.reactHistory = [];
        this.keywordReactions = reactionRules.keywords;
        this.messageTypeReactions = reactionRules.messageTypes;
    }

     
    // 🎯 PROCESS REACTION
     
    async processReaction(msg, userId) {
        if (!this.enabled) return null;

        try {
            const ownerData = getOwnerData(userId);
            if (!ownerData || !ownerData.features.autoReact) return null;

            const emoji = ownerData.features.reactEmoji || this.customEmoji;
            let reactionEmoji = null;

            // Get message content
            const messageText = this.extractMessageText(msg);
            const messageType = this.extractMessageType(msg);

            switch(this.mode) {
                case 'single':
                    // Always same emoji
                    reactionEmoji = emoji;
                    break;

                case 'random':
                    // Random from collection
                    const collection = emojiCollections.cool;
                    reactionEmoji = collection[Math.floor(Math.random() * collection.length)];
                    break;

                case 'multi':
                    // Multiple emojis (2-3)
                    const cool = emojiCollections.cool;
                    const count = Math.floor(Math.random() * 2) + 2;
                    const selected = [];
                    for (let i = 0; i < count; i++) {
                        selected.push(cool[Math.floor(Math.random() * cool.length)]);
                    }
                    reactionEmoji = selected.join('');
                    break;

                case 'keyword':
                    // React based on keywords
                    reactionEmoji = this.findKeywordReaction(messageText);
                    if (!reactionEmoji) {
                        reactionEmoji = this.findMessageTypeReaction(messageType) || emoji;
                    }
                    break;

                case 'smart':
                    // Smart reaction (keyword + message type)
                    const keywordReact = this.findKeywordReaction(messageText);
                    const typeReact = this.findMessageTypeReaction(messageType);
                    reactionEmoji = keywordReact || typeReact || emoji;
                    break;

                default:
                    reactionEmoji = emoji;
            }

            // Send reaction
            if (reactionEmoji) {
                await this.sock.sendMessage(msg.key.remoteJid, {
                    react: {
                        text: reactionEmoji,
                        key: msg.key
                    }
                });

                // Track reaction
                this.trackReaction(userId, reactionEmoji, messageText);
                
                return reactionEmoji;
            }

            return null;

        } catch (error) {
            console.error('❌ React Error:', error);
            return null;
        }
    }

     
    // 🔍 FIND KEYWORD REACTION
     
    findKeywordReaction(text) {
        if (!text) return null;
        
        const lowerText = text.toLowerCase();
        
        for (const [keyword, emoji] of Object.entries(this.keywordReactions)) {
            if (lowerText.includes(keyword)) {
                return emoji;
            }
        }
        
        return null;
    }

     
    // 📋 FIND MESSAGE TYPE REACTION
     
    findMessageTypeReaction(messageType) {
        return this.messageTypeReactions[messageType] || null;
    }

     
    // 📝 EXTRACT MESSAGE TEXT
     
    extractMessageText(msg) {
        if (!msg.message) return '';
        
        const type = Object.keys(msg.message)[0];
        
        switch(type) {
            case 'conversation':
                return msg.message.conversation;
            case 'extendedTextMessage':
                return msg.message.extendedTextMessage.text;
            case 'imageMessage':
                return msg.message.imageMessage.caption || '';
            case 'videoMessage':
                return msg.message.videoMessage.caption || '';
            default:
                return '';
        }
    }

     
    // 📎 EXTRACT MESSAGE TYPE
     
    extractMessageType(msg) {
        if (!msg.message) return 'unknown';
        return Object.keys(msg.message)[0];
    }

     
    // 📊 TRACK REACTION
     
    trackReaction(userId, emoji, messagePreview) {
        this.reactHistory.push({
            userId,
            emoji,
            messagePreview: messagePreview?.substring(0, 50) || '[media]',
            timestamp: new Date().toISOString()
        });

        // Keep last 200 reactions
        if (this.reactHistory.length > 200) {
            this.reactHistory.shift();
        }
    }

     
    // ⚙️ SETTINGS
     
    setMode(mode) {
        const validModes = ['single', 'random', 'multi', 'keyword', 'smart'];
        if (validModes.includes(mode)) {
            this.mode = mode;
            return { success: true, message: `✅ React mode set to: ${mode}` };
        }
        return { success: false, message: `❌ Invalid mode! Valid: ${validModes.join(', ')}` };
    }

    setCustomEmoji(emoji) {
        if (emoji && emoji.trim()) {
            this.customEmoji = emoji;
            return { success: true, message: `✅ Custom emoji set to: ${emoji}` };
        }
        return { success: false, message: '❌ Invalid emoji!' };
    }

    toggle() {
        this.enabled = !this.enabled;
        return { 
            success: true, 
            enabled: this.enabled,
            message: `Auto-react ${this.enabled ? 'ENABLED ✅' : 'DISABLED ❌'}`
        };
    }

    getSettings() {
        return {
            enabled: this.enabled,
            mode: this.mode,
            customEmoji: this.customEmoji,
            modes: ['single', 'random', 'multi', 'keyword', 'smart'],
            totalReactions: this.reactHistory.length
        };
    }

    getStats() {
        const total = this.reactHistory.length;
        const today = this.reactHistory.filter(r => {
            const todayStr = new Date().toDateString();
            return new Date(r.timestamp).toDateString() === todayStr;
        }).length;

        const mostUsed = {};
        this.reactHistory.forEach(r => {
            mostUsed[r.emoji] = (mostUsed[r.emoji] || 0) + 1;
        });

        const topEmoji = Object.entries(mostUsed)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            total,
            today,
            topEmoji: Object.fromEntries(topEmoji),
            mode: this.mode
        };
    }

     
    // 🎨 REACTION MENU
     
    getReactMenu() {
        const settings = this.getSettings();
        
        return `
 
    ⚡ AUTO REACT SETTINGS ⚡    
                                  
   Status: ${settings.enabled ? '✅ ON' : '❌ OFF'}                    
   Mode: ${settings.mode.padEnd(16)} 
   Emoji: ${settings.customEmoji.padEnd(16)} 
                                  
   📊 Stats:                     
   Total: ${String(settings.totalReactions).padEnd(16)} 
                                  

   🎨 AVAILABLE MODES:           
   • single  - One emoji         
   • random  - Random emoji      
   • multi   - 2-3 emojis        
   • keyword - Smart reactions   
   • smart   - AI reactions      
                                  
   🎯 EMOJI COLLECTIONS:         
   • basic  • cool  • funny      
   • love   • angry • sad        
   • fire   • ghost • animals    
   • food   • athex              
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`;
    }

     
    // 🎨 GET EMOJI COLLECTION
     
    getEmojiCollection(name) {
        return emojiCollections[name] || null;
    }

     
    // 📋 LIST ALL COLLECTIONS
     
    listCollections() {
        return Object.entries(emojiCollections).map(([name, emojis]) => ({
            name,
            emojis,
            count: emojis.length,
            preview: emojis.join(' ')
        }));
    }

     
    // 🔑 ADD CUSTOM KEYWORD
     
    addKeyword(keyword, emoji) {
        if (keyword && emoji) {
            this.keywordReactions[keyword.toLowerCase()] = emoji;
            return { success: true, message: `✅ Added: "${keyword}" → ${emoji}` };
        }
        return { success: false, message: '❌ Invalid keyword or emoji!' };
    }

     
    // 🔑 REMOVE KEYWORD
     
    removeKeyword(keyword) {
        if (this.keywordReactions[keyword.toLowerCase()]) {
            delete this.keywordReactions[keyword.toLowerCase()];
            return { success: true, message: `✅ Removed keyword: "${keyword}"` };
        }
        return { success: false, message: '❌ Keyword not found!' };
    }

     
    // 📋 LIST KEYWORDS
     
    listKeywords() {
        return Object.entries(this.keywordReactions).map(([keyword, emoji]) => ({
            keyword,
            emoji
        }));
    }
}

 
// 🚀 QUICK REACT (Single use)
 
const quickReact = async (sock, msg, emoji = '⚡') => {
    try {
        await sock.sendMessage(msg.key.remoteJid, {
            react: {
                text: emoji,
                key: msg.key
            }
        });
        return { success: true, emoji };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

 
// 🎨 BULK REACT (Multiple emojis)
 
const bulkReact = async (sock, msg, emojis = ['⚡', '🔥', '💀']) => {
    const results = [];
    
    for (const emoji of emojis) {
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                react: {
                    text: emoji,
                    key: msg.key
                }
            });
            results.push({ emoji, success: true });
        } catch (error) {
            results.push({ emoji, success: false });
        }
        // Small delay between reactions
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return results;
};

 
// 📤 EXPORTS
 
module.exports = {
    ReactController,
    quickReact,
    bulkReact,
    emojiCollections,
    reactionRules
};

 
// ⚡ ELYXIUM BOT v1.0 - Auto React Ready!
// ⚡ Powered by ATHEX & ALTHEA
 