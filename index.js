import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import yargs from 'yargs';
import chalk from 'chalk';
import Pino from 'pino';
import figlet from 'figlet';
import express from 'express';

const baileys = await import('@whiskeysockets/baileys');
const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWASocket } = baileys.default || baileys;

const PORT = process.env.PORT || 8000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.clear();
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.green(figlet.textSync('YOUSAF-BALOCH-MD', { font: 'Standard' })));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
console.log(chalk.yellow('🚀 Ultra Premium WhatsApp Bot - WORKING VERSION'));
console.log(chalk.green('🌐 Server starting on port ' + PORT + '\n'));

const app = express();
let currentQR = null;
let isConnected = false;
let sock = null;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH-MD</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(-45deg, #000, #1a0033, #330066);
            background-size: 400% 400%;
            animation: gradient 15s ease infinite;
            min-height: 100vh;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .container { max-width: 500px; padding: 20px; }
        .card {
            background: rgba(10, 10, 10, 0.9);
            backdrop-filter: blur(30px);
            border: 2px solid rgba(0, 242, 255, 0.3);
            border-radius: 30px;
            padding: 40px;
            text-align: center;
        }
        .title {
            font-family: 'Orbitron', sans-serif;
            font-size: 2em;
            background: linear-gradient(135deg, #00f2ff, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 20px;
        }
        .subtitle { color: #ffd700; margin-bottom: 30px; }
        .dev { margin-bottom: 30px; }
        .dev-name { font-size: 1.2em; color: #00f2ff; margin-bottom: 5px; }
        .dev-contact { color: rgba(255,255,255,0.7); }
        .status {
            background: rgba(255, 215, 0, 0.2);
            border: 2px solid #ffd700;
            border-radius: 50px;
            padding: 12px 25px;
            margin-bottom: 30px;
        }
        .buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .btn {
            background: linear-gradient(135deg, rgba(0, 242, 255, 0.2), rgba(139, 92, 246, 0.2));
            border: 2px solid #00f2ff;
            border-radius: 20px;
            padding: 25px 15px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0, 242, 255, 0.4); }
        .icon { font-size: 3em; margin-bottom: 10px; }
        .btn-title { font-family: 'Orbitron', sans-serif; font-size: 1.1em; margin-bottom: 5px; }
        .modal { display: none; }
        .modal.active { display: block; }
        .modal-title { font-family: 'Orbitron', sans-serif; font-size: 1.5em; color: #00f2ff; margin-bottom: 20px; }
        .qr-box { background: white; border-radius: 20px; padding: 20px; margin: 20px 0; }
        #qrcode { display: inline-block; }
        .timer { font-family: 'Orbitron', monospace; font-size: 1.2em; color: #ffd700; margin-top: 15px; }
        input {
            width: 100%;
            padding: 18px 20px;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid rgba(0, 242, 255, 0.3);
            border-radius: 15px;
            color: white;
            font-size: 1.1em;
            margin-bottom: 15px;
        }
        input::placeholder { color: rgba(255, 255, 255, 0.4); }
        input:focus { outline: none; border-color: #00f2ff; }
        .gen-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #00f2ff, #8b5cf6);
            border: none;
            border-radius: 15px;
            color: white;
            font-size: 1.1em;
            font-weight: 700;
            cursor: pointer;
        }
        .gen-btn:hover { transform: translateY(-3px); }
        .code-display {
            font-family: 'Orbitron', monospace;
            font-size: 2.5em;
            font-weight: 900;
            letter-spacing: 15px;
            color: #00f2ff;
            text-align: center;
            padding: 30px;
            background: rgba(0, 0, 0, 0.6);
            border: 3px solid #00f2ff;
            border-radius: 20px;
            margin: 20px 0;
        }
        .info { text-align: center; color: rgba(255, 255, 255, 0.7); margin: 15px 0; }
        .error { color: #ff0080 !important; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1 class="title">⚡ YOUSAF-BALOCH-MD ⚡</h1>
            <div class="subtitle">ULTRA PREMIUM EDITION</div>
            <div class="dev">
                <div class="dev-name">MUHAMMAD YOUSAF BALOCH</div>
                <div class="dev-contact">📞 +923710636110</div>
            </div>
            <div class="status">
                Status: <span id="status">⏳ Loading...</span>
            </div>
            <div class="buttons">
                <div class="btn" onclick="showQR()">
                    <div class="icon">📱</div>
                    <div class="btn-title">QR CODE</div>
                </div>
                <div class="btn" onclick="showPairing()">
                    <div class="icon">🔐</div>
                    <div class="btn-title">PAIRING</div>
                </div>
            </div>
            <div id="qr-section" class="modal">
                <div class="modal-title">📱 SCAN QR CODE</div>
                <div class="info">WhatsApp → Linked Devices → Link a Device</div>
                <div class="qr-box" id="qrcode"></div>
                <div class="timer" id="timer"></div>
            </div>
            <div id="pairing-section" class="modal">
                <div class="modal-title">🔐 PAIRING CODE</div>
                <input type="tel" id="phone" placeholder="923710636110" maxlength="15">
                <button class="gen-btn" onclick="generateCode()">🚀 GENERATE</button>
                <div id="result"></div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <script>
        function updateStatus() {
            fetch('/status').then(r => r.json()).then(d => {
                document.getElementById('status').textContent = d.connected ? '✅ CONNECTED' : '⏳ Waiting...';
            }).catch(() => {});
        }
        setInterval(updateStatus, 3000);
        updateStatus();
        
        function showQR() {
            document.getElementById('qr-section').classList.add('active');
            document.getElementById('pairing-section').classList.remove('active');
            loadQR();
        }
        
        function showPairing() {
            document.getElementById('pairing-section').classList.add('active');
            document.getElementById('qr-section').classList.remove('active');
        }
        
        function loadQR() {
            fetch('/qr').then(r => r.json()).then(d => {
                if (d.qr) {
                    const qr = document.getElementById('qrcode');
                    qr.innerHTML = '';
                    new QRCode(qr, { text: d.qr, width: 256, height: 256 });
                    startTimer();
                } else {
                    document.getElementById('qrcode').innerHTML = '<div class="info error">' + (d.error || 'Please wait...') + '</div>';
                }
            });
        }
        
        let ti;
        function startTimer() {
            let sec = 60;
            clearInterval(ti);
            ti = setInterval(() => {
                sec--;
                document.getElementById('timer').textContent = '⏰ ' + sec + 'S';
                if (sec <= 0) {
                    clearInterval(ti);
                    document.getElementById('timer').textContent = '⚠️ EXPIRED - CLICK QR AGAIN';
                }
            }, 1000);
        }
        
        async function generateCode() {
            const phone = document.getElementById('phone').value.replace(/[^0-9]/g, '');
            const r = document.getElementById('result');
            if (!phone || phone.length < 10) {
                r.innerHTML = '<div class="info error">❌ INVALID NUMBER</div>';
                return;
            }
            r.innerHTML = '<div class="info">⏳ GENERATING...</div>';
            try {
                const res = await fetch('/pairing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phone })
                });
                const d = await res.json();
                if (d.code) {
                    r.innerHTML = '<div class="code-display">' + d.code + '</div><div class="info">⏰ ENTER IN WHATSAPP WITHIN 60 SECONDS</div>';
                } else {
                    r.innerHTML = '<div class="info error">❌ ' + (d.error || 'ERROR') + '</div>';
                }
            } catch (error) {
                r.innerHTML = '<div class="info error">❌ ERROR</div>';
            }
        }
    </script>
</body>
</html>`);
});

app.get('/status', (req, res) => {
  res.json({ connected: isConnected });
});

app.get('/qr', (req, res) => {
  if (!currentQR) {
    return res.json({ error: 'Connecting... Please wait 10 seconds' });
  }
  res.json({ qr: currentQR });
});

app.post('/pairing', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.json({ error: 'Invalid number' });
    }
    if (!sock || !isConnected) {
      return res.json({ error: 'Bot connecting... Wait 15 seconds' });
    }
    const code = await sock.requestPairingCode(phone);
    const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
    console.log(chalk.green('\n🔐 Code: ' + formatted + ' for ' + phone + '\n'));
    res.json({ code: formatted });
  } catch (error) {
    console.error('Pairing error:', error);
    res.json({ error: 'Failed. Wait 15 seconds and retry.' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(chalk.green('✅ Server running on port ' + PORT + '\n'));
});

async function startBot() {
  try {
    const sessionFolder = path.join(__dirname, 'sessions');
    if (!existsSync(sessionFolder)) {
      mkdirSync(sessionFolder, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();
    
    console.log(chalk.green('✅ Baileys: ' + version.join('.') + '\n'));
    
    sock = makeWASocket({
      version,
      logger: Pino({ level: 'silent' }),
      printQRInTerminal: false,
      mobile: false,
      browser: ['Ubuntu', 'Chrome', '20.0.04'],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'silent' }))
      },
      getMessage: async () => ({ conversation: 'Hi' })
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        currentQR = qr;
        console.log(chalk.yellow('📱 QR updated\n'));
      }
      
      if (connection === 'open') {
        isConnected = true;
        console.log(chalk.green('✅ CONNECTED!\n'));
      }
      
      if (connection === 'close') {
        isConnected = false;
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(chalk.red('❌ Closed\n'));
        if (shouldReconnect) {
          console.log(chalk.yellow('⚠️ Reconnecting...\n'));
          setTimeout(() => startBot(), 5000);
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);
    
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    setTimeout(() => startBot(), 10000);
  }
}

startBot();
