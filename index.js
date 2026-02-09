/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃      YOUSAF-PAIRING-V1 SYSTEM         ┃
┃        Ultra Premium Edition           ┃
┃   DESIGN: NEON CYBERPUNK CLOCK UI      ┃
┃   FIXED: IMPORT & SESSION ERRORS       ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import chalk from 'chalk';
import Pino from 'pino';
import express from 'express';
import figlet from 'figlet';

// FIX: Correct Import for Baileys
import pkg from '@whiskeysockets/baileys';
const { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Session Folder Fix
const sessionDir = './sessions';
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

console.clear();
console.log(chalk.cyan(figlet.textSync('YOUSAF V1', { font: 'Small' })));

// --- UI Logic (Neon Digital Clock & Large Buttons) ---
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-PAIRING-V1</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Poppins:wght@300;600;800&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #00f2ff; --secondary: #ff0080; --accent: #ffd700; --dark: #050505; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Poppins', sans-serif;
            background: radial-gradient(circle at center, #1a0033 0%, #050505 100%);
            color: white; min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 15px;
        }
        .container { width: 100%; max-width: 480px; text-align: center; }
        .clock-box {
            background: rgba(0, 242, 255, 0.05);
            border: 2px solid var(--primary);
            border-radius: 35px; padding: 30px 15px; margin-bottom: 25px;
            box-shadow: 0 0 25px rgba(0, 242, 255, 0.2); backdrop-filter: blur(10px);
        }
        #time { font-family: 'Orbitron'; font-size: 3.5em; font-weight: 900; color: var(--primary); text-shadow: 0 0 20px var(--primary); }
        #date-day { font-size: 1.2em; color: #fff; margin-top: 10px; font-weight: 600; }
        .main-card {
            background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px);
            border-radius: 40px; padding: 40px 20px; border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 20px 50px rgba(0,0,0,0.5); margin-bottom: 25px;
        }
        .title { font-family: 'Orbitron'; font-size: 1.7em; font-weight: 900; background: linear-gradient(90deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 25px; }
        input {
            width: 100%; padding: 22px; border-radius: 20px; border: 2px solid #333; background: #000; color: #fff;
            font-family: 'Orbitron'; font-size: 1.3em; text-align: center; margin-bottom: 20px;
        }
        .gen-btn {
            width: 100%; padding: 22px; border-radius: 20px; border: none;
            background: linear-gradient(45deg, #00f2ff, #0066ff); color: white;
            font-family: 'Orbitron'; font-weight: 900; font-size: 1.2em; cursor: pointer;
            box-shadow: 0 10px 20px rgba(0, 102, 255, 0.3); transition: 0.2s;
        }
        #code-res { font-size: 2.8em; font-family: 'Orbitron'; color: var(--accent); margin-top: 25px; font-weight: 900; letter-spacing: 5px; text-shadow: 0 0 15px var(--accent); }
        .social-btn {
            width: 100%; padding: 22px; border-radius: 22px; margin-top: 15px;
            display: flex; align-items: center; justify-content: center; gap: 15px;
            font-weight: 800; color: white; text-decoration: none; font-family: 'Orbitron'; font-size: 1em;
            transition: 0.4s; border: 2px solid rgba(255,255,255,0.1);
        }
        .wa { background: linear-gradient(45deg, #25D366, #128C7E); }
        .yt { background: linear-gradient(45deg, #FF0000, #990000); }
        .tk { background: linear-gradient(45deg, #000, #333); }
        .ch { background: linear-gradient(45deg, #00c6ff, #0072ff); }
        .social-btn:hover { transform: translateY(-5px); filter: brightness(1.2); }
    </style>
</head>
<body>
    <div class="container">
        <div class="clock-box">
            <div id="time">00:00:00</div>
            <div id="date-day">LOADING...</div>
        </div>
        <div class="main-card">
            <h1 class="title">YOUSAF-PAIRING-V1</h1>
            <input type="tel" id="number" placeholder="923170636110">
            <button class="gen-btn" onclick="getCode()">⚡ GENERATE CODE</button>
            <div id="code-res"></div>
        </div>
        <a href="https://wa.me/923170636110" class="social-btn wa">📱 WHATSAPP OWNER</a>
        <a href="https://youtube.com/@Yousaf_Baloch_Tech" class="social-btn yt">🎬 YOUTUBE CHANNEL</a>
        <a href="https://tiktok.com/@loser_boy.110" class="social-btn tk">🎵 TIKTOK PROFILE</a>
        <a href="https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j" class="social-btn ch">📢 JOIN CHANNEL</a>
        <p style="margin-top: 30px; color: rgba(255,255,255,0.3); font-size: 0.8em; font-family: 'Orbitron';">BY MUHAMMAD YOUSAF BALOCH</p>
    </div>
    <script>
        function updateClock() {
            const now = new Date();
            document.getElementById('time').textContent = now.toLocaleTimeString('en-GB', { hour12: false });
            document.getElementById('date-day').textContent = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
        setInterval(updateClock, 1000); updateClock();
        async function getCode() {
            const num = document.getElementById('number').value.replace(/[^0-9]/g, '');
            if(!num) return alert('Enter phone number!');
            const resDiv = document.getElementById('code-res');
            resDiv.innerHTML = '<span style="font-size: 0.4em;">WAIT...</span>';
            try {
                const res = await fetch('/pairing', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ phone: num })
                });
                const data = await res.json();
                resDiv.textContent = data.code || 'ERROR';
            } catch { resDiv.textContent = 'SERVER ERROR'; }
        }
    </script>
</body>
</html>
    `);
});

// --- Backend Pairing Logic (Fixed Import Issue) ---
async function startPairing() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: Pino({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'silent' })),
        },
        browser: ["YOUSAF-V1", "Chrome", "3.0.0"],
        connectTimeoutMs: 60000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) setTimeout(startPairing, 5000);
            else { fs.rmSync(sessionDir, { recursive: true, force: true }); startPairing(); }
        }
    });

    app.post('/pairing', async (req, res) => {
        let phone = req.body.phone;
        try {
            let code = await sock.requestPairingCode(phone);
            res.json({ code: code?.match(/.{1,4}/g)?.join('-') || code });
        } catch { res.json({ error: 'Failed' }); }
    });
}

app.listen(PORT, () => console.log(chalk.green(`🚀 YOUSAF-PAIRING-V1 LIVE: ${PORT}`)));
startPairing();
