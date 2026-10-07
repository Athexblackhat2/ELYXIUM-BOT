 
// 📞 ELYXIUM BOT v1.0 - CALL DETECTOR
// ⚡ Powered by ATHEX & ALTHEA
 

const config = require('../config.json');
const { getOwnerData } = require('../middleware/ownerCheck');

 
// 🚫 ANTI-CALL REPLY MESSAGE
 
const antiCallMessage = `
 
    🚫  CALL DECLINED  🚫        
                                  
   YOU CAN'T CALL THIS           
   PERSON BECAUSE HE'S           
   USING ELYXIUM BOT             
                                  
   ⚡ POWERED BY ⚡             
   ATHEX & ALTHEA               
                                  
 
`;

 
// 📞 CALL HANDLER
 
const callHandler = async (sock, call) => {
    try {
        const { id, from, status } = call;
        
        // Only handle incoming calls
        if (status === 'offer') {
            const ownerData = getOwnerData(from);
            
            // Check if anti-call is enabled for this user
            if (ownerData && ownerData.features && ownerData.features.antiCall) {
                
                console.log(`📞 Incoming call from: ${from}`);
                console.log(`🚫 Anti-Call Active - Declining...`);
                
                // Reject the call immediately
                await sock.rejectCall(id, from);
                
                // Send the ATHEX & ALTHEA warning message
                await sock.sendMessage(from, {
                    text: antiCallMessage
                });
                
                console.log(`✅ Call Declined + Warning Sent to: ${from}`);
                
            } else if (!ownerData && config.features.antiCall.enabled) {
                // Not registered but global anti-call is ON
                
                console.log(`📞 Unknown caller: ${from}`);
                console.log(`🚫 Global Anti-Call - Declining...`);
                
                // Reject the call
                await sock.rejectCall(id, from);
                
                // Send warning
                await sock.sendMessage(from, {
                    text: antiCallMessage
                });
                
                console.log(`✅ Unknown Call Declined: ${from}`);
            }
        }
        
        // Handle call accepted (optional: you can also block answering)
        if (status === 'accept') {
            console.log(`📞 Call accepted by: ${from}`);
            // Optionally end the call if you want to be strict
            // await sock.rejectCall(id, from);
        }
        
    } catch (error) {
        console.error('❌ Call Handler Error:', error);
    }
};

 
// 🔌 EVENT EXECUTE
 
const execute = (sock, config) => {
    // Listen for call events
    sock.ev.on('call', async (calls) => {
        // Handle each call
        for (const call of calls) {
            await callHandler(sock, call);
        }
    });
    
    console.log('📞 Call Detector Ready!');
    console.log('🚫 Anti-Call Shield: ACTIVE');
    console.log('⚡ ATHEX & ALTHEA Protection: ENABLED\n');
};

 
// 📤 EXPORTS
 
module.exports = { execute };

 
// ⚡ ELYXIUM BOT v1.0 - Call Shield Ready!
// ⚡ Powered by ATHEX & ALTHEA
 