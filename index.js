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
import cors from 'cors'; // Added back to fix "Server connection failed"
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

// ═══════════════════════════════════════════════════════════════════════════════
// 🛠️ ES MODULES PATH FIXING
// ═══════════════════════════════════════════════════════════════════════════════
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// 🛡️ SECURITY & MIDDLEWARE
app.use(cors()); 
app.use(express.json());
app.use(express.static('public'));

const activeSessions = new Map();

// ═══════════════════════════════════════════════════════════════════════════════
// 🔒 YOUSAF BALOCH - HARDCODED OWNER INFORMATION (LOCKED)
// ═══════════════════════════════════════════════════════════════════════════════
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

// 🎨 ULTRA PRO PREMIUM COLORS FOR TERMINAL
const ULTRA_PRO_COLORS = {
    RESET: '\x1b[0m',
    BRIGHT: '\x1b[1m',
    DEEP_RED: '\x1b[38;5;196m',
    DEEP_GREEN: '\x1b[38;5;46m',
    DEEP_BLUE: '\x1b[38;5;33m',
    DEEP_YELLOW: '\x1b[38;5;226m',
    DEEP_MAGENTA: '\x1b[38;5;201m',
    DEEP_CYAN: '\x1b[38;5;51m',
    GOLD: '\x1b[38;5;220m',
    DIAMOND: '\x1b[38;5;231m'
};

function ultraProLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const styles = {
        info: { icon: '📘', color: ULTRA_PRO_COLORS.DEEP_CYAN },
        success: { icon: '✨', color: ULTRA_PRO_COLORS.DEEP_GREEN },
        error: { icon: '❌', color: ULTRA_PRO_COLORS.DEEP_RED },
        premium: { icon: '💎', color: ULTRA_PRO_COLORS.DEEP_MAGENTA },
        ultra: { icon: '🌟', color: ULTRA_PRO_COLORS.GOLD }
    };
    const style = styles[type] || styles.info;
    console.log(`${style.color}${ULTRA_PRO_COLORS.BRIGHT}${style.icon} [${timestamp}] ${message}${ULTRA_PRO_COLORS.RESET}`);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💎 SEND PREMIUM SUCCESS MESSAGE + SESSION ID
 * ═══════════════════════════════════════════════════════════════════════════════
 */
async function sendUltraProSessionMessage(sock, sessionId) {
    try {
        const userJid = sock.user.id;
        const premiumMessage = `
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     ✨ YOUSAF-BALOCH-MD CONNECTED SUCCESSFULLY! ✨            ║
║              💎 ULTRA PRO PREMIUM EDITION 💎                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

👑 *OWNER:* ${YOUSAF_BALOCH.FULL_NAME}
📱 *WHATSAPP:* +${YOUSAF_BALOCH.WHATSAPP_NUMBER}

🔐 *YOUR SESSION ID:*
\`\`\`${sessionId}\`\`\`

════════════════════════════════════════════════════════════════
🌐 *SOCIAL LINKS*
════════════════════════════════════════════════════════════════
📺 YouTube: ${YOUSAF_BALOCH.YOUTUBE}
🎵 TikTok: ${YOUSAF_BALOCH.TIKTOK}
📢 Channel: ${YOUSAF_BALOCH.WHATSAPP_CHANNEL}
🔗 GitHub: ${YOUSAF_BALOCH.MAIN_BOT_REPO}

🚀 *DEPLOY ON:* Heroku, Railway, Render, Koyeb, VPS.
© ${new Date().getFullYear()} ${YOUSAF_BALOCH.BOT_NAME} - All Rights Reserved
        `.trim();

        await sock.sendMessage(userJid, { text: premiumMessage });
        
        if (YOUSAF_BALOCH.LOGO) {
            await sock.sendMessage(userJid, {
                image: { url: YOUSAF_BALOCH.LOGO },
                caption: `🌟 ${YOUSAF_BALOCH.BOT_NAME} - Professional Edition 🌟`
            });
        }
        ultraProLog(`✅ Session Delivered to ${userJid}`, 'success');
        return true;
    } catch (error) {
        ultraProLog(`❌ Error sending message: ${error.message}`, 'error');
        return false;
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 START UNIVERSAL PAIRING SESSION
 * ═══════════════════════════════════════════════════════════════════════════════
 */
async function startUniversalPairingSession(phoneNumber, sessionId) {
    const authDir = `./tmp/auth_${sessionId}`;
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true });

    try {
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: Browsers.ubuntu('Chrome'), // Fix for Koyeb Stability
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 0,
            keepAliveIntervalMs: 10000
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open') {
                ultraProLog(`✨ CONNECTION ESTABLISHED!`, 'success');
                await delay(5000);
                
                const credentialsData = fs.readFileSync(path.join(authDir, 'creds.json'), 'utf-8');
                const base64SessionId = Buffer.from(credentialsData).toString('base64');
                
                await sendUltraProSessionMessage(sock, base64SessionId);
                
                setTimeout(async () => {
                    try {
                        await sock.logout();
                        if (fs.existsSync(authDir)) fs.rmSync(authDir, { recursive: true, force: true });
                    } catch (e) {}
                    activeSessions.delete(sessionId);
                }, 10000);
            }
            
            if (connection === 'close') {
                const statusCode = (lastDisconnect?.error instanceof Boom) ? lastDisconnect.error.output.statusCode : 0;
                ultraProLog(`🔌 Connection closed - Code: ${statusCode}`, 'error');
                activeSessions.delete(sessionId);
            }
        });

        if (!state.creds.registered) {
            const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
            ultraProLog(`📱 Requesting code for: ${cleanNumber}`, 'premium');
            
            // 428 CONNECTION CLOSED FIX: Small delay before requesting code
            await delay(5000); 
            
            try {
                const code = await sock.requestPairingCode(cleanNumber);
                const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
                ultraProLog(`🔑 PAIRING CODE: ${formattedCode}`, 'ultra');
                
                activeSessions.set(sessionId, { sock, phoneNumber, code: formattedCode });
                return { success: true, code: formattedCode };
            } catch (err) {
                ultraProLog(`Retry Pairing... ${err.message}`, 'error');
                await delay(3000);
                const code = await sock.requestPairingCode(cleanNumber);
                return { success: true, code };
            }
        }
    } catch (error) {
        ultraProLog(`❌ PAIRING ERROR: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌐 API ENDPOINTS
 * ═══════════════════════════════════════════════════════════════════════════════
 */
app.post('/get-code', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) return res.status(400).json({ success: false, error: 'Number Required' });
        
        const sId = `session_${Date.now()}`;
        const result = await startUniversalPairingSession(phoneNumber, sId);
        
        if (result.success) {
            res.json({ success: true, code: result.code, owner: YOUSAF_BALOCH.NAME });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html');
    res.send(`<body style="background:#000;color:#ff00ff;text-align:center;padding-top:100px;font-family:sans-serif;"><h1>🌟 ${YOUSAF_BALOCH.BOT_NAME} ULTRA PRO ONLINE 🌟</h1><p style="color:#0ff;">Developer: Muhammad Yousaf Baloch</p></body>`);
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎬 START SERVER
 * ═══════════════════════════════════════════════════════════════════════════════
 */
app.listen(PORT, '0.0.0.0', () => {
    console.clear();
    console.log(ULTRA_PRO_COLORS.DEEP_MAGENTA + ULTRA_PRO_COLORS.BRIGHT + '╔══════════════════════════════════════════════════════════════════╗' + ULTRA_PRO_COLORS.RESET);
    console.log(ULTRA_PRO_COLORS.GOLD + ULTRA_PRO_COLORS.BRIGHT + '║        🌟 YOUSAF-BALOCH-MD PAIRING SERVICE V2.0 🌟              ║' + ULTRA_PRO_COLORS.RESET);
    console.log(ULTRA_PRO_COLORS.DIAMOND + ULTRA_PRO_COLORS.BRIGHT + '║            💎 ULTRA PRO PREMIUM EDITION 💎                       ║' + ULTRA_PRO_COLORS.RESET);
    console.log(ULTRA_PRO_COLORS.DEEP_MAGENTA + ULTRA_PRO_COLORS.BRIGHT + '╚══════════════════════════════════════════════════════════════════╝' + ULTRA_PRO_COLORS.RESET);
    console.log('');
    ultraProLog(`🚀 SERVER ONLINE ON PORT: ${PORT}`, 'success');
    ultraProLog(`👨‍💻 Owner: ${YOUSAF_BALOCH.FULL_NAME}`, 'premium');
    ultraProLog(`📱 WhatsApp: +${YOUSAF_BALOCH.WHATSAPP_NUMBER}`, 'info');
    ultraProLog(`📺 YouTube: ${YOUSAF_BALOCH.YOUTUBE}`, 'info');
    ultraProLog(`🎵 TikTok: ${YOUSAF_BALOCH.TIKTOK}`, 'info');
});

process.on('uncaughtException', (err) => ultraProLog(`Critical: ${err.message}`, 'error'));
