 
// ℹ️ ELYXIUM BOT v1.0 - ABOUT COMMAND
// ⚡ Powered by ATHEX & ALTHEA
 

const config = require('../../config.json');

module.exports = {
    name: 'about',
    description: 'Bot info, owner details & premium upgrade',
    category: 'system',
    usage: 'about',
    aliases: ['info', 'owner', 'premium', 'buy', 'contact'],

    execute: async (sock, msg, args, config) => {
        const chatId = msg.key.remoteJid;

        const aboutText = `
                                       
      🤖  ELYXIUM BOT  🤖            
        v1.0 PRO (FREE)              
                                       

                                       
  👑 *OWNER DETAILS*                  
                                       
  📛 Name: ATHEX x ALTHEA             
  📞 Contact: +923490916663          
  📧 TikTok: @teamathex.1   
                                                                            
  📢 *OFFICIAL CHANNEL*               
                                       
  🔗 https://whatsapp.com/channel/    
     0029VbCc8Am5a24DMlIl4L02         
                                                                         
  ⭐ *UPGRADE TO v2.0 (PAID)*         
                                       
  🚀 40+ Premium Commands             
  🤖 AI ChatBot                       
  📥 Media Downloader                 
  🎵 Song/Video Download              
  📱 TikTok/Insta/YT Downloader       
  💬 Auto-Reply System                
  👋 Welcome/Goodbye Messages         
  🛡️ Anti-Delete/Anti-Link                                 
  🔄 Multi-Device Support    
     Much More         
  ⚡ 24/7 Uptime                      
                                       
  💰 *PRICING:*                       
  📅 RS. 999     
                                       
 📞 *To Buy, Contact Owner:*         
  +923490916663                       
                                                                         
  ⚡ *THIS IS v1.0 (FREE)*            
  16 Commands | 4 Pranks              
  Anti-Call | Status Faker            
                                       
 ⚡ POWERED BY ATHEX & ALTHEA ⚡     
                                       
`;

        await sock.sendMessage(chatId, { text: aboutText });
    }
};