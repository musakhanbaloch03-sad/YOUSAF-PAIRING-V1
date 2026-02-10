// ╔══════════════════════════════════════════════════════════════╗
// ║        YOUSAF-BALOCH-MD  •  SESSION SUCCESS HANDLER         ║
// ║               Created by Muhammad Yousaf Baloch             ║
// ║  📍 Location: YOUSAF-PAIRING-V1/session_success.js (root)  ║
// ╚══════════════════════════════════════════════════════════════╝

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────────────────────
// 🔒  HARDCODED OWNER INFO — FROZEN, CANNOT BE CHANGED BY USER
// ─────────────────────────────────────────────────────────────
const OWNER = Object.freeze({
    NAME         : 'Muhammad Yousaf Baloch',
    NUMBER       : '923710636110',
    TIKTOK       : 'https://tiktok.com/@loser_boy.110',
    YOUTUBE      : 'https://www.youtube.com/@Yousaf_Baloch_Tech',
    WA_CHANNEL   : 'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
    GITHUB       : 'https://github.com/musakhanbaloch03-sad',
    MAIN_REPO    : 'https://github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD',
    PAIRING_REPO : 'https://github.com/musakhanbaloch03-sad/YOUSAF-PAIRING-V1',
});

// ─────────────────────────────────────────────────────────────
// ⏱️  DELAY UTILITY
// ─────────────────────────────────────────────────────────────
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────
// 🔑  READ SESSION ID FROM CREDS FILE
// ─────────────────────────────────────────────────────────────
async function getSessionId(sessionPath) {
    try {
        const credsFile = path.join(sessionPath, 'creds.json');
        if (!fs.existsSync(credsFile)) return 'SESSION_NOT_READY_YET';
        const raw = fs.readFileSync(credsFile, 'utf-8');
        const b64 = Buffer.from(raw).toString('base64');
        return `YOUSAF;${b64}`;
    } catch (e) {
        console.error('\x1b[31m❌ Session read error: %s\x1b[0m', e.message);
        return 'SESSION_READ_ERROR';
    }
}

// ─────────────────────────────────────────────────────────────
// 📋  BUILD SUCCESS MESSAGE
// ─────────────────────────────────────────────────────────────
function buildMessage(sessionId) {
    return `╔════════════════════════════════════╗
║  ✅  BOT CONNECTED SUCCESSFULLY  ✅  ║
╚════════════════════════════════════╝

🎉 *YOUSAF BALOCH MD* is now live!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 *YOUR SESSION ID*
_Save this — required for deployment!_
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

\`\`\`${sessionId}\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 *DEPLOY YOUR BOT — ALL PLATFORMS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 ${OWNER.MAIN_REPO}

▸ Heroku  ▸ Render  ▸ Railway
▸ Koyeb   ▸ Replit  ▸ VPS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍💻 *DEVELOPER*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 *Name:*    ${OWNER.NAME}
📞 *Contact:* wa.me/${OWNER.NUMBER}
🐙 *GitHub:*  ${OWNER.GITHUB}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 *FOLLOW & SUPPORT*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📺 *YouTube:*
${OWNER.YOUTUBE}

🎵 *TikTok:*
${OWNER.TIKTOK}

📢 *WhatsApp Channel:*
${OWNER.WA_CHANNEL}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ _Star the repo · Subscribe · Follow_
_Made with ❤️ by ${OWNER.NAME}_`;
}

// ─────────────────────────────────────────────────────────────
// 👤  BUILD OWNER VCARD
// ─────────────────────────────────────────────────────────────
function buildVCard() {
    return `BEGIN:VCARD
VERSION:3.0
FN:${OWNER.NAME}
ORG:YOUSAF BALOCH MD - Bot Developer
TEL;type=CELL;type=VOICE;waid=${OWNER.NUMBER}:+${OWNER.NUMBER}
URL:${OWNER.GITHUB}
NOTE:Creator of YOUSAF-BALOCH-MD WhatsApp Bot
END:VCARD`;
}

// ─────────────────────────────────────────────────────────────
// 📤  MAIN EXPORT — sendSuccessMessages
// ─────────────────────────────────────────────────────────────
export async function sendSuccessMessages(sock, sessionPath) {
    try {
        // ── Resolve user's own JID ────────────────────────────
        const rawId   = sock.user?.id || sock.user?.jid || '';
        const userJid = rawId.includes(':')
            ? rawId.split(':')[0] + '@s.whatsapp.net'
            : rawId;

        if (!userJid || !userJid.includes('@s.whatsapp.net')) {
            console.error('\x1b[31m❌ Cannot resolve JID — message not sent\x1b[0m');
            return;
        }

        console.log('\x1b[36m📤 Sending to: %s\x1b[0m', userJid);

        // ── Read Session ID ───────────────────────────────────
        const sessionId = await getSessionId(sessionPath);

        // ── 1. Logo Image ─────────────────────────────────────
        try {
            await sock.sendMessage(userJid, {
                image   : { url: 'https://i.ibb.co/FbyCnmMX/shaban-md.jpg', mimetype: 'image/jpeg' },
                caption : `🎉 *YOUSAF BALOCH MD*\n✅ Connection Successful!\n👤 *By:* ${OWNER.NAME}`,
            });
            console.log('\x1b[36m📸 Logo sent\x1b[0m');
        } catch (imgErr) {
            console.warn('\x1b[33m⚠️ Logo skipped: %s\x1b[0m', imgErr.message);
        }

        await delay(1500);

        // ── 2. Full Success Message ───────────────────────────
        await sock.sendMessage(userJid, { text: buildMessage(sessionId) });
        console.log('\x1b[32m✅ Success message sent!\x1b[0m');

        await delay(1500);

        // ── 3. Owner Contact Card ─────────────────────────────
        await sock.sendMessage(userJid, {
            contacts: {
                displayName : OWNER.NAME,
                contacts    : [{ vcard: buildVCard() }],
            },
        });
        console.log('\x1b[32m✅ Owner contact sent!\x1b[0m');

        // ── 4. Console Summary ────────────────────────────────
        console.log('\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
        console.log('\x1b[93m🔑 SESSION ID READY\x1b[0m');
        console.log('\x1b[97m%s...\x1b[0m', sessionId.substring(0, 55));
        console.log('\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');

    } catch (err) {
        // Safe catch — server does NOT crash
        console.error('\x1b[31m❌ sendSuccessMessages failed: %s\x1b[0m', err.message);
    }
}
