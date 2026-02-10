import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import Pino from 'pino';

const baileys = await import('@whiskeysockets/baileys');
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, delay, makeCacheableSignalKeyStore } = baileys.default || baileys;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔒 CONFIGURATION (Protected Owner Info)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const OWNER = {
    name: 'MUHAMMAD YOUSAF',
    country: 'Pakistan 🇵🇰',
    phone: '923710636110',
    whatsapp: '+923710636110',
    channel: 'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
    youtube: 'https://www.youtube.com/@Yousaf_Baloch_Tech',
    tiktok: 'https://tiktok.com/@loser_boy.110',
    github: 'https://github.com/musakhanbaloch03-sad'
};

const config = {
    botName: 'YOUSAF-BALOCH-MD',
    version: '2.0',
    port: process.env.PORT || 8000,
    sessionPath: 'sessions',
    platforms: ['Heroku', 'Koyeb', 'Railway', 'Render', 'VPS']
};

Object.freeze(OWNER); // Lock owner info

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
 * 🔐 Connection Handler with Auto Session Send
 */
async function handleConnection(sock, saveCreds, phoneNumber) {
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
            console.log('\x1b[32m✅ Connected successfully for: %s\x1b[0m', phoneNumber);
            
            try {
                // Generate Session ID from creds
                const sessionData = JSON.stringify(sock.authState.creds, null, 2);
                const sessionId = Buffer.from(sessionData).toString('base64');
                
                // Format welcome message with session ID
                const message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *YOUSAF-BALOCH-MD CONNECTED*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Your bot is now connected!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *OWNER INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Name: *${OWNER.name}*
• Number: *${OWNER.whatsapp}*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 *SOCIAL MEDIA LINKS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• GitHub: ${OWNER.github}
• YouTube: ${OWNER.youtube}
• TikTok: ${OWNER.tiktok}
• WhatsApp: ${OWNER.channel}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 *YOUR SESSION ID*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Copy the code below for deployment:

\`\`\`${sessionId}\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 *SUPPORTED PLATFORMS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Heroku
• Koyeb  
• Railway
• Render
• VPS/Server

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 *HOW TO DEPLOY*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: ${OWNER.github}/YOUSAF-BALOCH-MD
2. Fork the repository
3. Choose deployment platform
4. Paste SESSION_ID when asked
5. Configure settings
6. Deploy! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *IMPORTANT*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Keep SESSION_ID safe
• Don't share with anyone
• Use environment variable
• If lost, reconnect to get new

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need help? Contact: ${OWNER.whatsapp}

© 2024 YOUSAF-BALOCH-MD`;

                // Send message to user
                await sock.sendMessage(sock.user.id, { text: message });
                
                console.log('\x1b[35m📤 Session ID sent to user: %s\x1b[0m', phoneNumber);
                console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
                
            } catch (err) {
                console.log('\x1b[31m❌ Failed to send session: %s\x1b[0m', err.message);
            }
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('\x1b[31m❌ Connection closed for: %s\x1b[0m', phoneNumber);
            
            if (shouldReconnect) {
                console.log('\x1b[33m⚠️ Reconnecting...\x1b[0m');
            }
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
}

/**
 * 🔐 Pairing Code Generation Endpoint (Dual endpoints for compatibility)
 */
async function generatePairingCode(req, res) {
    const { number, phone } = req.body;
    const userNumber = number || phone;
    
    if (!userNumber) {
        return res.json({ 
            error: 'Phone number is required',
            success: false 
        });
    }
    
    try {
        console.log('\x1b[33m📱 New pairing request for: %s\x1b[0m', userNumber);
        console.log('\x1b[36m⏰ Time: %s\x1b[0m', new Date().toLocaleString());
        
        const sessionId = `session_${userNumber}_${Date.now()}`;
        const sessionPath = path.join(__dirname, config.sessionPath);
        
        // Ensure session directory exists
        if (!existsSync(sessionPath)) {
            mkdirSync(sessionPath, { recursive: true });
        }
        
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();
        
        const sock = makeWASocket({
            version,
            logger: Pino({ level: 'silent' }),
            printQRInTerminal: false,
            mobile: false,
            browser: [config.botName, 'Chrome', config.version],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'silent' }))
            },
            getMessage: async () => ({ conversation: 'Hi' })
        });
        
        activeSessions.set(sessionId, { 
            sock, 
            userNumber: userNumber,
            createdAt: new Date()
        });
        
        if (!sock.authState.creds.registered) {
            let phoneNumber = userNumber.replace(/[^0-9]/g, '');
            
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
}

// Both endpoints for compatibility
app.post('/code', generatePairingCode);
app.post('/pairing', generatePairingCode);

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
    const publicPath = path.join(__dirname, 'public', 'index.html');
    if (existsSync(publicPath)) {
        res.sendFile(publicPath);
    } else {
        res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>YOUSAF-BALOCH-MD Pairing</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial; background: #000; color: #fff; text-align: center; padding: 50px; }
        h1 { color: #00bfff; }
        a { color: #00bfff; text-decoration: none; }
    </style>
</head>
<body>
    <h1>⚡ YOUSAF-BALOCH-MD Pairing Service ⚡</h1>
    <p>Version ${config.version}</p>
    <p>Created by ${OWNER.name}</p>
    <p><a href="/health">Health Check</a></p>
</body>
</html>
        `);
    }
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

// Error handlers
process.on('unhandledRejection', (err) => {
    console.log('\x1b[31m❌ Unhandled Rejection: %s\x1b[0m', err.message);
});

process.on('uncaughtException', (err) => {
    console.log('\x1b[31m❌ Uncaught Exception: %s\x1b[0m', err.message);
});
