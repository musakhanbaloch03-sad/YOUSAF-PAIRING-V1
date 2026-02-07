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
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8000;

// Pairing Endpoint
app.get('/pairing', async (req, res) => {
    let code = req.query.code; // Phone number from frontend
    let number = code ? code.replace(/[^0-9]/g, '') : '';

    if (!number) {
        return res.status(400).json({ error: "Please provide a valid phone number." });
    }

    async function getPairingCode() {
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        
        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: ["Chrome (Linux)", "", ""]
        });

        if (!sock.authState.creds.registered) {
            // WhatsApp server connection ka thora wait karein
            await delay(2000); 
            
            try {
                // Requesting the pairing code
                let pairingCode = await sock.requestPairingCode(number);
                pairingCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode;
                
                res.json({ code: pairingCode });
            } catch (error) {
                console.error("Pairing Error:", error);
                res.status(500).json({ error: "Failed to generate pairing code. Try again." });
            }
        }
    }

    getPairingCode();
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ YOUSAF-BALOCH-MD Server Running on Port: ${PORT}`);
});
