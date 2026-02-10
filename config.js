/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONFIG.JS - PAIRING SERVICE CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 👨‍💻 Developer: Muhammad Yousaf Baloch
 * 📱 WhatsApp: +923710636110
 * 📺 YouTube: https://www.youtube.com/@Yousaf_Baloch_Tech
 * 🎵 TikTok: https://tiktok.com/@loser_boy.110
 * 📢 Channel: https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
 * 🔗 GitHub: https://github.com/musakhanbaloch03-sad
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Port configuration
const PORT = process.env.PORT || 3000;

// Owner information (LOCKED - HARDCODED)
const OWNER = Object.freeze({
    NAME: "Yousuf Baloch",
    FULL_NAME: "Muhammad Yousaf Baloch",
    WHATSAPP: "923710636110",
    YOUTUBE: "https://www.youtube.com/@Yousaf_Baloch_Tech",
    TIKTOK: "https://tiktok.com/@loser_boy.110",
    CHANNEL: "https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j",
    GITHUB: "https://github.com/musakhanbaloch03-sad",
    MAIN_REPO: "https://github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD",
    PAIRING_REPO: "https://github.com/musakhanbaloch03-sad/YOUSAF-PAIRING-V1"
});

module.exports = {
    PORT,
    OWNER
};
