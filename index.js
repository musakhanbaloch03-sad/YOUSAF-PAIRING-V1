/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          YOUSAF-PAIRING-V1 — OFFICIAL SESSION GATEWAY           ║
 * ║          Created by: Muhammad Yousaf Baloch                     ║
 * ║          WhatsApp: +923710636110                                 ║
 * ║          GitHub: https://github.com/musakhanbaloch03-sad        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * NOTICE: This file contains hardcoded owner identity.
 * Modifying owner branding is a violation of the project license.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import NodeCache from 'node-cache';
import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════════
//  🔒 HARDCODED OWNER IDENTITY — DO NOT MODIFY — PROTECTED BY LICENSE
// ═══════════════════════════════════════════════════════════════════
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
  BAILEYS_VER: '6.7.9',
});
// ═══════════════════════════════════════════════════════════════════

const app = express();
const PORT = process.env.PORT || 8000;
const sessionCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
const activeSockets = new Map();

// ── Silent Baileys Logger ────────────────────────────────────────────
const silentLogger = pino({ level: 'silent' });

// ── Middleware ───────────────────────────────────────────────────────
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
});
app.use('/api/', limiter);

// ── Ultra-Premium Terminal Banner ───────────────────────────────────
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

// ── Success Message Template ─────────────────────────────────────────
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

// ── Session Folder Helper ────────────────────────────────────────────
function getSessionPath(id) {
  return join(__dirname, 'sessions', `session_${id}`);
}

function cleanSession(id) {
  const path = getSessionPath(id);
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

// ── Main Pairing Function ────────────────────────────────────────────
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
      // ✅ FIX: Use Browsers.ubuntu('Chrome') to prevent linking errors
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
    });

    activeSockets.set(sessionId, sock);

    // Request pairing code
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        const formatted = code.match(/.{1,4}/g)?.join('-') || code;
        console.log(chalk.hex('#FFD700').bold(`\n  📱 Pairing Code Generated: ${chalk.hex('#00FF00').bold(formatted)}\n`));
        sessionCache.set(`code_${sessionId}`, formatted);
        resolve({ sessionId, code: formatted });
      } catch (err) {
        clearTimeout(timeoutHandle);
        activeSockets.delete(sessionId);
        cleanSession(sessionId);
        reject(err);
      }
    }, 3000);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      if (connection === 'open') {
        clearTimeout(timeoutHandle);
        activeSockets.delete(sessionId);

        console.log(chalk.hex('#00FF00').bold(`\n  ✅ Device Paired Successfully! Generating Session ID...\n`));

        try {
          // Build session string from credentials
          const credsRaw = JSON.stringify(state.creds);
          const sessionString = Buffer.from(credsRaw).toString('base64');
          const fullSessionId = `YB_${sessionId}::${sessionString}`;

          // ✅ Send Success Message to the user's own WhatsApp number
          const userJid = `${phoneNumber}@s.whatsapp.net`;
          const successMessage = buildSuccessMessage(fullSessionId);

          await sock.sendMessage(userJid, { text: successMessage });
          console.log(chalk.hex('#00FF00').bold('  ✅ Success message delivered to user!\n'));

          sessionCache.set(`session_${sessionId}`, fullSessionId);
        } catch (sendErr) {
          console.error(chalk.hex('#FF0000')('  ⚠️  Could not send success message: ' + sendErr.message));
        }

        // Clean up auth files after a delay
        setTimeout(() => cleanSession(sessionId), 60000);

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

// ═══════════════════════════════════════════════════════════════════
//  API ROUTES
// ═══════════════════════════════════════════════════════════════════

// ── Web Frontend (Live Pairing Interface) ───────────────────────────
app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YOUSAF-BALOCH-MD | Pairing Service</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1728 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow-x: hidden;
      position: relative;
    }

    body::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(255, 0, 255, 0.05) 0%, transparent 50%);
      pointer-events: none;
      animation: pulse 8s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    .container {
      max-width: 580px;
      width: 100%;
      position: relative;
      z-index: 1;
    }

    .card {
      background: rgba(15, 20, 40, 0.9);
      border-radius: 24px;
      padding: 48px 40px;
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 255, 255, 0.1);
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo {
      font-family: 'Orbitron', monospace;
      font-size: 32px;
      font-weight: 900;
      background: linear-gradient(135deg, #00ffff 0%, #00d4ff 50%, #ffd700 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
      letter-spacing: 2px;
      text-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
      animation: glow 2s ease-in-out infinite alternate;
    }

    @keyframes glow {
      from { filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5)); }
      to { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)); }
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.7);
      font-size: 15px;
      font-weight: 400;
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), transparent);
      margin: 32px 0;
    }

    .form-group {
      margin-bottom: 24px;
    }

    label {
      display: block;
      color: #00ffff;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .input-wrapper {
      position: relative;
    }

    input[type="text"] {
      width: 100%;
      padding: 16px 20px;
      font-size: 16px;
      background: rgba(0, 20, 40, 0.6);
      border: 2px solid rgba(0, 255, 255, 0.2);
      border-radius: 12px;
      color: #ffffff;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
      outline: none;
    }

    input[type="text"]:focus {
      border-color: #00ffff;
      box-shadow: 0 0 0 4px rgba(0, 255, 255, 0.1), 0 0 20px rgba(0, 255, 255, 0.3);
      background: rgba(0, 30, 60, 0.8);
    }

    input[type="text"]::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    .hint {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 8px;
    }

    .btn {
      width: 100%;
      padding: 18px;
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      background: linear-gradient(135deg, #00ffff 0%, #00a8ff 100%);
      color: #0a0e27;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 8px 24px rgba(0, 255, 255, 0.3);
      position: relative;
      overflow: hidden;
    }

    .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s;
    }

    .btn:hover::before {
      left: 100%;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(0, 255, 255, 0.5);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn:disabled {
      background: rgba(100, 100, 100, 0.3);
      cursor: not-allowed;
      box-shadow: none;
    }

    .result {
      margin-top: 32px;
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      display: none;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .result.success {
      background: rgba(0, 255, 127, 0.1);
      border: 2px solid rgba(0, 255, 127, 0.3);
    }

    .result.error {
      background: rgba(255, 0, 80, 0.1);
      border: 2px solid rgba(255, 0, 80, 0.3);
    }

    .result.loading {
      background: rgba(255, 215, 0, 0.1);
      border: 2px solid rgba(255, 215, 0, 0.3);
    }

    .pairing-code {
      font-family: 'Orbitron', monospace;
      font-size: 48px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #00ff7f;
      margin: 20px 0;
      text-shadow: 0 0 20px rgba(0, 255, 127, 0.5);
    }

    .result-text {
      color: rgba(255, 255, 255, 0.9);
      font-size: 15px;
      line-height: 1.6;
      margin-top: 12px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
    }

    .owner-info {
      color: rgba(255, 255, 255, 0.6);
      font-size: 13px;
      margin-bottom: 16px;
    }

    .owner-name {
      color: #ffd700;
      font-weight: 700;
    }

    .social-links {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .social-link {
      color: #00ffff;
      text-decoration: none;
      font-size: 13px;
      padding: 8px 16px;
      border-radius: 20px;
      background: rgba(0, 255, 255, 0.05);
      border: 1px solid rgba(0, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .social-link:hover {
      background: rgba(0, 255, 255, 0.15);
      border-color: #00ffff;
      transform: translateY(-2px);
    }

    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid #ffd700;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
      .card {
        padding: 32px 24px;
      }
      .logo {
        font-size: 26px;
      }
      .pairing-code {
        font-size: 36px;
        letter-spacing: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1 class="logo">⚡ YOUSAF-MD ⚡</h1>
        <p class="subtitle">Official Pairing Gateway</p>
      </div>

      <div class="divider"></div>

      <form id="pairingForm">
        <div class="form-group">
          <label for="phoneNumber">📱 WhatsApp Number</label>
          <div class="input-wrapper">
            <input 
              type="text" 
              id="phoneNumber" 
              name="phone"
              placeholder="923XXXXXXXXX" 
              required
              pattern="[0-9]{10,15}"
              autocomplete="off"
            >
          </div>
          <p class="hint">Enter your number with country code (no + or spaces)</p>
        </div>

        <button type="submit" class="btn" id="generateBtn">
          🔑 Generate Pairing Code
        </button>
      </form>

      <div class="result" id="result"></div>

      <div class="footer">
        <p class="owner-info">
          Created by <span class="owner-name">${OWNER_IDENTITY.FULL_NAME}</span>
        </p>
        <div class="social-links">
          <a href="${OWNER_IDENTITY.TIKTOK}" target="_blank" class="social-link">🎵 TikTok</a>
          <a href="${OWNER_IDENTITY.YOUTUBE}" target="_blank" class="social-link">🎬 YouTube</a>
          <a href="${OWNER_IDENTITY.CHANNEL}" target="_blank" class="social-link">📢 Channel</a>
          <a href="${OWNER_IDENTITY.GITHUB}" target="_blank" class="social-link">💻 GitHub</a>
        </div>
      </div>
    </div>
  </div>

  <script>
    const form = document.getElementById('pairingForm');
    const phoneInput = document.getElementById('phoneNumber');
    const generateBtn = document.getElementById('generateBtn');
    const resultDiv = document.getElementById('result');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const phone = phoneInput.value.trim().replace(/[^0-9]/g, '');
      
      if (phone.length < 10 || phone.length > 15) {
        showError('Please enter a valid phone number (10-15 digits)');
        return;
      }

      showLoading();
      generateBtn.disabled = true;

      try {
        const response = await fetch(\`/api/pair?phone=\${phone}\`);
        const data = await response.json();

        if (data.success && data.code) {
          showSuccess(data.code);
        } else {
          showError(data.error || 'Failed to generate pairing code. Please try again.');
        }
      } catch (error) {
        showError('Network error. Please check your connection and try again.');
      } finally {
        generateBtn.disabled = false;
      }
    });

    function showLoading() {
      resultDiv.className = 'result loading';
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = \`
        <div class="spinner"></div>
        <p class="result-text">⏳ Generating your pairing code...<br>Please wait a moment.</p>
      \`;
    }

    function showSuccess(code) {
      resultDiv.className = 'result success';
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = \`
        <p class="result-text" style="color: #00ff7f; font-weight: 600; font-size: 16px;">
          ✅ Pairing Code Generated Successfully!
        </p>
        <div class="pairing-code">\${code}</div>
        <p class="result-text">
          1️⃣ Open WhatsApp on your phone<br>
          2️⃣ Go to <strong>Linked Devices</strong><br>
          3️⃣ Tap <strong>Link a Device</strong><br>
          4️⃣ Enter this code when prompted<br>
          5️⃣ Your <strong>SESSION ID</strong> will be sent to your WhatsApp!
        </p>
      \`;
    }

    function showError(message) {
      resultDiv.className = 'result error';
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = \`
        <p class="result-text" style="color: #ff5080; font-weight: 600; font-size: 16px;">
          ❌ Error
        </p>
        <p class="result-text">\${message}</p>
      \`;
    }

    // Auto-format phone number
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  </script>
</body>
</html>`;
  
  res.send(html);
});

// ── API Health Check ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: '✅ Online',
    service: 'YOUSAF-PAIRING-V1',
    owner: OWNER_IDENTITY.FULL_NAME,
    version: OWNER_IDENTITY.VERSION,
    powered_by: OWNER_IDENTITY.FULL_NAME,
    social: {
      tiktok:   OWNER_IDENTITY.TIKTOK,
      youtube:  OWNER_IDENTITY.YOUTUBE,
      channel:  OWNER_IDENTITY.CHANNEL,
      github:   OWNER_IDENTITY.GITHUB,
    },
    timestamp: new Date().toISOString(),
  });
});

// ── Request Pairing Code ─────────────────────────────────────────────
app.get('/api/pair', async (req, res) => {
  let { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number required. Example: ?phone=923710636110' });
  }

  // Sanitize phone number
  phone = phone.replace(/[^0-9]/g, '').replace(/^0+/, '');

  if (phone.length < 10 || phone.length > 15) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }

  console.log(chalk.hex('#00FFFF')(
    `\n  📲 Pairing request for: +${phone}`
  ));

  try {
    const result = await createPairingSession(phone);
    console.log(chalk.hex('#FFD700')(`  🔑 Session ID: ${result.sessionId}`));

    return res.json({
      success: true,
      code: result.code,
      session_id: result.sessionId,
      message: 'Enter the 8-digit code on your WhatsApp linked devices.',
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

// ── Check Session Status ─────────────────────────────────────────────
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

// ── 404 Handler ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found.',
    available: ['/api/pair?phone=YOUR_NUMBER', '/api/session/:id'],
    owner: OWNER_IDENTITY.FULL_NAME,
  });
});

// ── Global Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(chalk.hex('#FF0000')('  ❌ Server error: ' + err.message));
  res.status(500).json({ error: 'Internal server error.' });
});

// ═══════════════════════════════════════════════════════════════════
//  START SERVER
// ═══════════════════════════════════════════════════════════════════
printBanner();

app.listen(PORT, '0.0.0.0', () => {
  console.log(chalk.hex('#00FF00').bold(`  🌐 Server live at: http://0.0.0.0:${PORT}`));
  console.log(chalk.hex('#FFD700')(`  📡 API Endpoint: http://0.0.0.0:${PORT}/api/pair?phone=YOURNUMBER\n`));
  console.log(chalk.hex('#00FFFF')('  ═══════════════════════════════════════════════════════════════\n'));
});
