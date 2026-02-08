const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const fs = require('fs');
const qrcode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 8000;

// QR Management
let currentQR = '';
let lastQRUpdate = 0;
const QR_UPDATE_INTERVAL = 5000; // Only update QR every 5 seconds
let isConnecting = false;
let connectionAttempts = 0;
const MAX_ATTEMPTS = 3;

// Serve HTML
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH Pairing</title>
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
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
            text-align: center;
        }
        h1 { color: #333; margin-bottom: 10px; font-size: 28px; }
        .qr-container {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #qrcode { max-width: 280px; width: 100%; }
        .status {
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            background: #fff3cd;
            color: #856404;
        }
        .instructions {
            text-align: left;
            background: #e7f3ff;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .instructions ol { margin-left: 20px; margin-top: 10px; }
        .instructions li { margin: 8px 0; color: #004085; }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
        }
        .social-links a {
            display: inline-block;
            margin: 5px 10px;
            color: #667eea;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 YOUSAF-BALOCH-MD</h1>
        <p style="color: #666; margin-bottom: 20px;">WhatsApp Pairing Service</p>
        
        <div class="qr-container">
            <img id="qrcode" src="/qr" alt="Loading QR Code...">
        </div>
        
        <div class="status">
            ⏳ Scan QR code within 30 seconds
        </div>
        
        <div class="instructions">
            <strong>📱 Steps:</strong>
            <ol>
                <li>Open WhatsApp</li>
                <li>Tap Menu → Linked Devices</li>
                <li>Tap "Link a Device"</li>
                <li>Scan this QR code</li>
            </ol>
        </div>
        
        <div class="footer">
            <p><strong>Developer:</strong> Muhammad Yousaf Baloch</p>
            <div class="social-links">
                <a href="https://www.youtube.com/@Yousaf_Baloch_Tech">📺 YouTube</a>
                <a href="https://wa.me/923710636110">📱 WhatsApp</a>
                <a href="https://github.com/musakhanbaloch03-sad">🐙 GitHub</a>
            </div>
        </div>
    </div>
    
    <script>
        // Refresh QR image every 10 seconds (not too frequent)
        setInterval(() => {
            document.getElementById('qrcode').src = '/qr?t=' + Date.now();
        }, 10000);
    </script>
</body>
</html>
  `);
});

// Serve QR with caching
app.get('/qr', async (req, res) => {
  if (currentQR) {
    try {
      const qrImage = await qrcode.toDataURL(currentQR);
      const base64Data = qrImage.replace(/^data:image\/png;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': imgBuffer.length,
        'Cache-Control': 'no-cache'
      });
      res.end(imgBuffer);
    } catch (err) {
      console.error('QR generation error:', err);
      res.status(500).send('Error generating QR');
    }
  } else {
    res.status(404).send('QR not available yet');
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', qr: !!currentQR });
});

app.listen(PORT, () => {
  console.log(`🌐 Server: http://localhost:${PORT}`);
  startBot();
});

async function startBot() {
  if (isConnecting) {
    console.log('⚠️ Already connecting, skipping...');
    return;
  }
  
  isConnecting = true;
  
  try {
    // Clear old session if too many failed attempts
    if (connectionAttempts >= MAX_ATTEMPTS) {
      console.log('🧹 Clearing session after max attempts...');
      if (fs.existsSync('./session')) {
        fs.rmSync('./session', { recursive: true });
      }
      connectionAttempts = 0;
      await delay(5000);
    }
    
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();
    
    console.log(`✅ Baileys version: ${version.join('.')}`);

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: true, // Also print in terminal for debugging
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      browser: Browsers.ubuntu('Chrome'),
      
      // CRITICAL: Increase timeouts
      connectTimeoutMs: 90000, // 90 seconds
      defaultQueryTimeoutMs: 60000, // 60 seconds
      keepAliveIntervalMs: 30000, // 30 seconds
      
      // Retry settings
      retryRequestDelayMs: 5000,
      maxMsgRetryCount: 3,
      
      // QR generation settings
      qrTimeout: 30000, // 30 second QR timeout
      
      // Don't auto-reconnect
      shouldReconnect: () => false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Handle QR with debouncing (prevent spam)
      if (qr) {
        const now = Date.now();
        
        // Only update QR if enough time has passed
        if (now - lastQRUpdate >= QR_UPDATE_INTERVAL) {
          currentQR = qr;
          lastQRUpdate = now;
          console.log('📱 QR Code ready');
        }
      }

      if (connection === 'open') {
        console.log('✅ Connected!');
        isConnecting = false;
        connectionAttempts = 0;
        currentQR = '';
        
        // Save session
        const creds = fs.readFileSync('./session/creds.json', 'utf-8');
        const sessionId = Buffer.from(creds).toString('base64');
        
        console.log('\n════════════════════════════════');
        console.log('✅ SESSION ID:');
        console.log(sessionId);
        console.log('════════════════════════════════\n');
      }

      if (connection === 'close') {
        isConnecting = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        console.log(`❌ Disconnected: ${DisconnectReason[statusCode] || statusCode}`);

        if (!shouldReconnect) {
          console.log('🚪 Logged out - clearing session');
          if (fs.existsSync('./session')) {
            fs.rmSync('./session', { recursive: true });
          }
          currentQR = '';
          connectionAttempts = 0;
          
          setTimeout(() => startBot(), 5000);
          return;
        }

        // Handle timeout specifically
        if (statusCode === DisconnectReason.timedOut) {
          connectionAttempts++;
          
          if (connectionAttempts >= MAX_ATTEMPTS) {
            console.log(`❌ Max attempts (${MAX_ATTEMPTS}) reached`);
            console.log('⏸️ Cooling down for 2 minutes...');
            currentQR = '';
            
            setTimeout(() => {
              connectionAttempts = 0;
              startBot();
            }, 120000); // 2 minute cooldown
          } else {
            const delay = 30000; // Fixed 30 second delay
            console.log(`⚠️ Retry ${connectionAttempts}/${MAX_ATTEMPTS} in ${delay/1000}s...`);
            currentQR = '';
            
            setTimeout(() => startBot(), delay);
          }
        } else {
          // Other errors
          currentQR = '';
          setTimeout(() => startBot(), 10000);
        }
      }
    });

  } catch (error) {
    isConnecting = false;
    console.error('💥 Error:', error.message);
    currentQR = '';
    setTimeout(() => startBot(), 30000);
  }
}

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});
