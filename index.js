import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import Pino from 'pino';
import { sendSuccessMessages } from './session_success.js'; 
import pkg from '@whiskeysockets/baileys';

const { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    DisconnectReason, 
    delay, 
    makeCacheableSignalKeyStore 
} = pkg;

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

// Store active sessions
const activeSessions = new Map();

/**
 * 🔐 Connection Handler with Auto Session Send
 */
async function handleConnection(sock, saveCreds, phoneNumber, sessionPath) {
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
            console.log('\x1b[32m✅ Connected successfully for: %s\x1b[0m', phoneNumber);
            
            try {
                // Professional Session Success Handler
                await sendSuccessMessages(sock, sessionPath);
                console.log('\x1b[35m📤 Session Success Message Sent! ✅\x1b[0m');
            } catch (err) {
                console.log('\x1b[31m❌ Failed to send session: %s\x1b[0m', err.message);
            }
        }
        
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('\x1b[33m⚠️ Connection closed, reconnecting for: %s\x1b[0m', phoneNumber);
            }
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
}

/**
 * 🔐 Pairing Code Generation Endpoint
 */
async function generatePairingCode(req, res) {
    const { number, phone } = req.body;
    const userNumber = (number || phone)?.replace(/[^0-9]/g, '');
    
    if (!userNumber) {
        return res.json({ error: 'Valid phone number is required', success: false });
    }
    
    try {
        const uniqueSessionName = `session_${userNumber}`;
        const sessionPath = path.join(__dirname, config.sessionPath, uniqueSessionName);
        
        if (!existsSync(sessionPath)) {
            mkdirSync(sessionPath, { recursive: true });
        }
        
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();
        
        const sock = makeWASocket({
            version,
            logger: Pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'silent' }))
            }
        });
        
        activeSessions.set(uniqueSessionName, { 
            sock, 
            userNumber: userNumber,
            createdAt: new Date()
        });
        
        if (!sock.authState.creds.registered) {
            await delay(1500);
            const code = await sock.requestPairingCode(userNumber);
            const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
            
            handleConnection(sock, saveCreds, userNumber, sessionPath);
            
            res.json({ 
                code: formattedCode,
                success: true,
                owner: OWNER.name
            });
        }
    } catch (error) {
        res.json({ error: 'Pairing failed. Try again.', success: false });
    }
}

app.post('/code', generatePairingCode);
app.post('/pairing', generatePairingCode);

app.get('/', (req, res) => {
    res.send(`<h1>YOUSAF-BALOCH-MD Pairing Service Active ✅</h1><p>Created by ${OWNER.name}</p>`);
});

const PORT = config.port;
app.listen(PORT, () => {
    console.log('\x1b[32m🚀 Server is live on Port: %d\x1b[0m', PORT);
});
