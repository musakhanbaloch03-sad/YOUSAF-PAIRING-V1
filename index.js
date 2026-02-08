const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const fs = require('fs');
const qrcode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 8000;

let currentQR = null;
let sock = null;
let isStarting = false;

// HTML Interface
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH Pairing</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
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
        h1 { color: #333; margin-bottom: 20px; }
        .qr-box {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #qr { max-width: 280px; }
        .status {
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            background: #fff3cd;
            color: #856404;
        }
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
        }
        .btn:hover { background: #764ba2; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 YOUSAF-BALOCH-MD</h1>
        <p style="color: #666; margin-bottom: 20px;">WhatsApp Pairing Service</p>
        
        <div class="qr-box">
            <img id="qr" src="/qr" alt="QR Code Loading...">
        </div>
        
        <div class="status">Scan QR code to connect</div>
        
        <button class="btn" onclick="location.reload()">🔄 Refresh</button>
        
        <p style="margin-top: 30px; color: #666;">
            Developer: Muhammad Yousaf Baloch<br>
            <a href="https://github.com/musakhanbaloch03-sad" style="color: #667eea;">GitHub</a>
        </p>
    </div>
    <script>
        setInterval(() => {
            document.getElementById('qr').src = '/qr?t=' + Date.now();
        }, 15000);
    </script>
</body>
</html>
  `);
});

// QR Endpoint
app.get('/qr', async (req, res) => {
  if (currentQR) {
    try {
      const img = await qrcode.toDataURL(currentQR);
      const buf = Buffer.from(img.split(',')[1], 'base64');
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(buf);
    } catch (e) {
      res.status(500).send('QR Error');
    }
  } else {
    res.status(404).send('QR Not Ready');
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', qr: !!currentQR });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🌐 Server: http://localhost:${PORT}`);
  setTimeout(startBot, 3000); // Wait 3 seconds before starting
});

// Bot Function with CRASH PREVENTION
async function startBot() {
  // Prevent multiple simultaneous starts
  if (isStarting) {
    console.log('⚠️ Already starting...');
    return;
  }
  
  isStarting = true;
  
  try {
    console.log('🚀 Initializing bot...');
    
    // Get auth state
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    
    // Get Baileys version
    const { version } = await fetchLatestBaileysVersion();
    console.log(`✅ Baileys: ${version.join('.')}`);
    
    // Create socket with STRICT settings
    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: true,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      browser: Browsers.ubuntu('Chrome'),
      
      // CRITICAL: Proper timeouts
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0, // Disable query timeout
      keepAliveIntervalMs: 30000,
      qrTimeout: 40000,
      
      // IMPORTANT: Disable auto-reconnect
      shouldReconnect: () => false,
      
      // Prevent rapid retries
      retryRequestDelayMs: 10000,
      maxMsgRetryCount: 2,
      
      // Message handling
      getMessage: async () => undefined
    });
    
    // Save credentials
    sock.ev.on('creds.update', saveCreds);
    
    // Connection handler
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      // QR Code
      if (qr) {
        currentQR = qr;
        console.log('📱 QR Code available');
      }
      
      // Connected
      if (connection === 'open') {
        console.log('✅ CONNECTED!');
        currentQR = null;
        isStarting = false;
        
        try {
          const creds = fs.readFileSync('./session/creds.json', 'utf-8');
          const sessionId = Buffer.from(creds).toString('base64');
          console.log('\n' + '='.repeat(50));
          console.log('SESSION ID:');
          console.log(sessionId);
          console.log('='.repeat(50) + '\n');
        } catch (e) {
          console.error('Session read error:', e.message);
        }
      }
      
      // Disconnected
      if (connection === 'close') {
        isStarting = false;
        currentQR = null;
        
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const reason = lastDisconnect?.error?.output?.payload?.error || 'Unknown';
        
        console.log(`❌ Disconnected: ${reason} (${statusCode})`);
        
        // Handle logout
        if (statusCode === DisconnectReason.loggedOut) {
          console.log('🚪 Logged out - clearing session');
          try {
            if (fs.existsSync('./session')) {
              fs.rmSync('./session', { recursive: true, force: true });
            }
          } catch (e) {
            console.error('Session clear error:', e);
          }
        }
        
        // CRITICAL: Add delay before restart to prevent crash loop
        console.log('⏳ Restarting in 10 seconds...');
        setTimeout(() => {
          console.log('🔄 Restarting...');
          startBot();
        }, 10000); // 10 second delay
      }
    });
    
  } catch (error) {
    isStarting = false;
    console.error('💥 Fatal error:', error.message);
    console.log('⏳ Retry in 30 seconds...');
    
    // Long delay after fatal error
    setTimeout(startBot, 30000);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️ Shutting down...');
  if (sock) {
    try {
      await sock.logout();
    } catch (e) {}
  }
  process.exit(0);
});

// Prevent unhandled crashes
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
});
