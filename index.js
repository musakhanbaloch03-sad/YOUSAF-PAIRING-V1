/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌟 YOUSAF-PAIRING-V1 - OFFICIAL STABLE ENGINE 🌟
 * ═══════════════════════════════════════════════════════════════════════════════
 * 👨‍💻 DEVELOPER: MUHAMMAD YOUSAF BALOCH
 * 📱 WHATSAPP: +923710636110
 * 📺 YOUTUBE: https://www.youtube.com/@Yousaf_Baloch_Tech
 * 🎵 TIKTOK: https://tiktok.com/@loser_boy.110
 * 📢 WHATSAPP CHANNEL: https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
 * 🔗 MAIN REPO: https://github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import pkgBaileys from '@whiskeysockets/baileys';

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    Browsers, 
    delay 
} = pkgBaileys;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 🔒 OFFICIAL OWNER & BRANDING DATA
const YOUSAF_BRAND = Object.freeze({
    NAME: "Muhammad Yousaf Baloch",
    BANNER: "https://raw.githubusercontent.com/musakhanbaloch03-sad/YOUSAF-PAIRING-V1/main/assets/yousaf_banner.png", // Direct Link to your Banner
    MAIN_REPO: "https://github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD",
    YOUTUBE: "https://www.youtube.com/@Yousaf_Baloch_Tech",
    TIKTOK: "https://tiktok.com/@loser_boy.110",
    WA_CHANNEL: "https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j",
    WA_NUMBER: "+923710636110"
});

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
        browser: Browsers.ubuntu("Chrome"),
        connectTimeoutMs: 100000,
        keepAliveIntervalMs: 30000
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;

        if (connection === 'open') {
            await delay(5000);
            const credsFile = path.join(authDir, 'creds.json');
            const sessionData = fs.readFileSync(credsFile, 'utf-8');
            const sessionId = Buffer.from(sessionData).toString('base64');

            // 📩 THE ULTIMATE BRANDED MESSAGE
            const caption = `
╔══════════════════════════════════╗
║  🌟 YOUSAF-BALOCH-MD CONNECTED 🌟  ║
╚══════════════════════════════════╝

👤 *Owner:* ${YOUSAF_BRAND.NAME}
🔐 *Session ID:* \`\`\`${sessionId}\`\`\`

⚠️ *Don't share your Session ID with anyone!*

🚀 *Main Bot Repository:*
${YOUSAF_BRAND.MAIN_REPO}

🔗 *Connect with Us:*
📺 *YouTube:* ${YOUSAF_BRAND.YOUTUBE}
📢 *WA Channel:* ${YOUSAF_BRAND.WA_CHANNEL}
🎵 *TikTok:* ${YOUSAF_BRAND.TIKTOK}

📱 *Dev WhatsApp:* ${YOUSAF_BRAND.WA_NUMBER}

*Powered by Muhammad Yousaf Baloch Tech*
            `;
            
            // Send Image + Caption to the user
            await sock.sendMessage(sock.user.id, { 
                image: { url: "https://i.ibb.co/YDxBtFb/yousaf-baloch-md-logo.png" }, // Using a secure host for your image
                caption: caption.trim() 
            });
            
            setTimeout(() => {
                try {
                    sock.logout();
                    if (fs.existsSync(authDir)) fs.rmSync(authDir, { recursive: true, force: true });
                } catch (e) { }
            }, 8000);
        }
    });

    if (!state.creds.registered) {
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        await delay(5000); 
        try {
            const code = await sock.requestPairingCode(cleanNumber);
            if (!res.headersSent) res.json({ success: true, code });
        } catch (err) {
            if (!res.headersSent) res.status(500).json({ error: "Pairing Limit Reached. Try again." });
        }
    }
}

app.post('/get-code', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: "Number required" });
    await startPairing(phoneNumber, res);
});

app.get('/', (req, res) => {
    res.send(`<body style="background:#000;color:#0ff;text-align:center;padding-top:100px;font-family:sans-serif;">
        <h1>🌟 ${YOUSAF_BRAND.NAME} 🌟</h1>
        <p>YOUSAF-PAIRING-V1 Engine is Online.</p>
        <p>Official Repo: <a href="${YOUSAF_BRAND.MAIN_REPO}" style="color:#f0f;">YOUSAF-BALOCH-MD</a></p>
    </body>`);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ENGINE RUNNING ON PORT: ${PORT}`);
});
