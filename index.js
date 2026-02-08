/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     YOUSAF-BALOCH-MD WhatsApp Bot      ┃
┃        Ultra Premium Edition           ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import chalk from 'chalk';
import Pino from 'pino';
import figlet from 'figlet';
import express from 'express';
import { readFileSync, existsSync, mkdirSync } from 'fs';

const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWASocket, delay } = await import('@whiskeysockets/baileys');

const PORT = process.env.PORT || 8000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure sessions directory exists
const sessionsDir = path.join(__dirname, 'sessions');
if (!existsSync(sessionsDir)) {
  mkdirSync(sessionsDir, { recursive: true });
}

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());

console.clear();
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.green(figlet.textSync('YOUSAF-BALOCH-MD', { font: 'Standard' })));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
console.log(chalk.yellow('🚀 Ultra Premium WhatsApp Bot'));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

const app = express();
let currentQR = null;
let connectionStatus = 'waiting';
let qrUpdateTime = null;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH-MD - Premium WhatsApp Bot</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Poppins:wght@300;400;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #00f2ff;
            --secondary: #ff0080;
            --accent: #ffd700;
            --dark: #0a0a0a;
            --purple: #8b5cf6;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(-45deg, #000000, #0a0033, #1a0033, #330066, #000033);
            background-size: 400% 400%;
            animation: gradientShift 20s ease infinite;
            min-height: 100vh;
            overflow-x: hidden;
            color: white;
        }
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .main-card {
            background: rgba(10, 10, 10, 0.8);
            backdrop-filter: blur(30px);
            border: 2px solid rgba(139, 92, 246, 0.4);
            border-radius: 30px;
            padding: 40px 30px;
            box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
        }
        .bot-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 2.2em;
            font-weight: 900;
            text-align: center;
            background: linear-gradient(135deg, var(--primary), var(--purple), var(--secondary));
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: rainbowShift 5s ease infinite;
            margin-bottom: 10px;
        }
        @keyframes rainbowShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        .status-badge {
            display: inline-block;
            padding: 12px 30px;
            border-radius: 50px;
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            margin: 20px 0;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 128, 0, 0.2));
            border: 2px solid var(--accent);
        }
        .status.connected {
            background: linear-gradient(135deg, rgba(0, 255, 128, 0.2), rgba(0, 242, 255, 0.2));
            border-color: var(--primary);
        }
        .method-tabs {
            display: flex;
            gap: 10px;
            margin: 25px 0;
        }
        .tab-btn {
            flex: 1;
            padding: 15px;
            border: 2px solid rgba(139, 92, 246, 0.5);
            background: rgba(139, 92, 246, 0.1);
            color: white;
            border-radius: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .tab-btn.active {
            background: linear-gradient(135deg, var(--purple), var(--primary));
            border-color: var(--primary);
        }
        .method-section {
            display: none;
        }
        .method-section.active {
            display: block;
        }
        .qr-container {
            background: white;
            border-radius: 20px;
            padding: 20px;
            margin: 20px 0;
            min-height: 296px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #qrcode { display: flex; justify-content: center; align-items: center; }
        .phone-input {
            width: 100%;
            padding: 18px;
            border: 2px solid rgba(139, 92, 246, 0.5);
            border-radius: 15px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            font-size: 1.1em;
            margin: 15px 0;
        }
        .generate-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, var(--purple), var(--primary));
            border: none;
            border-radius: 15px;
            color: white;
            font-size: 1.1em;
            font-weight: 700;
            cursor: pointer;
        }
        .code-display {
            background: linear-gradient(135deg, var(--primary), var(--purple));
            padding: 25px;
            border-radius: 15px;
            font-family: 'Orbitron', monospace;
            font-size: 2.5em;
            font-weight: 900;
            text-align: center;
            margin: 20px 0;
        }
        .social-buttons {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 30px 0 20px 0;
        }
        .social-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
            border-radius: 15px;
            font-weight: 700;
            font-size: 1.1em;
            text-decoration: none;
            transition: all 0.3s;
            border: 2px solid;
        }
        .btn-github {
            background: linear-gradient(135deg, #24292e, #000000);
            border-color: #ffffff;
            color: white;
        }
        .btn-youtube {
            background: linear-gradient(135deg, #ff0000, #cc0000);
            border-color: #ff0000;
            color: white;
        }
        .btn-tiktok {
            background: linear-gradient(135deg, #000000, #00f2ea);
            border-color: #00f2ea;
            color: white;
        }
        .btn-whatsapp {
            background: linear-gradient(135deg, #25d366, #128c7e);
            border-color: #25d366;
            color: white;
        }
        .social-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 30px rgba(255, 255, 255, 0.3);
        }
        .info-text {
            text-align: center;
            margin: 10px 0;
            color: rgba(255, 255, 255, 0.8);
        }
        .spinner {
            display: inline-block;
            width: 15px;
            height: 15px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="main-card">
            <h1 class="bot-title">YOUSAF-BALOCH-MD</h1>
            <div style="text-align: center;">
                <span class="status-badge" id="status">⏳ WAITING...</span>
            </div>
            <div class="method-tabs">
                <button class="tab-btn active" onclick="showQR()">📱 QR CODE</button>
                <button class="tab-btn" onclick="showPairing()">🔐 PAIRING CODE</button>
            </div>
            <div id="qr-section" class="method-section active">
                <div class="qr-container" id="qrcode">
                    <div class="info-text"><span class="spinner"></span> LOADING...</div>
                </div>
                <div class="info-text" id="qr-timer">⏰ WAITING FOR QR CODE</div>
            </div>
            <div id="pairing-section" class="method-section">
                <input type="tel" id="phone" class="phone-input" placeholder="923170636110" maxlength="15">
                <button class="generate-btn" onclick="generateCode()">🔐 GENERATE CODE</button>
                <div id="code-result" style="margin-top: 25px;"></div>
            </div>
            <div class="social-buttons">
                <a href="https://github.com/musakhanbaloch03-sad/YOUSAF-PAIRING-V1" target="_blank" class="social-btn btn-github">⭐ GITHUB</a>
                <a href="https://www.youtube.com/@Yousaf_Baloch_Tech" target="_blank" class="social-btn btn-youtube">📺 YOUTUBE</a>
                <a href="https://tiktok.com/@loser_boy.110" target="_blank" class="social-btn btn-tiktok">🎵 TIKTOK</a>
                <a href="https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j" target="_blank" class="social-btn btn-whatsapp">📢 CHANNEL</a>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <script>
        function showQR() {
            document.getElementById('qr-section').classList.add('active');
            document.getElementById('pairing-section').classList.remove('active');
            document.querySelectorAll('.tab-btn')[0].classList.add('active');
            document.querySelectorAll('.tab-btn')[1].classList.remove('active');
            loadQR();
        }
        function showPairing() {
            document.getElementById('pairing-section').classList.add('active');
            document.getElementById('qr-section').classList.remove('active');
            document.querySelectorAll('.tab-btn')[1].classList.add('active');
            document.querySelectorAll('.tab-btn')[0].classList.remove('active');
        }
        function loadQR() {
            const qrDiv = document.getElementById('qrcode');
            fetch('/qr').then(r => r.json()).then(data => {
                if (data.qr) {
                    qrDiv.innerHTML = '';
                    new QRCode(qrDiv, {
                        text: data.qr,
                        width: 256,
                        height: 256,
                        colorDark: '#000000',
                        colorLight: '#ffffff'
                    });
                    document.getElementById('qr-timer').textContent = '⏰ SCAN WITHIN 60 SECONDS';
                } else {
                    setTimeout(loadQR, 2000);
                }
            }).catch(() => setTimeout(loadQR, 2000));
        }
        function updateStatus() {
            fetch('/status').then(r => r.json()).then(data => {
                const el = document.getElementById('status');
                if (data.connected) {
                    el.className = 'status-badge status connected';
                    el.textContent = '✅ CONNECTED: ' + data.number;
                } else {
                    el.className = 'status-badge';
                    el.textContent = data.status === 'connecting' ? '🔄 CONNECTING...' : '⏳ WAITING...';
                }
            }).catch(() => {});
        }
        async function generateCode() {
            const phone = document.getElementById('phone').value.replace(/[^0-9]/g, '');
            const resultEl = document.getElementById('code-result');
            if (!phone || phone.length < 10) {
                resultEl.innerHTML = '<div class="info-text" style="color: #ff0080;">❌ INVALID NUMBER</div>';
                return;
            }
            resultEl.innerHTML = '<div class="info-text"><span class="spinner"></span> GENERATING...</div>';
            try {
                const response = await fetch('/pairing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone })
                });
                const data = await response.json();
                if (data.code) {
                    resultEl.innerHTML = \`<div class="code-display">\${data.code}</div><div class="info-text">⏰ ENTER IN WHATSAPP NOW</div>\`;
                } else {
                    resultEl.innerHTML = '<div class="info-text" style="color: #ff0080;">❌ ' + data.error + '</div>';
                }
            } catch (error) {
                resultEl.innerHTML = '<div class="info-text" style="color: #ff0080;">❌ ERROR</div>';
            }
        }
        setInterval(updateStatus, 3000);
        updateStatus();
        loadQR();
    </script>
</body>
</html>
  `);
});

app.get('/status', (req, res) => {
  res.json({
    connected: connectionStatus === 'connected',
    status: connectionStatus,
    number: global.conn?.user?.id?.split(':')[0] || null,
    qrReady: !!currentQR
  });
});

app.get('/qr', (req, res) => {
  res.json({ 
    qr: currentQR,
    timestamp: qrUpdateTime 
  });
});

app.post('/pairing', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.json({ error: 'Invalid phone number' });
    }
    if (!global.conn) {
      return res.json({ error: 'Bot starting, wait 10 seconds' });
    }
    const code = await global.conn.requestPairingCode(phone);
    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
    console.log(chalk.green(`\n✅ Code: ${formattedCode} for ${phone}\n`));
    res.json({ code: formattedCode });
  } catch (error) {
    console.error(chalk.red('Pairing error:'), error.message);
    res.json({ error: 'Failed to generate code' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(chalk.green(`\n✅ Server running on port ${PORT}\n`));
});

// Bot connection logic
let connectionAttempts = 0;
const MAX_ATTEMPTS = 3;
let isConnecting = false;

async function startBot() {
  if (isConnecting) return;
  if (connectionAttempts >= MAX_ATTEMPTS) {
    console.log(chalk.red('\n❌ Max attempts reached. Service requires restart.\n'));
    return;
  }

  try {
    isConnecting = true;
    connectionAttempts++;

    const {state, saveCreds} = await useMultiFileAuthState(sessionsDir);
    const {version} = await fetchLatestBaileysVersion();
    
    console.log(chalk.green(`✅ Baileys version: ${version.join(',')}\n`));
    
    const sock = makeWASocket({
      version,
      logger: Pino({level: 'silent'}),
      printQRInTerminal: false,
      browser: ['YOUSAF-BALOCH-MD', 'Chrome', '120.0.0'],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, Pino({level: 'silent'})),
      },
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false,
      syncFullHistory: false,
      getMessage: async () => ({ conversation: '' }),
      defaultQueryTimeoutMs: 60000,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
      qrTimeout: 60000,
      retryRequestDelayMs: 1000,
      maxMsgRetryCount: 2
    });

    global.conn = sock;
    isConnecting = false;

    sock.ev.on('connection.update', async (update) => {
      const {connection, lastDisconnect, qr} = update;
      
      if (qr) {
        currentQR = qr;
        qrUpdateTime = Date.now();
        connectionStatus = 'qr_ready';
        console.log(chalk.yellow('📱 QR Code updated\n'));
      }
      
      if (connection === 'connecting') {
        connectionStatus = 'connecting';
      }
      
      if (connection === 'open') {
        connectionStatus = 'connected';
        connectionAttempts = 0;
        currentQR = null;
        console.log(chalk.green('\n✅ CONNECTED!\n'));
        console.log(chalk.cyan(`📱 Number: ${sock.user.id.split(':')[0]}\n`));
      }
      
      if (connection === 'close') {
        connectionStatus = 'closed';
        const code = lastDisconnect?.error?.output?.statusCode;
        console.log(chalk.red(`\n❌ Connection closed (Code: ${code})\n`));
        
        if (code !== DisconnectReason.loggedOut && connectionAttempts < MAX_ATTEMPTS) {
          console.log(chalk.yellow(`⚠️  Reconnecting in 10 seconds...\n`));
          await delay(10000);
          startBot();
        } else if (code === DisconnectReason.loggedOut) {
          console.log(chalk.red('❌ Logged out. Scan QR or use pairing code.\n'));
          connectionAttempts = 0;
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);
    
  } catch (error) {
    isConnecting = false;
    console.error(chalk.red('❌ Bot Error:'), error.message);
    if (connectionAttempts < MAX_ATTEMPTS) {
      console.log(chalk.yellow('⚠️  Retrying in 15 seconds...\n'));
      await delay(15000);
      startBot();
    }
  }
}

startBot();

process.on('unhandledRejection', (err) => {
  console.error(chalk.red('Unhandled Rejection:'), err.message);
});

process.on('uncaughtException', (err) => {
  console.error(chalk.red('Uncaught Exception:'), err.message);
});
