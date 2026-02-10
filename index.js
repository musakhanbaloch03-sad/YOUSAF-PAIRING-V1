const express = require('express');
const path = require('path');
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, delay } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const config = require('./config');
const { handleConnection, OWNER } = require('./lib/connection-handler');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Ultra Pro Console Banner
console.clear();
console.log('\x1b[35m╔═══════════════════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[36m║                                                           ║\x1b[0m');
console.log('\x1b[36m║   🤖 YOUSAF-BALOCH-MD PAIRING SERVICE                    ║\x1b[0m');
console.log('\x1b[36m║   Ultra Pro Premium WhatsApp Multi-Device System         ║\x1b[0m');
console.log('\x1b[36m║   Version 2.0 - Professional Edition                     ║\x1b[0m');
console.log('\x1b[36m║                                                           ║\x1b[0m');
console.log('\x1b[35m╚═══════════════════════════════════════════════════════════╝\x1b[0m');
console.log('');
console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
console.log('\x1b[33m👨‍💻 Created by: %s\x1b[0m', OWNER.name);
console.log('\x1b[32m🇵🇰 Country: %s\x1b[0m', OWNER.country);
console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
console.log('\x1b[35m📱 WhatsApp Channel: %s\x1b[0m', OWNER.channel);
console.log('\x1b[31m🎥 YouTube: %s\x1b[0m', OWNER.youtube);
console.log('\x1b[30m🎵 TikTok: %s\x1b[0m', OWNER.tiktok);
console.log('\x1b[34m📞 Phone: %s\x1b[0m', OWNER.phone);
console.log('\x1b[36m🐙 GitHub: %s\x1b[0m', OWNER.github);
console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
console.log('');

// Store active sessions
const activeSessions = new Map();

/**
 * 🔐 Pairing Code Generation Endpoint
 */
app.post('/code', async (req, res) => {
    const { number } = req.body;
    
    if (!number) {
        return res.json({ 
            error: 'Phone number is required',
            success: false 
        });
    }
    
    try {
        console.log('\x1b[33m📱 New pairing request for: %s\x1b[0m', number);
        console.log('\x1b[36m⏰ Time: %s\x1b[0m', new Date().toLocaleString());
        
        const sessionId = `session_${number}_${Date.now()}`;
        const sessionPath = path.join(__dirname, config.sessionPath);
        
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();
        
        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: state,
            browser: [config.botName, 'Chrome', config.version]
        });
        
        activeSessions.set(sessionId, { 
            sock, 
            userNumber: number,
            createdAt: new Date()
        });
        
        if (!sock.authState.creds.registered) {
            let phoneNumber = number.replace(/[^0-9]/g, '');
            
            // Auto-add Pakistan code if not present
            if (!phoneNumber.startsWith('92')) {
                phoneNumber = '92' + phoneNumber.replace(/^0/, '');
            }
            
            await delay(3000);
            
            const code = await sock.requestPairingCode(phoneNumber);
            const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
            
            console.log('\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
            console.log('\x1b[35m✅ Pairing Code Generated: %s\x1b[0m', formattedCode);
            console.log('\x1b[33m📱 For Number: %s\x1b[0m', phoneNumber);
            console.log('\x1b[36m👨‍💻 Owner: %s\x1b[0m', OWNER.name);
            console.log('\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
            
            // Handle connection and auto-send session
            handleConnection(sock, saveCreds, phoneNumber);
            
            res.json({ 
                code: formattedCode,
                success: true,
                message: 'Pairing code generated successfully!',
                owner: OWNER.name,
                version: config.version
            });
            
        } else {
            res.json({ 
                error: 'This number is already registered',
                success: false 
            });
        }
        
    } catch (error) {
        console.log('\x1b[31m❌ Error: %s\x1b[0m', error.message);
        res.json({ 
            error: error.message,
            success: false 
        });
    }
});

/**
 * 🏥 Health Check Endpoint
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: 'active',
        service: 'YOUSAF-BALOCH-MD Pairing Service',
        version: config.version,
        owner: OWNER.name,
        country: OWNER.country,
        activeSessions: activeSessions.size,
        uptime: process.uptime(),
        platforms: config.platforms,
        social: {
            github: OWNER.github,
            whatsapp: OWNER.whatsapp,
            channel: OWNER.channel,
            youtube: OWNER.youtube,
            tiktok: OWNER.tiktok,
            phone: OWNER.phone
        }
    });
});

/**
 * 🏠 Home Endpoint
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * 🧹 Session Cleanup (Every 30 minutes)
 */
setInterval(() => {
    console.log('\x1b[33m🧹 Running session cleanup...\x1b[0m');
    const now = Date.now();
    
    for (const [sessionId, data] of activeSessions.entries()) {
        const age = now - data.createdAt.getTime();
        if (age > 30 * 60 * 1000) {
            activeSessions.delete(sessionId);
            console.log('\x1b[36m🗑️ Cleaned old session: %s\x1b[0m', sessionId);
        }
    }
}, 30 * 60 * 1000);

/**
 * 🚀 Start Server
 */
const PORT = config.port;
app.listen(PORT, () => {
    console.log('\x1b[32m🚀 Server started successfully!\x1b[0m');
    console.log('\x1b[36m🌐 Port: %d\x1b[0m', PORT);
    console.log('\x1b[35m🔗 URL: http://localhost:%d\x1b[0m', PORT);
    console.log('');
    console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
    console.log('\x1b[35m💻 YOUSAF-BALOCH-MD Pairing Service is ACTIVE! ✅\x1b[0m');
    console.log('\x1b[36m👨‍💻 Created by %s from %s\x1b[0m', OWNER.name, OWNER.country);
    console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
    console.log('');
});
