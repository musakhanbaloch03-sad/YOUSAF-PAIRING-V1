// ╔══════════════════════════════════════════════════════════════╗
// ║          YOUSAF-BALOCH-MD  •  PAIRING CONFIG                ║
// ║                Created by Yousuf Baloch                     ║
// ║    🔒 LOCKED — Owner info cannot be changed by any user     ║
// ╚══════════════════════════════════════════════════════════════╝

import dotenv from 'dotenv';
dotenv.config();

// ═══════════════════════════════════════════════════════════════
// 🔒  HARDCODED — CANNOT BE OVERRIDDEN BY ENV VARS OR CONFIG
// ═══════════════════════════════════════════════════════════════
const LOCKED = Object.freeze({
    OWNER_NAME      : 'Yousuf Baloch',
    OWNER_NUMBER    : '923710636110',
    TIKTOK          : 'https://tiktok.com/@loser_boy.110',
    YOUTUBE         : 'https://www.youtube.com/@Yousaf_Baloch_Tech',
    WA_CHANNEL      : 'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
    GITHUB          : 'https://github.com/musakhanbaloch03-sad',
    MAIN_REPO       : 'https://github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD',
    PAIRING_REPO    : 'https://github.com/musakhanbaloch03-sad/YOUSAF-PAIRING-V1',
    BOT_NAME        : 'YOUSAF BALOCH MD',
    VERSION         : '2.0.0',
    LOGO_URL        : 'https://i.ibb.co/FbyCnmMX/shaban-md.jpg',
});

// ═══════════════════════════════════════════════════════════════
// 🔓  EDITABLE — Users may set these via environment variables
// ═══════════════════════════════════════════════════════════════
const CONFIG = {
    PORT        : parseInt(process.env.PORT  || '8000', 10),
    NODE_ENV    : process.env.NODE_ENV       || 'production',
    SESSION_DIR : process.env.SESSION_DIR    || './session',

    // ── Merged locked owner info (read-only) ──────────────────
    ...LOCKED,
};

// Prevent runtime modification of the final config
Object.freeze(CONFIG);

export default CONFIG;
