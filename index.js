/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          YOUSAF-PAIRING-V1 — OFFICIAL SESSION GATEWAY           ║
 * ║          Created by: Muhammad Yousaf Baloch                     ║
 * ║          WhatsApp: +923710636110                                 ║
 * ║          GitHub: https://github.com/musakhanbaloch03-sad        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import NodeCache from 'node-cache';
import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, delay } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OWNER_IDENTITY = Object.freeze({
  NAME:        'Yousuf Baloch',
  FULL_NAME:   'Muhammad Yousaf Baloch',
  WHATSAPP:    '923710636110',
  TIKTOK:      'https://www.tiktok.com/@yousaf_baloch_tech',
  YOUTUBE:     'https://www.youtube.com/@Yousaf_Baloch_Tech',
  CHANNEL:     'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
  GITHUB:      'https://github.com/musakhanbaloch03-sad',
  BOT_NAME:    'YOUSAF-BALOCH-MD',
  VERSION:     '2.0.0',
  BAILEYS_VER: '6.7.8',
});

const app = express();
const PORT = process.env.PORT || 8000;
const sessionCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
const activeSockets = new Map();

const silentLogger = pino({ level: 'silent' });

app.set('trust proxy', 1);

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
});
app.use('/api/', limiter);

function printBanner() {
  console.clear();
  const fire = gradient(['#FF0000', '#FF4500', '#FF6F00', '#FFD700']);
  const cyber = gradient(['#00FFFF', '#0080FF', '#8000FF']);
  const gold  = gradient(['#FFD700', '#FFA500', '#FF6347']);

  console.log('\n' + fire.multiline(
    figlet.textSync('YOUSAF-MD', { font: 'ANSI Shadow', horizontalLayout: 'full' })
  ));

  console.log(cyber('  ═══════════════════════════════════════════════════════════════'));
  console.log(gold('  ⚡  YOUSAF-BALOCH-MD  |  Official Pairing Gateway  |  v2.0.0  ⚡'));
  console.log(cyber('  ═══════════════════════════════════════════════════════════════'));

  console.log(chalk.hex('#00FFFF')('  👑  Owner  : ') + chalk.hex('#FFD700').bold(OWNER_IDENTITY.FULL_NAME));
  console.log(chalk.hex('#00FFFF')('  📱  WA     : ') + chalk.hex('#25D366').bold('+' + OWNER_IDENTITY.WHATSAPP));
  console.log(chalk.hex('#00FFFF')('  🎵  TikTok : ') + chalk.hex('#FF0050')(OWNER_IDENTITY.TIKTOK));
  console.log(chalk.hex('#00FFFF')('  🎬  YouTube: ') + chalk.hex('#FF0000')(OWNER_IDENTITY.YOUTUBE));
  console.log(chalk.hex('#00FFFF')('  📢  Channel: ') + chalk.hex('#25D366')(OWNER_IDENTITY.CHANNEL));
  console.log(chalk.hex('#00FFFF')('  💻  GitHub : ') + chalk.hex('#FFFFFF')(OWNER_IDENTITY.GITHUB));

  console.log(cyber('  ═══════════════════════════════════════════════════════════════'));
  console.log(chalk.hex('#FF6F00').bold(`\n  🚀 Pairing Server Started on Port ${PORT}\n`));
}

function buildSuccessMessage(sessionId) {
  return `╔══════════════════════════════════════════════╗
║   ⚡ YOUSAF-BALOCH-MD — CONNECTED! ⚡        ║
╚══════════════════════════════════════════════╝

✅ *BOT CONNECTED SUCCESSFULLY!*

🤖 *Bot Name:* ${OWNER_IDENTITY.BOT_NAME}
👑 *Created By:* ${OWNER_IDENTITY.FULL_NAME}
🔖 *Version:* ${OWNER_IDENTITY.VERSION}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *YOUR SESSION ID:*

\`\`\`${sessionId}\`\`\`

⚠️ Keep this SESSION ID private! Never share it!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👑 *OWNER & DEVELOPER:*
┌─────────────────────────────────────
│ 📛 Name    : ${OWNER_IDENTITY.FULL_NAME}
│ 📱 Contact : wa.me/${OWNER_IDENTITY.WHATSAPP}
└─────────────────────────────────────

🌐 *OFFICIAL SOCIAL MEDIA:*
┌─────────────────────────────────────
│ 🎵 TikTok  : ${OWNER_IDENTITY.TIKTOK}
│ 🎬 YouTube : ${OWNER_IDENTITY.YOUTUBE}
│ 📢 Channel : ${OWNER_IDENTITY.CHANNEL}
│ 💻 GitHub  : ${OWNER_IDENTITY.GITHUB}
└─────────────────────────────────────

💡 *NEXT STEPS:*
1️⃣ Copy the SESSION ID above
2️⃣ Go to your bot deployment
3️⃣ Paste in SESSION_ID config variable
4️⃣ Restart your bot
5️⃣ Enjoy 280+ Premium Commands! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by ${OWNER_IDENTITY.FULL_NAME} © 2026* ⚡
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

function getSessionPath(id) {
  return join(__dirname, 'sessions', `session_${id}`);
}

function cleanSession(id) {
  const path = getSessionPath(id);
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

function sanitizePhone(phone) {
  phone = phone.replace(/[^0-9]/g, '');
  phone = phone.replace(/^0+/, '');
  
  if (phone.length === 10 && phone.startsWith('3')) {
    phone = '92' + phone;
  }
  
  return phone;
}

async function createPairingSession(phoneNumber) {
  const sessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const sessionPath = getSessionPath(sessionId);

  if (!existsSync(join(__dirname, 'sessions'))) {
    mkdirSync(join(__dirname, 'sessions'), { recursive: true });
  }
  mkdirSync(sessionPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  return new Promise((resolve, reject) => {
    const timeoutHandle = setTimeout(() => {
      const sock = activeSockets.get(sessionId);
      if (sock) {
        try { sock.end(); } catch {}
        activeSockets.delete(sessionId);
      }
      cleanSession(sessionId);
      reject(new Error('Pairing timeout. Please try again.'));
    }, 120000);

    const sock = makeWASocket({
      version,
      logger: silentLogger,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, silentLogger),
      },
      browser: Browsers.macOS('Desktop'),
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      getMessage: async () => undefined,
    });

    activeSockets.set(sessionId, sock);

    let pairingCodeResolved = false;

    setTimeout(async () => {
      try {
        await delay(1500);
        
        const code = await sock.requestPairingCode(phoneNumber);
        const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
        
        console.log(chalk.hex('#FFD700').bold(`\n  📱 Pairing Code Generated: ${chalk.hex('#00FF00').bold(formatted)}\n`));
        
        sessionCache.set(`code_${sessionId}`, formatted);
        pairingCodeResolved = true;
        resolve({ sessionId, code: formatted });
      } catch (err) {
        if (!pairingCodeResolved) {
          clearTimeout(timeoutHandle);
          activeSockets.delete(sessionId);
          cleanSession(sessionId);
          reject(err);
        }
      }
    }, 1000);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      if (connection === 'open') {
        clearTimeout(timeoutHandle);
        
        console.log(chalk.hex('#00FF00').bold(`\n  ✅ Device Paired Successfully! Generating Session ID...\n`));

        try {
          const credsPath = join(sessionPath, 'creds.json');
          const credsRaw = readFileSync(credsPath, 'utf-8');
          const sessionString = Buffer.from(credsRaw).toString('base64');

          const userJid = `${phoneNumber}@s.whatsapp.net`;
          const successMessage = buildSuccessMessage(sessionString);

          await sock.sendMessage(userJid, { text: successMessage });
          console.log(chalk.hex('#00FF00').bold('  ✅ Success message delivered to user!\n'));

          sessionCache.set(`session_${sessionId}`, sessionString);
        } catch (sendErr) {
          console.error(chalk.hex('#FF0000')('  ⚠️  Could not send success message: ' + sendErr.message));
        }

        setTimeout(async () => {
          try {
            await sock.logout();
          } catch {}
          activeSockets.delete(sessionId);
          cleanSession(sessionId);
        }, 60000);

      } else if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        clearTimeout(timeoutHandle);
        activeSockets.delete(sessionId);

        if (reason !== DisconnectReason.loggedOut) {
          console.log(chalk.hex('#FF6600')(`  ⚠️  Connection closed. Reason: ${reason}`));
        }
        cleanSession(sessionId);
      }
    });
  });
}

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH-MD Pairing Gateway</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .badge {
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            display: block;
            width: fit-content;
            margin: 0 auto 20px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 20px;
        }
        .social-links {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        .social-link {
            padding: 8px 16px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-size: 12px;
            transition: transform 0.2s;
        }
        .social-link:hover {
            transform: translateY(-2px);
        }
        .input-group {
            margin: 30px 0;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
        }
        input {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-size: 16px;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .result {
            margin-top: 30px;
            padding: 20px;
            border-radius: 10px;
            display: none;
        }
        .result.success {
            background: #d4edda;
            border: 2px solid #28a745;
            color: #155724;
        }
        .result.error {
            background: #f8d7da;
            border: 2px solid #dc3545;
            color: #721c24;
        }
        .code-display {
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            letter-spacing: 5px;
            color: #667eea;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
            display: none;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 YOUSAF-BALOCH-MD</h1>
        <span class="badge">💎 ULTRA PRO PREMIUM</span>
        <p class="subtitle">WhatsApp Session Generator V2.0</p>
        
        <div class="social-links">
            <a href="https://www.youtube.com/@Yousaf_Baloch_Tech" target="_blank" class="social-link">📺 YouTube</a>
            <a href="https://tiktok.com/@loser_boy.110" target="_blank" class="social-link">🎵 TikTok</a>
            <a href="https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j" target="_blank" class="social-link">📢 Channel</a>
            <a href="https://github.com/musakhanbaloch03-sad" target="_blank" class="social-link">🔗 GitHub</a>
        </div>
        
        <div class="input-group">
            <label>📱 Enter Your WhatsApp Number</label>
            <input type="tel" id="phoneNumber" placeholder="923710636110">
            <small style="color: #666; font-size: 12px;">Enter with country code (without + or spaces)</small>
        </div>
        
        <button class="btn" id="submitBtn" onclick="generateCode()">🔑 Generate Pairing Code</button>
        
        <div class="spinner" id="spinner"></div>
        <div class="result" id="result"></div>
        
        <div class="footer">
            <p>Made with ❤️ by <strong>Muhammad Yousaf Baloch</strong></p>
            <p style="margin-top: 10px;">📱 WhatsApp: <a href="https://wa.me/923710636110" target="_blank">+923710636110</a></p>
            <p style="margin-top: 5px;">🔗 Main Bot: <a href="https://github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD" target="_blank">YOUSAF-BALOCH-MD</a></p>
        </div>
    </div>
    
    <script>
        async function generateCode() {
            const phoneNumber = document.getElementById('phoneNumber').value.trim();
            const resultDiv = document.getElementById('result');
            const spinner = document.getElementById('spinner');
            const btn = document.getElementById('submitBtn');
            
            if (!phoneNumber) {
                showResult('error', '❌ Please enter your phone number');
                return;
            }
            
            if (!/^[0-9]{10,15}$/.test(phoneNumber)) {
                showResult('error', '❌ Invalid number format');
                return;
            }
            
            btn.disabled = true;
            spinner.style.display = 'block';
            resultDiv.style.display = 'none';
            
            try {
                const response = await fetch('/api/pair?phone=' + phoneNumber);
                const data = await response.json();
                
                if (data.success) {
                    showResult('success', '<h3>✅ Pairing Code Generated!</h3><div class="code-display">' + data.code + '</div><p><strong>Enter this code in WhatsApp within 60 seconds!</strong></p>');
                } else {
                    showResult('error', '❌ Error: ' + (data.error || 'Failed'));
                }
            } catch (error) {
                showResult('error', '❌ Connection error: ' + error.message);
            } finally {
                btn.disabled = false;
                spinner.style.display = 'none';
            }
        }
        
        function showResult(type, message) {
            const result = document.getElementById('result');
            result.className = 'result ' + type;
            result.innerHTML = message;
            result.style.display = 'block';
        }
    </script>
</body>
</html>`);
});

app.get('/health', (req, res) => {
  res.json({
    status: '✅ Online',
    service: 'YOUSAF-PAIRING-V1',
    owner: OWNER_IDENTITY.FULL_NAME,
    version: OWNER_IDENTITY.VERSION,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/pair', async (req, res) => {
  let { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number required. Example: ?phone=923710636110' });
  }

  phone = sanitizePhone(phone);

  if (phone.length < 10 || phone.length > 15) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }

  console.log(chalk.hex('#00FFFF')(`\n  📲 Pairing request for: +${phone}`));

  try {
    const result = await createPairingSession(phone);
    console.log(chalk.hex('#FFD700')(`  🔑 Session ID: ${result.sessionId}`));

    return res.json({
      success: true,
      code: result.code,
      session_id: result.sessionId,
      message: 'Enter the code in WhatsApp → Linked Devices → Link with phone number',
      owner: OWNER_IDENTITY.FULL_NAME,
      powered_by: `${OWNER_IDENTITY.BOT_NAME} by ${OWNER_IDENTITY.FULL_NAME}`,
    });
  } catch (err) {
    console.error(chalk.hex('#FF0000')(`  ❌ Pairing error: ${err.message}`));
    return res.status(500).json({
      success: false,
      error: err.message || 'Pairing failed. Please try again.',
    });
  }
});

app.get('/api/session/:id', (req, res) => {
  const { id } = req.params;
  const session = sessionCache.get(`session_${id}`);

  if (session) {
    return res.json({
      success: true,
      connected: true,
      session_id: session,
      owner: OWNER_IDENTITY.FULL_NAME,
    });
  }

  return res.json({
    success: true,
    connected: false,
    message: 'Session pending. Waiting for device to connect.',
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found.',
    available: ['/api/pair?phone=YOUR_NUMBER', '/api/session/:id'],
    owner: OWNER_IDENTITY.FULL_NAME,
  });
});

app.use((err, req, res, next) => {
  console.error(chalk.hex('#FF0000')('  ❌ Server error: ' + err.message));
  res.status(500).json({ error: 'Internal server error.' });
});

printBanner();

app.listen(PORT, '0.0.0.0', () => {
  console.log(chalk.hex('#00FF00').bold(`  🌐 Server live at: http://0.0.0.0:${PORT}`));
  console.log(chalk.hex('#FFD700')(`  📡 API Endpoint: http://0.0.0.0:${PORT}/api/pair?phone=YOURNUMBER\n`));
  console.log(chalk.hex('#00FFFF')('  ═══════════════════════════════════════════════════════════════\n'));
});
