// ╔══════════════════════════════════════════════════════════════╗
// ║           YOUSAF-BALOCH-MD  •  SESSION HANDLER              ║
// ║                 Created by Yousuf Baloch                    ║
// ║     🔒 LOCKED — No part of this file may be modified        ║
// ╚══════════════════════════════════════════════════════════════╝

import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────
// 🔒  HARDCODED OWNER INFO
// ─────────────────────────────────────────────
export const OWNER = Object.freeze({
    NAME            : 'Yousuf Baloch',
    NUMBER          : '923170636110', 
    WHATSAPP_JID    : '923170636110@s.whatsapp.net',
    TIKTOK          : 'https://tiktok.com/@loser_boy.110',
    YOUTUBE         : 'https://www.youtube.com/@Yousaf_Baloch_Tech',
    WA_CHANNEL      : 'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
    GITHUB          : 'https://github.com/musakhanbaloch03-sad',
    MAIN_REPO       : 'https://github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD',
    PAIRING_REPO    : 'https://github.com/musakhanbaloch03-sad/YOUSAF-PAIRING-V1',
    LOGO_URL        : 'https://i.ibb.co/FbyCnmMX/shaban-md.jpg',
});

const C = {
    reset   : '\x1b[0m', bold    : '\x1b[1m',
    cyan    : '\x1b[96m', gold    : '\x1b[93m',
    green   : '\x1b[92m', red     : '\x1b[91m',
    magenta : '\x1b[95m', blue    : '\x1b[94m',
    white   : '\x1b[97m',
};

export function printBanner() {
    console.log(`
${C.cyan}${C.bold}
╔══════════════════════════════════════════════════════╗
║   ${C.gold}██╗   ██╗ ██████╗ ██╗   ██╗███████╗ █████╗ ███████╗${C.cyan}  ║
║   ${C.gold}╚██╗ ██╔╝██╔═══██╗██║   ██║██╔════╝██╔══██╗██╔════╝${C.cyan}  ║
║   ${C.gold} ╚████╔╝ ██║   ██║██║   ██║███████╗███████║█████╗  ${C.cyan}  ║
║   ${C.gold}  ╚██╔╝  ██║   ██║██║   ██║╚════██║██╔══██║██╔══╝  ${C.cyan}  ║
║   ${C.gold}   ██║   ╚██████╔╝╚██████╔╝███████║██║  ██║██║     ${C.cyan}  ║
║   ${C.white}  PAIRING SERVICE  •  by ${C.gold}Yousuf Baloch${C.white}               ${C.cyan}  ║
╚══════════════════════════════════════════════════════╝
${C.reset}`);
}

export async function generateSessionId(sessionDir) {
    try {
        const credsPath = path.join(sessionDir, 'creds.json');
        if (!fs.existsSync(credsPath)) return 'SESSION_NOT_SAVED_YET';
        const raw  = fs.readFileSync(credsPath, 'utf-8');
        const b64  = Buffer.from(raw).toString('base64');
        return `YOUSAF;;;${b64}`; // Added triple semicolon for better parsing
    } catch (e) {
        return 'ERROR_GENERATING_SESSION';
    }
}

export function buildSuccessMessage(sessionId) {
    return `╔══════════════════════════════════╗
║  ✅  CONNECTION SUCCESSFUL  ✅   ║
╚══════════════════════════════════╝

🎉 *YOUSAF BALOCH MD* Connected!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 *YOUR SESSION ID*
\`\`\`${sessionId}\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 *DEPLOY YOUR BOT NOW*
1️⃣ Open: ${OWNER.MAIN_REPO}
2️⃣ Paste your *Session ID*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${OWNER.NAME}
📞 *WhatsApp:* wa.me/${OWNER.NUMBER}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

export function buildOwnerVCard() {
    return `BEGIN:VCARD\nVERSION:3.0\nFN:${OWNER.NAME}\nORG:Bot Developer\nTEL;type=CELL;type=VOICE;waid=${OWNER.NUMBER}:+${OWNER.NUMBER}\nEND:VCARD`;
}

export async function sendSuccessMessages(sock, sessionDir) {
    try {
        const userJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const sessionId = await generateSessionId(sessionDir);

        // 1. Send Logo with Professional Caption
        await sock.sendMessage(userJid, {
            image : { url: OWNER.LOGO_URL },
            caption: `🎉 *YOUSAF BALOCH MD*\n✅ Connection Successful!\n\n*Session ID* is generated. Please copy from the next message.`,
        });

        await new Promise(r => setTimeout(r, 2000));

        // 2. Send Session ID (With Auto-Read Support)
        await sock.sendMessage(userJid, { text: buildSuccessMessage(sessionId) });

        await new Promise(r => setTimeout(r, 1500));

        // 3. Send Contact Card
        await sock.sendMessage(userJid, {
            contacts: {
                displayName: OWNER.NAME,
                contacts: [{ vcard: buildOwnerVCard() }],
            },
        });

        console.log(`${C.green}✅ [YOUSAF-MD] Success Messages Sent to ${userJid}${C.reset}`);
    } catch (err) {
        console.error(`${C.red}❌ Error sending success messages: ${err.message}${C.reset}`);
    }
}
