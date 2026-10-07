 
// 🔥 ELYXIUM BOT v1.0 PRO - MAIN MENU
// ⚡ Powered by ATHEX & ALTHEA
 

const config = require('./config.json');
const path = require('path');
const fs = require('fs');

const logoPath = path.join(__dirname, 'assets', 'logo.png');
const hasLogo = fs.existsSync(logoPath);
const menuText = `
🎉  FUN COMMANDS              
  ${config.bot.prefix}ping      » Bot Latency Check      
  ${config.bot.prefix}8ball     » Magic 8-Ball        
  ${config.bot.prefix}meme      » Random Meme   

🛠️  UTILITY COMMANDS          
  ${config.bot.prefix}avatar    » Get User Avatar      
  ${config.bot.prefix}userinfo  » User Details      
  ${config.bot.prefix}serverinfo» Group Info          
  ${config.bot.prefix}save      » Save Status/DP  

👻  STATUS COMMANDS           
  ${config.bot.prefix}fakeonline » Online Anytime      
  ${config.bot.prefix}fakeoffline» Offline Mode       
  ${config.bot.prefix}setreact  » Set Auto-React      

💀  PRANK COMMANDS            
  ${config.bot.prefix}hack      » Hack Terminal       
  ${config.bot.prefix}spam      » Message Bomber      
  ${config.bot.prefix}crash     » WhatsApp Crash Basic Not Heavy

🛡️  DEFENSE COMMANDS          
  ${config.bot.prefix}anticall  » Anti-Call Shield    

⚙️  SYSTEM COMMANDS           
  ${config.bot.prefix}menu      » Show This Menu      
  ${config.bot.prefix}register  » Register as Owner  
  ${config.bot.prefix}help      » Command Help ❓       


⚡ DEVELOPED BY  ⚡
⚡ ATHEX & ALTHEA⚡
                     
🛡️ OWNER PROTECTED                   
🚫 ANTI-CALL | 👁️ AUTO SEEN+REACT    
`;

const helpText = `
📌 *HOW TO USE:*
• Prefix: *${config.bot.prefix}* | Example: *${config.bot.prefix}menu*

🎯 *COMMANDS:*
${config.bot.prefix}ping | ${config.bot.prefix}8ball | ${config.bot.prefix}meme
${config.bot.prefix}avatar | ${config.bot.prefix}userinfo | ${config.bot.prefix}serverinfo
${config.bot.prefix}save | ${config.bot.prefix}fakeonline | ${config.bot.prefix}fakeoffline
${config.bot.prefix}setreact | ${config.bot.prefix}hack | ${config.bot.prefix}spam
${config.bot.prefix}crash | ${config.bot.prefix}anticall | ${config.bot.prefix}register
⚡ Powered by ATHEX & ALTHEA ⚡`;
const sendMenu = async (sock, chatId) => {
    try {
        if (hasLogo) {
            await sock.sendMessage(chatId, {
                image: { url: logoPath },
                caption: `🤖 *ELYXIUM BOT v1.0*\n⚡ *Powered by ATHEX & ALTHEA*\n\n${menuText}`
            });
        } else {
            await sock.sendMessage(chatId, {
                text: `🤖 *ELYXIUM BOT v1.0*\n⚡ *Powered by ATHEX & ALTHEA*\n\n${menuText}`
            });
        }
        return true;
    } catch (error) {
        await sock.sendMessage(chatId, { text: menuText });
        return true;
    }
};
const sendHelp = async (sock, chatId) => {
    try {
        if (hasLogo) {
            await sock.sendMessage(chatId, {
                image: { url: logoPath },
                caption: `🤖 *ELYXIUM BOT HELP*\n${helpText}`
            });
        } else {
            await sock.sendMessage(chatId, { text: `🤖 *ELYXIUM BOT HELP*\n${helpText}` });
        }
        return true;
    } catch (error) {
        await sock.sendMessage(chatId, { text: helpText });
        return true;
    }
};
module.exports = { sendMenu, sendHelp };