/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          YOUSAF-PAIRING-V1 — OFFICIAL SESSION GATEWAY           ║
 * ║          Created by: Muhammad Yousaf Baloch                     ║
 * ║          WhatsApp: +923710636110                                 ║
 * ║          GitHub: https://github.com/musakhanbaloch03-sad        ║
 * ║          ✅ SECURITY HARDENED - GitHub CodeQL Compliant         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import dotenv from 'dotenv';
dotenv.config();

import express   from 'express';
import cors      from 'cors';
import helmet    from 'helmet';
import rateLimit from 'express-rate-limit';
import pino      from 'pino';
import chalk     from 'chalk';
import figlet    from 'figlet';
import gradient  from 'gradient-string';
import NodeCache from 'node-cache';
import { randomBytes }   from 'crypto';
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  delay,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT      = process.env.PORT || 5000;
const app       = express();

const store  = new NodeCache({ stdTTL: 180, checkperiod: 30 });
const logger = pino({ level: 'warn' });

const OWNER = Object.freeze({
  NAME:    'Muhammad Yousaf Baloch',
  WA:      '923710636110',
  TIKTOK:  'https://tiktok.com/@loser_boy.110',
  YOUTUBE: 'https://www.youtube.com/@Yousaf_Baloch_Tech',
  CHANNEL: 'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
  GITHUB:  'https://github.com/musakhanbaloch03-sad',
  BOT:     'YOUSAF-BALOCH-MD',
  VER:     '2.0.0',
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many pairing requests. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: 'Health check rate limit exceeded.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.set('trust proxy', 1);
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

app.use((req, _res, next) => {
  if (req.path !== '/favicon.ico') {
    console.log(chalk.cyan(`  → ${req.method} ${req.path}`));
  }
  next();
});

function sessPath(id) {
  return join(__dirname, 'sessions', `s_${id}`);
}
function delSess(id) {
  try {
    const p = sessPath(id);
    if (existsSync(p)) rmSync(p, { recursive: true, force: true });
  } catch {}
}
function mkSessDir() {
  const d = join(__dirname, 'sessions');
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
}
function cleanPhone(raw) {
  if (!raw) return '';
  let p = String(raw).replace(/\s/g, '').replace(/^\+/, '');
  p = p.replace(/\D/g, '');
  if (p.startsWith('00')) p = p.slice(2);
  if (p.length === 10 && p.startsWith('3')) p = '92' + p;
  return p;
}
function validPhone(p) {
  return p && p.length >= 7 && p.length <= 15;
}
function makeId() {
  return randomBytes(8).toString('hex');
}

function sessionMsg(sid) {
  return `╔══════════════════════════════════════╗
║  ⚡ YOUSAF-BALOCH-MD — CONNECTED! ⚡  ║
╚══════════════════════════════════════╝

✅ *BOT CONNECTED SUCCESSFULLY!*

🤖 *Bot:* ${OWNER.BOT}
👑 *By:* ${OWNER.NAME}
🔖 *Version:* ${OWNER.VER}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *YOUR SESSION ID:*

\`\`\`${sid}\`\`\`

⚠️ Never share this SESSION ID!
━━━━━━━━━━━━━━━━━━━━━━━━━━━

👑 *Developer:*
│ 📛 ${OWNER.NAME}
│ 📱 wa.me/${OWNER.WA}

🌐 *Social Media:*
│ 🎵 ${OWNER.TIKTOK}
│ 🎬 ${OWNER.YOUTUBE}
│ 📢 ${OWNER.CHANNEL}
│ 💻 ${OWNER.GITHUB}

💡 Copy SESSION ID → paste in bot → restart!
⚡ Powered by ${OWNER.NAME} © 2026 ⚡`;
}

function banner() {
  console.clear();
  const fire  = gradient(['#FF0000','#FF4500','#FFD700']);
  const cyber = gradient(['#00FFFF','#0080FF','#8000FF']);
  const gold  = gradient(['#FFD700','#FFA500','#FF6347']);
  console.log('\n' + fire.multiline(
    figlet.textSync('YOUSAF-MD', { font: 'ANSI Shadow', horizontalLayout: 'full' })
  ));
  console.log(cyber('  ══════════════════════════════════════════════'));
  console.log(gold( '  ⚡  YOUSAF-BALOCH-MD  |  Pairing Gateway  ⚡'));
  console.log(cyber('  ══════════════════════════════════════════════'));
  console.log(chalk.cyan('  👑 Owner : ') + chalk.yellow.bold(OWNER.NAME));
  console.log(chalk.cyan('  📱 WA    : ') + chalk.green.bold('+' + OWNER.WA));
  console.log(chalk.cyan('  🎵 TikTok: ') + chalk.hex('#FF0050')(OWNER.TIKTOK));
  console.log(chalk.cyan('  🎬 YT    : ') + chalk.red(OWNER.YOUTUBE));
  console.log(chalk.cyan('  📢 Chan  : ') + chalk.green(OWNER.CHANNEL));
  console.log(chalk.cyan('  💻 GitHub: ') + chalk.white(OWNER.GITHUB));
  console.log(cyber('  ══════════════════════════════════════════════'));
  console.log(chalk.green('  🔒 Security: Rate limiting enabled'));
  console.log(chalk.green('  ✅ CSP: Disabled for fetch compatibility\n'));
}

// ═════════════════════════════════════════════════════════════════════
// 🔧 FIX #1: Message history handler (incomplete function fix)
// ═════════════════════════════════════════════════════════════════════
const msgRetryCounter = {};

async function getMessage(key) {
  if (store.has(key.id)) {
    return store.get(key.id);
  }
  return undefined;
}

async function startPairing(phone, sid) {
  mkSessDir();
  const path = sessPath(sid);
  let sock = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 3;

  store.set(sid, { status: 'connecting', phone });
  console.log(chalk.cyan(`\n  📲 Pairing started for +${phone} [${sid}]`));

  try {
    const { state, saveCreds } = await useMultiFileAuthState(path);
    const { version }          = await fetchLatestBaileysVersion();

    // ═════════════════════════════════════════════════════════════════════
    // 🔧 FIX #2: Complete socket configuration with proper options
    // ═════════════════════════════════════════════════════════════════════
    sock = makeWASocket({
      version,
      logger,
      browser: Browsers.ubuntu('Chrome'),
      auth: {
        creds: state.creds,
        keys:  makeCacheableSignalKeyStore(state.keys, logger),
      },
      // 🔧 FIX #3: Improved connection options for Heroku
      markOnlineOnConnect:            false,
      generateHighQualityLinkPreview: false,
      syncFullHistory:                false,
      getMessage,
      msgRetryCounter,
      
      // 🔧 FIX #4: Timeout settings for better stability
      connectTimeoutMs: 60000,      // 60 seconds
      keepAliveIntervalMs: 30000,   // 30 seconds
      retryRequestDelayMs: 2000,    // 2 seconds retry delay
      
      // Additional stability options
      emitOwnEvents: false,
      patchMessageBeforeSending: (message) => {
        return message;
      },
    });

    sock.ev.on('creds.update', saveCreds);

    // ═════════════════════════════════════════════════════════════════════
    // 🔧 FIX #5: Request pairing code with better error handling
    // ═════════════════════════════════════════════════════════════════════
    if (!sock.authState.creds.registered) {
      try {
        await delay(1500);
        console.log(chalk.yellow(`  📡 Requesting pairing code for +${phone}...`));
        
        const code = await sock.requestPairingCode(phone);
        const fmt  = code?.match(/.{1,4}/g)?.join('-') || code;
        
        console.log(chalk.green.bold(`\n  ✅ CODE READY: ${fmt} → +${phone}\n`));
        store.set(sid, { status: 'code_ready', phone, code: fmt });
        
        // ═════════════════════════════════════════════════════════════════════
        // 🔧 FIX #6: Send code directly to WhatsApp as backup
        // ═════════════════════════════════════════════════════════════════════
        try {
          const jid = `${phone}@s.whatsapp.net`;
          await sock.sendMessage(jid, { 
            text: `🔐 *Your Pairing Code:*\n\n\`\`\`${fmt}\`\`\`\n\nEnter this code in WhatsApp → Settings → Linked Devices → Link Device` 
          });
          console.log(chalk.green('  📨 Code also sent to WhatsApp!'));
        } catch (e) {
          console.log(chalk.yellow('  ⚠️ Could not send code to WhatsApp (not paired yet)'));
        }
        
      } catch (codeErr) {
        console.log(chalk.red(`  ❌ requestPairingCode failed: ${codeErr.message}`));
        store.set(sid, { status: 'error', error: codeErr.message });
        try { sock.end(); } catch {}
        delSess(sid);
        return;
      }
    }

    let sessDone = false;
    let connectionStable = false;

    // ═════════════════════════════════════════════════════════════════════
    // 🔧 FIX #7: Improved connection update handler with 515 error handling
    // ═════════════════════════════════════════════════════════════════════
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log(chalk.yellow('  📱 QR Code received (for future reference)'));
      }

      if (connection === 'open') {
        connectionStable = true;
        console.log(chalk.green('  ✅ Connection established!'));
        
        if (sock.authState.creds.registered && !sessDone) {
          sessDone = true;
          console.log(chalk.green(`  ✅ Paired! Sending session to +${phone}...`));
          try {
            await delay(2000);
            const raw    = readFileSync(join(path, 'creds.json'), 'utf-8');
            const sessId = Buffer.from(raw).toString('base64');
            const jid    = `${phone}@s.whatsapp.net`;
            await sock.sendMessage(jid, { text: sessionMsg(sessId) });
            store.set(sid, { status: 'session_sent', phone, sessId });
            console.log(chalk.green.bold('  📩 Session ID sent to WhatsApp!\n'));
            setTimeout(() => {
              try { sock.end(); } catch {}
              delSess(sid);
            }, 15000);
          } catch (sendErr) {
            console.log(chalk.red(`  ❌ Session send error: ${sendErr.message}`));
            store.set(sid, { status: 'error', error: sendErr.message });
          }
        }
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error ? new Boom(lastDisconnect.error).output.statusCode : null;
        const disconnectReason = lastDisconnect?.error?.message || 'Unknown';
        
        console.log(chalk.yellow(`  ⚠️  Connection closed. Code: ${reason}, Reason: ${disconnectReason}`));
        
        // ═════════════════════════════════════════════════════════════════════
        // 🔧 FIX #8: Handle error 515 specifically with reconnection
        // ═════════════════════════════════════════════════════════════════════
        if (reason === 515) {
          console.log(chalk.yellow('  🔄 Stream error 515 detected. Attempting to reconnect...'));
          
          if (reconnectAttempts < maxReconnectAttempts && !connectionStable) {
            reconnectAttempts++;
            console.log(chalk.cyan(`  🔄 Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}...`));
            
            await delay(3000);
            
            // Retry pairing code request
            try {
              const code = await sock.requestPairingCode(phone);
              const fmt  = code?.match(/.{1,4}/g)?.join('-') || code;
              console.log(chalk.green.bold(`  ✅ New CODE READY: ${fmt} → +${phone}\n`));
              store.set(sid, { status: 'code_ready', phone, code: fmt });
              connectionStable = true; // Mark as stable after code generation
            } catch (codeErr) {
              console.log(chalk.red(`  ❌ Reconnection failed: ${codeErr.message}`));
            }
          } else {
            console.log(chalk.red('  ❌ Max reconnection attempts reached'));
          }
        }
        
        const current = store.get(sid);
        
        // Handle other disconnection scenarios
        if (current?.status === 'connecting' || current?.status === 'code_ready') {
          if (reason !== 515 || reconnectAttempts >= maxReconnectAttempts) {
            store.set(sid, {
              status: 'error',
              error:  `WhatsApp disconnected (${reason}). Please try again.`
            });
            delSess(sid);
          }
        }
        
        if (sessDone) delSess(sid);
      }
    });

    // ═════════════════════════════════════════════════════════════════════
    // 🔧 FIX #9: Better timeout handling
    // ═════════════════════════════════════════════════════════════════════
    setTimeout(() => {
      const s = store
