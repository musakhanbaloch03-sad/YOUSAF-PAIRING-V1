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
const cache     = new NodeCache({ stdTTL: 300 });
const logger    = pino({ level: 'silent' });

// ═══════════════════════════════════
// 👑 OWNER — DO NOT CHANGE
// ═══════════════════════════════════
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

// ═══════════════════════════════════
// ⚙️ MIDDLEWARE
// ═══════════════════════════════════
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

// ═══════════════════════════════════
// 🗂️ HELPERS
// ═══════════════════════════════════
function sessPath(id) {
  return join(__dirname, 'sessions', `sess_${id}`);
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
  let p = String(raw).replace(/\D/g, '');
  if (p.startsWith('00')) p = p.slice(2);
  if (p.length === 10 && p.startsWith('3')) p = '92' + p;
  return p;
}
function validPhone(p) {
  return p && p.length >= 7 && p.length <= 15;
}

// ═══════════════════════════════════
// 📩 SESSION MESSAGE
// ═══════════════════════════════════
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

// ═══════════════════════════════════
// 🎨 BANNER
// ═══════════════════════════════════
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

// ═══════════════════════════════════════════════════════
// 📱 CORE PAIRING FUNCTION
// ═══════════════════════════════════════════════════════
async function startPairing(phone) {
  mkSessDir();

  const id   = `${Date.now()}_${randomBytes(6).toString('hex')}`;
  const path = sessPath(id);

  const { state, saveCreds } = await useMultiFileAuthState(path);
  const { version }          = await fetchLatestBaileysVersion();

  console.log(chalk.cyan(`\n  📲 Starting pairing for +${phone}...`));

  return new Promise((resolve, reject) => {

    let codeDone = false;
    let sessDone = false;

    const timer = setTimeout(() => {
      if (!codeDone) {
        console.log(chalk.red(`  ❌ Timeout for +${phone}`));
        try { sock.end(); } catch {}
        delSess(id);
        reject(new Error('WhatsApp connection timeout. Please try again.'));
      }
    }, 90000);

    const sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'),
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

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'open') {

        // STEP 1 — Request pairing code
        if (!codeDone) {
          codeDone = true;
          clearTimeout(timer);
          try {
            await delay(1000);
            const code = await sock.requestPairingCode(phone);
            const fmt  = code?.match(/.{1,4}/g)?.join('-') || code;
            console.log(chalk.green.bold(`\n  ✅ CODE: ${fmt} → +${phone}\n`));
            cache.set(`code_${id}`, fmt);
            resolve({ code: fmt, id });
          } catch (e) {
            console.log(chalk.red(`  ❌ Code failed: ${e.message}`));
            try { sock.end(); } catch {}
            delSess(id);
            reject(new Error('Code generation failed: ' + e.message));
          }
        }

        // STEP 2 — Send session after user enters code
        if (codeDone && !sessDone && state.creds?.registered) {
          sessDone = true;
          try {
            await delay(2000);
            const raw    = readFileSync(join(path, 'creds.json'), 'utf-8');
            const sessId = Buffer.from(raw).toString('base64');
            const jid    = `${phone}@s.whatsapp.net`;
            await sock.sendMessage(jid, { text: sessionMsg(sessId) });
            cache.set(`sess_${id}`, sessId);
            console.log(chalk.green.bold('  📩 Session sent!\n'));
            setTimeout(() => { try { sock.end(); } catch {} }, 10000);
          } catch (e) {
            console.log(chalk.red(`  ❌ Session send failed: ${e.message}`));
          }
        }
      }

      if (connection === 'close') {
        const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.log(chalk.yellow(`  ⚠️  Closed. Code: ${code}`));
        if (!codeDone) {
          clearTimeout(timer);
          delSess(id);
          reject(new Error(`Disconnected (${code}). Try again.`));
        }
        if (sessDone) delSess(id);
      }
    });
  });
}

// ═══════════════════════════════════
// 🌐 ROUTES
// ═══════════════════════════════════
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

app.post('/get-code', async (req, res) => {
  const raw   = req.body?.phoneNumber || req.body?.number || req.body?.phone || '';
  const phone = cleanPhone(raw);

  if (!phone || !validPhone(phone)) {
    return res.status(400).json({
      success: false,
      error:   'Invalid phone number. Example: 923001234567',
    });
  }

  console.log(chalk.cyan(`\n  📲 Request: +${phone}`));

  try {
    const result = await startPairing(phone);
    return res.json({
      success: true,
      code:    result.code,
      message: 'Enter this code in WhatsApp → Linked Devices → Link with phone number',
    });
  } catch (err) {
    console.error(chalk.red(`  ❌ Error: ${err.message}`));
    return res.status(500).json({
      success: false,
      error:   err.message,
    });
  }
});

app.get('/api/pair', async (req, res) => {
  const raw   = req.query?.phone || req.query?.number || '';
  const phone = cleanPhone(raw);
  if (!phone || !validPhone(phone)) {
    return res.status(400).json({ error: 'Phone required. ?phone=923001234567' });
  }
  try {
    const result = await startPairing(phone);
    return res.json({ success: true, code: result.code });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.use((_, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ═══════════════════════════════════
// 🚀 START
// ═══════════════════════════════════
mkSessDir();
banner();

app.listen(PORT, '0.0.0.0', () => {
  console.log(chalk.green.bold(`  🌐 Server live  : http://0.0.0.0:${PORT}`));
  console.log(chalk.yellow(    `  📡 POST         : http://0.0.0.0:${PORT}/get-code`));
  console.log(chalk.cyan(      `  📡 GET          : http://0.0.0.0:${PORT}/api/pair?phone=923710636110`));
  console.log(chalk.green(     `  ❤️  Health       : http://0.0.0.0:${PORT}/health\n`));
  console.log(chalk.green.bold(`  ✅ Pure pairing mode — QR removed.\n`));
});
