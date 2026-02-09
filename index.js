/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     YOUSAF-BALOCH-MD WhatsApp Bot      ┃
┃        Ultra Premium Edition           ┃
┃      DESIGN: NEON CYBERPUNK UI         ┃
┃      DEVELOPED BY: MR YOUSAF           ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import yargs from 'yargs';
import chalk from 'chalk';
import Pino from 'pino';
import figlet from 'figlet';
import express from 'express';

const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWASocket } = await import('@whiskeysockets/baileys');

const PORT = process.env.PORT || 8000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());

const app = express();
let currentQR = null;
let connectionStatus = 'waiting';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🎨 Ultra-Professional UI Logic (As per screenshots 194252 & 194253)
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH-MD - Pairing System</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #00f2ff;
            --secondary: #ff0080;
            --purple: #b06ab3;
            --blue-grad: linear-gradient(135deg, #00f2ff, #0066ff);
            --pink-grad: linear-gradient(135deg, #ff6b6b, #ff0080);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Poppins', sans-serif;
            background: #fdfdfd; 
            background: linear-gradient(180deg, #ffffff 0%, #eef2f3 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            padding: 20px;
            color: #333;
        }
        .container { width: 100%; max-width: 450px; text-align: center; }
        .bot-icon { font-size: 80px; margin-bottom: 10px; }
        .bot-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 2.2em;
            font-weight: 900;
            background: linear-gradient(to right, #4568dc, #b06ab3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 5px;
        }
        .bot-subtitle { font-size: 0.9em; color: #777; margin-bottom: 30px; }

        /* ⏰ Digital Clock (Screenshot 194252 style) */
        .clock-box {
            background: var(--blue-grad);
            border-radius: 25px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 10px 30px rgba(0, 242, 255, 0.3);
            color: white;
        }
        #time { font-family: 'Orbitron', sans-serif; font-size: 3em; font-weight: 800; }
        #date { font-size: 1.1em; opacity: 0.9; margin-top: 5px; }

        /* 📑 Tab Buttons */
        .tabs { display: flex; gap: 10px; margin-bottom: 30px; }
        .tab {
            flex: 1; padding: 15px; border-radius: 15px; background: #f0f0f0;
            font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .tab.active {
            background: var(--purple); color: white;
            box-shadow: 0 5px 15px rgba(176, 106, 179, 0.4);
        }

        /* ⌨️ Input Section */
        .input-card { text-align: left; margin-bottom: 25px; }
        .input-label { font-weight: 700; font-size: 1.1em; margin-bottom: 10px; display: block; }
        .phone-input {
            width: 100%; padding: 20px; border-radius: 18px; border: 1px solid #ddd;
            background: #f9f9f9; font-size: 1.3em; font-family: 'Orbitron', sans-serif;
            outline: none; transition: 0.3s;
        }
        .phone-input:focus { border-color: var(--primary); background: #fff; }

        /* ⚡ 3D Skeuomorphic Button */
        .gen-btn {
            width: 100%; padding: 22px; border-radius: 20px; border: none;
            background: linear-gradient(135deg, #b06ab3, #4568dc);
            color: white; font-size: 1.2em; font-weight: 900; font-family: 'Orbitron', sans-serif;
            cursor: pointer; box-shadow: 0 8px 0px #2d45a3, 0 15px 25px rgba(0,0,0,0.1);
            transition: 0.1s; margin-bottom: 30px;
        }
        .gen-btn:active { transform: translateY(4px); box-shadow: 0 4px 0px #2d45a3; }

        /* 👤 Owner Details (Screenshot 194253 style) */
        .owner-card {
            background: var(--pink-grad); border-radius: 30px; padding: 30px;
            margin-bottom: 20px; text-align: left; color: white;
        }
        .owner-title { font-family: 'Orbitron', sans-serif; font-size: 1.3em; font-weight: 800; margin-bottom: 20px; }
        .info-row {
            background: rgba(255,255,255,0.2); border-radius: 15px; padding: 15px;
            margin-bottom: 10px; display: flex; justify-content: space-between; font-weight: 600;
        }

        /* 🔗 Social Media Buttons */
        .social-btn {
            width: 100%; padding: 18px; border-radius: 15px; margin-bottom: 12px;
            display: flex; align-items: center; justify-content: center; gap: 10px;
            font-weight: 700; text-decoration: none; color: white; font-size: 1.1em;
        }
        .wa { background: #25D366; } .yt { background: #FF0000; } 
        .tk { background: #000; } .call { background: #00a2ff; }

        #code-display { font-size: 2.5em; font-family: 'Orbitron', sans-serif; color: #4568dc; margin-top: 20px; letter-spacing: 5px; font-weight: 900; }
    </style>
</head>
<body>
    <div class="container">
        <div class="bot-icon">🤖</div>
        <h1 class="bot-title">YOUSAF-BALOCH-MD</h1>
        <p class="bot-subtitle">Premium WhatsApp Multi-Device Pairing System</p>

        <div class="clock-box">
            <div id="time">00:00:00</div>
            <div id="date">Loading...</div>
        </div>

        <div class="tabs">
            <div class="tab active">📱 Phone Number</div>
            <div class="tab">📷 QR Code</div>
        </div>

        <div class="input-card">
            <label class="input-label">📞 Enter Your WhatsApp Number</label>
            <input type="tel" id="phone" class="phone-input" placeholder="923XXXXXXXXX">
            <p style="font-size: 0.8em; color: #888; margin-top: 10px;">ℹ️ Format: Country code + number (e.g., 923170636110)</p>
        </div>

        <button class="gen-btn" onclick="generateCode()">⚡ GENERATE PAIRING CODE</button>
        <div id="code-display"></div>

        <div class="owner-card">
            <div class="owner-title">👨‍💻 CREATED BY MUHAMMAD YOUSAF</div>
            <div class="info-row"><span>📞 Phone:</span> <span>923170636110</span></div>
            <div class="info-row"><span>🌐 Country:</span> <span>Pakistan 🇵🇰</span></div>
        </div>

        <a href="https://wa.me/923170636110" class="social-btn wa">📱 WhatsApp</a>
        <a href="#" class="social-btn yt">🎬 YouTube</a>
        <a href="#" class="social-btn tk">🎵 TikTok</a>
        <a href="tel:+923170636110" class="social-btn call">📞 Call</a>
    </div>

    <script>
        function updateClock() {
            const now = new Date();
            document.getElementById('time').textContent = now.toLocaleTimeString('en-GB', { hour12: false });
            document.getElementById('date').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        }
        setInterval(updateClock, 1000); updateClock();

        async function generateCode() {
            const phone = document.getElementById('phone').value.replace(/[^0-9]/g, '');
            const display = document.getElementById('code-display');
            if(!phone || phone.length < 10) return alert('Enter valid number!');
            
            display.textContent = 'WAIT...';
            try {
                const res = await fetch('/pairing', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ phone })
                });
                const data = await res.json();
                display.textContent = data.code || 'ERROR';
            } catch { display.textContent = 'ERROR'; }
        }
    </script>
</body>
</html>
  `);
});

// --- Baileys Backend Logic ---

app.post('/pairing', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!global.conn) return res.json({ error: 'Bot starting...' });
    const code = await global.conn.requestPairingCode(phone);
    res.json({ code: code?.match(/.{1,4}/g)?.join('-') || code });
  } catch (error) { res.json({ error: 'Failed' }); }
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./sessions');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'silent' })) },
    printQRInTerminal: false,
    logger: Pino({ level: 'silent' }),
    browser: ['YOUSAF-BALOCH-MD', 'Chrome', '1.0.0']
  });

  global.conn = sock;
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') console.log(chalk.green('✅ Connected!'));
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    }
  });
}

app.listen(PORT, () => console.log(chalk.blue(`🚀 Server on port ${PORT}`)));
startBot();
