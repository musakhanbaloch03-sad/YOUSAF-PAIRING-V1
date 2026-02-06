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

app.use(express.static('public'));
app.use(express.json());

if (!fs.existsSync('./sessions')) {
    fs.mkdirSync('./sessions');
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/code', async (req, res) => {
    const { number } = req.body;
    
    if (!number) {
        return res.json({ error: 'Number required' });
    }

    const phoneNumber = number.replace(/[^0-9]/g, '');
    
    if (phoneNumber.length < 10) {
        return res.json({ error: 'Invalid number' });
    }

    try {
        const id = `session_${Date.now()}`;
        const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${id}`);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
            },
            browser: ['YOUSAF-BALOCH-MD', 'Chrome', '1.0.0']
        });

        if (!sock.authState.creds.registered) {
            const code = await sock.requestPairingCode(phoneNumber);
            const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
            
            res.json({ 
                success: true, 
                code: formattedCode 
            });

            sock.ev.on('creds.update', saveCreds);
            
            sock.ev.on('connection.update', (update) => {
                const { connection } = update;
                if (connection === 'open') {
                    setTimeout(() => {
                        try {
                            fs.rmSync(`./sessions/${id}`, { recursive: true });
                        } catch {}
                        sock.end();
                    }, 5000);
                }
            });
        } else {
            res.json({ error: 'Already registered' });
        }
    } catch (error) {
        console.error(error);
        res.json({ error: 'Failed to generate code' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
