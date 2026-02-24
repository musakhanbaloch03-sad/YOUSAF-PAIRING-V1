/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          YOUSAF-PAIRING-V1 — OFFICIAL SESSION GATEWAY           ║
 * ║          Created by: Muhammad Yousaf Baloch                     ║
 * ║          WhatsApp: +923710636110                                 ║
 * ║          GitHub: https://github.com/musakhanbaloch03-sad        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import dotenv          from 'dotenv';
dotenv.config();

import express         from 'express';
import cors            from 'cors';
import helmet          from 'helmet';
import rateLimit       from 'express-rate-limit';
import chalk           from 'chalk';
import figlet          from 'figlet';
import gradient        from 'gradient-string';
import NodeCache       from 'node-cache';
import qrcode          from 'qrcode';
import { randomBytes } from 'crypto';
import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  delay,
} from '@whiskeysockets/baileys';
import { Boom }        from '@hapi/boom';
import pino            from 'pino';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OWNER_IDENTITY = Object.freeze({
  NAME:        'Yousuf Baloch',
  FULL_NAME:   'Muhammad Yousaf Baloch',
  WHATSAPP:    '923710636110',
  TIKTOK:      'https://tiktok.com/@loser_boy.110',
  YOUTUBE:     'https://www.youtube.com/@Yousaf_Baloch_Tech',
  CHANNEL:     'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
  GITHUB:      'https://github.com/musakhanbaloch03-sad',
  BOT_NAME:    'YOUSAF-BALOCH-MD',
  VERSION:     '2.0.0',
  BAILEYS_VER: '6.7.9',
});

const app           = express();
const PORT          = process.env.PORT || 5000;
const sessionCache  = new NodeCache({ stdTTL: 600, checkperiod: 60 });
const activeSockets = new Map();
const silentLogger  = pino({ level: 'silent' });

app.set('trust proxy', 1);

// ✅ FIX: CORS — permissive configuration fix
// Default: allows all origins (for public pairing server)
// To restrict: set ALLOWED_ORIGINS=https://yourdomain.com in .env
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc : ["'self'"],
      styleSrc   : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      scriptSrc  : ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc    : ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc     : ["'self'", "data:", "https:"],
    },
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

const limiter = rateLimit({
  windowMs      : 15 * 60 * 1000,
  max           : 30,
  message       : { error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders  : false,
});
app.use('/api/',     limiter);
app.use('/get-code', limiter);
app.use('/get-qr',   limiter);

// ── QR Socket globals ────────────────────────────────────────────────
let qrSocket    = null;
let currentQR   = null;
let qrConnected = false;

// ═══════════════════════════════════════════════════════════════════
//  🎨 TERMINAL BANNER
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
//  ✅ SUCCESS MESSAGE
// ═══════════════════════════════════════════════════════════════════
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
3️⃣ Paste in SESSION_ID variable
4️⃣ Restart your bot
5️⃣ Enjoy 500+ Premium Commands! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by ${OWNER_IDENTITY.FULL_NAME} © 2026* ⚡
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// ═══════════════════════════════════════════════════════════════════
//  🛠️ HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function getSessionPath(id) {
  return join(__dirname, 'sessions', `session_${id}`);
}

function cleanSession(id) {
  try {
    const p = getSessionPath(id);
    if (existsSync(p)) rmSync(p, { recursive: true, force: true });
  } catch (err) {
    console.warn(`[Session] Could not clean session ${id}: ${err.message}`);
  }
}

function ensureSessionsDir() {
  try {
    const dir = join(__dirname, 'sessions');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  } catch (err) {
    console.error('[Session] Could not create sessions directory:', err.message);
  }
}

// ✅ FIX: International phone support
function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  phone = phone.replace(/[^0-9]/g, '');
  phone = phone.replace(/^0+/, '');
  if (phone.length === 10 && phone.startsWith('3')) {
    phone = '92' + phone;
  }
  return phone;
}

function isValidPhone(phone) {
  return phone && phone.length >= 10 && phone.length <= 15;
}

// ✅ FIX: Secure random ID — crypto کے ذریعے
function generateSecureSessionId() {
  return `${Date.now()}_${randomBytes(8).toString('hex')}`;
}

// ═══════════════════════════════════════════════════════════════════
//  📷 QR CODE SESSION
// ═══════════════════════════════════════════════════════════════════
async function startQRSession() {
  const sessionId   = 'qr_session';
  const sessionPath = getSessionPath(sessionId);

  ensureSessionsDir();
  try { mkdirSync(sessionPath, { recursive: true }); } catch (_) {}

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version }          = await fetchLatestBaileysVersion();

  if (qrSocket) {
    try { qrSocket.end(); } catch {}
    qrSocket = null;
  }

  const sock = makeWASocket({
    version,
    logger                        : silentLogger,
    printQRInTerminal             : false,
    auth: {
      creds: state.creds,
      keys : makeCacheableSignalKeyStore(state.keys, silentLogger),
    },
    browser                       : Browsers.ubuntu('Chrome'),
    markOnlineOnConnect           : false,
    generateHighQualityLinkPreview: true,
    syncFullHistory               : false,
    getMessage                    : async () => undefined,
  });

  qrSocket = sock;
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      try {
        currentQR   = await qrcode.toDataURL(qr);
        qrConnected = false;
        console.log(chalk.hex('#00FFFF')('  📷 QR Code generated!'));
      } catch (e) {
        console.error('[QR] Generation error:', e.message);
      }
    }

    if (connection === 'open') {
      qrConnected = true;
      currentQR   = null;
      console.log(chalk.hex('#00FF00').bold('  ✅ QR Login Successful!'));
      try {
        const credsRaw   = readFileSync(join(sessionPath, 'creds.json'), 'utf-8');
        const sessionStr = Buffer.from(credsRaw).toString('base64');
        const userJid    = sock.user?.id;
        if (userJid) {
          await sock.sendMessage(userJid, { text: buildSuccessMessage(sessionStr) });
        }
      } catch (e) {
        console.error('[QR] Success message error:', e.message);
      }
    }

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      qrConnected  = false;
      currentQR    = null;
      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.hex('#FF6600')('  ⚠️ QR connection closed. Restarting in 5s...'));
        setTimeout(startQRSession, 5000);
      } else {
        cleanSession(sessionId);
        setTimeout(startQRSession, 3000);
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
//  🔑 PAIRING CODE SESSION
// ═══════════════════════════════════════════════════════════════════
async function createPairingSession(phoneNumber) {

  // ✅ FIX: crypto.randomBytes — secure random ID
  const sessionId   = generateSecureSessionId();
  const sessionPath = getSessionPath(sessionId);

  ensureSessionsDir();
  try { mkdirSync(sessionPath, { recursive: true }); } catch (_) {}

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version }          = await fetchLatestBaileysVersion();

  return new Promise((resolve, reject) => {
    let pairingDone = false;

    const timeoutHandle = setTimeout(() => {
      const s = activeSockets.get(sessionId);
      if (s) { try { s.end(); } catch {} activeSockets.delete(sessionId); }
      cleanSession(sessionId);
      reject(new Error('Pairing timeout. Please try again.'));
    }, 120000);

    const sock = makeWASocket({
      version,
      logger                        : silentLogger,
      printQRInTerminal             : false,
      auth: {
        creds: state.creds,
        keys : makeCacheableSignalKeyStore(state.keys, silentLogger),
      },
      browser                       : Browsers.ubuntu('Chrome'),
      markOnlineOnConnect           : false,
      generateHighQualityLinkPreview: false,
      syncFullHistory               : false,
      getMessage                    : async () => undefined,
    });

    activeSockets.set(sessionId, sock);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {

      if (connection === 'connecting' && !pairingDone) {
        setTimeout(async () => {
          try {
            if (!sock.authState.creds.registered && !pairingDone) {
              await delay(1500);
              const code      = await sock.requestPairingCode(phoneNumber);
              const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
              pairingDone     = true;

              console.log(chalk.hex('#FFD700').bold(
                `\n  📱 Pairing Code for +${phoneNumber}: ${chalk.hex('#00FF00').bold(formatted)}\n`
              ));

              sessionCache.set(`code_${sessionId}`, formatted);
              resolve({ sessionId, code: formatted });
            }
          } catch (err) {
            if (!pairingDone) {
              clearTimeout(timeoutHandle);
              activeSockets.delete(sessionId);
              cleanSession(sessionId);
              reject(new Error('Failed to generate pairing code. Please try again.'));
            }
          }
        }, 2000);
      }

      if (connection === 'open') {
        clearTimeout(timeoutHandle);
        console.log(chalk.hex('#00FF00').bold(`\n  ✅ Device Paired! Sending Session ID...\n`));
        try {
          const credsRaw   = readFileSync(join(sessionPath, 'creds.json'), 'utf-8');
          const sessionStr = Buffer.from(credsRaw).toString('base64');
          const userJid    = `${phoneNumber}@s.whatsapp.net`;
          await sock.sendMessage(userJid, { text: buildSuccessMessage(sessionStr) });
          sessionCache.set(`session_${sessionId}`, sessionStr);
          console.log(chalk.hex('#00FF00').bold('  ✅ Session ID sent to WhatsApp!\n'));
        } catch (sendErr) {
          console.error('[Pairing] Could not send session message:', sendErr.message);
        }

        setTimeout(async () => {
          try { await sock.logout(); } catch {}
          activeSockets.delete(sessionId);
          cleanSession(sessionId);
        }, 60000);
      }

      if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        clearTimeout(timeoutHandle);
        activeSockets.delete(sessionId);
        if (reason !== DisconnectReason.loggedOut) {
          console.log(chalk.hex('#FF6600')(`  ⚠️ Pairing connection closed. Reason: ${reason}`));
        }
        cleanSession(sessionId);
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
//  🌐 ROUTES
// ═══════════════════════════════════════════════════════════════════

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({
    status    : '✅ Online',
    service   : 'YOUSAF-PAIRING-V1',
    owner     : OWNER_IDENTITY.FULL_NAME,
    version   : OWNER_IDENTITY.VERSION,
    timestamp : new Date().toISOString(),
    activeSess: activeSockets.size,
  });
});

app.get('/get-qr', (req, res) => {
  if (qrConnected) {
    return res.json({ success: false, message: 'Already connected via QR!' });
  }
  if (currentQR) {
    return res.json({ success: true, qr: currentQR });
  }
  return res.json({ success: false, message: 'QR not ready yet. Please wait...' });
});

app.post('/get-code', async (req, res) => {
  let { phoneNumber } = req.body;

  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return res.status(400).json({ success: false, error: 'Phone number required.' });
  }
  if (phoneNumber.length > 20) {
    return res.status(400).json({ success: false, error: 'Invalid phone number.' });
  }

  phoneNumber = sanitizePhone(phoneNumber);

  if (!isValidPhone(phoneNumber)) {
    return res.status(400).json({
      success: false,
      error  : 'Invalid phone number format. Example: 923710636110',
    });
  }

  console.log(chalk.hex('#00FFFF')(`\n  📲 Pairing request for: +${phoneNumber}`));

  try {
    const result = await createPairingSession(phoneNumber);
    return res.json({
      success : true,
      code    : result.code,
      message : 'Enter this code in WhatsApp → Linked Devices → Link with phone number',
    });
  } catch (err) {
    console.error(chalk.hex('#FF0000')(`  ❌ Pairing error: ${err.message}`));
    return res.status(500).json({
      success: false,
      error  : 'Pairing failed. Please try again.',
    });
  }
});

app.get('/api/pair', async (req, res) => {
  let { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number required. Example: ?phone=923710636110' });
  }
  if (typeof phone !== 'string' || phone.length > 20) {
    return res.status(400).json({ error: 'Invalid phone number.' });
  }

  phone = sanitizePhone(phone);

  if (!isValidPhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }

  console.log(chalk.hex('#00FFFF')(`\n  📲 API Pairing request for: +${phone}`));

  try {
    const result = await createPairingSession(phone);
    return res.json({
      success   : true,
      code      : result.code,
      session_id: result.sessionId,
      message   : 'Enter the code in WhatsApp → Linked Devices → Link with phone number',
      owner     : OWNER_IDENTITY.FULL_NAME,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Pairing failed. Please try again.' });
  }
});

app.get('/api/session/:id', (req, res) => {
  const { id }  = req.params;
  const session = sessionCache.get(`session_${id}`);
  if (session) {
    return res.json({ success: true, connected: true, session_id: session });
  }
  return res.json({ success: true, connected: false, message: 'Session pending.' });
});

app.use((req, res) => {
  res.status(404).json({
    error    : 'Endpoint not found.',
    available: [
      'GET  /',
      'GET  /health',
      'GET  /get-qr',
      'POST /get-code',
      'GET  /api/pair?phone=923710636110',
    ],
  });
});

app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// ═══════════════════════════════════════════════════════════════════
//  🚀 START SERVER
// ═══════════════════════════════════════════════════════════════════
printBanner();
ensureSessionsDir();

app.listen(PORT, '0.0.0.0', () => {
  console.log(chalk.hex('#00FF00').bold(`  🌐 Server live: http://0.0.0.0:${PORT}`));
  console.log(chalk.hex('#FFD700')(`  📡 Pairing: POST http://0.0.0.0:${PORT}/get-code\n`));
  console.log(chalk.hex('#00FFFF')('  ═══════════════════════════════════════════════════════════════\n'));

  startQRSession().catch(err => {
    console.error('[QR] Session error:', err.message);
  });
});
