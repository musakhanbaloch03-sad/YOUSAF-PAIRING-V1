const fs = require('fs');
const path = require('path');
const pino = require('pino');

// 🔒 ULTRA PRO HARDCODED OWNER - LOCKED FOREVER
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

// Ultra Pro Premium Logger with Deep Colors
const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
            customColors: 'info:magenta,warn:yellow,error:red,debug:cyan'
        }
    }
});

/**
 * 🌟 ULTRA PRO CONNECTION HANDLER
 * Premium Session Auto-Send System
 */
async function handleConnection(sock, saveCreds, userNumber) {
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            // Ultra Pro Premium Banner
            console.log('\x1b[38;5;201m╔═══════════════════════════════════════════════════════╗\x1b[0m');
            console.log('\x1b[38;5;51m║  ✅ YOUSAF-BALOCH-MD CONNECTED SUCCESSFULLY! 🎉      ║\x1b[0m');
            console.log('\x1b[38;5;201m╚═══════════════════════════════════════════════════════╝\x1b[0m');
            
            try {
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const sessionData = await getSessionData();
                const sessionId = Buffer.from(JSON.stringify(sessionData)).toString('base64');
                
                const message = createUltraProPremiumMessage(sessionId, userNumber);
                
                const userJid = `${userNumber}@s.whatsapp.net`;
                await sock.sendMessage(userJid, { text: message });
                
                console.log('\x1b[38;5;46m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
                console.log('\x1b[38;5;226m📤 Session ID sent successfully!\x1b[0m');
                console.log('\x1b[38;5;51m📱 User: %s\x1b[0m', userNumber);
                console.log('\x1b[38;5;201m👨‍💻 Owner: %s\x1b[0m', OWNER.name);
                console.log('\x1b[38;5;46m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
                
                saveSessionFile(sessionData, userNumber);
                
            } catch (error) {
                console.log('\x1b[38;5;196m❌ Error: %s\x1b[0m', error.message);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
            if (shouldReconnect) {
                console.log('\x1b[38;5;226m🔄 Reconnecting...\x1b[0m');
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

async function getSessionData() {
    const sessionPath = path.join(__dirname, '../session');
    if (!fs.existsSync(sessionPath)) throw new Error('Session not found');
    
    const files = fs.readdirSync(sessionPath);
    const sessionData = {};
    
    for (const file of files) {
        if (file.endsWith('.json')) {
            const content = fs.readFileSync(path.join(sessionPath, file), 'utf8');
            sessionData[file] = JSON.parse(content);
        }
    }
    return sessionData;
}

function createUltraProPremiumMessage(sessionId, userNumber) {
    return `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     ✨ CONNECTION SUCCESSFUL! ✨                      ║
║     🎉 ULTRA PRO PREMIUM EDITION 🎉                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

🤖 *YOUSAF-BALOCH-MD*
⚡ _Ultra Pro Premium WhatsApp Multi-Device Bot_
💎 _Professional Edition v2.0_
🌟 _Made in Pakistan with Love_

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 *YOUR SESSION DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 *Connected Number:*
${userNumber}

🆔 *Your Premium Session ID:*

\`\`\`${sessionId.substring(0, 150)}...\`\`\`

_(Full Session: ${sessionId.length} characters)_

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *ULTRA SECURITY WARNING*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 Keep Session ID *100% PRIVATE*
💾 Save in ultra-secure location
🚫 *NEVER EVER* share with anyone
⚡ Use ONLY for official bot deployment
🔐 Grants complete WhatsApp access
🛡️ Protected by premium encryption

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍💻 *CREATED BY*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*${OWNER.name}*
🇵🇰 ${OWNER.country}
💼 _Premium WhatsApp Bot Developer_
🏆 _Ultra Pro Bot Creator_

📱 WhatsApp: ${OWNER.whatsapp}
📢 Channel: ${OWNER.channel}
🎥 YouTube: ${OWNER.youtube}
🎵 TikTok: ${OWNER.tiktok}
🐙 GitHub: ${OWNER.github}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 *ULTRA PRO DEPLOYMENT GUIDE*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*Step 1:* Copy your Session ID above
*Step 2:* Visit: ${OWNER.github}/YOUSAF-BALOCH-MD
*Step 3:* Choose premium platform:
   🔷 Heroku (Premium - Recommended)
   🔷 Koyeb (Free - Good Performance)
   🔷 Railway (Free Trial Available)
   🔷 Render (Free - Slower)
   🔷 VPS (Advanced Users)
   🔷 Replit (Free - Limited)

*Step 4:* Add Session ID to config
*Step 5:* Deploy & enjoy ultra features! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💎 *ULTRA PRO FEATURES*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Auto Status React
✨ Last Seen Hide
✨ Anti-Link Protection
✨ Welcome Messages
✨ Auto Reply System
✨ Premium Stickers
✨ Groups & DMs Support
✨ Multi-Platform Compatible

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 *NEED ULTRA SUPPORT?*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📹 Premium Tutorials: ${OWNER.youtube}
📱 Ultra Updates: ${OWNER.channel}
💬 Direct Contact: ${OWNER.whatsapp}
📞 Emergency: ${OWNER.phone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*© 2024 YOUSAF-BALOCH-MD*
_Ultra Pro Premium Quality_
_Made with ❤️ in Pakistan 🇵🇰_
_by ${OWNER.name}_

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 *Thank you for choosing YOUSAF-BALOCH-MD!* 🌟
💎 *Ultra Pro Premium Edition* 💎
`.trim();
}

function saveSessionFile(sessionData, userNumber) {
    const outputDir = path.join(__dirname, '../sessions-output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    const filename = `ULTRA_PRO_SESSION_${userNumber}_${Date.now()}.json`;
    fs.writeFileSync(
        path.join(outputDir, filename), 
        JSON.stringify(sessionData, null, 2)
    );
    console.log('\x1b[38;5;46m💾 Ultra Pro Session Saved: %s\x1b[0m', filename);
}

module.exports = { handleConnection, OWNER };
