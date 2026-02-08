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

const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWASocket } = await import('@whiskeysockets/baileys');

const PORT = process.env.PORT || 8000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
        }
        .particle {
            position: absolute;
            background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
            border-radius: 50%;
            animation: float 20s infinite;
            opacity: 0.3;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.3; }
            90% { opacity: 0.3; }
            100% { transform: translateY(-100vh) translateX(100px) rotate(360deg); opacity: 0; }
        }
        .container {
            position: relative;
            z-index: 1;
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .header-time {
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(20px);
            border: 2px solid rgba(0, 242, 255, 0.3);
            border-radius: 25px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 0 40px rgba(0, 242, 255, 0.2);
            animation: slideDown 0.8s ease;
        }
        @keyframes slideDown {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .time-display {
            font-family: 'Orbitron', monospace;
            font-size: 2.5em;
            font-weight: 900;
            text-align: center;
            background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent));
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientFlow 3s ease infinite;
            margin-bottom: 10px;
        }
        @keyframes gradientFlow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        .date-display {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.1em;
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
        }
        .main-card {
            background: rgba(10, 10, 10, 0.8);
            backdrop-filter: blur(30px);
            border: 2px solid rgba(139, 92, 246, 0.4);
            border-radius: 30px;
            padding: 40px 30px;
            box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
            animation: scaleUp 0.8s ease;
            position: relative;
            overflow: hidden;
        }
        .main-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(139, 92, 246, 0.1), transparent);
            transform: rotate(45deg);
            animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        @keyframes scaleUp {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
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
            background-clip: text;
            animation: rainbowShift 5s ease infinite;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        @keyframes rainbowShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        .bot-subtitle {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.9em;
            text-align: center;
            color: var(--accent);
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
        }
        .dev-info {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
        }
        .dev-name {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.3em;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 5px;
        }
        .dev-contact {
            font-size: 0.95em;
            color: rgba(255, 255, 255, 0.7);
        }
        .status-badge {
            display: inline-block;
            padding: 12px 30px;
            border-radius: 50px;
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            font-size: 1em;
            margin-bottom: 30px;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 128, 0, 0.2));
            border: 2px solid var(--accent);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            animation: pulse 2s ease infinite;
            position: relative;
            z-index: 1;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
            50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); }
        }
        .status.connected {
            background: linear-gradient(135deg, rgba(0, 255, 128, 0.2), rgba(0, 242, 255, 0.2));
            border-color: var(--primary);
            box-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
        }
        .method-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }
        .tab-btn {
            flex: 1;
            padding: 15px;
            border: 2px solid rgba(139, 92, 246, 0.5);
            background: rgba(139, 92, 246, 0.1);
            color: white;
            border-radius: 15px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 600;
            font-size: 1em;
            cursor: pointer;
            transition: all 0.3s;
        }
        .tab-btn:hover {
            background: rgba(139, 92, 246, 0.3);
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
        }
        .tab-btn.active {
            background: linear-gradient(135deg, var(--purple), var(--primary));
            border-color: var(--primary);
            box-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
        }
        .method-section {
            display: none;
            animation: fadeIn 0.5s ease;
            position: relative;
            z-index: 1;
        }
        .method-section.active {
            display: block;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .qr-container {
            background: white;
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 10px 40px rgba(0, 242, 255, 0.3);
        }
        #qrcode {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 256px;
        }
        .qr-timer {
            text-align: center;
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            color: var(--accent);
            margin-top: 15px;
            font-size: 1em;
        }
        .input-group {
            margin-bottom: 20px;
        }
        .input-label {
            display: block;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 600;
            margin-bottom: 10px;
            color: var(--primary);
            font-size: 1em;
        }
        .phone-input {
            width: 100%;
            padding: 18px;
            border: 2px solid rgba(139, 92, 246, 0.5);
            border-radius: 15px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            font-size: 1.1em;
            font-family: 'Orbitron', monospace;
            transition: all 0.3s;
        }
        .phone-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 20px rgba(0, 242, 255, 0.3);
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
            font-family: 'Space Grotesk', sans-serif;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 5px 20px rgba(139, 92, 246, 0.4);
        }
        .generate-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(139, 92, 246, 0.6);
        }
        .generate-btn:active {
            transform: translateY(0);
        }
        .code-display {
            background: linear-gradient(135deg, var(--primary), var(--purple));
            padding: 25px;
            border-radius: 15px;
            font-family: 'Orbitron', monospace;
            font-size: 2.5em;
            font-weight: 900;
            text-align: center;
            letter-spacing: 0.1em;
            margin-bottom: 20px;
            box-shadow: 0 0 40px rgba(0, 242, 255, 0.5);
            animation: codeGlow 2s ease infinite;
        }
        @keyframes codeGlow {
            0%, 100% { box-shadow: 0 0 40px rgba(0, 242, 255, 0.5); }
            50% { box-shadow: 0 0 60px rgba(0, 242, 255, 0.8); }
        }
        .info-text {
            text-align: center;
            font-size: 0.95em;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 10px;
            line-height: 1.6;
        }
        .spinner {
            display: inline-block;
            width: 15px;
            height: 15px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 8px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .instructions {
            background: rgba(139, 92, 246, 0.1);
            border: 2px solid rgba(139, 92, 246, 0.3);
            border-radius: 15px;
            padding: 20px;
            margin-top: 25px;
            position: relative;
            z-index: 1;
        }
        .instructions h3 {
            font-family: 'Orbitron', sans-serif;
            color: var(--primary);
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        .instructions ol {
            padding-left: 20px;
            line-height: 1.8;
        }
        .instructions li {
            margin-bottom: 8px;
            color: rgba(255, 255, 255, 0.9);
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 25px;
            border-top: 2px solid rgba(139, 92, 246, 0.3);
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.6);
            position: relative;
            z-index: 1;
        }
        .footer a {
            color: var(--primary);
            text-decoration: none;
            transition: color 0.3s;
        }
        .footer a:hover {
            color: var(--accent);
        }
    </style>
</head>
<body>
    <div class="particles"></div>
    <div class="container">
        <div class="header-time">
            <div class="time-display" id="time">00:00:00</div>
            <div class="date-display" id="date">LOADING...</div>
        </div>
        <div class="main-card">
            <h1 class="bot-title">YOUSAF-BALOCH-MD</h1>
            <p class="bot-subtitle">⚡ ULTRA PREMIUM WHATSAPP BOT ⚡</p>
            <div class="dev-info">
                <div class="dev-name">👨‍💻 MR YOUSAF BALOCH</div>
                <div class="dev-contact">📱 +92 317 0636110</div>
            </div>
            <div style="text-align: center; margin-bottom: 30px;">
                <span class="status-badge" id="status">⏳ Waiting...</span>
            </div>
            <div class="method-tabs">
                <button class="tab-btn" onclick="showQR()">📱 QR CODE</button>
                <button class="tab-btn active" onclick="showPairing()">🔐 PAIRING CODE</button>
            </div>
            <div id="qr-section" class="method-section">
                <div class="qr-container">
                    <div id="qrcode"></div>
                </div>
                <div class="qr-timer" id="qr-timer">⏰ LOADING...</div>
                <div class="instructions">
                    <h3>📱 HOW TO CONNECT</h3>
                    <ol>
                        <li>Open WhatsApp on your phone</li>
                        <li>Tap Menu or Settings → Linked Devices</li>
                        <li>Tap "Link a Device"</li>
                        <li>Scan this QR code</li>
                    </ol>
                </div>
            </div>
            <div id="pairing-section" class="method-section active">
                <div class="input-group">
                    <label class="input-label">📱 ENTER PHONE NUMBER (WITH COUNTRY CODE)</label>
                    <input type="tel" id="phone" class="phone-input" placeholder="923170636110" maxlength="15">
                </div>
                <button class="generate-btn" onclick="generateCode()">🔐 GENERATE CODE</button>
                <div id="code-result" style="margin-top: 25px;"></div>
                <div class="instructions">
                    <h3>🔐 HOW TO USE PAIRING CODE</h3>
                    <ol>
                        <li>Enter your WhatsApp number with country code</li>
                        <li>Click "Generate Code" button</li>
                        <li>Open WhatsApp → Linked Devices</li>
                        <li>Select "Link with Phone Number"</li>
                        <li>Enter the code within 60 seconds</li>
                    </ol>
                </div>
            </div>
            <div class="footer">
                Powered by <a href="https://github.com/YOUSAF-BALOCH-MD" target="_blank">YOUSAF-BALOCH-MD</a> © 2026
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <script>
        const particles = document.querySelector('.particles');
        function createParticles() {
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                const size = Math.random() * 5 + 2;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 20 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
                particles.appendChild(particle);
            }
        }
        createParticles();
        function updateDateTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            document.getElementById('time').textContent = \`\${hours}:\${minutes}:\${seconds}\`;
            const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const day = days[now.getDay()];
            const month = months[now.getMonth()];
            const date = now.getDate();
            const year = now.getFullYear();
            document.getElementById('date').textContent = \`\${day}, \${month} \${date}, \${year}\`;
        }
        setInterval(updateDateTime, 1000);
        updateDateTime();
        function updateStatus() {
            fetch('/status').then(r => r.json()).then(data => {
                const statusEl = document.getElementById('status');
                if (data.connected) {
                    statusEl.className = 'status-badge status connected';
                    statusEl.innerHTML = '✅ CONNECTED: ' + data.number;
                } else {
                    statusEl.className = 'status-badge';
                    statusEl.textContent = '⏳ Waiting...';
                }
            }).catch(() => {});
        }
        setInterval(updateStatus, 3000);
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
            fetch('/qr').then(r => r.json()).then(data => {
                if (data.qr) {
                    const qrDiv = document.getElementById('qrcode');
                    qrDiv.innerHTML = '';
                    new QRCode(qrDiv, {
                        text: data.qr,
                        width: 256,
                        height: 256,
                        colorDark: '#000000',
                        colorLight: '#ffffff'
                    });
                    startQRTimer();
                }
            });
        }
        let timerInterval;
        function startQRTimer() {
            let seconds = 60;
            const timerEl = document.getElementById('qr-timer');
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                seconds--;
                timerEl.textContent = \`⏰ EXPIRES IN \${seconds}S\`;
                if (seconds <= 0) {
                    clearInterval(timerInterval);
                    timerEl.textContent = '⚠️ EXPIRED! REFRESH PAGE';
                }
            }, 1000);
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
                    resultEl.innerHTML = \`
                        <div class="code-display">\${data.code}</div>
                        <div class="info-text">⏰ ENTER IN WHATSAPP WITHIN 60 SECONDS</div>
                        <div class="info-text">WhatsApp → Linked Devices → Link with Phone Number</div>
                    \`;
                } else {
                    resultEl.innerHTML = '<div class="info-text" style="color: #ff0080;">❌ ' + data.error + '</div>';
                }
            } catch (error) {
                resultEl.innerHTML = '<div class="info-text" style="color: #ff0080;">❌ ERROR OCCURRED</div>';
            }
        }
        document.getElementById('phone').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') { generateCode(); }
        });
    </script>
</body>
</html>
  `);
});

app.get('/status', (req, res) => {
  res.json({
    connected: connectionStatus === 'connected',
    number: global.conn?.user?.id?.split(':')[0] || null
  });
});

app.get('/qr', (req, res) => {
  res.json({ qr: currentQR });
});

app.post('/pairing', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.json({ error: 'Invalid phone number' });
    }
    const code = await global.conn.requestPairingCode(phone);
    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
    console.log(chalk.green(`\n🔐 Code: ${formattedCode} for ${phone}\n`));
    res.json({ code: formattedCode });
  } catch (error) {
    console.error('Pairing error:', error);
    res.json({ error: 'Failed to generate' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(chalk.green(`\n✅ Server running on port ${PORT}\n`));
});

async function startBot() {
  const sessionFolder = path.join(__dirname, 'sessions');
  const {state, saveCreds} = await useMultiFileAuthState(sessionFolder);
  const {version} = await fetchLatestBaileysVersion();
  
  console.log(chalk.green(`✅ Baileys version: ${version}\n`));
  
  const sock = makeWASocket({
    version,
    logger: Pino({level: 'silent'}),
    printQRInTerminal: false,
    browser: ['YOUSAF-BALOCH-MD', 'Safari', '1.0.0'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, Pino({level: 'silent'})),
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
  });

  global.conn = sock;

  sock.ev.on('connection.update', async (update) => {
    const {connection, lastDisconnect, qr} = update;
    
    if (qr) {
      currentQR = qr;
      console.log(chalk.yellow('📱 QR Code updated\n'));
    }
    
    const code = lastDisconnect?.error?.output?.statusCode;
    
    if (code && code !== DisconnectReason.loggedOut && !sock?.ws.socket) {
      console.log(chalk.yellow('⚠️  Reconnecting...\n'));
      connectionStatus = 'reconnecting';
      setTimeout(() => startBot(), 3000);
    }
    
    if (connection === 'open') {
      connectionStatus = 'connected';
      console.log(chalk.green('✅ BOT CONNECTED!\n'));
      console.log(chalk.cyan(`📱 Number: ${sock.user.id.split(':')[0]}\n`));
    }
    
    if (connection === 'close') {
      connectionStatus = 'closed';
      console.log(chalk.red('❌ Connection closed\n'));
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

startBot();

process.on('unhandledRejection', (err) => {
  console.error(chalk.red('Unhandled Rejection:'), err);
});

process.on('uncaughtException', (err) => {
  console.error(chalk.red('Uncaught Exception:'), err);
});
      
