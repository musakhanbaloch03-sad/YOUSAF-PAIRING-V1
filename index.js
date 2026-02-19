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
import qrcode from 'qrcode';
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
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
});
app.use('/api/', limiter);

// ── QR Socket (global, for QR-based login) ──────────────────────────
let qrSocket = null;
let currentQR = null;
let qrConnected = false;

function printBanner() {
  console.clear();
  const fire  = gradient(['#FF0000', '#FF4500', '#FF6F00', '#FFD700']);
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
  if (existsSync(path)) rmSync(path, { recursive: true, force: true });
}

function sanitizePhone(phone) {
  phone = phone.replace(/[^0-9]/g, '');
  phone = phone.replace(/^0+/, '');
  if (phone.length === 10 && phone.startsWith('3')) {
    phone = '92' + phone;
  }
  return phone;
}

// ═══════════════════════════════════════════════════════════════════
//  QR CODE SESSION
// ═══════════════════════════════════════════════════════════════════
async function startQRSession() {
  const sessionId = 'qr_session';
  const sessionPath = getSessionPath(sessionId);

  if (!existsSync(join(__dirname, 'sessions'))) {
    mkdirSync(join(__dirname, 'sessions'), { recursive: true });
  }
  mkdirSync(sessionPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  if (qrSocket) {
    try { qrSocket.end(); } catch {}
  }

  const sock = makeWASocket({
    version,
    logger: silentLogger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, silentLogger),
    },
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => undefined,
  });

  qrSocket = sock;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      try {
        currentQR = await qrcode.toDataURL(qr);
        qrConnected = false;
        console.log(chalk.hex('#00FFFF')('  📷 QR Code generated!'));
      } catch (e) {
        console.error('QR generation error:', e.message);
      }
    }

    if (connection === 'open') {
      qrConnected = true;
      currentQR = null;
      console.log(chalk.hex('#00FF00').bold('  ✅ QR Login Successful!'));

      try {
        const credsPath = join(sessionPath, 'creds.json');
        const credsRaw = readFileSync(credsPath, 'utf-8');
        const sessionString = Buffer.from(credsRaw).toString('base64');
        const userJid = sock.user?.id;
        if (userJid) {
          await sock.sendMessage(userJid, { text: buildSuccessMessage(sessionString) });
        }
      } catch (e) {
        console.error('QR success message error:', e.message);
      }
    }

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      qrConnected = false;
      currentQR = null;
      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.hex('#FF6600')('  ⚠️ QR connection closed. Restarting...'));
        setTimeout(startQRSession, 5000);
      } else {
        cleanSession(sessionId);
        setTimeout(startQRSession, 3000);
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
//  PAIRING CODE SESSION
// ═══════════════════════════════════════════════════════════════════
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
      if (sock) { try { sock.end(); } catch {} activeSockets.delete(sessionId); }
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
      // ✅ FIX: ubuntu Chrome is accepted by WhatsApp
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      getMessage: async () => undefined,
    });

    activeSockets.set(sessionId, sock);

    sock.ev.on('creds.update', saveCreds);

    // ✅ FIX: Request pairing code after socket is ready
    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {

      if (connection === 'connecting') {
        // Request pairing code once connecting
        setTimeout(async () => {
          try {
            if (!sock.authState.creds.registered) {
              await delay(2000);
              const code = await sock.requestPairingCode(phoneNumber);
              const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
              console.log(chalk.hex('#FFD700').bold(`\n  📱 Pairing Code: ${chalk.hex('#00FF00').bold(formatted)}\n`));
              sessionCache.set(`code_${sessionId}`, formatted);
              resolve({ sessionId, code: formatted });
            }
          } catch (err) {
            clearTimeout(timeoutHandle);
            activeSockets.delete(sessionId);
            cleanSession(sessionId);
            reject(new Error('Failed to generate pairing code: ' + err.message));
          }
        }, 3000);
      }

      if (connection === 'open') {
        clearTimeout(timeoutHandle);
        console.log(chalk.hex('#00FF00').bold(`\n  ✅ Device Paired Successfully!\n`));

        try {
          const credsPath = join(sessionPath, 'creds.json');
          const credsRaw = readFileSync(credsPath, 'utf-8');
          const sessionString = Buffer.from(credsRaw).toString('base64');
          const userJid = `${phoneNumber}@s.whatsapp.net`;
          await sock.sendMessage(userJid, { text: buildSuccessMessage(sessionString) });
          sessionCache.set(`session_${sessionId}`, sessionString);
          console.log(chalk.hex('#00FF00').bold('  ✅ Session ID sent to user on WhatsApp!\n'));
        } catch (sendErr) {
          console.error(chalk.hex('#FF0000')('  ⚠️ Could not send success message: ' + sendErr.message));
        }

        setTimeout(async () => {
          try { await sock.logout(); } catch {}
          activeSockets.delete(sessionId);
          cleanSession(sessionId);
        }, 60000);

      } else if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        clearTimeout(timeoutHandle);
        activeSockets.delete(sessionId);
        if (reason !== DisconnectReason.loggedOut) {
          console.log(chalk.hex('#FF6600')(`  ⚠️ Connection closed. Reason: ${reason}`));
        }
        cleanSession(sessionId);
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════════════

// Main page — serve HTML file
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: '✅ Online',
    service: 'YOUSAF-PAIRING-V1',
    owner: OWNER_IDENTITY.FULL_NAME,
    version: OWNER_IDENTITY.VERSION,
    timestamp: new Date().toISOString(),
  });
});

// ✅ NEW: GET QR Code for HTML frontend
app.get('/get-qr', async (req, res) => {
  if (qrConnected) {
    return res.json({ success: false, message: 'Already connected via QR!' });
  }
  if (currentQR) {
    return res.json({ success: true, qr: currentQR });
  }
  return res.json({ success: false, message: 'QR not ready yet. Please wait...' });
});

// ✅ NEW: POST /get-code for HTML frontend (Pairing Code)
app.post('/get-code', async (req, res) => {
  let { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ success: false, error: 'Phone number required.' });
  }

  phoneNumber = sanitizePhone(phoneNumber);

  if (phoneNumber.length < 10 || phoneNumber.length > 15) {
    return res.status(400).json({ success: false, error: 'Invalid phone number format.' });
  }

  console.log(chalk.hex('#00FFFF')(`\n  📲 Pairing request for: +${phoneNumber}`));

  try {
    const result = await createPairingSession(phoneNumber);
    return res.json({
      success: true,
      code: result.code,
      message: 'Enter this code in WhatsApp → Linked Devices → Link with phone number',
    });
  } catch (err) {
    console.error(chalk.hex('#FF0000')(`  ❌ Pairing error: ${err.message}`));
    return res.status(500).json({ success: false, error: err.message || 'Pairing failed. Please try again.' });
  }
});

// Old API endpoint (backward compatible)
app.get('/api/pair', async (req, res) => {
  let { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'Phone number required. Example: ?phone=923710636110' });

  phone = sanitizePhone(phone);
  if (phone.length < 10 || phone.length > 15) return res.status(400).json({ error: 'Invalid phone number format.' });

  console.log(chalk.hex('#00FFFF')(`\n  📲 API Pairing request for: +${phone}`));

  try {
    const result = await createPairingSession(phone);
    return res.json({
      success: true,
      code: result.code,
      session_id: result.sessionId,
      message: 'Enter the code in WhatsApp → Linked Devices → Link with phone number',
      owner: OWNER_IDENTITY.FULL_NAME,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Pairing failed.' });
  }
});

app.get('/api/session/:id', (req, res) => {
  const { id } = req.params;
  const session = sessionCache.get(`session_${id}`);
  if (session) {
    return res.json({ success: true, connected: true, session_id: session, owner: OWNER_IDENTITY.FULL_NAME });
  }
  return res.json({ success: true, connected: false, message: 'Session pending.' });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found.',
    available: ['/get-code (POST)', '/get-qr (GET)', '/api/pair?phone=YOUR_NUMBER'],
    owner: OWNER_IDENTITY.FULL_NAME,
  });
});

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
  console.log(chalk.hex('#FFD700')(`  📡 Pairing: POST http://0.0.0.0:${PORT}/get-code\n`));
  console.log(chalk.hex('#00FFFF')('  ═══════════════════════════════════════════════════════════════\n'));

  // Start QR session automatically
  startQRSession().catch(err => {
    console.error(chalk.hex('#FF0000')('  ⚠️ QR session error: ' + err.message));
  });
});
