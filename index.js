const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require('pino');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/pair', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Number required" });

    const { state, saveCreds } = await useMultiFileAuthState(`./temp/${num}`);
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["Yousaf-MD", "Chrome", "1.0.0"]
    });

    if (!sock.authState.creds.registered) {
        try {
            await delay(1500);
            let code = await sock.requestPairingCode(num);
            res.json({ code: code });
        } catch (e) {
            res.status(500).json({ error: "Server Busy" });
        }
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (s) => {
        if (s.connection === 'open') {
            await delay(5000);
            let session = fs.readFileSync(`./temp/${num}/creds.json`);
            await sock.sendMessage(sock.user.id, { text: "YOUSAF-MD~" + Buffer.from(session).toString('base64') });
        }
    });
});

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
