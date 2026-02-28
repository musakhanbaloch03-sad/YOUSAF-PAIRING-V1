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

// ✅ FIX: CSP بند کی — fetch requests block نہیں ہوں گی
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
      printQRInTerminal: false,
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

    if (!sock.authState.creds.registered) {
      try {
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

    let sessDone = false;

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
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

app.get('/', generalLimiter, (_, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/health', healthLimiter, (_, res) => {
  res.json({
    status:   '✅ Online',
    service:  'YOUSAF-PAIRING-V1',
    owner:    OWNER.NAME,
    version:  OWNER.VER,
    time:     new Date().toISOString(),
    security: 'Rate limiting enabled',
  });
});

app.post('/get-code', strictLimiter, async (req, res) => {
  const raw   = req.body?.phoneNumber || req.body?.number || req.body?.phone || '';
  const phone = cleanPhone(raw);

  if (!phone || !validPhone(phone)) {
    return res.status(400).json({
      success: false,
      error:   'Invalid phone number. Example: 923001234567',
    });
  }

  console.log(chalk.cyan(`\n  📲 /get-code → +${phone}`));
  const sid = makeId();

  startPairing(phone, sid).catch(err => {
    console.error(chalk.red(`  ❌ Background error: ${err.message}`));
  });

  return res.json({
    success:    true,
    session_id: sid,
    message:    'Pairing started. Poll /check/' + sid + ' for your code.',
  });
});

app.get('/check/:id', generalLimiter, (req, res) => {
  const { id } = req.params;
  const data   = store.get(id);

  if (!data) {
    return res.status(404).json({
      success: false,
      status:  'not_found',
      error:   'Session not found or expired.',
    });
  }

  return res.json({ success: true, ...data });
});

app.get('/api/pair', strictLimiter, async (req, res) => {
  const raw   = req.query?.phone || req.query?.number || '';
  const phone = cleanPhone(raw);
  if (!phone || !validPhone(phone)) {
    return res.status(400).json({ error: '?phone=923001234567' });
  }
  const sid = makeId();
  startPairing(phone, sid).catch(() => {});
  return res.json({ success: true, session_id: sid, poll: `/check/${sid}` });
});

app.use(generalLimiter, (_, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Server error' });
});

mkSessDir();
banner();

app.listen(PORT, '0.0.0.0', () => {
  console.log(chalk.green.bold(`  🌐 Server: http://0.0.0.0:${PORT}`));
  console.log(chalk.yellow(    `  📡 POST  : /get-code`));
  console.log(chalk.cyan(      `  📡 POLL  : /check/:id`));
  console.log(chalk.green(     `  ❤️  Health: /health`));
  console.log(chalk.green.bold(`  ✅ Pure pairing mode active`));
  console.log(chalk.green.bold(`  🔒 Rate limiting: ENABLED\n`));
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n⚠️  SIGTERM - Shutting down gracefully...'));
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️  SIGINT - Shutting down gracefully...'));
  process.exit(0);
});
