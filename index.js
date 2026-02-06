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

// Sessions folder create karein
if (!fs.existsSync('./sessions')) {
    fs.mkdirSync('./sessions');
}

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check route (Koyeb ke liye zaruri)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Pairing code route
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
        const id = `session_${Date.now()}`;
        const sessionPath = `./sessions/${id}`;
        
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
            
            res.json({ 
                success: true, 
                code: formattedCode 
            });

            sock.ev.on('creds.update', saveCreds);
            
            sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect } = update;
                
                if (connection === 'open') {
                    console.log('Connection successful for:', phoneNumber);
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
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                    
                    if (!shouldReconnect) {
                        try {
                            if (fs.existsSync(sessionPath)) {
                                fs.rmSync(sessionPath, { recursive: true, force: true });
                            }
                        } catch (err) {
                            console.error('Cleanup error:', err);
                        }
                    }
                }
            });
        } else {
            res.json({ error: 'Number already registered' });
            sock.end();
        }
    } catch (error) {
        console.error('Pairing error:', error);
        res.json({ error: 'Failed to generate pairing code. Please try again.' });
    }
});

// Session cleanup endpoint (optional)
app.delete('/cleanup', (req, res) => {
    try {
        const sessions = fs.readdirSync('./sessions');
        sessions.forEach(session => {
            const sessionPath = `./sessions/${session}`;
            fs.rmSync(sessionPath, { recursive: true, force: true });
        });
        res.json({ success: true, message: 'All sessions cleared' });
    } catch (error) {
        res.json({ error: 'Cleanup failed' });
    }
});

// Server start
app.listen(PORT, () => {
    console.log(`✅ YOUSAF-BALOCH-MD Pairing Server`);
    console.log(`🌐 Port: ${PORT}`);
    console.log(`📱 Ready to generate pairing codes`);
});
