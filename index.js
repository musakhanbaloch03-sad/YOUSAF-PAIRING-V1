/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌟 YOUSAF-BALOCH-MD ULTRA PRO PREMIUM PAIRING SERVICE V2.0 🌟
 * ═══════════════════════════════════════════════════════════════════════════════
 * * 👨‍💻 Developer: Muhammad Yousaf Baloch
 * 📱 WhatsApp: +923710636110
 * 📺 YouTube: https://www.youtube.com/@Yousaf_Baloch_Tech
 * 🎵 TikTok: https://tiktok.com/@loser_boy.110
 * 📢 WhatsApp Channel: https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
 * 🔗 GitHub Main Bot: https://github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD
 * 🔗 GitHub Pairing: https://github.com/musakhanbaloch03-sad/YOUSAF-PAIRING-V1
 * * ═══════════════════════════════════════════════════════════════════════════════
 * 💎 ULTRA PRO PREMIUM QUALITY - PROFESSIONAL EDITION 💎
 * ═══════════════════════════════════════════════════════════════════════════════
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
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers,
    delay
} = pkg;
import pino from 'pino';
import { Boom } from '@hapi/boom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// 🛡️ SECURITY & CONFIGURATION
app.use(cors()); 
app.use(express.json());
app.use(express.static('public'));

// 🔒 OWNER INFORMATION (LOCKED)
const YOUSAF_BALOCH = Object.freeze({
    NAME: "Yousuf Baloch",
    FULL_NAME: "Muhammad Yousaf Baloch",
    WHATSAPP_NUMBER: "923710636110",
    YOUTUBE: "https://www.youtube.com/@Yousaf_Baloch_Tech",
    TIKTOK: "https://tiktok.com/@loser_boy.110",
    WHATSAPP_CHANNEL: "https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j",
    GITHUB_PROFILE: "https://github.com/musakhanbaloch03-sad",
    MAIN_BOT_REPO: "https://github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD",
    PAIRING_REPO: "https://github.com/musakhanbaloch03-sad/YOUSAF-PAIRING-V1",
    BOT_NAME: "YOUSAF-BALOCH-MD",
    VERSION: "2.0.0",
    LOGO: "https://i.ibb.co/YDx8tFb/yousaf-baloch-md-logo.png"
});

// 🎨 PREMIUM COLORS
const COLORS = {
    CYAN: '\x1b[38;5;51m',
    GREEN: '\x1b[38;5;46m',
    RED: '\x1b[38;5;196m',
    MAGENTA: '\x1b[38;5;201m',
    GOLD: '\x1b[38;5;220m',
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m'
};

function ultraLog(msg, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const color = type === 'success' ? COLORS.GREEN : type === 'error' ? COLORS.RED : COLORS.CYAN;
    console.log(`${color}${COLORS.BOLD}[${time}] ${msg}${COLORS.RESET}`);
}

/**
 * 🚀 START PAIRING ENGINE
 */
async function startPairing(phoneNumber, res) {
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
        // 🛠️ CRITICAL FIX: Chrome Browser allows WhatsApp to accept the code instantly
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
        connectTimeoutMs: 60000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            ultraLog("✨ YOUSAF-BALOCH-MD CONNECTED!", "success");
            await delay(5000);
            
            const credsFile = path.join(authDir, 'creds.json');
            const sessionData = fs.readFileSync(credsFile, 'utf-8');
            const sessionId = Buffer.from(sessionData).toString('base64');

            // Constructing Professional Message
            const msg = `
╔══════════════════════════════════════╗
║   🌟 YOUSAF-BALOCH-MD CONNECTED! 🌟   ║
╚══════════════════════════════════════╝
👑 Owner: ${YOUSAF_BALOCH.FULL_NAME}
🔐 Session ID: 
\`\`\`${sessionId}\`\`\`
📺 YT: ${YOUSAF_BALOCH.YOUTUBE}
📢 Channel: ${YOUSAF_BALOCH.WHATSAPP_CHANNEL}
            `;
            
            await sock.sendMessage(sock.user.id, { text: msg.trim() });
            ultraLog("🔐 Session ID sent to WhatsApp!", "success");

            setTimeout(() => {
                sock.logout();
                fs.rmSync(authDir, { recursive: true, force: true });
            }, 5000);
        }

        if (connection === 'close') {
            const code = (lastDisconnect?.error instanceof Boom) ? lastDisconnect.error.output.statusCode : 0;
            if (code !== DisconnectReason.loggedOut) {
                ultraLog("🔌 Connection Closed. Retrying...", "error");
            }
        }
    });

    if (!state.creds.registered) {
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        // 🛠️ FIX: Proper delay before requesting code to avoid "Connection Closed"
        await delay(3000);
        try {
            const code = await sock.requestPairingCode(cleanNumber);
            ultraLog(`🔑 Code Generated: ${code}`, "success");
            if (!res.headersSent) {
                res.json({ success: true, code, owner: YOUSAF_BALOCH.NAME });
            }
        } catch (err) {
            ultraLog(`❌ Pairing Error: ${err.message}`, "error");
            if (!res.headersSent) res.status(500).json({ success: false, error: "Failed to generate code" });
        }
    }
}

// 🌐 API ROUTES
app.post('/get-code', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: "Phone number is required" });
    await startPairing(phoneNumber, res);
});

app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html');
    res.send(`<body style="background:#000;color:#0ff;text-align:center;font-family:sans-serif;padding-top:100px;">
        <h1>🌟 ${YOUSAF_BALOCH.BOT_NAME} 🌟</h1>
        <p>Ultra Pro Pairing Service is Running...</p>
        <p style="color:#ff00ff;">Owner: ${YOUSAF_BALOCH.NAME}</p>
    </body>`);
});

// 🎬 INITIALIZE SERVER
app.listen(PORT, '0.0.0.0', () => {
    console.clear();
    console.log(`${COLORS.MAGENTA}${COLORS.BOLD}╔══════════════════════════════════════════════════════════════════╗${COLORS.RESET}`);
    console.log(`${COLORS.GOLD}${COLORS.BOLD}║        🌟 YOUSAF-BALOCH-MD PAIRING SERVICE V2.0 🌟              ║${COLORS.RESET}`);
    console.log(`${COLORS.MAGENTA}${COLORS.BOLD}╚══════════════════════════════════════════════════════════════════╝${COLORS.RESET}`);
    ultraLog(`🚀 SERVER RUNNING ON PORT: ${PORT}`, "success");
    ultraLog(`👨‍💻 Developer: ${YOUSAF_BALOCH.FULL_NAME}`, "success");
    ultraLog(`📺 YouTube: ${YOUSAF_BALOCH.YOUTUBE}`, "info");
});

process.on('uncaughtException', (err) => ultraLog(`Fatal: ${err.message}`, "error"));
