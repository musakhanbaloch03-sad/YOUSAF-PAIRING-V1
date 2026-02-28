/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          YOUSAF-PAIRING-V1 — OFFICIAL SESSION GATEWAY           ║
 * ║          Created by: Muhammad Yousaf Baloch                     ║
 * ║          WhatsApp: +923710636110                                 ║
 * ║          GitHub: https://github.com/musakhanbaloch03-sad        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import dotenv from 'dotenv';
dotenv.config();

import express   from 'express';
import cors      from 'cors';
import helmet    from 'helmet';
import pino      from 'pino';
import chalk     from 'chalk';
import figlet    from 'figlet';
import gradient  from 'gradient-string';
import NodeCache from 'node-cache';
import { randomBytes }   from 'crypto';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
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

// ✅ Cache — code اور session store کرتا ہے
const store = new NodeCache({ stdTTL: 180, checkperiod: 30 });

// ✅ Logger — errors دکھانے کے لیے
const logger = pino({ level: 'warn' });

// ════════════════════════════════════
// 👑 OWNER — DO NOT CHANGE
// ════════════════════════════════════
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

// ════════════════════════════════════
// ⚙️ MIDDLEWARE
// ════════════════════════════════════
app.set('trust proxy', 1);
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'","'unsafe-inline'","https://fonts.googleapis.com","https://cdnjs.cloudflare.com"],
      scriptSrc:  ["'self'","'unsafe-inline'"],
      fontSrc:    ["'self'","https://fonts.gstatic.com","https://cdnjs.cloudflare.com"],
      imgSrc:     ["'self'","data:","https:"],
    },
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// ✅ Request logger — ہر request log ہوگی
app.use((req, _res, next) => {
  if (req.path !== '/favicon.ico') {
    console.log(chalk.cyan(`  → ${req.method} ${req.path}`));
  }
  next();
});

// ════════════════════════════════════
// 🗂️ HELPERS
// ════════════════════════════════════
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

// ════════════════════════════════════
// 📩 SESSION MESSAGE
// ════════════════════════════════════
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

// ════════════════════════════════════
// 🎨 BANNER
// ════════════════════════════════════
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
  console.log(cyber('  ══════════════════════════════════════════════\n'));
}

// ════════════════════════════════════════════════════════
// 📱 PAIRING — BACKGROUND (non-blocking)
//
// ✅ FIX 1: requestPairingCode called IMMEDIATELY after
//           socket creation — NOT waiting for 'open'!
//           This is how Shahban MD / Khan MD do it.
//
// ✅ FIX 2: Function returns session_id IMMEDIATELY.
//           Code result stored in cache.
//           Frontend polls /check/:id for result.
//           This fixes Heroku 30s timeout completely.
// ════════════════════════════════════════════════════════
async function startPairing(phone, sid) {
  mkSessDir();
  const path = sessPath(sid);

  store.set(sid, { status: 'connecting', phone });
  console.log(chalk.cyan(`\n  📲 Pairing started for +${phone} [${sid}]`));

  try {
    const { state, saveCreds } = await useMultiFileAuthState(path);
    const { version }          = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,   // ✅ QR مکمل بند
      browser:           Browsers.ubuntu('Chrome'),
      auth: {
        creds: state.creds,
        keys:  makeCacheableSignalKeyStore(state.keys, logger),
      },
      markOnlineOnConnect:            false,
      generateHighQualityLinkPreview: false,
      syncFullHistory:                false,
      getMessage:                     async () => undefined,
    });

    sock.ev.on('creds.update', saveCreds);

    // ════════════════════════════════════════════
    // ✅ CRITICAL FIX — Request code IMMEDIATELY
    //    after socket is created, if not registered.
    //    Do NOT wait for connection === 'open'!
    // ════════════════════════════════════════════
    if (!sock.authState.creds.registered) {
      try {
        // Small delay for socket to initialise
        await delay(1500);

        console.log(chalk.yellow(`  📡 Requesting pairing code for +${phone}...`));
        const code = await sock.requestPairingCode(phone);
        const fmt  = code?.match(/.{1,4}/g)?.join('-') || code;

        console.log(chalk.green.bold(`\n  ✅ CODE READY: ${fmt} → +${phone}\n`));
        store.set(sid, { status: 'code_ready', phone, code: fmt });

      } catch (codeErr) {
        console.log(chalk.red(`  ❌ requestPairingCode failed: ${codeErr.message}`));
        store.set(sid, { status: 'error', error: codeErr.message });
        try { sock.end(); } catch {}
        delSess(sid);
        return;
      }
    }

    // ════════════════════════════════════════════
    // Connection handler — session send on paired
    // ════════════════════════════════════════════
    let sessDone = false;

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {

      // ✅ When user enters code → WhatsApp authenticates
      // → connection opens as registered user
      if (connection === 'open') {
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
          }
        }
      }

      // Connection closed
      if (connection === 'close') {
        const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.log(chalk.yellow(`  ⚠️  Connection closed. Code: ${code}`));

        const current = store.get(sid);
        if (current?.status === 'connecting') {
          store.set(sid, {
            status: 'error',
            error:  `WhatsApp disconnected (${code}). Please try again.`
          });
          delSess(sid);
        }
        if (sessDone) delSess(sid);
      }
    });

    // Auto-cleanup after 3 minutes
    setTimeout(() => {
      const s = store.get(sid);
      if (s && s.status === 'connecting') {
        store.set(sid, { status: 'error', error: 'Timeout. Please try again.' });
        try { sock.end(); } catch {}
        delSess(sid);
      }
    }, 180000);

  } catch (err) {
    console.log(chalk.red(`  ❌ startPairing error: ${err.message}`));
    store.set(sid, { status: 'error', error: err.message });
    delSess(sid);
  }
}

// ════════════════════════════════════
// 🌐 ROUTES
// ════════════════════════════════════

app.get('/', (_, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/health', (_, res) => {
  res.json({
    status:  '✅ Online',
    service: 'YOUSAF-PAIRING-V1',
    owner:   OWNER.NAME,
    version: OWNER.VER,
    time:    new Date().toISOString(),
  });
});

// ════════════════════════════════════════════════════════
// ✅ STEP 1 — Client calls this first
//    Returns session_id IMMEDIATELY (no waiting!)
//    Background pairing starts automatically
//    Heroku 30s timeout = NO PROBLEM ✅
// ════════════════════════════════════════════════════════
app.post('/get-code', async (req, res) => {
  const raw   = req.body?.phoneNumber || req.body?.number || req.body?.phone || '';
  const phone = cleanPhone(raw);

  if (!phone || !validPhone(phone)) {
    return res.status(400).json({
      success: false,
      error:   'Invalid phone number. Example: 923001234567',
    });
  }

  console.log(chalk.cyan(`\n  📲 /get-code → +${phone}`));

  // Generate unique session id
  const sid = makeId();

  // ✅ Start pairing in background — do NOT await!
  startPairing(phone, sid).catch(err => {
    console.error(chalk.red(`  ❌ Background error: ${err.message}`));
  });

  // ✅ Return session_id immediately — no timeout!
  return res.json({
    success:    true,
    session_id: sid,
    message:    'Pairing started. Poll /check/' + sid + ' for your code.',
  });
});

// ════════════════════════════════════════════════════════
// ✅ STEP 2 — Client polls this every 3 seconds
//    Returns code when ready, or status/error
// ════════════════════════════════════════════════════════
app.get('/check/:id', (req, res) => {
  const { id } = req.params;
  const data   = store.get(id);

  if (!data) {
    return res.status(404).json({
      success: false,
      status:  'not_found',
      error:   'Session not found or expired.',
    });
  }

  return res.json({
    success: true,
    ...data,
  });
});

// ════════════════════════════════════════════════════════
// ✅ GET ROUTE — Direct API access
// ════════════════════════════════════════════════════════
app.get('/api/pair', async (req, res) => {
  const raw   = req.query?.phone || req.query?.number || '';
  const phone = cleanPhone(raw);
  if (!phone || !validPhone(phone)) {
    return res.status(400).json({ error: '?phone=923001234567' });
  }
  const sid = makeId();
  startPairing(phone, sid).catch(() => {});
  return res.json({ success: true, session_id: sid, poll: `/check/${sid}` });
});

app.use((_, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Server error' });
});

// ════════════════════════════════════
// 🚀 START
// ════════════════════════════════════
mkSessDir();
banner();

app.listen(PORT, '0.0.0.0', () => {
  console.log(chalk.green.bold(`  🌐 Server: http://0.0.0.0:${PORT}`));
  console.log(chalk.yellow(    `  📡 POST  : /get-code`));
  console.log(chalk.cyan(      `  📡 POLL  : /check/:id`));
  console.log(chalk.green(     `  ❤️  Health: /health\n`));
  console.log(chalk.green.bold(`  ✅ Pure pairing mode active.\n`));
});
