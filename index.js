import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  delay,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} from 'baileys';
import pino from 'pino';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * 👨‍💻 OWNER: MUHAMMAD YOUSAF BALOCH
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8000;
const activeSessions = new Set();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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
      browser: Browsers.ubuntu('Chrome'),
      version,
      syncFullHistory: false,
      markOnlineOnConnect: true
    });

    sock.ev.on('creds.update', saveCreds);

    if (!state.creds.registered) {
      await delay(5000); // 👈 Important delay before requesting code
      const code = await sock.requestPairingCode(cleanNumber);
      if (!res.headersSent) res.json({ success: true, code });

      timeout = setTimeout(() => {
        if (activeSessions.has(cleanNumber)) {
            sock.end(); // 👈 Use end() instead of logout()
            activeSessions.delete(cleanNumber);
            if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
        }
      }, 180000);
    }

    sock.ev.on('connection.update', async (update) => {
      const { connection } = update;
      
      if (connection === 'open') {
        clearTimeout(timeout);
        console.log(`✅ [SUCCESS] ${cleanNumber} Linked!`);
        
        await delay(3000); // Wait for creds.json stability
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
        
        setTimeout(() => {
          sock.end(); // 👈 end() is much safer than logout() here
          activeSessions.delete(cleanNumber);
          if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
        }, 5000);
      }
    });

  } catch (error) {
    activeSessions.delete(cleanNumber);
    if (!res.headersSent) res.json({ success: false, error: 'Connection Error.' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server on Port: ${PORT}`));
