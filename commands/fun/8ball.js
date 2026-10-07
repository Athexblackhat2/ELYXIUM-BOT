 
// 🎱 ELYXIUM BOT v1.0 - 8BALL COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const { createBox, athexBadge } = require('../../utils/embedBuilder');

 
// 🎱 MAGIC 8-BALL ANSWERS
 
const answers = {
    positive: [
        { text: 'It is certain.', emoji: '✅' },
        { text: 'It is decidedly so.', emoji: '💯' },
        { text: 'Without a doubt.', emoji: '✨' },
        { text: 'Yes definitely.', emoji: '👍' },
        { text: 'You may rely on it.', emoji: '🤝' },
        { text: 'As I see it, yes.', emoji: '👁️' },
        { text: 'Most likely.', emoji: '📈' },
        { text: 'Outlook good.', emoji: '🌤️' },
        { text: 'Yes!', emoji: '🎉' },
        { text: 'Signs point to yes.', emoji: '👉' },
        { text: 'Absolutely!', emoji: '🔥' },
        { text: '100% yes!', emoji: '💪' },
    ],
    neutral: [
        { text: 'Reply hazy, try again.', emoji: '🌫️' },
        { text: 'Ask again later.', emoji: '⏰' },
        { text: 'Better not tell you now.', emoji: '🤫' },
        { text: 'Cannot predict now.', emoji: '🤷' },
        { text: 'Concentrate and ask again.', emoji: '🧘' },
        { text: 'I\'m not sure...', emoji: '🤔' },
        { text: 'Maybe, maybe not.', emoji: '🪙' },
        { text: 'The future is unclear.', emoji: '🔮' },
    ],
    negative: [
        { text: 'Don\'t count on it.', emoji: '🙅' },
        { text: 'My reply is no.', emoji: '👎' },
        { text: 'My sources say no.', emoji: '📚' },
        { text: 'Outlook not so good.', emoji: '🌧️' },
        { text: 'Very doubtful.', emoji: '🤨' },
        { text: 'No way!', emoji: '🚫' },
        { text: 'Absolutely not!', emoji: '❌' },
        { text: 'Nope!', emoji: '🙅‍♂️' },
        { text: 'I don\'t think so.', emoji: '🤷‍♂️' },
        { text: 'Negative!', emoji: '⛔' },
    ]
};

 
// 😂 FUNNY CUSTOM ANSWERS
 
const funnyAnswers = [
    { text: 'Bro, even Google doesn\'t know!', emoji: '😂' },
    { text: 'Are you seriously asking ME?', emoji: '🤨' },
    { text: 'My magic ball says... maybe get a life?', emoji: '💀' },
    { text: 'Error 404: Answer not found!', emoji: '🔍' },
    { text: 'The spirits are on lunch break.', emoji: '🍔' },
    { text: 'I asked my WiFi router, it said no.', emoji: '📡' },
    { text: 'Even ATHEX & ALTHEA can\'t predict this!', emoji: '⚡' },
    { text: 'Let me check my crystal ball... it\'s buffering.', emoji: '⏳' },
    { text: 'The universe said: "Ask again with payment."', emoji: '💸' },
    { text: 'Yes... wait no... actually yes... hmm... no.', emoji: '🔄' },
];

 
// 🎱 SHAKE ANIMATIONS
 
const shakeAnimations = [
    '🎱 Shaking...',
    '🎱 Shaking... 🔮',
    '🎱 Shaking... 🔮 ✨',
    '🎱 The spirits are answering...',
    '🎱 Magic is working...',
    '🔮 Consulting the universe...',
    '✨ Asking the stars...',
];

 
// ⚡ COMMAND CONFIG
 
module.exports = {
    name: '8ball',
    description: 'Ask the magic 8-ball a question',
    category: 'fun',
    usage: '8ball <question>',
    aliases: ['ball', 'magic', 'ask', 'question', 'predict'],

     
     
     
    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;
        
        try {
            // Check if question was asked
            if (!args || args.length === 0) {
                await sock.sendMessage(chatId, {
                    text: `
 
    🎱 MAGIC 8-BALL 🎱          
                                  
   Please ask a question!        
                                  
   Usage: *${config.prefix}8ball <question>*   
                                  
   Example:                      
   ${config.prefix}8ball Will I be rich?     
                                  
 
⚡ Powered by ATHEX & ALTHEA ⚡`
                });
                return;
            }

            // Get the question
            const question = args.join(' ');
            
            // Shake animation (send progressive messages)
            const shakeMsg = await sock.sendMessage(chatId, {
                text: '```🎱 Shaking...```'
            });

            // Dramatic pause
            await new Promise(resolve => setTimeout(resolve, 800));

            // Update with second shake
            await sock.sendMessage(chatId, {
                text: '```🎱 Shaking... 🔮✨```',
                edit: shakeMsg.key
            });

            // Another dramatic pause
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Get random answer
            const answer = getRandomAnswer();
            
            // Determine answer type for styling
            const answerType = getAnswerType(answer);
            const typeEmoji = getTypeEmoji(answerType);

            // Build response
            const response = `
 
       🎱 MAGIC 8-BALL 🎱       
                                  
   ❓ Question:                  
   "${truncateText(question, 28)}"   
                                  
   ${typeEmoji} Answer:                    
   ${answer.text.padEnd(30)} 
                                  
   ${answer.emoji} ${answerType.toUpperCase()}                         
                                  
   ⚡ ELYXIUM BOT ⚡            
 `;

            // Delete shake message and send answer
            await sock.sendMessage(chatId, {
                text: response,
                edit: shakeMsg.key
            });

            // Add reaction to original question
            await sock.sendMessage(chatId, {
                react: {
                    text: answer.emoji,
                    key: msg.key
                }
            });

        } catch (error) {
            console.error('❌ 8ball Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *The magic ball cracked!*\nTry again later.\n\n⚡ ATHEX & ALTHEA ⚡'
            });
        }
    }
};

 
// 🎲 GET RANDOM ANSWER
 
const getRandomAnswer = () => {
    // 5% chance of funny answer
    if (Math.random() < 0.05) {
        return funnyAnswers[Math.floor(Math.random() * funnyAnswers.length)];
    }

    // Weighted random: 40% positive, 30% neutral, 30% negative
    const roll = Math.random() * 100;
    
    let category;
    if (roll < 40) {
        category = 'positive';
    } else if (roll < 70) {
        category = 'neutral';
    } else {
        category = 'negative';
    }
    
    const categoryAnswers = answers[category];
    return categoryAnswers[Math.floor(Math.random() * categoryAnswers.length)];
};

 
// 📊 GET ANSWER TYPE
 
const getAnswerType = (answer) => {
    for (const [type, answerList] of Object.entries(answers)) {
        if (answerList.includes(answer)) {
            return type;
        }
    }
    return 'funny';
};

 
// 🎯 GET TYPE EMOJI
 
const getTypeEmoji = (type) => {
    switch(type) {
        case 'positive': return '🟢';
        case 'neutral': return '🟡';
        case 'negative': return '🔴';
        case 'funny': return '😂';
        default: return '⚪';
    }
};

 
// ✂️ TRUNCATE TEXT
 
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

 
// ⚡ ELYXIUM BOT v1.0 - 8ball Command Ready!
// ⚡ Powered by ATHEX & ALTHEA
 