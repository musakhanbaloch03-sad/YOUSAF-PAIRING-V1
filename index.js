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
 * * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
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

// 🛠️ DYNAMIC IMPORT FOR CORS TO PREVENT CRASH
let cors;
try {
    const corsModule = await import('cors');
    cors = corsModule.default;
} catch (e) {
    console.log("⚠️ CORS package not found, using fallback.");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// 🛡️ SECURITY & CONFIGURATION
if (cors) app.use(cors()); 
app.use(express.json());
app.use(express.static('public'));

// 🔒 OWNER INFORMATION
const YOUSAF_BALOCH = Object.freeze({
    NAME: "Yousuf Baloch",
    FULL_NAME: "Muhammad Yousaf Baloch",
    WHATSAPP_NUMBER: "923710636110",
    YOUTUBE: "https://www.youtube.com/@Yousaf_Baloch_Tech",
    TIKTOK: "https://tiktok.com/@loser_boy.110",
    WHATSAPP_CHANNEL: "https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j",
    BOT_NAME: "YOUSAF-BALOCH-MD",
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
            
            setTimeout(() => {
                try {
                    sock.logout();
                    if (fs.existsSync(authDir)) fs.rmSync(authDir, { recursive: true, force: true });
                } catch (e) {}
            }, 5000);
        }
    });

    if (!state.creds.registered) {
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        await delay(3500); // Stabilize connection
        try {
            const code = await sock.requestPairingCode(cleanNumber);
            if (!res.headersSent) {
                res.json({ success: true, code });
            }
        } catch (err) {
            if (!res.headersSent) res.status(500).json({ success: false, error: "Pairing failed" });
        }
    }
}

// 🌐 API ROUTES
app.post('/get-code', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: "Number required" });
    await startPairing(phoneNumber, res);
});

app.get('/', (req, res) => {
    res.send(`<body style="background:#000;color:#0ff;text-align:center;padding-top:100px;font-family:sans-serif;">
        <h1>🌟 ${YOUSAF_BALOCH.BOT_NAME} 🌟</h1>
        <p>Service is Live and Professional.</p>
        <p style="color:#f0f;">Developer: ${YOUSAF_BALOCH.FULL_NAME}</p>
    </body>`);
});

app.listen(PORT, '0.0.0.0', () => {
    ultraLog(`🚀 SERVER RUNNING ON PORT: ${PORT}`, "success");
});
