// 🔒 HARDCODED CONFIGURATION - Cannot be edited
const OWNER = Object.freeze({
    name: 'MUHAMMAD YOUSAF',
    phone: '923710636110',
    whatsapp: 'https://wa.me/923710636110',
    channel: 'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
    youtube: 'https://www.youtube.com/@Yousaf_Baloch_Tech',
    tiktok: 'https://tiktok.com/@loser_boy.110',
    github: 'https://github.com/musakhanbaloch03-sad',
    country: 'Pakistan 🇵🇰'
});

module.exports = {
    // Server Configuration
    port: process.env.PORT || 3000,
    
    // Owner Info (Locked)
    owner: OWNER,
    
    // Session Settings
    sessionPath: './session',
    outputPath: './sessions-output',
    
    // Bot Branding
    botName: 'YOUSAF-BALOCH-MD',
    version: '2.0.0',
    
    // Platform Support
    platforms: ['Heroku', 'Koyeb', 'Railway', 'Render', 'VPS', 'Replit']
};
