import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  delay,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import pino from 'pino';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                YOUSAF-BALOCH-MD  •  PAIRING SERVER           ║
 * ║                Created by Muhammad Yousaf Baloch             ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 👤 OWNER: Muhammad Yousaf Baloch
 * 📱 WHATSAPP: +923710636110
 * 📺 YOUTUBE: https://www.youtube.com/@Yousaf_Baloch_Tech
 * 🎵 TIKTOK: https://tiktok.com/@loser_boy.110
 * 📢 CHANNEL: https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
 * 🐙 GITHUB: https://github.com/musakhanbaloch03-sad
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8000;
const activeSessions = new Set();

app.use(express.json());
app.use(express.static('public'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: "Pro", developer: "Yousaf Baloch" });
});

app.post('/get-code', async (req, res) => {
  let sock;
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) return res.json({ success: false, error: 'Phone number is required' });
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  
  if (activeSessions.has(cleanNumber)) {
    return res.json({ success: false, error: 'Already processing. Please wait.' });
  }

  activeSessions.add(cleanNumber);
  
  // 🧹 Hard clean for session directory
  const sessionDir = path.join(__dirname, 'sessions', `${cleanNumber}`);
  if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
  fs.mkdirSync(sessionDir, { recursive: true });

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      auth: { 
        creds: state.creds, 
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) 
      },
      logger: pino({ level: 'silent' }),
      version,
      // 📱 Spoofing as official WhatsApp Desktop to avoid "Couldn't Link" error
      browser: Browsers.macOS('Desktop'), 
      syncFullHistory: false,
      printQRInTerminal: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 30000
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
      await delay(5000); 
      const code = await sock.requestPairingCode(cleanNumber);
      if (!res.headersSent) res.json({ success: true, code });
    }

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === 'open') {
        console.log(`✅ [CONNECTED] ${cleanNumber}`);
        await delay(10000); 
        
        const credsFile = path.join(sessionDir, 'creds.json');
        if (fs.existsSync(credsFile)) {
          const sessionId = Buffer.from(fs.readFileSync(credsFile, 'utf-8')).toString('base64');
          
          const successMsg = `╔═══════════════════════════════════╗
║   ✅  BOT CONNECTED SUCCESSFULLY  ║
╚═══════════════════════════════════╝

✨ *YOUSAF-BALOCH-MD SESSION ID*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 *SESSION ID*:
\`\`\`${sessionId}\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍💻 *DEVELOPER INFO*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Name:* Muhammad Yousaf Baloch
📞 *WhatsApp:* wa.me/923710636110
📺 *YouTube:* youtube.com/@Yousaf_Baloch_Tech
🎵 *TikTok:* tiktok.com/@loser_boy.110
📢 *Channel:* https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
🐙 *GitHub:* https://github.com/musakhanbaloch03-sad

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

          await sock.sendMessage(`${cleanNumber}@s.whatsapp.net`, { text: successMsg });
        }
        
        setTimeout(() => {
          sock.end();
          activeSessions.delete(cleanNumber);
          if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
        }, 15000);
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
           activeSessions.delete(cleanNumber);
           if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
        }
      }
    });

  } catch (error) {
    activeSessions.delete(cleanNumber);
    if (!res.headersSent) res.json({ success: false, error: 'Server Busy' });
  }
});

app.listen(PORT, () => console.log(`🚀 Yousaf Pairing Server running on Port: ${PORT}`));
