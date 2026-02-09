/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌟 YOUSAF-BALOCH-MD ULTRA PRO PREMIUM PAIRING SERVICE V2.0 🌟
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors'; // 🛠️ اصلی حل: CORS کو لازمی شامل کرنا ہے تاکہ کنکشن فیل نہ ہو
import { fileURLToPath } from 'url';
import pkg from '@whiskeysockets/baileys';
const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    delay
} = pkg;
import pino from 'pino';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// 🛡️ MIDDLEWARE (یہ "Server Connection Failed" کو روکے گا)
app.use(cors()); 
app.use(express.json());
app.use(express.static('public'));

// 🔒 OWNER INFORMATION
const YOUSAF_BALOCH = {
    NAME: "Yousuf Baloch",
    FULL_NAME: "Muhammad Yousaf Baloch",
    WHATSAPP_NUMBER: "923710636110",
    YOUTUBE: "https://www.youtube.com/@Yousaf_Baloch_Tech",
    TIKTOK: "https://tiktok.com/@loser_boy.110",
    WHATSAPP_CHANNEL: "https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j"
};

const ultraLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    console.log(`\x1b[32m[${time}] 🚀 ${msg}\x1b[0m`);
};

/**
 * 🚀 PAIRING ENGINE
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
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"], // 🛠️ FIX: WhatsApp Linkage Fix
        connectTimeoutMs: 60000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            const credsFile = path.join(authDir, 'creds.json');
            const sessionData = fs.readFileSync(credsFile, 'utf-8');
            const sessionId = Buffer.from(sessionData).toString('base64');

            const msg = `🌟 *YOUSAF-BALOCH-MD CONNECTED!* 🌟\n\n🔐 *ID:* ${sessionId}\n👑 *Owner:* ${YOUSAF_BALOCH.FULL_NAME}`;
            await sock.sendMessage(sock.user.id, { text: msg });

            setTimeout(() => {
                try { sock.logout(); fs.rmSync(authDir, { recursive: true }); } catch (e) {}
            }, 5000);
        }
    });

    if (!state.creds.registered) {
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        await delay(5000); // 🛠️ FIX: 428 Connection Closed Fix
        try {
            const code = await sock.requestPairingCode(cleanNumber);
            if (!res.headersSent) res.json({ success: true, code });
        } catch (err) {
            if (!res.headersSent) res.status(500).json({ success: false, error: "Try again later" });
        }
    }
}

// 🌐 API ROUTES
app.post('/get-code', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: "Number Required" });
    await startPairing(phoneNumber, res);
});

app.get('/', (req, res) => {
    res.send(`<h1 style="text-align:center;">🌟 YOUSAF-BALOCH-MD PAIRING 🌟</h1>`);
});

app.listen(PORT, '0.0.0.0', () => {
    ultraLog(`SERVER RUNNING ON PORT: ${PORT}`, "success");
});
