/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     YOUSAF-BALOCH-MD WhatsApp Bot      ┃
┃        Ultra Premium Edition           ┃
┃          WORKING VERSION               ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/

import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import yargs from 'yargs';
import chalk from 'chalk';
import Pino from 'pino';
import figlet from 'figlet';
import express from 'express';
import NodeCache from 'node-cache';

const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWASocket } = await import('@whiskeysockets/baileys');

const PORT = process.env.PORT || 8000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());

console.clear();
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.green(figlet.textSync('YOUSAF-BALOCH-MD', { font: 'Standard' })));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
console.log(chalk.yellow('🚀 Ultra Premium WhatsApp Bot - FIXED VERSION'));
console.log(chalk.green('🌐 Server starting on port ' + PORT + '...\n'));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

const app = express();
const msgRetryCounterCache = new NodeCache();
let currentQR = null;
let connectionStatus = 'waiting';
let connectedNumber = null;
let sock = null;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH-MD - Premium Bot</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #00f2ff; --secondary: #ff0080; --accent: #ffd700; --purple: #8b5cf6; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(-45deg, #000000, #0a0033, #1a0033, #330066);
            background-size: 400% 400%;
            animation: gradientShift 20s ease infinite;
            min-height: 100vh;
            color: white;
        }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .container { position: relative; z-index: 1; max-width: 500px; margin: 50px auto; padding: 20px; }
        .header-time {
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(20px);
            border: 2px solid rgba(0, 242, 255, 0.3);
            border-radius: 25px;
            padding: 25px;
            margin-bottom: 25px;
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
            animation: gradientFlow 3s ease infinite;
            margin-bottom: 10px;
        }
        @keyframes gradientFlow { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .date-display { font-size: 1.1em; text-align: center; color: rgba(255, 255, 255, 0.8); }
        .main-card {
            background: rgba(10, 10, 10, 0.8);
            backdrop-filter: blur(30px);
            border: 2px solid rgba(139, 92, 246, 0.4);
            border-radius: 30px;
            padding: 40px 30px;
        }
        .bot-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 2.2em;
            font-weight: 900;
            text-align: center;
            background: linear-gradient(135deg, var(--primary), var(--purple), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .bot-subtitle { text-align: center; color: var(--accent); margin-bottom: 20px; }
        .dev-info { text-align: center; margin-bottom: 30px; }
        .dev-name { font-family: 'Orbitron', sans-serif; font-size: 1.3em; color: var(--primary); margin-bottom: 5px; }
        .dev-contact { font-size: 0.95em; color: rgba(255, 255, 255, 0.7); }
        .status-badge {
            display: inline-block;
            padding: 12px 30px;
            border-radius: 50px;
            background: rgba(255, 215, 0, 0.2);
            border: 2px solid var(--accent);
            margin-bottom: 30px;
        }
        .status-text { color: var(--accent); }
        .status.connected { color: #00ff00; }
        .buttons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .method-btn {
            background: linear-gradient(135deg, rgba(0, 242, 255, 0.2), rgba(139, 92, 246, 0.2));
            border: 2px solid var(--primary);
            border-radius: 20px;
            padding: 25px 15px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;
        }
        .method-btn:hover { transform: translateY(-5px); }
        .method-icon { font-size: 3em; margin-bottom: 10px; }
        .method-title { font-family: 'Orbitron', sans-serif; font-size: 1.1em; margin-bottom: 5px; }
        .method-desc { font-size: 0.85em; color: rgba(255, 255, 255, 0.6); }
        .modal-section { display: none; }
        .modal-section.active { display: block; }
        .modal-title { font-family: 'Orbitron', sans-serif; font-size: 1.5em; text-align: center; color: var(--primary); margin-bottom: 20px; }
        .qr-container { background: white; border-radius: 20px; padding: 20px; margin: 20px 0; display: flex; justify-content: center; }
        #qrcode { display: inline-block; }
        .qr-timer { font-family: 'Orbitron', monospace; font-size: 1.2em; color: var(--accent); text-align: center; margin-top: 15px; }
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
        input:focus { outline: none; border-color: var(--primary); }
        .generate-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, var(--primary), var(--purple));
            border: none;
            border-radius: 15px;
            color: white;
            font-size: 1.1em;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
        }
        .generate-btn:hover { transform: translateY(-3px); }
        .code-display {
            font-family: 'Orbitron', monospace;
            font-size: 2.5em;
            font-weight: 900;
            letter-spacing: 15px;
            color: var(--primary);
            text-align: center;
            padding: 30px;
            background: rgba(0, 0, 0, 0.6);
            border: 3px solid var(--primary);
            border-radius: 20px;
            margin: 20px 0;
        }
        .info-text { text-align: center; color: rgba(255, 255, 255, 0.7); margin: 15px 0; }
        .error-text { color: #ff0080 !important; }
        .social-links { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 30px; }
        .social-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            color: white;
            text-decoration: none;
            transition: all 0.3s;
        }
        .social-btn:hover { background: rgba(255, 0, 128, 0.2); transform: translateY(-3px); }
        .spinner { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(0, 242, 255, 0.3); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-time">
            <div class="time-display" id="time">00:00:00</div>
            <div class="date-display" id="date">Loading...</div>
        </div>
        <div class="main-card">
            <h1 class="bot-title">⚡ YOUSAF-BALOCH-MD ⚡</h1>
            <div class="bot-subtitle">ULTRA PREMIUM EDITION</div>
            <div class="dev-info">
                <div class="dev-name">MUHAMMAD YOUSAF BALOCH</div>
                <div class="dev-contact">📞 +923710636110</div>
            </div>
            <div class="status-badge">
                <div class="status-text">Status: <span id="status">⏳ Waiting...</span></div>
            </div>
            <div class="buttons-grid">
                <div class="method-btn" onclick="showQR()">
                    <div class="method-icon">📱</div>
                    <div class="method-title">QR CODE</div>
                    <div class="method-desc">Scan & Connect</div>
                </div>
                <div class="method-btn" onclick="showPairing()">
                    <div class="method-icon">🔐</div>
                    <div class="method-title">PAIRING</div>
                    <div class="method-desc">8-Digit Code</div>
                </div>
            </div>
            <div id="qr-section" class="modal-section">
                <div class="modal-title">📱 SCAN QR CODE</div>
                <div class="info-text">WhatsApp → Linked Devices → Link a Device</div>
                <div class="qr-container" id="qrcode"></div>
                <div class="qr-timer" id="qr-timer"></div>
            </div>
            <div id="pairing-section" class="modal-section">
                <div class="modal-title">🔐 PAIRING CODE</div>
                <div class="input-wrapper">
                    <input type="tel" id="phone" placeholder="923710636110" maxlength="15">
                    <button class="generate-btn" onclick="generateCode()">🚀 GENERATE CODE</button>
                </div>
                <div id="code-result"></div>
            </div>
            <div class="social-links">
                <a href="https://github.com/musakhanbaloch03-sad" target="_blank" class="social-btn"><span>💻</span><span>GitHub</span></a>
                <a href="https://www.youtube.com/@Yousaf_Baloch_Tech" target="_blank" class="social-btn"><span>📺</span><span>YouTube</span></a>
                <a href="https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j" target="_blank" class="social-btn"><span>📢</span><span>Channel</span></a>
                <a href="https://tiktok.com/@loser_boy.110" target="_blank" class="social-btn"><span>🎵</span><span>TikTok</span></a>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <script>
        function updateDateTime() {
            const now = new Date();
            document.getElementById('time').textContent = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') + ':' + String(now.getSeconds()).padStart(2,'0');
            const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
            const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
            document.getElementById('date').textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
        }
        setInterval(updateDateTime, 1000);
        updateDateTime();
        
        function updateStatus() {
            fetch('/status').then(r => r.json()).then(d => {
                const s = document.getElementById('status');
                if (d.connected) {
                    s.className = 'status connected';
                    s.textContent = '✅ CONNECTED: ' + d.number;
                } else {
                    s.className = 'status';
                    s.textContent = '⏳ ' + (d.message || 'Waiting...');
                }
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
                } else if (d.error) {
                    document.getElementById('qrcode').innerHTML = '<div class="info-text error-text">' + d.error + '</div>';
                }
            });
        }
        
        let ti;
        function startTimer() {
            let sec = 60;
            const t = document.getElementById('qr-timer');
            clearInterval(ti);
            ti = setInterval(() => {
                sec--;
                t.textContent = '⏰ EXPIRES IN ' + sec + 'S';
                if (sec <= 0) {
                    clearInterval(ti);
                    t.textContent = '⚠️ EXPIRED! CLICK QR CODE AGAIN';
                }
            }, 1000);
        }
        
        async function generateCode() {
            const phone = document.getElementById('phone').value.replace(/[^0-9]/g, '');
            const r = document.getElementById('code-result');
            if (!phone || phone.length < 10) {
                r.innerHTML = '<div class="info-text error-text">❌ INVALID NUMBER</div>';
                return;
            }
            r.innerHTML = '<div class="info-text"><span class="spinner"></span> GENERATING...</div>';
            try {
                const res = await fetch('/pairing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phone })
                });
                const d = await res.json();
                if (d.code) {
                    r.innerHTML = '<div class="code-display">' + d.code + '</div><div class="info-text">⏰ ENTER IN WHATSAPP WITHIN 60 SECONDS</div><div class="info-text">WhatsApp → Linked Devices → Link with Phone Number</div>';
                } else {
                    r.innerHTML = '<div class="info-text error-text">❌ ' + (d.error || 'ERROR') + '</div>';
                }
            } catch (error) {
                r.innerHTML = '<div class="info-text error-text">❌ CONNECTION ERROR</div>';
            }
        }
        
        document.getElementById('phone').addEventListener('keypress', e => { if (e.key === 'Enter') generateCode(); });
    </script>
</body>
</html>`;
  res.send(html);
});

app.get('/status', (req, res) => {
  res.json({
    connected: connectionStatus === 'connected',
    number: connectedNumber,
    message: connectionStatus === 'connecting' ? 'Connecting to WhatsApp...' : 
             connectionStatus === 'waiting' ? 'Waiting for connection...' : 
             connectionStatus === 'connected' ? 'Connected' : 'Disconnected'
  });
});

app.get('/qr', (req, res) => {
  if (!currentQR) {
    return res.json({ error: 'Bot is connecting... Please wait 10 seconds and try again.' });
  }
  res.json({ qr: currentQR });
});

app.post('/pairing', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.json({ error: 'Invalid phone number' });
    }
    
    if (!sock || connectionStatus !== 'open') {
      return res.json({ error: 'Bot is connecting... Please wait and try again in 15 seconds.' });
    }
    
    const code = await sock.requestPairingCode(phone);
    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
    console.log(chalk.green('\n🔐 Pairing Code: ' + formattedCode + ' for ' + phone + '\n'));
    res.json({ code: formattedCode });
  } catch (error) {
    console.error('Pairing error:', error);
    res.json({ error: 'Failed to generate code. Bot may still be starting. Wait 15 seconds and try again.' });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(), 
    connected: connectionStatus === 'connected',
    botStatus: connectionStatus
  });
});

app.listen(PORT, () => {
  console.log(chalk.green('✅ Server running on port ' + PORT));
  console.log(chalk.cyan('🌐 Access at: http://localhost:' + PORT + '\n'));
});

async function startBot() {
  try {
    connectionStatus = 'connecting';
    
    const sessionFolder = path.join(__dirname, 'sessions');
    if (!existsSync(sessionFolder)) {
      mkdirSync(sessionFolder, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();
    
    console.log(chalk.green('✅ Baileys version: ' + version.join('.') + '\n'));
    
    sock = makeWASocket({
      version,
      logger: Pino({ level: 'silent' }),
      printQRInTerminal: false,
      mobile: false,
      browser: ['Ubuntu', 'Chrome', '20.0.04'],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'silent' })),
      },
      msgRetryCounterCache,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      defaultQueryTimeoutMs: undefined,
      getMessage: async () => ({ conversation: 'Hi' })
    });

    global.conn = sock;

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        currentQR = qr;
        console.log(chalk.yellow('📱 QR Code updated\n'));
      }
      
      if (connection === 'open') {
        connectionStatus = 'connected';
        connectedNumber = sock.user.id.split(':')[0];
        console.log(chalk.green('✅ BOT CONNECTED!\n'));
        console.log(chalk.cyan('📱 Number: ' + connectedNumber + '\n'));
      }
      
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(chalk.red('❌ Connection closed\n'));
        
        if (shouldReconnect) {
          console.log(chalk.yellow('⚠️ Reconnecting in 5 seconds...\n'));
          connectionStatus = 'connecting';
          setTimeout(() => startBot(), 5000);
        } else {
          connectionStatus = 'waiting';
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);
    
  } catch (error) {
    console.error(chalk.red('Bot error:'), error);
    connectionStatus = 'connecting';
    setTimeout(() => startBot(), 10000);
  }
}

startBot();

process.on('unhandledRejection', (err) => console.error(chalk.red('Unhandled Rejection:'), err));
process.on('uncaughtException', (err) => console.error(chalk.red('Uncaught Exception:'), err));
