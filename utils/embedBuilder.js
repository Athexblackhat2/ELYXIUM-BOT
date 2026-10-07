 
// 🎨 ELYXIUM BOT v1.0 - EMBED BUILDER
// ⚡ Powered by ATHEX & ALTHEA
 

const config = require('../config.json');

 
// 📦 STYLE PRESETS
 
const styles = {
    border: {
        double: '═',
        single: '─',
        thick: '━',
        dotted: '┄',
        star: '✧'
    },
    corner: {
        topLeft: '╔',
        topRight: '╗',
        bottomLeft: '╚',
        bottomRight: '╝',
        left: ' ',
        right: ' '
    },
    icons: {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        fire: '🔥',
        star: '⭐',
        lock: '🔒',
        shield: '🛡️',
        skull: '💀',
        bomb: '💣',
        eye: '👁️',
        ghost: '👻',
        phone: '📱',
        call: '📞',
        hack: '💻',
        spam: '📧',
        back: '🔙',
        save: '💾',
        menu: '📋',
        ping: '🏓',
        magic: '🎱',
        meme: '😂',
        avatar: '🖼️',
        user: '👤',
        server: '📊'
    }
};

 
// 🎯 CREATE HEADER
 
const createHeader = (title) => {
    const width = 40;
    const titleLength = title.length;
    const padding = Math.floor((width - titleLength - 2) / 2);
    const extraPad = (width - titleLength - 2) % 2;
    
    let header = '';
    header += `${styles.corner.topLeft}${styles.border.double.repeat(width)}${styles.corner.topRight}\n`;
    header += `${styles.corner.left}${' '.repeat(padding)}${title}${' '.repeat(padding + extraPad)}${styles.corner.right}\n`;
    header += `${styles.corner.bottomLeft}${styles.border.double.repeat(width)}${styles.corner.bottomRight}`;
    
    return header;
};

 
// 🎯 CREATE FOOTER
 
const createFooter = () => {
    const width = 40;
    
    let footer = '';
    footer += `${styles.corner.topLeft}${styles.border.double.repeat(width)}${styles.corner.topRight}\n`;
    footer += `${styles.corner.left}${' '.repeat(Math.floor((width - 24) / 2))}⚡ ATHEX & ALTHEA ⚡${' '.repeat(Math.ceil((width - 24) / 2))}${styles.corner.right}\n`;
    footer += `${styles.corner.bottomLeft}${styles.border.double.repeat(width)}${styles.corner.bottomRight}`;
    
    return footer;
};

 
// 🎯 CREATE BOX
 
const createBox = (content, title = '') => {
    const width = 40;
    const lines = content.split('\n');
    
    let box = '';
    
    // Top border
    box += `${styles.corner.topLeft}${styles.border.double.repeat(width)}${styles.corner.topRight}\n`;
    
    // Title
    if (title) {
        const titlePad = Math.floor((width - title.length - 2) / 2);
        const extra = (width - title.length - 2) % 2;
        box += `${styles.corner.left} ${' '.repeat(titlePad)}${title}${' '.repeat(titlePad + extra)} ${styles.corner.right}\n`;
        box += `${styles.corner.left}${styles.border.single.repeat(width)}${styles.corner.right}\n`;
    }
    
    // Content lines
    for (const line of lines) {
        const cleanLine = line.length > width - 4 ? line.substring(0, width - 7) + '...' : line;
        box += `${styles.corner.left} ${cleanLine}${' '.repeat(Math.max(0, width - cleanLine.length - 2))} ${styles.corner.right}\n`;
    }
    
    // Bottom border
    box += `${styles.corner.bottomLeft}${styles.border.double.repeat(width)}${styles.corner.bottomRight}`;
    
    return box;
};

 
// 🎯 CREATE SECTION
 
const createSection = (title, items) => {
    const width = 40;
    const maxItemLength = width - 4;
    
    let section = '';
    
    // Section header
    section += `┌${styles.border.single.repeat(width - 2)}┐\n`;
    section += `│ ${title}${' '.repeat(Math.max(0, width - title.length - 3))}│\n`;
    section += `├${styles.border.single.repeat(width - 2)}┤\n`;
    
    // Items
    for (const item of items) {
        const cleanItem = item.length > maxItemLength ? item.substring(0, maxItemLength - 3) + '...' : item;
        section += `│ ${cleanItem}${' '.repeat(Math.max(0, maxItemLength - cleanItem.length + 1))}│\n`;
    }
    
    // Section footer
    section += `└${styles.border.single.repeat(width - 2)}┘`;
    
    return section;
};

 
// ✅ SUCCESS MESSAGE
 
const successMessage = (text) => {
    return `${styles.icons.success} *SUCCESS*\n${text}`;
};

 
// ❌ ERROR MESSAGE
 
const errorMessage = (text) => {
    return `${styles.icons.error} *ERROR*\n${text}`;
};

 
// ⚠️ WARNING MESSAGE
 
const warningMessage = (text) => {
    return `${styles.icons.warning} *WARNING*\n${text}`;
};

 
// ℹ️ INFO MESSAGE
 
const infoMessage = (text) => {
    return `${styles.icons.info} *INFO*\n${text}`;
};

 
// 🎯 ATHEX & ALTHEA BADGE
 
const athexBadge = () => {
    return `\n\n⚡ *Powered by ATHEX & ALTHEA* ⚡`;
};

 
// 📊 PROGRESS BAR
 
const createProgressBar = (percent, length = 20) => {
    const filled = Math.floor((percent / 100) * length);
    const empty = length - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${percent}%`;
};

 
// ⏳ TYPING ANIMATION TEXT
 
const typingSequence = (text, speed = 'medium') => {
    const speeds = {
        slow: 200,
        medium: 100,
        fast: 50,
        hacker: 30
    };
    
    return {
        text,
        delay: speeds[speed] || speeds.medium
    };
};

 
// 🎨 COLORED TEXT (for console)
 
const consoleColors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

const colorize = (text, color) => {
    return `${consoleColors[color] || ''}${text}${consoleColors.reset}`;
};

 
// 🔒 ACCESS DENIED TEMPLATE
 
const accessDeniedTemplate = () => {
    return `
 
    ⚠️  ACCESS DENIED  ⚠️       
                                  
      DON'T TRY...                  
   IT'S NOT NORMAL!              
                                  
   THIS IS THE POWER OF          
   ⚡ ATHEX & ALTHEA ⚡         
                                  
 
`;
};

 
// 🚫 ANTI-CALL TEMPLATE
 
const antiCallTemplate = () => {
    return `
 
    🚫  CALL DECLINED  🚫        
                                  
   YOU CAN'T CALL THIS           
   PERSON BECAUSE HE'S           
   USING ELYXIUM BOT 💀         
                                   
   ⚡ POWERED BY ⚡             
💀  ATHEX & ALTHEA  💀            
                                  
 
`;
};

 
// 🎯 COMMAND HELP TEMPLATE
 
const commandHelp = (commandName, description, usage, example) => {
    let help = '';
    help += `📋 *Command:* ${config.bot.prefix}${commandName}\n`;
    help += `📝 *Description:* ${description}\n`;
    if (usage) help += `🔧 *Usage:* ${config.bot.prefix}${usage}\n`;
    if (example) help += `💡 *Example:* ${config.bot.prefix}${example}\n`;
    return help;
};

 
// 📤 EXPORTS
 
module.exports = {
    // Core builders
    createHeader,
    createFooter,
    createBox,
    createSection,
    createProgressBar,
    
    // Templates
    successMessage,
    errorMessage,
    warningMessage,
    infoMessage,
    accessDeniedTemplate,
    antiCallTemplate,
    commandHelp,
    athexBadge,
    
    // Effects
    typingSequence,
    colorize,
    
    // Styles
    styles,
    consoleColors
};

 
// ⚡ ELYXIUM BOT v1.0 - Embed Builder Ready!
// ⚡ Powered by ATHEX & ALTHEA
 