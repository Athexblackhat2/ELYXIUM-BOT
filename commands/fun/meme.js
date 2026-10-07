 
// 😂 ELYXIUM BOT v1.0 - MEME COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const axios = require('axios');
const { createBox, athexBadge } = require('../../utils/embedBuilder');

 
// 🌐 MEME API SOURCES
 
const memeAPIs = [
    {
        name: 'Meme API',
        url: 'https://meme-api.com/gimme',
        parser: (data) => ({
            title: data.title,
            image: data.url,
            author: data.author,
            subreddit: data.subreddit,
            upvotes: data.ups,
            nsfw: data.nsfw,
            source: 'Reddit'
        })
    },
    {
        name: 'Imgflip',
        url: 'https://api.imgflip.com/get_memes',
        parser: (data) => {
            const memes = data.data.memes;
            const meme = memes[Math.floor(Math.random() * memes.length)];
            return {
                title: meme.name,
                image: meme.url,
                author: 'Imgflip',
                subreddit: 'imgflip',
                upvotes: Math.floor(Math.random() * 10000),
                nsfw: false,
                source: 'Imgflip'
            };
        }
    }
];

 
// 😂 FUNNY CAPTIONS
 
const funnyCaptions = [
    '😂 Here\'s a fresh meme for you!',
    '🤣 I found this gem!',
    '💀 This one\'s deadly!',
    '🔥 Hot meme incoming!',
    '👌 Quality content right here!',
    '🎯 This meme hits different!',
    '😭 I\'m crying! 😂',
    '🏆 Top tier meme!',
    '⚡ Meme power!',
    '🍿 Fresh from the internet!',
    '🤌 Chef\'s kiss!',
    '💯 Certified dank!',
];

 
// 🏷️ HASHTAGS
 
const hashtags = [
    '#meme #funny #elyxium',
    '#dankmeme #lol #athex',
    '#memesdaily #humor #althea',
    '#funnymeme #jokes #elyxiumbot',
    '#memeoftheday #comedy',
];

 
// ⚡ COMMAND CONFIG
 
module.exports = {
    name: 'meme',
    description: 'Get a random funny meme from the internet',
    category: 'fun',
    usage: 'meme',
    aliases: ['memes', 'funny', 'dank', 'laugh', 'reddit'],

     
     
     
    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        
        try {
            // Send loading message
            const loadingMsg = await sock.sendMessage(chatId, {
                text: '```🔍 Hunting for a dank meme...```'
            });

            // Fetch meme
            const meme = await fetchMeme();
            
            if (!meme || !meme.image) {
                await sock.sendMessage(chatId, {
                    text: '❌ *Failed to fetch meme!*\nThe internet is not funny right now.\nTry again later!\n\n⚡ ATHEX & ALTHEA ⚡',
                    edit: loadingMsg.key
                });
                return;
            }

            // Skip NSFW memes
            if (meme.nsfw) {
                await sock.sendMessage(chatId, {
                    text: '🙈 *NSFW meme detected!*\nFetching a safe one...\n\n⚡ ATHEX & ALTHEA ⚡'
                });
                // Retry once
                const retryMeme = await fetchMeme();
                if (retryMeme && !retryMeme.nsfw) {
                    await sendMemeMessage(sock, chatId, retryMeme, config, loadingMsg.key);
                    return;
                }
                await sock.sendMessage(chatId, {
                    text: '❌ Couldn\'t find a safe meme. Try again!\n⚡ ATHEX & ALTHEA ⚡',
                    edit: loadingMsg.key
                });
                return;
            }

            // Send meme
            await sendMemeMessage(sock, chatId, meme, config, loadingMsg.key);

        } catch (error) {
            console.error('❌ Meme Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *MEME MACHINE BROKE!*\nThe memes are too powerful today!\nTry again later.\n\n⚡ ATHEX & ALTHEA ⚡'
            });
        }
    }
};

 
// 🌐 FETCH MEME
 
const fetchMeme = async () => {
    // Random API selection
    const api = memeAPIs[Math.floor(Math.random() * memeAPIs.length)];
    
    try {
        const response = await axios.get(api.url, {
            timeout: 8000,
            headers: {
                'User-Agent': 'ELYXIUM-Bot/1.0'
            }
        });
        
        if (response.data) {
            return api.parser(response.data);
        }
        
        return null;
    } catch (error) {
        console.error(`❌ Meme API Error (${api.name}):`, error.message);
        
        // Try fallback API
        if (memeAPIs.length > 1) {
            const fallback = memeAPIs.find(a => a.name !== api.name);
            if (fallback) {
                try {
                    const response = await axios.get(fallback.url, { timeout: 8000 });
                    return fallback.parser(response.data);
                } catch (fallbackError) {
                    console.error('❌ Fallback API also failed:', fallbackError.message);
                }
            }
        }
        
        return null;
    }
};

 
// 📤 SEND MEME MESSAGE
 
const sendMemeMessage = async (sock, chatId, meme, config, editKey = null) => {
    // Random caption
    const caption = funnyCaptions[Math.floor(Math.random() * funnyCaptions.length)];
    const tag = hashtags[Math.floor(Math.random() * hashtags.length)];
    
    // Build caption text
    let captionText = `*${meme.title || 'Meme'}*\n`;
    captionText += `${caption}\n\n`;
    
    if (meme.author) captionText += `👤 ${meme.author}\n`;
    if (meme.subreddit) captionText += `📂 r/${meme.subreddit}\n`;
    if (meme.upvotes) captionText += `👍 ${formatNumber(meme.upvotes)} upvotes\n`;
    
    captionText += `\n${tag}\n`;
    captionText += `⚡ Powered by ATHEX & ALTHEA ⚡`;

    try {
        if (editKey) {
            // Delete loading message first
            await sock.sendMessage(chatId, {
                delete: editKey
            });
        }

        // Send meme image
        await sock.sendMessage(chatId, {
            image: { url: meme.image },
            caption: captionText,
            mimetype: 'image/jpeg'
        });

        // Add reaction
        await sock.sendMessage(chatId, {
            react: {
                text: '😂',
                key: { remoteJid: chatId, id: 'meme' }
            }
        });

    } catch (error) {
        console.error('❌ Send Meme Error:', error);
        // Fallback: send URL only
        await sock.sendMessage(chatId, {
            text: `😂 *${meme.title || 'Meme'}*\n\n🔗 ${meme.image}\n\n${captionText}`
        });
    }
};

 
// 🔢 FORMAT NUMBER
 
const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

 
// ⚡ ELYXIUM BOT v1.0 - Meme Command Ready!
// ⚡ Powered by ATHEX & ALTHEA
 