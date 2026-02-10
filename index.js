import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  delay
} from '@whiskeysockets/baileys';
import pino from 'pino';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Serve HTML
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH-MD Pairing Service</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
            backdrop-filter: blur(10px);
        }
        .header { text-align: center; margin-bottom: 30px; }
        .logo {
            font-size: 48px;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: bold;
        }
        .title {
            font-size: 28px;
            color: #333;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .subtitle {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .premium-badge {
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
        }
        .social-links {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        .social-link {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-size: 12px;
            transition: transform 0.3s;
        }
        .social-link:hover {
            transform: translateY(-3px);
        }
        .input-group {
            margin-bottom: 20px;
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
            transition: border-color 0.3s;
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
            transition: transform 0.3s;
        }
        .btn:hover {
            transform: translateY(-2px);
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌟</div>
            <h1 class="title">YOUSAF-BALOCH-MD</h1>
            <span class="premium-badge">💎 ULTRA PRO PREMIUM</span>
            <p class="subtitle">WhatsApp Session Generator V2.0</p>
        </div>

        <div class="social-links">
            <a href="https://www.youtube.com/@Yousaf_Baloch_Tech" target="_blank" class="social-link">
                📺 YouTube
            </a>
            <a href="https://tiktok.com/@loser_boy.110" target="_blank" class="social-link">
                🎵 TikTok
            </a>
            <a href="https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j" target="_blank" class="social-link">
                📢 Channel
            </a>
            <a href="https://github.com/musakhanbaloch03-sad" target="_blank" class="social-link">
                🔗 GitHub
            </a>
        </div>

        <div class="input-group">
            <label for="phoneNumber">📱 Enter Your WhatsApp Number</label>
            <input 
                type="tel" 
                id="phoneNumber" 
                placeholder="923710636110" 
                required
            >
            <small style="color: #666; font-size: 12px;">Enter with country code (without + or spaces)</small>
        </div>

        <button class="btn" id="submitBtn" onclick="generateCode()">
            🔑 Generate Pairing Code
        </button>

        <div class="spinner" id="spinner"></div>
        <div class="result" id="result"></div>

        <div class="footer">
            <p>Made with ❤️ by <strong>Muhammad Yousaf Baloch</strong></p>
            <p style="margin-top: 10px;">
                📱 WhatsApp: <a href="https://wa.me/923710636110" target="_blank">+923710636110</a>
            </p>
            <p style="margin-top: 5px;">
                🔗 Main Bot: <a href="https://github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD" target="_blank">YOUSAF-BALOCH-MD</a>
            </p>
            <p style="margin-top: 5px; font-size: 10px; color: #999;">
                © 2024 YOUSAF-BALOCH-MD - All Rights Reserved
            </p>
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
                showResult('error', '❌ Invalid phone number format. Enter digits only (10-15 digits)');
                return;
            }

            btn.disabled = true;
            spinner.style.display = 'block';
            resultDiv.style.display = 'none';

            try {
                const response = await fetch('/get-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ phoneNumber })
                });

                const data = await response.json();

                if (data.success) {
                    showResult('success', \`
                        <h3>✅ Pairing Code Generated!</h3>
                        <div class="code-display">\${data.code}</div>
                        <p><strong>Instructions:</strong></p>
                        <ol style="text-align: left; margin-top: 10px;">
                            <li>Open WhatsApp on your phone</li>
                            <li>Go to Settings → Linked Devices</li>
                            <li>Tap "Link a Device"</li>
                            <li>Select "Link with phone number"</li>
                            <li>Enter the code above: <strong>\${data.code}</strong></li>
                        </ol>
                        <p style="margin-top: 15px; color: #28a745;">
                            <strong>✨ Your Session ID will be sent to your WhatsApp!</strong>
                        </p>
                    \`);
                } else {
                    showResult('error', \`❌ Error: \${data.error || 'Failed to generate code'}\`);
                }
            } catch (error) {
                showResult('error', \`❌ Network error: \${error.message}\`);
            } finally {
                btn.disabled = false;
                spinner.style.display = 'none';
            }
        }

        function showResult(type, message) {
            const result = document.getElementById('result');
            result.className = \`result \${type}\`;
            result.innerHTML = message;
            result.style.display = 'block';
        }
    </script>
</body>
</html>`);
});

// API Endpoint
app.post('/get-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.json({ success: false, error: 'Phone number is required' });
    }

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      return res.json({ success: false, error: 'Invalid phone number length' });
    }

    console.log(`📱 Generating pairing code for: ${cleanNumber}`);

    const sessionDir = path.join(__dirname, 'sessions', `temp-${Date.now()}`);
    fs.mkdirSync(sessionDir, { recursive: true });

    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        browser: Browsers.ubuntu('Chrome'),
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        generateHighQualityLinkPreview: true,
        getMessage: async () => undefined
      });

      sock.ev.on('creds.update', saveCreds);

      if (!sock.authState.creds.registered) {
        await delay(2000);

        const code = await sock.requestPairingCode(cleanNumber);
        console.log(`✅ Pairing Code Generated: ${code}`);

        res.json({
          success: true,
          code: code,
          number: cleanNumber
        });

        sock.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect } = update;

          if (connection === 'open') {
            console.log('✅ WhatsApp Connected!');

            try {
              const credsPath = path.join(sessionDir, 'creds.json');
              const credsData = fs.readFileSync(credsPath, 'utf-8');
              const sessionId = Buffer.from(credsData).toString('base64');

              console.log('\n' + '='.repeat(60));
              console.log('SESSION ID:');
              console.log(sessionId);
              console.log('='.repeat(60) + '\n');

              await sock.sendMessage(`${cleanNumber}@s.whatsapp.net`, {
                text: `✅ *YOUSAF-BALOCH-MD SESSION*\n\n🔐 Your Session ID:\n\`\`\`${sessionId}\`\`\`\n\n✨ Save this session ID safely!\n\n👨‍💻 Developer: Muhammad Yousaf Baloch\n📱 Contact: +923710636110`
              });

              console.log('✅ Session ID sent to WhatsApp!');

              setTimeout(async () => {
                await sock.logout();
                fs.rmSync(sessionDir, { recursive: true, force: true });
              }, 5000);

            } catch (err) {
              console.error('Session save error:', err);
            }
          }

          if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed:', lastDisconnect?.error?.message);

            if (!shouldReconnect) {
              fs.rmSync(sessionDir, { recursive: true, force: true });
            }
          }
        });

      } else {
        res.json({ success: false, error: 'Number already registered' });
      }

    } catch (error) {
      console.error('Socket Error:', error);
      fs.rmSync(sessionDir, { recursive: true, force: true });
      res.json({ success: false, error: error.message });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║   🤖 YOUSAF-BALOCH-MD PAIRING SERVICE                    ║');
  console.log('║   Ultra Pro Premium WhatsApp Multi-Device System         ║');
  console.log('║   Version 2.0 - Professional Edition                     ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍💻 Created by: MUHAMMAD YOUSAF');
  console.log('🇵🇰 Country: Pakistan 🇵🇰');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 WhatsApp Channel: https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j');
  console.log('🎥 YouTube: https://www.youtube.com/@Yousaf_Baloch_Tech');
  console.log('🎵 TikTok: https://tiktok.com/@loser_boy.110');
  console.log('📞 Phone: 923710636110');
  console.log('🐙 GitHub: https://github.com/musakhanbaloch03-sad');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`🚀 Server started successfully!`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💻 YOUSAF-BALOCH-MD Pairing Service is ACTIVE! ✅');
  console.log('👨‍💻 Created by MUHAMMAD YOUSAF from Pakistan 🇵🇰');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Keep server alive
setInterval(() => {
  console.log('⏰ Server heartbeat - Running...');
}, 30000);

// Error handlers
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received, closing server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
