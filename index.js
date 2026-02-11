import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  delay
} from 'baileys';
import pino from 'pino';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH-MD Pairing</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 10px;
        }
        .badge {
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            display: block;
            width: fit-content;
            margin: 0 auto 20px;
        }
        .social-links {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        .social-link {
            padding: 8px 16px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-size: 12px;
        }
        .input-group {
            margin: 30px 0;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
        }
        input {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-size: 16px;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
        }
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .result {
            margin-top: 30px;
            padding: 20px;
            border-radius: 10px;
            display: none;
        }
        .result.success {
            background: #d4edda;
            border: 2px solid #28a745;
            color: #155724;
        }
        .result.error {
            background: #f8d7da;
            border: 2px solid #dc3545;
            color: #721c24;
        }
        .code-display {
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            letter-spacing: 5px;
            color: #667eea;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
            display: none;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 YOUSAF-BALOCH-MD</h1>
        <span class="badge">💎 ULTRA PRO PREMIUM</span>
        <p style="text-align: center; color: #666; margin-bottom: 20px;">WhatsApp Session Generator V2.0</p>
        
        <div class="social-links">
            <a href="https://www.youtube.com/@Yousaf_Baloch_Tech" class="social-link">📺 YouTube</a>
            <a href="https://tiktok.com/@loser_boy.110" class="social-link">🎵 TikTok</a>
            <a href="https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j" class="social-link">📢 Channel</a>
            <a href="https://github.com/musakhanbaloch03-sad" class="social-link">🔗 GitHub</a>
        </div>
        
        <div class="input-group">
            <label>📱 Enter Your WhatsApp Number</label>
            <input type="tel" id="phoneNumber" placeholder="923710636110">
            <small style="color: #666; font-size: 12px;">Enter with country code (without + or spaces)</small>
        </div>
        
        <button class="btn" id="submitBtn" onclick="generateCode()">🔑 Generate Pairing Code</button>
        
        <div class="spinner" id="spinner"></div>
        <div class="result" id="result"></div>
        
        <div class="footer">
            <p>Made with ❤️ by <strong>Muhammad Yousaf Baloch</strong></p>
            <p style="margin-top: 10px;">📱 WhatsApp: <a href="https://wa.me/923710636110">+923710636110</a></p>
        </div>
    </div>
    
    <script>
        async function generateCode() {
            const phoneNumber = document.getElementById('phoneNumber').value.trim();
            const resultDiv = document.getElementById('result');
            const spinner = document.getElementById('spinner');
            const btn = document.getElementById('submitBtn');
            
            if (!phoneNumber) {
                showResult('error', '❌ Please enter your phone number');
                return;
            }
            
            if (!/^[0-9]{10,15}$/.test(phoneNumber)) {
                showResult('error', '❌ Invalid number format');
                return;
            }
            
            btn.disabled = true;
            spinner.style.display = 'block';
            resultDiv.style.display = 'none';
            
            try {
                const response = await fetch('/get-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showResult('success', '<h3>✅ Pairing Code Generated!</h3><div class="code-display">' + data.code + '</div><p><strong>Enter this code in WhatsApp within 60 seconds!</strong></p><ol style="text-align: left; margin-top: 10px;"><li>Open WhatsApp</li><li>Settings → Linked Devices</li><li>Link a Device → Link with phone number</li><li>Enter code: <strong>' + data.code + '</strong></li></ol>');
                } else {
                    showResult('error', '❌ Error: ' + (data.error || 'Failed'));
                }
            } catch (error) {
                showResult('error', '❌ Network error: ' + error.message);
            } finally {
                btn.disabled = false;
                spinner.style.display = 'none';
            }
        }
        
        function showResult(type, message) {
            const result = document.getElementById('result');
            result.className = 'result ' + type;
            result.innerHTML = message;
            result.style.display = 'block';
        }
    </script>
</body>
</html>`);
});

app.post('/get-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.json({ success: false, error: 'Phone number required' });
    }
    
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    if (cleanNumber.length < 10) {
      return res.json({ success: false, error: 'Invalid number' });
    }
    
    console.log(`📱 Generating for: ${cleanNumber}`);
    
    const sessionDir = path.join(__dirname, 'sessions', `temp-${Date.now()}`);
    
    // Remove old temp sessions
    const sessionsRoot = path.join(__dirname, 'sessions');
    if (fs.existsSync(sessionsRoot)) {
      const allSessions = fs.readdirSync(sessionsRoot);
      allSessions.forEach(folder => {
        if (folder.startsWith('temp-')) {
          const folderPath = path.join(sessionsRoot, folder);
          const stats = fs.statSync(folderPath);
          const ageMinutes = (Date.now() - stats.mtimeMs) / 1000 / 60;
          if (ageMinutes > 5) {
            fs.rmSync(folderPath, { recursive: true, force: true });
          }
        }
      });
    }
    
    fs.mkdirSync(sessionDir, { recursive: true });
    
    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
      const { version } = await fetchLatestBaileysVersion();
      
      console.log(`📦 Baileys version: ${version.join('.')}`);
      
      const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        mobile: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        browser: Browsers.windows('Desktop'),
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        fireInitQueries: false,
        getMessage: async () => undefined
      });
      
      sock.ev.on('creds.update', saveCreds);
      
      if (!sock.authState.creds.registered) {
        await delay(1500);
        
        const code = await sock.requestPairingCode(cleanNumber);
        console.log(`✅ Code: ${code}`);
        
        res.json({ success: true, code: code });
        
        let connectionTimeout = setTimeout(() => {
          console.log('⏱️ Connection timeout');
          sock.end();
          fs.rmSync(sessionDir, { recursive: true, force: true });
        }, 60000); // 60 second timeout
        
        sock.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect } = update;
          
          if (connection === 'open') {
            clearTimeout(connectionTimeout);
            console.log('✅ Connected!');
            
            try {
              const creds = fs.readFileSync(path.join(sessionDir, 'creds.json'), 'utf-8');
              const sessionId = Buffer.from(creds).toString('base64');
              
              console.log('\n' + '='.repeat(50));
              console.log('SESSION ID:');
              console.log(sessionId);
              console.log('='.repeat(50) + '\n');
              
              await sock.sendMessage(`${cleanNumber}@s.whatsapp.net`, {
                text: `✅ *YOUSAF-BALOCH-MD SESSION*\n\n🔐 Session ID:\n\`\`\`${sessionId}\`\`\`\n\n✨ Save this!\n\n👨‍💻 Developer: Muhammad Yousaf Baloch\n📱 +923710636110`
              });
              
              console.log('✅ Session sent!');
              
              setTimeout(async () => {
                await sock.logout();
                fs.rmSync(sessionDir, { recursive: true, force: true });
              }, 3000);
            } catch (e) {
              console.error('Error:', e);
            }
          }
          
          if (connection === 'close') {
            clearTimeout(connectionTimeout);
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log('❌ Closed:', DisconnectReason[statusCode] || statusCode);
            
            fs.rmSync(sessionDir, { recursive: true, force: true });
          }
        });
      } else {
        res.json({ success: false, error: 'Already registered' });
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('Socket error:', error);
      fs.rmSync(sessionDir, { recursive: true, force: true });
      res.json({ success: false, error: error.message });
    }
  } catch (error) {
    console.error('API error:', error);
    res.json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   🤖 YOUSAF-BALOCH-MD PAIRING        ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log(`🚀 Server: http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

process.on('unhandledRejection', (err) => {
  console.error('Error:', err);
});
