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
app.use(helmet({ contentSecurityPolicy: false }));
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

// ── Health Check ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
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
