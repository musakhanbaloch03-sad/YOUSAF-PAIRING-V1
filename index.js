import express from 'express';
import pino from 'pino';
import { 
    makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore 
} from '@whiskeysockets/baileys';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;

app.get('/pairing', async (req, res) => {
    let number = req.query.code;
    number = number ? number.replace(/[^0-9]/g, '') : '';

    if (!number) {
        return res.status(400).json({ error: "Please provide a valid phone number." });
    }

    async function startPairing() {
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

        // Save credentials when updated
        sock.ev.on('creds.update', saveCreds);

        if (!sock.authState.creds.registered) {
            await delay(3000); // 3 seconds wait for stability
            try {
                let code = await sock.requestPairingCode(number);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                res.json({ code: code });
            } catch (err) {
                console.error("Pairing Error:", err);
                res.status(500).json({ error: "Service Unavailable. Try again later." });
            }
        }
    }

    startPairing();
});

app.listen(PORT, () => {
    console.log(`✅ YOUSAF-BALOCH-MD is live on Port: ${PORT}`);
});
