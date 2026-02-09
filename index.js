/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌟 YOUSAF-PAIRING-V1 - THE ELITE PAIRING ENGINE 🌟
 * ═══════════════════════════════════════════════════════════════════════════════
 * 👨‍💻 DEVELOPER: MUHAMMAD YOUSAF BALOCH
 * 📱 WHATSAPP: +923710636110
 * 📺 YOUTUBE: https://www.youtube.com/@Yousaf_Baloch_Tech
 * 🎵 TIKTOK: https://tiktok.com/@loser_boy.110
 * 📢 WHATSAPP CHANNEL: https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
 * 🔗 GITHUB: https://github.com/musakhanbaloch03-sad/YOUSAF-PAIRING-V1
 * ═══════════════════════════════════════════════════════════════════════════════
 * @description This file is the core of YOUSAF-PAIRING-V1, designed for 
 * high-performance WhatsApp MD bot pairing. All rights reserved.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import pkg from '@whiskeysockets/baileys';
const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    Browsers,
    delay
} = pkg;
import pino from 'pino';
import { Boom } from '@hapi/boom';

// PATH CONFIGURATION
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

/** * PROFESSIONAL MIDDLEWARE 
 * Handling CORS and JSON Parsing for high-speed requests
 */
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static('public'));

// GLOBAL OWNER DATA (PROTECTED)
const YOUSAF_OWNER_INFO = Object.freeze({
    NAME: "Yousuf Baloch",
    FULL_NAME: "Muhammad Yousaf Baloch",
    CONTACT: "+923710636110",
    YOUTUBE: "https://www.youtube.com/@Yousaf_Baloch_Tech",
    TIKTOK: "https://tiktok.com/@loser_boy.110",
    CHANNEL: "https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j",
    PROJECT: "YOUSAF-PAIRING-V1"
});

/**
 * 🎨 PRESET CONSOLE COLORS FOR LOGGING
 */
const COLORS = {
    CYAN: '\x1b[36m',
    GREEN: '\x1b[32m',
    GOLD: '\x1b[33m',
    MAGENTA: '\x1b[35m',
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m'
};

/**
 * 🚀 PROFESSIONAL PAIRING ENGINE START
 * This function handles the complex logic of Baileys pairing.
 */
async function startYousafPairing(phoneNumber, res) {
    const authId = `session_${Math.random().toString(36).substring(7)}`;
    const authDir = path.join(__dirname, 'sessions', authId);
    
    if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS("Desktop"), 
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log(`${COLORS.GREEN}${COLORS.BOLD}✨ [${YOUSAF_OWNER_INFO.PROJECT}] SUCCESSFUL CONNECTION!${COLORS.RESET}`);
            await delay(5000);
            
            const credsFile = path.join(authDir, 'creds.json');
            const sessionData = fs.readFileSync(credsFile, 'utf-8');
            const sessionId = Buffer.from(sessionData).toString('base64');

            const pairingMsg = `
╔══════════════════════════════════════╗
║   🌟 YOUSAF-PAIRING-V1 CONNECTED 🌟   ║
╚══════════════════════════════════════╝
👤 OWNER: ${YOUSAF_OWNER_INFO.FULL_NAME}
🔐 SESSION ID: 
\`\`\`${sessionId}\`\`\`
📺 YOUTUBE: ${YOUSAF_OWNER_INFO.YOUTUBE}
📢 CHANNEL: ${YOUSAF_OWNER_INFO.CHANNEL}
🎵 TIKTOK: ${YOUSAF_OWNER_INFO.TIKTOK}
            `;
            
            await sock.sendMessage(sock.user.id, { text: pairingMsg.trim() });
            
            // Cleanup session folder after successful pairing
            setTimeout(() => {
                try {
                    sock.logout();
                    if (fs.existsSync(authDir)) fs.rmSync(authDir, { recursive: true, force: true });
                } catch (e) { console.error("Cleanup error"); }
            }, 5000);
        }

        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== 401) { 
                // Auto-reconnect logic can be added here if needed
            }
        }
    });

    if (!state.creds.registered) {
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        await delay(3000); 
        try {
            const code = await sock.requestPairingCode(cleanNumber);
            if (!res.headersSent) {
                res.json({ success: true, code });
            }
        } catch (err) {
            if (!res.headersSent) res.status(500).json({ success: false, error: "Pairing code request failed" });
        }
    }
}

/** * 🌐 API ROUTES & ENDPOINTS 
 */

// Route to get Pairing Code
app.post('/get-code', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: "Phone number is required." });
    await startYousafPairing(phoneNumber, res);
});

// Root Page Display
app.get('/', (req, res) => {
    res.send(`
        <div style="background:#000; color:#0ff; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif;">
            <h1 style="border-bottom: 2px solid #f0f; padding-bottom:10px;">🌟 ${YOUSAF_OWNER_INFO.PROJECT} 🌟</h1>
            <p style="color:#fff;">Service is Online and Running Professionally.</p>
            <p style="color:#f0f; font-weight:bold;">Developer: ${YOUSAF_OWNER_INFO.FULL_NAME}</p>
        </div>
    `);
});

/**
 * 🚀 SERVER INITIALIZATION
 */
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
${COLORS.MAGENTA}╔══════════════════════════════════════════════════════════════╗
${COLORS.GOLD}   🚀 SERVER RUNNING ON PORT: ${PORT}
${COLORS.CYAN}   👨‍💻 DEVELOPER: ${YOUSAF_OWNER_INFO.FULL_NAME}
${COLORS.GOLD}   📱 WHATSAPP: ${YOUSAF_OWNER_INFO.CONTACT}
${COLORS.MAGENTA}╚══════════════════════════════════════════════════════════════╝${COLORS.RESET}
    `);
});
