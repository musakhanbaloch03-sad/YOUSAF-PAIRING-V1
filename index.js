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
 * 👨‍💻 DEVELOPER: MUHAMMAD YOUSAF BALOCH
 * 📱 WHATSAPP: +923710636110
 * 🔗 YOUTUBE: @Yousaf_Baloch_Tech
 * 🎵 TIKTOK: @loser_boy.110
 * 📢 CHANNEL: https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware & Static Files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Loading Ultra Pro Frontend from public folder

// CORS Configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Serving the Ultra Pro Premium HTML Page
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Error: public/index.html not found! Please create the public folder and add your UI file.");
    }
});

// API Endpoint for Pairing Code
app.post('/get-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.json({ success: false, error: 'Phone number required' });
    }
    
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    if (cleanNumber.length < 10) {
      return res.json({ success: false, error: 'Invalid number format' });
    }
    
    console.log(`📱 Generating Pairing Code for: ${cleanNumber}`);
    
    const sessionDir = path.join(__dirname, 'temp_sessions', `${cleanNumber}_${Date.now()}`);
    fs.mkdirSync(sessionDir, { recursive: true });
    
    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
      
      const sock = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Desktop'),
        syncFullHistory: false,
        markOnlineOnConnect: false
      });
      
      sock.ev.on('creds.update', saveCreds);
      
      if (!sock.authState.creds.registered) {
        await delay(3000); // 3-second delay for stability
        
        const code = await sock.requestPairingCode(cleanNumber);
        console.log(`✅ Code Generated Successfully: ${code}`);
        
        res.json({ success: true, code: code });
        
        const timeout = setTimeout(() => {
            if (sock) {
                console.log('⏱️ Session Request Timeout');
                sock.end();
                if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
            }
        }, 60000);
        
        sock.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect } = update;
          
          if (connection === 'open') {
            clearTimeout(timeout);
            console.log('✅ WhatsApp Connected Successfully!');
            
            try {
              const credsFile = path.join(sessionDir, 'creds.json');
              const creds = fs.readFileSync(credsFile, 'utf-8');
              const sessionId = Buffer.from(creds).toString('base64');
              
              const welcomeMessage = `━━━━━━━━━━━━━━━━━━━━━━━━
✅ *YOUSAF-BALOCH-MD SESSION*
━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Your bot is now connected!

👤 *OWNER:* Muhammad Yousaf Baloch
📱 *NUMBER:* +923710636110

🔗 *SOCIAL LINKS:*
• YouTube: youtube.com/@Yousaf_Baloch_Tech
• TikTok: tiktok.com/@loser_boy.110
• Channel: whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j

🔑 *YOUR SESSION ID:*
\`\`\`${sessionId}\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Keep this ID safe and don't share it!*
━━━━━━━━━━━━━━━━━━━━━━━━`;

              await sock.sendMessage(`${cleanNumber}@s.whatsapp.net`, { text: welcomeMessage });
              console.log('✅ Session ID sent to User!');
              
              setTimeout(() => {
                sock.end();
                if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
              }, 5000);
            } catch (e) {
              console.error('Session Processing Error:', e);
            }
          }
          
          if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (!shouldReconnect) {
                clearTimeout(timeout);
                console.log('❌ Connection Terminated');
                if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
            }
          }
        });
      } else {
        res.json({ success: false, error: 'This number is already registered!' });
        if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('Socket error:', error);
      if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
      res.json({ success: false, error: error.message });
    }
  } catch (error) {
    console.error('API error:', error);
    res.json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', developer: 'Muhammad Yousaf Baloch', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   🤖 YOUSAF-BALOCH-MD PAIRING        ║');
  console.log('║   Professional Session System        ║');
  console.log('║   Developer: Muhammad Yousaf Baloch  ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log(`🚀 Server running on port: ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Error:', err);
});
