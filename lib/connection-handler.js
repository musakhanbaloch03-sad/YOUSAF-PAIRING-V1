const fs = require('fs');
const path = require('path');
const pino = require('pino');

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

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname'
        }
    }
});

async function handleConnection(sock, saveCreds, userNumber) {
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log('\x1b[35m╔═══════════════════════════════════════════════╗\x1b[0m');
            console.log('\x1b[36m║  ✅ YOUSAF-BALOCH-MD CONNECTED SUCCESSFULLY! ║\x1b[0m');
            console.log('\x1b[35m╚═══════════════════════════════════════════════╝\x1b[0m');
            
            try {
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const sessionData = await getSessionData();
                const sessionId = Buffer.from(JSON.stringify(sessionData)).toString('base64');
                
                const message = createUltraProMessage(sessionId, userNumber);
                
                const userJid = `${userNumber}@s.whatsapp.net`;
                await sock.sendMessage(userJid, { text: message });
                
                console.log('\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
                console.log('\x1b[33m📤 Session ID sent to: %s\x1b[0m', userNumber);
                console.log('\x1b[36m👨‍💻 Owner: %s\x1b[0m', OWNER.name);
                console.log('\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
                
                saveSessionFile(sessionData, userNumber);
                
            } catch (error) {
                console.log('\x1b[31m❌ Error: %s\x1b[0m', error.message);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
            if (shouldReconnect) {
                console.log('\x1b[33m🔄 Reconnecting...\x1b[0m');
            } else {
                console.log('\x1b[31m🔒 Closed\x1b[0m');
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

function createUltraProMessage(sessionId, userNumber) {
    return `
╔═══════════════════════════════════════════════╗
║        ✅ CONNECTION SUCCESSFUL! ✅           ║
╚═══════════════════════════════════════════════╝

🤖 *YOUSAF-BALOCH-MD*
_Ultra Pro Premium Edition_

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 *YOUR SESSION DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 *Number:* ${userNumber}
🆔 *Session ID:*

\`\`\`${sessionId.substring(0, 150)}...\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍💻 *CREATED BY*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*${OWNER.name}*
🇵🇰 ${OWNER.country}

📱 WhatsApp: ${OWNER.whatsapp}
📢 Channel: ${OWNER.channel}
🎥 YouTube: ${OWNER.youtube}
🎵 TikTok: ${OWNER.tiktok}
🐙 GitHub: ${OWNER.github}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 *DEPLOYMENT*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Visit: ${OWNER.github}/YOUSAF-BALOCH-MD
Use Session ID above

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*© 2024 YOUSAF-BALOCH-MD*
_Made with ❤️ in Pakistan 🇵🇰_
`.trim();
}

function saveSessionFile(sessionData, userNumber) {
    const outputDir = path.join(__dirname, '../sessions-output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    const filename = `SESSION_${userNumber}_${Date.now()}.json`;
    fs.writeFileSync(
        path.join(outputDir, filename), 
        JSON.stringify(sessionData, null, 2)
    );
    console.log('\x1b[32m💾 Saved: %s\x1b[0m', filename);
}

module.exports = { handleConnection, OWNER };
