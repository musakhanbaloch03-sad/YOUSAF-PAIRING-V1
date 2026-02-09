import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import chalk from 'chalk';
import Pino from 'pino';
import express from 'express';
import figlet from 'figlet';

const baileys = require('@whiskeysockets/baileys');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore,
    DisconnectReason,
    Browsers,   // <--- Ye zaroori hai
    delay       // <--- Delay add kiya taake WhatsApp server reject na kare
} = baileys;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

const sessionDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionDir)) fs.ensureDirSync(sessionDir);

console.clear();
console.log(chalk.cyan(figlet.textSync('YOUSAF V1', { font: 'Small' })));

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-V1 PAIRING</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; background: #050505; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 15px; }
        .card { background: rgba(255, 255, 255, 0.05); border-radius: 30px; padding: 30px; width: 100%; max-width: 450px; text-align: center; border: 1px solid #333; box-shadow: 0 0 30px rgba(0,242,255,0.1); }
        .clock { background: #111; border: 2px solid #00f2ff; border-radius: 20px; padding: 20px; margin-bottom: 25px; box-shadow: 0 0 15px #00f2ff33; }
        #time { font-family: 'Orbitron'; font-size: 2.8em; color: #00f2ff; text-shadow: 0 0 10px #00f2ff; }
        #date { color: #888; font-size: 1.1em; margin-top: 5px; }
        input { width: 90%; padding: 18px; border-radius: 15px; border: 1px solid #444; background: #000; color: white; font-size: 1.2em; text-align: center; margin-bottom: 15px; outline: none; }
        input:focus { border-color: #00f2ff; box-shadow: 0 0 10px #00f2ff55; }
        .btn { width: 100%; padding: 18px; border-radius: 15px; border: none; background: linear-gradient(45deg, #00f2ff, #0066ff); color: white; font-weight: bold; font-size: 1.1em; cursor: pointer; transition: 0.3s; }
        .btn:hover { transform: scale(1.02); filter: brightness(1.2); }
        #code { font-size: 2.5em; font-family: 'Orbitron'; color: #ffd700; margin-top: 20px; letter-spacing: 5px; text-shadow: 0 0 10px #ffd700; min-height: 60px; }
        .social-box { margin-top: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .social { padding: 15px; border-radius: 12px; color: white; text-decoration: none; font-weight: bold; font-size: 0.8em; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
        .wa { background: #25D366; } .yt { background: #FF0000; } .tk { background: #000; border: 1px solid #444; } .ch { background: #0072ff; }
    </style>
</head>
<body>
    <div class="card">
        <div class="clock"><div id="time">00:00:00</div><div id="date">LOADING...</div></div>
        <h2 style="color:#00f2ff; margin-bottom:20px; font-family:'Orbitron';">YOUSAF-V1</h2>
        <input type="tel" id="num" placeholder="923170636110">
        <button class="btn" onclick="getCode()">⚡ GET PAIRING CODE</button>
        <div id="code"></div>
        <div class="social-box">
            <a href="https://wa.me/923170636110" class="social wa">WHATSAPP</a>
            <a href="https://youtube.com/@Yousaf_Baloch_Tech" class="social yt">YOUTUBE</a>
            <a href="https://tiktok.com/@loser_boy.110" class="social tk">TIKTOK</a>
            <a href="https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j" class="social ch">CHANNEL</a>
        </div>
    </div>
    <script>
        function update() {
            const n = new Date();
            document.getElementById('time').innerText = n.toLocaleTimeString('en-GB');
            document.getElementById('date').innerText = n.toLocaleDateString('en-US', {weekday:'long', day:'numeric', month:'long'});
        } setInterval(update, 1000); update();
        async function getCode() {
            const p = document.getElementById('num').value.replace(/[^0-9]/g,'');
            if(!p) return alert('Please enter your number!');
            const resDiv = document.getElementById('code');
            resDiv.innerText = 'WAIT...';
            try {
                const r = await fetch('/pairing', { 
                    method:'POST', 
                    headers:{'Content-Type':'application/json'}, 
                    body:JSON.stringify({phone:p}) 
                });
                const d = await r.json();
                if(d.code) {
                    resDiv.innerText = d.code;
                } else {
                    resDiv.innerText = 'ERROR';
                    alert(d.error || 'Check number format');
                }
            } catch { resDiv.innerText = 'SERVER ERR'; }
        }
    </script>
</body>
</html>
    `);
});

// --- Pairing Engine with FIXED BROWSER ---
async function startYousafV1() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'silent' })),
        },
        printQRInTerminal: false,
        logger: Pino({ level: 'silent' }),
        // --- YEH HAI ASAL FIX: Ubuntu Chrome Identity ---
        browser: Browsers.ubuntu("Chrome"),
    });

    sock.ev.on('creds.update', saveCreds);

    app.post('/pairing', async (req, res) => {
        let phone = req.body.phone;
        try {
            if (!sock.authState.creds.registered) {
                // Thora delay taake server reject na kare
                await delay(1500); 
                let code = await sock.requestPairingCode(phone);
                res.json({ code: code });
            } else {
                res.json({ error: "Session Active. Clear Session first." });
            }
        } catch (err) {
            console.error("Pairing Error:", err);
            res.json({ error: "Try Again (Server Busy)" });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startYousafV1();
        } else if (connection === 'open') {
            console.log(chalk.green('✅ YOUSAF-V1 Connected Successfully!'));
        }
    });
}

app.listen(PORT, () => {
    console.log(chalk.green(`🚀 YOUSAF-V1 LIVE ON PORT: ${PORT}`));
    startYousafV1().catch(e => console.log(e));
});
