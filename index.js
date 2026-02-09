/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃      YOUSAF-PAIRING-V1 SYSTEM         ┃
┃   DEVELOPER: MUHAMMAD YOUSAF BALOCH    ┃
┃   FIXED: TYPEERROR & IMPORT ISSUE      ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import chalk from 'chalk';
import Pino from 'pino';
import express from 'express';
import figlet from 'figlet';

// --- Baileys Import Fix (Is se TypeError khatam ho jayega) ---
import pkg from '@whiskeysockets/baileys';
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Session logic
const sessionDir = './sessions';
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

console.clear();
console.log(chalk.cyan(figlet.textSync('YOUSAF V1', { font: 'Small' })));

// --- UI Design ---
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-PAIRING-V1</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; background: #050505; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 15px; }
        .card { background: rgba(255, 255, 255, 0.05); border-radius: 30px; padding: 30px; width: 100%; max-width: 450px; text-align: center; border: 1px solid #333; box-shadow: 0 0 30px rgba(0,242,255,0.1); }
        .clock { background: #111; border: 2px solid #00f2ff; border-radius: 20px; padding: 20px; margin-bottom: 25px; box-shadow: 0 0 15px #00f2ff33; }
        #time { font-family: 'Orbitron'; font-size: 3em; color: #00f2ff; text-shadow: 0 0 10px #00f2ff; }
        #date { color: #888; font-size: 1.1em; margin-top: 5px; }
        input { width: 100%; padding: 18px; border-radius: 15px; border: 1px solid #444; background: #000; color: white; font-size: 1.2em; text-align: center; margin-bottom: 15px; }
        .btn { width: 100%; padding: 18px; border-radius: 15px; border: none; background: linear-gradient(45deg, #00f2ff, #0066ff); color: white; font-weight: bold; font-size: 1.1em; cursor: pointer; }
        #code { font-size: 2.5em; font-family: 'Orbitron'; color: #ffd700; margin-top: 20px; text-shadow: 0 0 10px #ffd700; }
        .social { display: block; padding: 18px; margin-top: 12px; border-radius: 15px; color: white; text-decoration: none; font-weight: bold; font-size: 0.9em; transition: 0.3s; text-align: center; }
        .wa { background: #25D366; } .yt { background: #FF0000; } .tk { background: #000; border: 1px solid #444; } .ch { background: #0072ff; }
    </style>
</head>
<body>
    <div class="card">
        <div class="clock"><div id="time">00:00:00</div><div id="date">LOADING...</div></div>
        <h2 style="color:#00f2ff;">YOUSAF-PAIRING-V1</h2>
        <input type="tel" id="num" placeholder="923170636110">
        <button class="btn" onclick="getCode()">⚡ GET PAIRING CODE</button>
        <div id="code"></div>
        <div style="margin-top:25px;">
            <a href="https://wa.me/923170636110" class="social wa">📱 WHATSAPP OWNER</a>
            <a href="https://youtube.com/@Yousaf_Baloch_Tech" class="social yt">📺 YOUTUBE CHANNEL</a>
            <a href="https://tiktok.com/@loser_boy.110" class="social tk">🎵 TIKTOK PROFILE</a>
            <a href="https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j" class="social ch">📢 JOIN CHANNEL</a>
        </div>
    </div>
    <script>
        function update() {
            const n = new Date();
            document.getElementById('time').innerText = n.toLocaleTimeString('en-GB');
            document.getElementById('date').innerText = n.toLocaleDateString('en-US', {weekday:'long', day:'numeric', month:'long'});
        } setInterval(update, 1000); update();
        async function getCode() {
            const p = document.getElementById('num').value.replace(/[^0-9]/g,'');
            if(!p) return alert('Enter number!');
            const resDiv = document.getElementById('code');
            resDiv.innerText = 'GENERATING...';
            try {
                const r = await fetch('/pairing', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({phone:p}) });
                const d = await r.json();
                resDiv.innerText = d.code || 'ERROR';
            } catch { resDiv.innerText = 'SERVER ERROR'; }
        }
    </script>
</body>
</html>
    `);
});

// --- Pairing Logic ---
async function start() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'silent' })),
        },
        logger: Pino({ level: 'silent' }),
        browser: ["YOUSAF-V1", "Chrome", "3.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (u) => {
        if (u.connection === 'close') setTimeout(start, 5000);
    });

    app.post('/pairing', async (req, res) => {
        try {
            let code = await sock.requestPairingCode(req.body.phone);
            res.json({ code: code?.match(/.{1,4}/g)?.join('-') || code });
        } catch { res.json({ error: true }); }
    });
}

app.listen(PORT, () => console.log(chalk.green(`🚀 YOUSAF-V1 LIVE ON PORT: ${PORT}`)));
start().catch(err => console.error("Startup Error:", err));
