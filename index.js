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
 * * 👤 OWNER: Muhammad Yousaf Baloch
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

// ✅ Health Check Route for Koyeb Stability
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: "Healthy", 
    bot: "YOUSAF-BALOCH-MD",
    developer: "Yousaf Baloch" 
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/get-code', async (req, res) => {
  let sock;
  let timeout;
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) return res.json({ success: false, error: 'Phone number is required' });
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  
  if (activeSessions.has(cleanNumber)) {
    return res.json({ success: false, error: 'Request in progress. Please wait...' });
  }

  activeSessions.add(cleanNumber);
  const sessionDir = path.join(__dirname, 'temp_sessions', `${cleanNumber}_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

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
      // 🚀 WINDOWS SPOOFING: Fixes the Infinite Loading Issue
      browser: ["Windows", "Chrome", "20.0.04"], 
      printQRInTerminal: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 10000
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
      await delay(5000); 
      const code = await sock.requestPairingCode(cleanNumber);
      if (!res.headersSent) res.json({ success: true, code });

      // ⏳ Increase timeout to 300s (5 minutes)
      timeout = setTimeout(() => {
        if (activeSessions.has(cleanNumber)) {
            sock.end();
            activeSessions.delete(cleanNumber);
            if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
        }
      }, 300000); 
    }

    sock.ev.on('connection.update', async (update) => {
      const { connection } = update;
      
      if (connection === 'open') {
        clearTimeout(timeout);
        console.log(`✅ [SUCCESS] ${cleanNumber} Linked!`);
        
        await delay(10000); // Stable delay
        const credsFile = path.join(sessionDir, 'creds.json');
        
        if (fs.existsSync(credsFile)) {
          const sessionId = Buffer.from(fs.readFileSync(credsFile, 'utf-8')).toString('base64');
          
          const successMsg = `╔═══════════════════════════════════╗
║   ✅  BOT CONNECTED SUCCESSFULLY  ║
╚═══════════════════════════════════╝

✨ *YOUSAF-BALOCH-MD SESSION*
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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ _Made with ❤️ by Yousaf Baloch_`;

          await sock.sendMessage(`${cleanNumber}@s.whatsapp.net`, { text: successMsg });
        }
        
        // ⏳ Keep socket open for 60s as requested
        setTimeout(() => {
          sock.end();
          activeSessions.delete(cleanNumber);
          if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
        }, 60000);
      }
    });

  } catch (error) {
    activeSessions.delete(cleanNumber);
    if (!res.headersSent) res.json({ success: false, error: 'Connection Error.' });
  }
});

app.listen(PORT, () => console.log(`🚀 Yousaf Pairing Server running on Port: ${PORT}`));
