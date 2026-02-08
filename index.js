/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     YOUSAF-BALOCH-MD WhatsApp Bot      ┃
┃        Ultra Premium Edition           ┃
┃           FIXED VERSION                ┃
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
console.log(chalk.yellow('🚀 Ultra Premium WhatsApp Bot - FIXED VERSION'));
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
        .tabs {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }
        .tab {
            flex: 1;
            padding: 15px;
            text-align: center;
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            font-size: 0.95em;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid rgba(139, 92, 246, 0.3);
            background: rgba(139, 92, 246, 0.1);
        }
        .tab.active {
            background: linear-gradient(135deg, var(--purple), var(--primary));
            border-color: var(--primary);
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
            transform: translateY(-3px);
        }
        .tab-content {
            display: none;
            position: relative;
            z-index: 1;
        }
        .tab-content.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .qr-container {
            text-align: center;
            margin-bottom: 25px;
        }
        .qr-box {
            background: white;
            padding: 20px;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 15px;
            box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
        }
        .qr-box img {
            max-width: 280px;
            width: 100%;
            height: auto;
        }
        .info-text {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.95em;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 10px;
        }
        .pairing-form {
            margin-bottom: 25px;
        }
        .input-group {
            margin-bottom: 20px;
        }
        .input-group label {
            display: block;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.9em;
            margin-bottom: 10px;
            color: var(--accent);
        }
        .input-group input {
            width: 100%;
            padding: 15px 20px;
            border-radius: 15px;
            border: 2px solid rgba(0, 242, 255, 0.3);
            background: rgba(0, 0, 0, 0.5);
            color: white;
            font-family: 'Orbitron', sans-serif;
            font-size: 1.1em;
            transition: all 0.3s ease;
        }
        .input-group input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 20px rgba(0, 242, 255, 0.3);
        }
        .btn {
            width: 100%;
            padding: 18px;
            border-radius: 15px;
            border: none;
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            font-size: 1.1em;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .btn-primary {
            background: linear-gradient(135deg, var(--purple), var(--primary));
            color: white;
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
        }
        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(139, 92, 246, 0.6);
        }
        .btn-primary:active {
            transform: translateY(-1px);
        }
        .code-display {
            font-family: 'Orbitron', monospace;
            font-size: 2.5em;
            font-weight: 900;
            text-align: center;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientFlow 3s ease infinite;
            margin-bottom: 15px;
            letter-spacing: 5px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            position: relative;
            z-index: 1;
        }
        .social-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
        }
        .social-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3em;
            transition: all 0.3s ease;
            border: 2px solid;
        }
        .social-btn.whatsapp {
            background: linear-gradient(135deg, #25D366, #128C7E);
            border-color: #25D366;
        }
        .social-btn.github {
            background: linear-gradient(135deg, #333, #000);
            border-color: #fff;
        }
        .social-btn.youtube {
            background: linear-gradient(135deg, #FF0000, #CC0000);
            border-color: #FF0000;
        }
        .social-btn:hover {
            transform: translateY(-5px) scale(1.1);
            box-shadow: 0 10px 25px rgba(255, 255, 255, 0.3);
        }
        .copyright {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.85em;
            color: rgba(255, 255, 255, 0.6);
        }
        @media (max-width: 480px) {
            .time-display { font-size: 2em; }
            .bot-title { font-size: 1.8em; }
            .qr-box img { max-width: 240px; }
            .code-display { font-size: 2em; letter-spacing: 3px; }
        }
    </style>
</head>
<body>
    <div class="particles" id="particles"></div>
    <div class="container">
        <div class="header-time">
            <div class="time-display" id="time">00:00:00</div>
            <div class="date-display" id="date">Loading...</div>
        </div>
        
        <div class="main-card">
            <h1 class="bot-title">YOUSAF-BALOCH-MD</h1>
            <p class="bot-subtitle">🚀 PREMIUM MULTI-DEVICE WHATSAPP BOT 🚀</p>
            
            <div class="dev-info">
                <div class="dev-name">⚡ MR YOUSAF BALOCH ⚡</div>
                <div class="dev-contact">📱 +92 317 0636110</div>
            </div>
            
            <div style="text-align: center;">
                <span class="status-badge">✨ ULTRA PREMIUM EDITION ✨</span>
            </div>
            
            <div class="tabs">
                <div class="tab active" onclick="switchTab('qr')">QR CODE</div>
                <div class="tab" onclick="switchTab('pairing')">PAIRING CODE</div>
            </div>
            
            <div id="qr-tab" class="tab-content active">
                <div class="qr-container">
                    <div class="qr-box">
                        <img id="qr-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='280'%3E%3Crect width='280' height='280' fill='%23fff'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23000' font-family='monospace' font-size='16'%3ELoading QR...%3C/text%3E%3C/svg%3E" alt="QR Code">
                    </div>
                    <div class="info-text">📱 SCAN WITH WHATSAPP</div>
                    <div class="info-text">Settings → Linked Devices → Link a Device</div>
                    <div class="info-text">⏰ QR Code expires in 60 seconds</div>
                </div>
            </div>
            
            <div id="pairing-tab" class="tab-content">
                <div class="pairing-form">
                    <div class="input-group">
                        <label>📱 ENTER YOUR PHONE NUMBER</label>
                        <input type="tel" id="phone" placeholder="923170636110" maxlength="15">
                    </div>
                    <button class="btn btn-primary" onclick="generateCode()">
                        🔐 GENERATE PAIRING CODE
                    </button>
                </div>
                <div id="pairing-result"></div>
            </div>
            
            <div class="footer">
                <div class="social-links">
                    <a href="https://wa.me/923170636110" target="_blank" class="social-btn whatsapp">📱</a>
                    <a href="https://github.com/musakhanbaloch03-sad" target="_blank" class="social-btn github">💻</a>
                    <a href="https://youtube.com/@yousafbaloch" target="_blank" class="social-btn youtube">📺</a>
                </div>
                <div class="copyright">
                    © 2024 YOUSAF-BALOCH-MD | Made with ❤️ in Pakistan 🇵🇰
                </div>
            </div>
        </div>
    </div>

    <script>
        // Particles
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = Math.random() * 4 + 2 + 'px';
            particle.style.height = particle.style.width;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = Math.random() * 10 + 15 + 's';
            particlesContainer.appendChild(particle);
        }

        // Time & Date
        function updateTime() {
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour12: false });
            const date = now.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            document.getElementById('time').textContent = time;
            document.getElementById('date').textContent = date;
        }
        updateTime();
        setInterval(updateTime, 1000);

        // Tab switching
        function switchTab(tab) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            if (tab === 'qr') {
                document.querySelector('.tab:first-child').classList.add('active');
                document.getElementById('qr-tab').classList.add('active');
            } else {
                document.querySelector('.tab:last-child').classList.add('active');
                document.getElementById('pairing-tab').classList.add('active');
            }
        }

        // QR Code updates
        async function updateQR() {
            try {
                const response = await fetch('/qr');
                const data = await response.json();
                if (data.qr) {
                    const qrImg = document.getElementById('qr-img');
                    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=' + encodeURIComponent(data.qr);
                }
            } catch (error) {
                console.error('QR update error:', error);
            }
        }
        setInterval(updateQR, 3000);
        updateQR();

        // Pairing code generation
        async function generateCode() {
            const phone = document.getElementById('phone').value.replace(/\D/g, '');
            const resultEl = document.getElementById('pairing-result');
            
            if (phone.length < 10) {
                resultEl.innerHTML = '<div class="info-text" style="color: #ff0080;">❌ INVALID NUMBER</div>';
                return;
            }
            
            resultEl.innerHTML = '<div class="info-text">⏳ GENERATING CODE...</div>';
            
            try {
                const response = await fetch('/pairing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone })
                });
                const data = await response.json();
                if (data.code) {
                    resultEl.innerHTML = `
                        <div class="code-display">\${data.code}</div>
                        <div class="info-text">⏰ ENTER IN WHATSAPP WITHIN 60 SECONDS</div>
                        <div class="info-text">WhatsApp → Linked Devices → Link with Phone Number</div>
                    `;
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
    
    // FIX 1: Check if connection exists before requesting code
    if (!global.conn) {
      return res.json({ error: 'Bot is starting, please wait 10 seconds...' });
    }
    
    // Check if bot is ready
    if (connectionStatus === 'closed' || !global.conn.user) {
      return res.json({ error: 'Bot is reconnecting, please wait...' });
    }
    
    const code = await global.conn.requestPairingCode(phone);
    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
    console.log(chalk.green(`\n🔐 Code: ${formattedCode} for ${phone}\n`));
    res.json({ code: formattedCode });
  } catch (error) {
    console.error('Pairing error:', error);
    res.json({ error: 'Failed to generate code. Try again in 10 seconds.' });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    connected: connectionStatus === 'connected'
  });
});

app.listen(PORT, () => {
  console.log(chalk.green(`\n✅ Server running on port ${PORT}\n`));
});

// FIX 2: Prevent multiple reconnection attempts
let isReconnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// FIX 3: Initialize message store BEFORE startBot function
const store = {
  messages: {},
  loadMessage: async (jid, id) => {
    return store.messages[jid]?.[id];
  }
};

async function startBot() {
  try {
    const sessionFolder = path.join(__dirname, 'sessions');
    const {state, saveCreds} = await useMultiFileAuthState(sessionFolder);
    const {version} = await fetchLatestBaileysVersion();
    
    console.log(chalk.green(`✅ Baileys version: ${version.join('.')}\n`));
    
    const sock = makeWASocket({
      version,
      logger: Pino({level: 'silent'}),
      printQRInTerminal: false,
      browser: ['YOUSAF-BALOCH-MD', 'Chrome', '1.0.0'],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, Pino({level: 'silent'})),
      },
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      // FIX 4: getMessage handler - now store is already defined above
      getMessage: async (key) => {
        if (store) {
          const msg = await store.loadMessage(key.remoteJid, key.id);
          return msg?.message || undefined;
        }
        return {
          conversation: 'Hello'
        };
      },
      // FIX 5: Improved connection options to prevent timeout
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: undefined,
      keepAliveIntervalMs: 10000,
      emitOwnEvents: true,
      fireInitQueries: true,
      shouldIgnoreJid: (jid) => false,
      // FIX 6: Add this to prevent history sync issues
      shouldSyncHistoryMessage: () => false
    });

    global.conn = sock;

    sock.ev.on('messages.upsert', ({ messages }) => {
      for (const msg of messages) {
        if (msg.key.remoteJid && msg.key.id) {
          if (!store.messages[msg.key.remoteJid]) {
            store.messages[msg.key.remoteJid] = {};
          }
          store.messages[msg.key.remoteJid][msg.key.id] = msg;
        }
      }
    });

    sock.ev.on('connection.update', async (update) => {
      const {connection, lastDisconnect, qr} = update;
      
      if (qr) {
        currentQR = qr;
        console.log(chalk.yellow('📱 QR Code updated\n'));
      }
      
      if (connection === 'open') {
        connectionStatus = 'connected';
        isReconnecting = false;
        reconnectAttempts = 0;
        console.log(chalk.green('✅ ✅ ✅ BOT SUCCESSFULLY CONNECTED! ✅ ✅ ✅\n'));
        console.log(chalk.cyan(`📱 Number: ${sock.user.id.split(':')[0]}\n`));
      }
      
      if (connection === 'close') {
        connectionStatus = 'closed';
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const reason = lastDisconnect?.error?.output?.payload?.error;
        
        console.log(chalk.red(`❌ Connection closed - Reason: ${reason || 'Unknown'}\n`));
        
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        // FIX 7: Improved reconnection logic with exponential backoff
        if (shouldReconnect && !isReconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          isReconnecting = true;
          reconnectAttempts++;
          
          const delay = Math.min(5000 * reconnectAttempts, 30000); // Max 30 seconds
          console.log(chalk.yellow(`⚠️  Reconnecting in ${delay/1000} seconds... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})\n`));
          
          setTimeout(() => {
            isReconnecting = false;
            startBot();
          }, delay);
        } else if (statusCode === DisconnectReason.loggedOut) {
          console.log(chalk.red('❌ Logged out. Delete sessions folder and reconnect.\n'));
          reconnectAttempts = 0;
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.log(chalk.red('❌ Max reconnection attempts reached. Waiting 60 seconds...\n'));
          setTimeout(() => {
            reconnectAttempts = 0;
            isReconnecting = false;
            startBot();
          }, 60000);
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);
    
  } catch (error) {
    console.error(chalk.red('❌ Bot startup error:'), error);
    if (!isReconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      isReconnecting = true;
      reconnectAttempts++;
      console.log(chalk.yellow(`⚠️  Restarting in 10 seconds...\n`));
      setTimeout(() => {
        isReconnecting = false;
        startBot();
      }, 10000);
    }
  }
}

// FIX 8: Graceful shutdown handling
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️  Shutting down gracefully...\n'));
  if (global.conn) {
    global.conn.end();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n⚠️  Received SIGTERM, shutting down...\n'));
  if (global.conn) {
    global.conn.end();
  }
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error(chalk.red('Unhandled Rejection:'), err);
});

process.on('uncaughtException', (err) => {
  console.error(chalk.red('Uncaught Exception:'), err);
});

// Start the bot
startBot();
