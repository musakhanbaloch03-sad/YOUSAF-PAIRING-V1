import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  delay,
  makeCacheableSignalKeyStore
} from 'baileys';
import pino from 'pino';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * 👨‍💻 OWNER: MUHAMMAD YOUSAF BALOCH
 * 🤖 BOT: YOUSAF-BALOCH-MD (ULTRA PRO)
 * 📱 WHATSAPP: +923710636110
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Main Dashboard Route
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Error: public/index.html not found! Please ensure the public folder exists.");
    }
});

app.post('/get-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.json({ success: false, error: 'Number required' });
    
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    console.log(`📱 Requesting Code for: ${cleanNumber}`);
    
    const sessionDir = path.join(__dirname, 'temp_sessions', `${cleanNumber}_${Date.now()}`);
    fs.mkdirSync(sessionDir, { recursive: true });
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        // CRITICAL FIX: Setting mobile-like browser identity
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        syncFullHistory: false,
        markOnlineOnConnect: false
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    if (!sock.authState.creds.registered) {
        await delay(5000); // 5 sec delay for stability
        const code = await sock.requestPairingCode(cleanNumber);
        res.json({ success: true, code: code });
        
        // Timeout set to 2 minutes for user ease
        const timeout = setTimeout(() => {
            if (sock) {
                console.log('⏱️ Session Timeout');
                sock.end();
                if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
            }
        }, 120000);
        
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open') {
                clearTimeout(timeout);
                console.log('✅ Connected Successfully!');
                
                try {
                    const credsFile = path.join(sessionDir, 'creds.json');
                    const creds = fs.readFileSync(credsFile, 'utf-8');
                    const sessionId = Buffer.from(creds).toString('base64');
                    
                    const successMsg = `━━━━━━━━━━━━━━━━━━━━━━━━
✨ *YOUSAF-BALOCH-MD SESSION* ✨
━━━━━━━━━━━━━━━━━━━━━━━━

👤 *OWNER:* Muhammad Yousaf Baloch
📱 *NUMBER:* +923710636110

🔐 *YOUR SESSION ID:*
\`\`\`${sessionId}\`\`\`

🔗 *SOCIAL ACCOUNTS:*
📺 YouTube: youtube.com/@Yousaf_Baloch_Tech
🎵 TikTok: tiktok.com/@loser_boy.110
📢 Channel: whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
💻 Repo: github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD

━━━━━━━━━━━━━━━━━━━━━━━━
*Note:* Do not share this ID with anyone!
━━━━━━━━━━━━━━━━━━━━━━━━`;

                    await sock.sendMessage(`${cleanNumber}@s.whatsapp.net`, { text: successMsg });
                    
                    setTimeout(() => {
                        sock.end();
                        if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
                    }, 5000);
                } catch (e) { console.error('Processing Error:', e); }
            }
            
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                if (reason !== DisconnectReason.loggedOut) {
                    clearTimeout(timeout);
                    if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
                }
            }
        });
    }
  } catch (error) {
    console.error('API error:', error);
    res.json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   🤖 YOUSAF-BALOCH-MD PAIRING        ║');
  console.log('║   Professional Session System        ║');
  console.log('║   Developer: Muhammad Yousaf Baloch  ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log(`🚀 Server running on port: ${PORT}`);
});
