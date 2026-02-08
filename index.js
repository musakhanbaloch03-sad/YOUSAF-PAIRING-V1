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

let currentQR = '';
let connectionAttempts = 0;
const MAX_ATTEMPTS = 3;
const QR_TIMEOUT = 30000; // 30 seconds per QR
let qrTimeout = null;
let sock = null;

// Serve HTML page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH Pairing Service</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
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
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
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
        #qrcode {
            max-width: 100%;
        }
        .status {
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            font-weight: 500;
        }
        .status.waiting {
            background: #fff3cd;
            color: #856404;
        }
        .status.connected {
            background: #d4edda;
            color: #155724;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
        }
        .instructions {
            text-align: left;
            background: #e7f3ff;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .instructions ol {
            margin-left: 20px;
            margin-top: 10px;
        }
        .instructions li {
            margin: 8px 0;
            color: #004085;
        }
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
            font-weight: 500;
        }
        .social-links a:hover {
            color: #764ba2;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .refresh-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 15px;
        }
        .refresh-btn:hover {
            background: #764ba2;
        }
        .timer {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 YOUSAF-BALOCH-MD</h1>
        <p class="subtitle">WhatsApp Pairing Service</p>
        
        <div class="qr-container">
            <img id="qrcode" src="/qr" alt="QR Code will appear here">
        </div>
        
        <div id="status" class="status waiting">
            ⏳ Waiting for QR Code scan...
            <div class="timer" id="timer"></div>
        </div>
        
        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh QR Code</button>
        
        <div class="instructions">
            <strong>📱 How to Connect:</strong>
            <ol>
                <li>Open WhatsApp on your phone</li>
                <li>Tap <strong>Menu (⋮)</strong> or <strong>Settings</strong></li>
                <li>Tap <strong>Linked Devices</strong></li>
                <li>Tap <strong>Link a Device</strong></li>
                <li>Scan the QR code above</li>
            </ol>
        </div>
        
        <div class="footer">
            <p><strong>Developer:</strong> Muhammad Yousaf Baloch</p>
            <div class="social-links">
                <a href="https://www.youtube.com/@Yousaf_Baloch_Tech" target="_blank">📺 YouTube</a>
                <a href="https://wa.me/923710636110" target="_blank">📱 WhatsApp</a>
                <a href="https://github.com/musakhanbaloch03-sad" target="_blank">🐙 GitHub</a>
            </div>
        </div>
    </div>
    
    <script>
        // Auto-refresh QR every 25 seconds
        let timeLeft = 25;
        const timerElement = document.getElementById('timer');
        
        setInterval(() => {
            timeLeft--;
            timerElement.textContent = \`QR expires in \${timeLeft} seconds\`;
            
            if (timeLeft <= 0) {
                location.reload();
            }
        }, 1000);
        
        // Refresh QR image every 5 seconds
        setInterval(() => {
            document.getElementById('qrcode').src = '/qr?t=' + new Date().getTime();
        }, 5000);
    </script>
</body>
</html>
  `);
});

// Serve QR code
app.get('/qr', async (req, res) => {
  if (currentQR) {
    try {
      const qrImage = await qrcode.toDataURL(currentQR);
      const base64Data = qrImage.replace(/^data:image\/png;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': imgBuffer.length
      });
      res.end(imgBuffer);
    } catch (err) {
      res.status(500).send('QR generation failed');
    }
  } else {
    res.status(404).send('QR not ready');
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    qr: !!currentQR,
    attempts: connectionAttempts 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Open: http://localhost:${PORT}`);
  startBot();
});

// Bot function with PROPER timeout handling
async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false, // We handle QR ourselves
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: false,
      
      // CRITICAL: Proper timeout settings
      connectTimeoutMs: 60000, // 60 seconds
      defaultQueryTimeoutMs: 30000, // 30 seconds
      keepAliveIntervalMs: 10000, // 10 seconds
      
      // Disable auto-reconnect, we handle it manually
      shouldReconnect: () => false
    });

    // Handle credentials update
    sock.ev.on('creds.update', saveCreds);

    // Handle QR code
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // QR Code received
      if (qr) {
        currentQR = qr;
        console.log('📱 QR Code updated');
        
        // Clear old timeout
        if (qrTimeout) clearTimeout(qrTimeout);
        
        // Set new timeout - close connection after 30 seconds
        qrTimeout = setTimeout(() => {
          console.log('⏱️ QR Code expired');
          if (sock) {
            sock.end(new Error('QR_TIMEOUT'));
          }
        }, QR_TIMEOUT);
      }

      // Connection opened
      if (connection === 'open') {
        console.log('✅ Connected successfully!');
        currentQR = '';
        connectionAttempts = 0;
        
        // Clear timeout
        if (qrTimeout) clearTimeout(qrTimeout);
        
        // Get session and display
        const sessionData = fs.readFileSync('./session/creds.json', 'utf-8');
        console.log('\n═══════════════════════════════════');
        console.log('✅ SESSION ID (Save this):');
        console.log(Buffer.from(sessionData).toString('base64'));
        console.log('═══════════════════════════════════\n');
      }

      // Connection closed
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const reason = DisconnectReason[statusCode] || 'Unknown';
        
        console.log(`❌ Connection closed - Reason: ${reason}`);
        
        // Clear timeout
        if (qrTimeout) clearTimeout(qrTimeout);
        
        // Handle different disconnect reasons
        if (statusCode === DisconnectReason.loggedOut) {
          console.log('🚪 Logged out - clearing session');
          if (fs.existsSync('./session')) {
            fs.rmSync('./session', { recursive: true, force: true });
          }
          currentQR = '';
          connectionAttempts = 0;
          
          // Wait 5 seconds before restarting
          setTimeout(() => {
            console.log('🔄 Restarting bot...');
            startBot();
          }, 5000);
          
        } else if (statusCode === DisconnectReason.timedOut || 
                   reason.includes('timeout') || 
                   reason.includes('Time-out')) {
          
          connectionAttempts++;
          
          if (connectionAttempts >= MAX_ATTEMPTS) {
            console.log(`❌ Max reconnection attempts (${MAX_ATTEMPTS}) reached`);
            console.log('⏸️ Waiting 60 seconds before retry...');
            connectionAttempts = 0;
            currentQR = '';
            
            setTimeout(() => {
              console.log('🔄 Restarting bot after cooldown...');
              startBot();
            }, 60000); // 60 second cooldown
            
          } else {
            const delay = connectionAttempts * 10000; // 10s, 20s, 30s
            console.log(`⚠️ Reconnecting in ${delay/1000} seconds... (Attempt ${connectionAttempts}/${MAX_ATTEMPTS})`);
            currentQR = '';
            
            setTimeout(() => {
              console.log('🔄 Reconnecting...');
              startBot();
            }, delay);
          }
          
        } else {
          // Other errors - restart after 10 seconds
          console.log('⚠️ Restarting after 10 seconds...');
          currentQR = '';
          connectionAttempts = 0;
          
          setTimeout(() => {
            startBot();
          }, 10000);
        }
      }
    });

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    console.log('🔄 Restarting in 30 seconds...');
    currentQR = '';
    
    setTimeout(() => {
      startBot();
    }, 30000);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️ Shutting down gracefully...');
  if (qrTimeout) clearTimeout(qrTimeout);
  if (sock) await sock.end();
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled rejection:', err);
});
