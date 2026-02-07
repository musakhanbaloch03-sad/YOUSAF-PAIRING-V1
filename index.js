import express from 'express';
import pino from 'pino';
import { makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';

const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH-MD PAIRING</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); padding: 30px; border-radius: 20px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); text-align: center; width: 90%; max-width: 400px; border: 1px solid rgba(255, 255, 255, 0.18); }
        h2 { color: #00ff88; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
        p { font-size: 14px; color: #ccc; margin-bottom: 20px; }
        input { width: 100%; padding: 12px; margin-bottom: 20px; border: none; border-radius: 8px; background: rgba(255, 255, 255, 0.2); color: white; font-size: 16px; outline: none; box-sizing: border-box; }
        input::placeholder { color: #ddd; }
        button { width: 100%; padding: 12px; border: none; border-radius: 8px; background: #00ff88; color: #000; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.3s; }
        button:hover { background: #00cc6a; transform: scale(1.02); }
        #result { margin-top: 25px; padding: 15px; border-radius: 8px; background: rgba(0, 0, 0, 0.3); font-size: 1.5rem; font-weight: bold; color: #00ff88; min-height: 40px; display: none; border: 1px dashed #00ff88; }
        .loading { display: none; margin-top: 10px; color: #ffcc00; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>YOUSAF-BALOCH-MD</h2>
        <p>Enter WhatsApp Number with Country Code <br> (Example: 923001234567)</p>
        <input type="number" id="number" placeholder="92xxxxxxxxxx">
        <button onclick="generateCode()">GENERATE PAIRING CODE</button>
        <div id="loading" class="loading">Please wait... Connecting to WhatsApp</div>
        <div id="result"></div>
    </div>

    <script>
        async function generateCode() {
            const num = document.getElementById('number').value;
            const resDiv = document.getElementById('result');
            const loader = document.getElementById('loading');
            
            if(!num) return alert("Please enter a number!");

            resDiv.style.display = "none";
            loader.style.display = "block";

            try {
                const response = await fetch('/pairing?code=' + num);
                const data = await response.json();
                loader.style.display = "none";
                
                if(data.code) {
                    resDiv.style.display = "block";
                    resDiv.innerText = data.code;
                } else {
                    alert("Error: " + (data.error || "Something went wrong"));
                }
            } catch (e) {
                loader.style.display = "none";
                alert("Server Error! Check if Koyeb is running.");
            }
        }
    </script>
</body>
</html>
    `);
});

app.get('/pairing', async (req, res) => {
    let number = req.query.code;
    number = number ? number.replace(/[^0-9]/g, '') : '';
    if (!number) return res.status(400).json({ error: "Invalid Number" });

    async function start() {
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: ["Ubuntu", "Chrome", "20.0.04"]
        });

        sock.ev.on('creds.update', saveCreds);

        if (!sock.authState.creds.registered) {
            await delay(4000); // 4 seconds delay for stability
            try {
                let code = await sock.requestPairingCode(number);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                res.json({ code: code });
            } catch (err) {
                res.status(500).json({ error: "Connection Refused by WhatsApp" });
            }
        }
    }
    start();
});

app.listen(PORT, () => { console.log('Server started on port ' + PORT); });
