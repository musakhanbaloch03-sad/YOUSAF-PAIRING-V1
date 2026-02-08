/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     YOUSAF-BALOCH-MD WhatsApp Bot      ┃
┃        Ultra Premium Edition           ┃
┃        FIXED & STABLE VERSION          ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import yargs from 'yargs';
import chalk from 'chalk';
import Pino from 'pino';
import figlet from 'figlet';
import express from 'express';

// ✅ Baileys Fixed Import for ESM
import pkg from '@whiskeysockets/baileys';
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason 
} = pkg;

const PORT = process.env.PORT || 8000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());

console.clear();
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.green(figlet.textSync('YOUSAF-BALOCH-MD', { font: 'Standard' })));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

const app = express();
let currentQR = null;
let connectionStatus = 'waiting';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🎨 Your Professional UI with Clock, Date and Social Links
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH-MD</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Poppins:wght@300;600&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #00f2ff; --secondary: #ff0080; --dark: #0a0a0a; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Poppins', sans-serif;
            background: radial-gradient(circle at center, #1a0033 0%, #000 100%);
            color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;
        }
        .main-card {
            background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(15px);
            border: 1px solid rgba(0, 242, 255, 0.2); border-radius: 30px;
            padding: 40px; width: 90%; max-width: 450px; text-align: center;
            box-shadow: 0 0 50px rgba(0, 242, 255, 0.1);
        }
        .clock-box {
            background: rgba(0, 0, 0, 0.5); border-radius: 20px;
            padding: 20px; margin-bottom: 25px; border: 1px solid var(--primary);
        }
        #time { font-family: 'Orbitron', sans-serif; font-size: 2.5em; color: var(--primary); text-shadow: 0 0 10px var(--primary); }
        #date { font-size: 1em; color: #aaa; margin-top: 5px; }
        .bot-name { font-family: 'Orbitron', sans-serif; font-size: 1.8em; margin-bottom: 10px; background: linear-gradient(to right, #00f2ff, #ff0080); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .status-badge { display: inline-block; padding: 8px 20px; border-radius: 50px; font-weight: bold; margin: 20px 0; background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; color: #ffd700; }
        .status-badge.connected { border-color: #00ff88; color: #00ff88; background: rgba(0, 255, 136, 0.1); }
        .input-group { margin-bottom: 20px; text-align: left; }
        .phone-input { width: 100%; padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; font-size: 1.1em; outline: none; transition: 0.3s; }
        .phone-input:focus { border-color: var(--primary); box-shadow: 0 0 10px rgba(0,242,255,0.3); }
        .btn { width: 100%; padding: 15px; border-radius: 12px; border: none; background: linear-gradient(45deg, var(--primary), var(--secondary)); color: white; font-weight: bold; cursor: pointer; font-size: 1.1em; transition: 0.3s; }
        .btn:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,242,255,0.4); }
        #code-display { margin-top: 20px; font-family: 'Orbitron', sans-serif; font-size: 2em; letter-spacing: 5px; color: var(--primary); }
        .social-links { margin-top: 30px; display: flex; justify-content: center; gap: 15px; }
        .social-links a { color: white; text-decoration: none; font-size: 0.9em; opacity: 0.7; transition: 0.3s; }
        .social-links a:hover { opacity: 1; color: var(--primary); }
    </style>
</head>
<body>
    <div class="main-card">
        <div class="clock-box">
            <div id="time">00:00:00</div>
            <div id="date">Loading...</div>
        </div>
        <h1 class="bot-name">YOUSAF-BALOCH-MD</h1>
        <p style="font-size: 0.9em; color: #888;">Owner: Muhammad Yousaf Baloch</p>
        
        <div id="status" class="status-badge">⏳ WAITING FOR CONNECTION</div>

        <div class="input-group">
            <input type="tel" id="phone" class="phone-input" placeholder="923170636110">
        </div>
        <button class="btn" onclick="generateCode()">GENERATE PAIRING CODE</button>
        <div id="code-display"></div>

        <div class="social-links">
            <a href="https://wa.me/923170636110">WhatsApp</a>
            <a href="#">YouTube</a>
            <a href="#">TikTok</a>
        </div>
    </div>

    <script>
        function updateTime() {
            const now = new Date();
            document.getElementById('time').textContent = now.toLocaleTimeString();
            document.getElementById('date').textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
        setInterval(updateTime, 1000);
        updateTime();

        async function generateCode() {
            const phone = document.getElementById('phone').value.replace(/[^0-9]/g, '');
            const display = document.getElementById('code-display');
            if(!phone) return alert('Enter phone number!');
            
            display.innerHTML = '<span style="font-size: 0.5em;">GENERATING...</span>';
            try {
                const res = await fetch('/pairing', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ phone })
                });
                const data = await res.json();
                if(data.code) display.textContent = data.code;
                else display.textContent = 'ERROR';
            } catch { display.textContent = 'ERROR'; }
        }

        setInterval(async () => {
            const res = await fetch('/status');
            const data = await res.json();
            const status = document.getElementById('status');
            if(data.connected) {
                status.textContent = '✅ CONNECTED';
                status.classList.add('connected');
            }
        }, 3000);
    </script>
</body>
</html>
  `);
});

app.get('/status', (req, res) => res.json({ connected: connectionStatus === 'connected' }));

app.post('/pairing', async (req, res) => {
    const { phone } = req.body;
    try {
        if (!global.conn) return res.json({ error: 'Not ready' });
        let code = await global.conn.requestPairingCode(phone);
        res.json({ code: code?.match(/.{1,4}/g)?.join('-') || code });
    } catch { res.json({ error: 'Failed' }); }
});

async function startBot() {
    const sessionPath = "./sessions";
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'silent' })),
        },
        printQRInTerminal: false,
        logger: Pino({ level: 'silent' }),
        browser: ["Yousaf-MD", "Chrome", "1.0.0"]
    });

    global.conn = sock;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            connectionStatus = 'connected';
            console.log(chalk.green('✅ Connected to WhatsApp!'));
        }
        if (connection === 'close') {
            connectionStatus = 'closed';
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        }
    });
}

app.listen(PORT, () => console.log(chalk.blue(`[SERVER] Running on port ${PORT}`)));
startBot();
