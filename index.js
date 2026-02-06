const express = require('express');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store active connections
let connections = {};

// Config
const config = {
    owner: ['923710636110'],
    botName: 'YOUSAF-BALOCH-MD',
    socialMedia: {
        whatsappChannel: 'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
        youtube: 'https://www.youtube.com/@Yousaf_Baloch_Tech',
        tiktok: 'https://tiktok.com/@loser_boy.110',
        phone: '923710636110'
    }
};

// Welcome Message
console.log(`
╔═══════════════════════════════════╗
║   YOUSAF-BALOCH-MD PAIRING V1    ║
║   WhatsApp Multi-Device System    ║
╚═══════════════════════════════════╝

📱 WhatsApp: ${config.socialMedia.whatsappChannel}
🎥 YouTube: ${config.socialMedia.youtube}
🎵 TikTok: ${config.socialMedia.tiktok}
📞 Phone: ${config.socialMedia.phone}

🇵🇰 Made in Pakistan by MUHAMMAD YOUSAF
🚀 Server starting...
`);

// Route: Get Pairing Code
app.post('/get-pairing-code', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        if (!phoneNumber) {
            return res.json({ success: false, message: 'Phone number required' });
        }

        // Validate phone number
        if (!/^[0-9]{10,15}$/.test(phoneNumber)) {
            return res.json({ success: false, message: 'Invalid phone number format' });
        }

        console.log(`📱 Generating pairing code for: ${phoneNumber}`);

        // Create session
        const { state, saveCreds } = await useMultiFileAuthState(`./session_${phoneNumber}`);
        const { version } = await fetchLatestBaileysVersion();

        const conn = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: state,
            browser: ['YOUSAF-BALOCH-MD', 'Safari', '1.0.0']
        });

        // Generate pairing code
        if (!conn.authState.creds.registered) {
            const code = await conn.requestPairingCode(phoneNumber);
            
            console.log(`✅ Pairing code generated: ${code}`);

            // Store connection
            connections[phoneNumber] = conn;

            // Handle connection updates
            conn.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;
                
                if (connection === 'open') {
                    console.log(`✅ Connected: ${phoneNumber}`);
                }
                
                if (connection === 'close') {
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log(`❌ Connection closed: ${phoneNumber}`);
                    
                    if (shouldReconnect) {
                        console.log('🔄 Reconnecting...');
                    }
                }
            });

            conn.ev.on('creds.update', saveCreds);

            // Format code with hyphen (XXXX-XXXX)
            const formattedCode = code.match(/.{1,4}/g).join('-');

            return res.json({ 
                success: true, 
                code: formattedCode,
                phoneNumber: phoneNumber
            });
        } else {
            return res.json({ success: false, message: 'Number already registered' });
        }

    } catch (error) {
        console.error('❌ Pairing error:', error);
        return res.json({ 
            success: false, 
            message: error.message || 'Failed to generate pairing code' 
        });
    }
});

// Route: Get QR Code
app.get('/get-qr-code', async (req, res) => {
    try {
        console.log('📷 Generating QR code...');

        const sessionId = `qr_${Date.now()}`;
        const { state, saveCreds } = await useMultiFileAuthState(`./session_${sessionId}`);
        const { version } = await fetchLatestBaileysVersion();

        const conn = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: state,
            browser: ['YOUSAF-BALOCH-MD', 'Safari', '1.0.0']
        });

        let qrData = null;

        conn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                qrData = qr;
                console.log('✅ QR Code generated');
            }

            if (connection === 'open') {
                console.log('✅ QR Code scanned successfully');
            }

            if (connection === 'close') {
                console.log('❌ QR Connection closed');
            }
        });

        conn.ev.on('creds.update', saveCreds);

        // Wait for QR code
        await new Promise((resolve) => {
            const interval = setInterval(() => {
                if (qrData) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);

            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(interval);
                resolve();
            }, 10000);
        });

        if (qrData) {
            connections[sessionId] = conn;
            return res.json({ success: true, qr: qrData });
        } else {
            return res.json({ success: false, message: 'QR code generation timeout' });
        }

    } catch (error) {
        console.error('❌ QR error:', error);
        return res.json({ 
            success: false, 
            message: error.message || 'Failed to generate QR code' 
        });
    }
});

// Route: Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'active',
        bot: config.botName,
        creator: 'MUHAMMAD YOUSAF',
        country: 'Pakistan 🇵🇰',
        activeConnections: Object.keys(connections).length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
✅ Server running successfully!
🌐 URL: http://localhost:${PORT}
📱 Open this URL in your browser to get pairing code

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Made with ❤️ by MUHAMMAD YOUSAF
🇵🇰 Proudly Made in Pakistan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});

// Error handling
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
});
