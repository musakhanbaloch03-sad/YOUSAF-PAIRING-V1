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
 * 👨‍💻 OWNER: MUHAMMAD YOUSAF BALOCH
 * 🤖 BOT: YOUSAF-BALOCH-MD (PAIRING SERVER)
 * 📱 WHATSAPP: +923710636110
 * 📺 YOUTUBE: @Yousaf_Baloch_Tech
 * 🎵 TIKTOK: @loser_boy.110
 * 📢 CHANNEL: https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8000;
const activeSessions = new Set();

app.use(express.json());
app.use(express.static('public'));

// ✅ Health Check Route (Koyeb Fix)
app.get('/health', (req, res) => {
  res.status(200).json({ status: "OK", message: "Yousaf Pairing Server Running" });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/get-code', async (req, res) => {
  let sock;
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) return res.json({ success: false, error: 'Phone number is required' });
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  
  if (activeSessions.has(cleanNumber)) {
    return res.json({ success: false, error: 'Please wait, request in progress...' });
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
      browser: Browsers.ubuntu('Chrome'),
      version,
      printQRInTerminal: false,
      connectTimeoutMs: 60000,   // ⏳ Increased for slow networks
      defaultQueryTimeoutMs: 0,  // ⚡ Fix for "Loading" issue
      retryRequestDelayMs: 5000, 
      keepAliveIntervalMs: 10000
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
      await delay(3000);
      const code = await sock.requestPairingCode(cleanNumber);
      if (!res.headersSent) res.json({ success: true, code });
    }

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === 'open') {
        console.log(`✅ [SUCCESS] ${cleanNumber} Linked!`);
        
        // ⏳ Wait 10 seconds to ensure session is fully written
        await delay(10000); 
        
        const credsFile = path.join(sessionDir, 'creds.json');
        if (fs.existsSync(credsFile)) {
          const sessionId = Buffer.from(fs.readFileSync(credsFile, 'utf-8')).toString('base64');
          
          const successMsg = `━━━━━━━━━━━━━━━━━━━━━━━━
✨ *YOUSAF-BALOCH-MD SESSION* ✨
━━━━━━━━━━━━━━━━━━━━━━━━
👤 *OWNER:* Muhammad Yousaf Baloch
🔐 *SESSION ID:* \`${sessionId}\`

🔗 *SOCIAL LINKS:*
📺 YouTube: youtube.com/@Yousaf_Baloch_Tech
🎵 TikTok: tiktok.com/@loser_boy.110
📢 Channel: whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
━━━━━━━━━━━━━━━━━━━━━━━━`;

          await sock.sendMessage(`${cleanNumber}@s.whatsapp.net`, { text: successMsg });
        }
        
        // 🛑 End connection cleanly after 60 seconds
        setTimeout(() => {
          sock.end();
          activeSessions.delete(cleanNumber);
          if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
        }, 60000);
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason !== DisconnectReason.loggedOut) {
           // Do nothing, let it reconnect if needed temporarily
        } else {
           activeSessions.delete(cleanNumber);
           if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
        }
      }
    });

  } catch (error) {
    console.error(error);
    activeSessions.delete(cleanNumber);
    if (!res.headersSent) res.json({ success: false, error: 'Connection Error' });
  }
});

app.listen(PORT, () => {
    console.log(`🚀 YOUSAF PAIRING SERVER RUNNING ON PORT: ${PORT}`);
});
