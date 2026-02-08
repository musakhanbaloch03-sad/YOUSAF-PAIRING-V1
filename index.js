import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import figlet from 'figlet';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 OWNER INFORMATION (DO NOT DELETE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const OWNER_NAME = "Muhammad Yousaf Baloch";
const OWNER_NUMBER = "923710636110";
const BOT_NAME = "YOUSAF-BALOCH-MD";

// 🔗 SOCIAL MEDIA LINKS (DO NOT DELETE)
const SOCIAL_LINKS = {
    youtube: "https://www.youtube.com/@Yousaf_Baloch_Tech",
    whatsapp_channel: "https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j",
    tiktok: "https://tiktok.com/@loser_boy.110",
    github: "https://github.com/musakhanbaloch03-sad",
    personal_whatsapp: "https://wa.me/923710636110"
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8000;

let session;
let currentQR = null;

// ✨ UI & Console Styling
const logInfo = (text) => console.log(chalk.cyanBright(`[INFO] ${text}`));
const logSuccess = (text) => console.log(chalk.greenBright(`[SUCCESS] ${text}`));
const logError = (text) => console.log(chalk.redBright(`[ERROR] ${text}`));

console.clear();
console.log(chalk.yellow(figlet.textSync('YOUSAF MD', { font: 'Standard' })));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.green(`🚀 Starting ${BOT_NAME} by ${OWNER_NAME}...`));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🎨 Professional Pairing Dashboard
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${BOT_NAME} | Pairing</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
        <style>
            :root { --primary: #00f2ff; --secondary: #8b5cf6; --bg: #0a0a0a; --glass: rgba(255, 255, 255, 0.05); }
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }
            body { 
                background: radial-gradient(circle at center, #1a1a2e, #000); 
                color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center; 
                overflow: hidden;
            }
            .container { 
                background: var(--glass); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1);
                padding: 40px; border-radius: 20px; text-align: center; max-width: 450px; width: 90%;
                box-shadow: 0 0 50px rgba(0, 242, 255, 0.1); position: relative;
            }
            h1 { font-family: 'Orbitron', sans-serif; background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
            .owner-tag { background: rgba(0, 242, 255, 0.1); color: var(--primary); padding: 5px 15px; border-radius: 50px; font-size: 0.8rem; display: inline-block; margin-bottom: 20px; border: 1px solid var(--primary); }
            .input-group { margin: 20px 0; position: relative; }
            input { 
                width: 100%; padding: 15px; background: rgba(0,0,0,0.3); border: 1px solid #333; border-radius: 10px; 
                color: white; font-size: 1rem; transition: 0.3s; text-align: center; letter-spacing: 2px;
            }
            input:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 15px rgba(0, 242, 255, 0.2); }
            button {
                width: 100%; padding: 15px; background: linear-gradient(45deg, var(--primary), var(--secondary)); 
                border: none; border-radius: 10px; color: black; font-weight: bold; font-size: 1rem; cursor: pointer;
                transition: 0.3s; margin-top: 10px; font-family: 'Orbitron', sans-serif;
            }
            button:hover { transform: translateY(-2px); box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
            #code-display { 
                margin-top: 20px; font-family: 'Orbitron', sans-serif; font-size: 1.5rem; letter-spacing: 5px; 
                color: var(--primary); min-height: 30px; text-shadow: 0 0 10px var(--primary);
            }
            .socials { margin-top: 30px; display: flex; justify-content: center; gap: 15px; }
            .socials a { color: rgba(255,255,255,0.5); font-size: 1.2rem; transition: 0.3s; text-decoration: none; }
            .socials a:hover { color: var(--primary); transform: scale(1.2); }
            .logs { font-size: 0.8rem; color: #666; margin-top: 20px; }
        </style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    </head>
    <body>
        <div class="container">
            <div class="owner-tag">👑 Owner: ${OWNER_NAME}</div>
            <h1>${BOT_NAME}</h1>
            <p style="color: #aaa; font-size: 0.9rem;">Multi-Device WhatsApp Bot Pairing</p>
            
            <div class="input-group">
                <input type="text" id="number" placeholder="923710636110" autocomplete="off">
            </div>
            <button onclick="getPairingCode()" id="submit-btn"><i class="fas fa-link"></i> GET PAIRING CODE</button>
            
            <div id="code-display"></div>
            <div class="logs" id="logs">Waiting for input...</div>

            <div class="socials">
                <a href="${SOCIAL_LINKS.youtube}" target="_blank"><i class="fab fa-youtube"></i></a>
                <a href="${SOCIAL_LINKS.whatsapp_channel}" target="_blank"><i class="fab fa-whatsapp"></i></a>
                <a href="${SOCIAL_LINKS.tiktok}" target="_blank"><i class="fab fa-tiktok"></i></a>
                <a href="${SOCIAL_LINKS.github}" target="_blank"><i class="fab fa-github"></i></a>
            </div>
        </div>

        <script>
            async function getPairingCode() {
                const number = document.getElementById("number").value.replace(/[^0-9]/g, "");
                const logs = document.getElementById("logs");
                const display = document.getElementById("code-display");
                const btn = document.getElementById("submit-btn");

                if (!number) {
                    logs.innerText = "❌ Please enter your WhatsApp number!";
                    logs.style.color = "#ff4d4d";
                    return;
                }

                if (number.length < 11) {
                    logs.innerText = "⚠️ Number looks too short. Include country code.";
                    logs.style.color = "#ffa502";
                }

                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GENERATING...';
                logs.innerText = "🔄 Connecting to bot server...";
                logs.style.color = "#00f2ff";

                try {
                    const response = await fetch('/pair', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ number: number })
                    });
                    
                    const data = await response.json();
                    
                    if (data.code) {
                        display.innerText = data.code;
                        logs.innerText = "✅ Code Generated! Enter this in WhatsApp > Linked Devices.";
                        logs.style.color = "#2ecc71";
                    } else {
                        logs.innerText = "❌ Error: " + (data.error || "Unknown error");
                        logs.style.color = "#ff4d4d";
                    }
                } catch (e) {
                    logs.innerText = "❌ Connection Failed. Is the bot running?";
                    logs.style.color = "#ff4d4d";
                }
                
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-link"></i> GET PAIRING CODE';
            }
        </script>
    </body>
    </html>
    `);
});

// 🤖 MAIN BOT LOGIC
async function startYousafBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    // Fetch latest Baileys version safely
    const { version } = await fetchLatestBaileysVersion();
    logInfo(`Using Baileys version: ${version.join('.')}`);

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        printQRInTerminal: false, // We use Pairing Code, not QR in terminal
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"], // Stable browser ID
        version
    });

    // 🔗 PAIRING CODE ENDPOINT
    app.post('/pair', async (req, res) => {
        const { number } = req.body;
        if (!number) return res.status(400).json({ error: "Number is required" });

        try {
            logInfo(`Pairing request for: ${number}`);
            
            if (!sock.authState.creds.me) {
                const code = await sock.requestPairingCode(number);
                logSuccess(`Pairing Code Generated: ${code}`);
                res.json({ code: code });
            } else {
                res.json({ error: "Bot is already connected. Please delete session to repair." });
            }
        } catch (error) {
            logError("Pairing Error: " + error.message);
            res.status(500).json({ error: "Failed to generate code. Try again in 10s." });
        }
    });

    // 📡 CONNECTION UPDATE HANDLING
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) currentQR = qr;

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            logError(`Connection Closed: ${reason}`);
            
            // Auto Reconnect Logic
            if (reason !== DisconnectReason.loggedOut) {
                logInfo("Reconnecting...");
                setTimeout(startYousafBot, 3000);
            } else {
                logError("Session logged out. Delete 'session' folder and restart.");
            }
        } else if (connection === 'open') {
            logSuccess(`${BOT_NAME} Connected Successfully!`);
            
            // 🎉 Send Welcome Message to Owner
            const welcomeMsg = `
⚡ *YOUSAF-BALOCH-MD CONNECTED* ⚡

👑 *Owner:* ${OWNER_NAME}
📱 *Number:* ${OWNER_NUMBER}
🌐 *Version:* 2.0.0 (Ultra Premium)

✅ *Bot is now active and ready to use!*
            `;
            await sock.sendMessage(sock.user.id, { text: welcomeMsg });
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// Start Server & Bot
app.listen(PORT, () => {
    logSuccess(`Server running on port ${PORT}`);
    startYousafBot();
});
