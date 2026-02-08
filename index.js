import express from 'express';
import fs from 'fs';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());

// Sessions folder
if (!fs.existsSync('./sessions')) {
    fs.mkdirSync('./sessions');
}

// Main route - Premium HTML page
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH-MD | Premium Pairing</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Poppins:wght@300;400;600;700;900&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        }

        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
        }

        .particle {
            position: absolute;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            animation: float 15s infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }

        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            padding: 50px 40px;
            border-radius: 30px;
            box-shadow: 0 30px 90px rgba(0, 0, 0, 0.3);
            max-width: 550px;
            width: 100%;
            animation: slideUp 0.8s ease;
            position: relative;
            z-index: 1;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(50px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .header { text-align: center; margin-bottom: 40px; }

        .logo {
            width: 100px;
            height: 100px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 50px;
            color: white;
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        .header h1 {
            font-family: 'Orbitron', sans-serif;
            color: #667eea;
            font-size: 32px;
            font-weight: 900;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .header p {
            color: #666;
            font-size: 16px;
            font-weight: 500;
        }

        .badges {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 15px;
            flex-wrap: wrap;
        }

        .badge {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .form-group {
            margin-bottom: 30px;
            position: relative;
        }

        .form-group i {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            color: #667eea;
            font-size: 20px;
        }

        input {
            width: 100%;
            padding: 18px 20px 18px 55px;
            border: 3px solid #e0e0e0;
            border-radius: 15px;
            font-size: 18px;
            font-weight: 600;
            transition: 0.3s;
            background: white;
            color: #333;
        }

        input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 5px rgba(102, 126, 234, 0.1);
            transform: translateY(-2px);
        }

        input::placeholder { color: #aaa; font-weight: 400; }

        button {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 15px;
            font-size: 20px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.3s;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        button:before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }

        button:hover:before { width: 300px; height: 300px; }
        button:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5); }
        button:active { transform: translateY(-1px); }
        button:disabled { background: #ccc; cursor: not-allowed; transform: none; }

        #result {
            margin-top: 30px;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
            display: none;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        .success {
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            color: #155724;
            border: 3px solid #b1dfbb;
        }

        .error {
            background: linear-gradient(135deg, #f8d7da, #f5c6cb);
            color: #721c24;
            border: 3px solid #f5c6cb;
        }

        .loading {
            background: linear-gradient(135deg, #fff3cd, #ffeaa7);
            color: #856404;
            border: 3px solid #ffeaa7;
        }

        .code-display {
            font-family: 'Orbitron', monospace;
            font-size: 42px;
            letter-spacing: 5px;
            margin: 20px 0;
            font-weight: 900;
            color: #667eea;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        .social-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 30px 0 20px;
            flex-wrap: wrap;
        }

        .social-link {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: white;
            text-decoration: none;
            transition: 0.3s;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
        }

        .social-link:before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: 0.5s;
        }

        .social-link:hover:before { width: 100%; height: 100%; }
        .social-link:hover { transform: translateY(-5px) scale(1.1); }

        .whatsapp { background: linear-gradient(135deg, #25D366, #128C7E); }
        .youtube { background: linear-gradient(135deg, #FF0000, #CC0000); }
        .tiktok { background: linear-gradient(135deg, #000000, #69C9D0); }
        .channel { background: linear-gradient(135deg, #00E676, #00C853); }
        .github { background: linear-gradient(135deg, #333, #24292e); }

        .instructions {
            background: linear-gradient(135deg, #e7f3ff, #c3e0ff);
            padding: 25px;
            border-radius: 15px;
            margin-top: 30px;
            font-size: 14px;
            line-height: 1.8;
            color: #333;
            border: 2px solid #9ec8ff;
        }

        .instructions h3 {
            font-family: 'Orbitron', sans-serif;
            color: #667eea;
            margin-bottom: 15px;
            font-size: 20px;
            font-weight: 700;
        }

        .instructions ol { padding-left: 25px; }
        .instructions li { margin-bottom: 10px; }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
        }

        .footer p { color: #666; font-size: 14px; margin-bottom: 10px; }
        .footer .owner {
            font-family: 'Orbitron', sans-serif;
            color: #667eea;
            font-weight: 700;
            font-size: 18px;
            margin: 10px 0;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
            .container { padding: 30px 20px; }
            .header h1 { font-size: 26px; }
            .code-display { font-size: 32px; }
            .social-link { width: 50px; height: 50px; font-size: 22px; }
        }
    </style>
</head>
<body>
    <div class="particles" id="particles"></div>

    <div class="container">
        <div class="header">
            <div class="logo">
                <i class="fas fa-robot"></i>
            </div>
            <h1>🤖 YOUSAF-BALOCH-MD</h1>
            <p>Premium WhatsApp Bot Pairing Service</p>
            <div class="badges">
                <span class="badge">🚀 Ultra Fast</span>
                <span class="badge">🔒 100% Secure</span>
                <span class="badge">✨ Premium</span>
            </div>
        </div>

        <div class="form-group">
            <i class="fab fa-whatsapp"></i>
            <input 
                type="tel" 
                id="number" 
                placeholder="923710636110" 
                autocomplete="off"
            />
        </div>

        <button onclick="getPairingCode()" id="submitBtn">
            <span style="position: relative; z-index: 1;">
                <i class="fas fa-key"></i> Get Pairing Code
            </span>
        </button>

        <div id="result"></div>

        <div class="social-links">
            <a href="https://wa.me/923710636110" target="_blank" class="social-link whatsapp" title="WhatsApp">
                <i class="fab fa-whatsapp"></i>
            </a>
            <a href="https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j" target="_blank" class="social-link channel" title="WhatsApp Channel">
                <i class="fas fa-bullhorn"></i>
            </a>
            <a href="https://www.youtube.com/@Yousaf_Baloch_Tech" target="_blank" class="social-link youtube" title="YouTube">
                <i class="fab fa-youtube"></i>
            </a>
            <a href="https://tiktok.com/@loser_boy.110" target="_blank" class="social-link tiktok" title="TikTok">
                <i class="fab fa-tiktok"></i>
            </a>
            <a href="https://github.com/musakhanbaloch03-sad" target="_blank" class="social-link github" title="GitHub">
                <i class="fab fa-github"></i>
            </a>
        </div>

        <div class="instructions">
            <h3><i class="fas fa-info-circle"></i> How to Use</h3>
            <ol>
                <li><strong>Enter Number:</strong> Type your WhatsApp number with country code (e.g., 923710636110)</li>
                <li><strong>Click Button:</strong> Press "Get Pairing Code"</li>
                <li><strong>Receive Code:</strong> You'll get an 8-digit pairing code</li>
                <li><strong>Open WhatsApp:</strong> Settings → Linked Devices → Link a Device</li>
                <li><strong>Enter Code:</strong> Choose "Link with phone number" and enter your code</li>
                <li><strong>Done!</strong> Your bot is connected</li>
            </ol>
        </div>

        <div class="footer">
            <p class="owner">💎 Muhammad Yousaf Baloch 💎</p>
            <p><i class="fas fa-phone"></i> +923710636110</p>
            <p style="font-size: 12px; margin-top: 15px;">
                Made with <span style="color: #e74c3c;">❤️</span> in Pakistan 🇵🇰
            </p>
        </div>
    </div>

    <script>
        function createParticles() {
            const particles = document.getElementById('particles');
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.width = Math.random() * 5 + 2 + 'px';
                particle.style.height = particle.style.width;
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDuration = Math.random() * 10 + 10 + 's';
                particle.style.animationDelay = Math.random() * 5 + 's';
                particles.appendChild(particle);
            }
        }
        createParticles();

        async function getPairingCode() {
            const number = document.getElementById('number').value.trim();
            const result = document.getElementById('result');
            const submitBtn = document.getElementById('submitBtn');
            
            result.style.display = 'none';
            result.className = '';
            
            if (!number) {
                showResult('error', '<i class="fas fa-exclamation-circle"></i> Please enter your WhatsApp number!');
                return;
            }

            if (number.length < 10) {
                showResult('error', '<i class="fas fa-exclamation-circle"></i> Invalid number! Must be at least 10 digits.');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span style="position: relative; z-index: 1;"><i class="fas fa-spinner fa-spin"></i> Generating...</span>';
            result.style.display = 'block';
            result.className = 'loading';
            result.innerHTML = '<div class="spinner"></div><p><i class="fas fa-clock"></i> Please wait...</p>';

            try {
                const response = await fetch('/code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ number: number })
                });
                
                const data = await response.json();
                
                if (data.success && data.code) {
                    showResult('success', \`
                        <i class="fas fa-check-circle" style="font-size: 50px; color: #28a745; margin-bottom: 15px;"></i>
                        <h3>✅ Your Pairing Code</h3>
                        <div class="code-display">\${data.code}</div>
                        <p style="font-size: 16px; margin-top: 15px;">
                            <i class="fas fa-hourglass-half"></i> Code expires in 60 seconds!
                        </p>
                        <p style="font-size: 14px; margin-top: 10px; color: #666;">
                            Enter in WhatsApp → Settings → Linked Devices
                        </p>
                    \`);
                } else {
                    showResult('error', \`<i class="fas fa-times-circle"></i> \${data.error || 'Failed to generate code'}\`);
                }
            } catch (error) {
                showResult('error', '<i class="fas fa-exclamation-triangle"></i> Network error! Try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span style="position: relative; z-index: 1;"><i class="fas fa-key"></i> Get Pairing Code</span>';
            }
        }

        function showResult(type, message) {
            const result = document.getElementById('result');
            result.className = type;
            result.innerHTML = message;
            result.style.display = 'block';
        }

        document.getElementById('number').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getPairingCode();
            }
        });
    </script>
</body>
</html>`);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Pairing code generation
app.post('/code', async (req, res) => {
    const { number } = req.body;
    
    if (!number) {
        return res.json({ error: 'Number required' });
    }

    const phoneNumber = number.replace(/[^0-9]/g, '');
    
    if (phoneNumber.length < 10) {
        return res.json({ error: 'Invalid number format' });
    }

    try {
        const id = \`session_\${Date.now()}\`;
        const sessionPath = \`./sessions/\${id}\`;
        
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
            },
            browser: ['YOUSAF-BALOCH-MD', 'Chrome', '1.0.0'],
            connectTimeoutMs: 60000
        });

        if (!sock.authState.creds.registered) {
            const code = await sock.requestPairingCode(phoneNumber);
            const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
            
            console.log(\`✅ Pairing code generated: \${formattedCode} for \${phoneNumber}\`);
            
            res.json({ 
                success: true, 
                code: formattedCode 
            });

            sock.ev.on('creds.update', saveCreds);
            
            sock.ev.on('connection.update', (update) => {
                const { connection } = update;
                
                if (connection === 'open') {
                    console.log(\`✅ Connection successful for: \${phoneNumber}\`);
                    setTimeout(() => {
                        try {
                            if (fs.existsSync(sessionPath)) {
                                fs.rmSync(sessionPath, { recursive: true, force: true });
                            }
                        } catch (err) {
                            console.error('Cleanup error:', err);
                        }
                        sock.end();
                    }, 5000);
                } else if (connection === 'close') {
                    try {
                        if (fs.existsSync(sessionPath)) {
                            fs.rmSync(sessionPath, { recursive: true, force: true });
                        }
                    } catch (err) {
                        console.error('Cleanup error:', err);
                    }
                }
            });
        } else {
            res.json({ error: 'Number already registered' });
            sock.end();
        }
    } catch (error) {
        console.error('Pairing error:', error);
        res.json({ error: 'Failed to generate code. Please try again.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(\`✅ YOUSAF-BALOCH-MD Pairing Server\`);
    console.log(\`🌐 Port: \${PORT}\`);
    console.log(\`📱 Ready to generate pairing codes\`);
});
