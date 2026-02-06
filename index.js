import express from 'express';
import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Create sessions directory
const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
}

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Pairing server is running' });
});

// Generate pairing code
app.post('/code', async (req, res) => {
    try {
        const { number } = req.body;
        
        if (!number) {
            return res.json({ error: 'Phone number is required' });
        }
        
        // Clean phone number
        const phoneNumber = number.replace(/[^0-9]/g, '');
        
        if (phoneNumber.length < 10) {
            return res.json({ error: 'Invalid phone number format' });
        }

        console.log('📱 Generating code for:', phoneNumber);
        
        // Create unique session
        const sessionId = `session_${Date.now()}`;
        const sessionPath = path.join(sessionsDir, sessionId);
        
        // Setup Baileys
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
            generateHighQualityLinkPreview: true
        });

        // Request pairing code
        if (!sock.authState.creds.registered) {
            setTimeout(async () => {
                try {
                    const code = await sock.requestPairingCode(phoneNumber);
                    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
                    
                    console.log('✅ Code generated:', formattedCode);
                    
                    // Clean up session after 5 minutes
                    setTimeout(() => {
                        try {
                            if (fs.existsSync(sessionPath)) {
                                fs.rmSync(sessionPath, { recursive: true, force: true });
                            }
                        } catch (err) {
                            console.error('Cleanup error:', err);
                        }
                    }, 300000);
                    
                } catch (err) {
                    console.error('Code generation error:', err);
                }
            }, 3000);
        }

        // Listen for connection
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open') {
                console.log('✅ Connected successfully');
                
                // Clean up
                setTimeout(() => {
                    sock.end();
                    if (fs.existsSync(sessionPath)) {
                        fs.rmSync(sessionPath, { recursive: true, force: true });
                    }
                }, 5000);
            }
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('❌ Connection closed. Reconnect:', shouldReconnect);
            }
        });

        sock.ev.on('creds.update', saveCreds);

        // Wait for code generation
        await new Promise(resolve => setTimeout(resolve, 5000));

        res.json({
            success: true,
            message: 'Code sent! Check your terminal/logs or WhatsApp.',
            note: 'If you dont receive code, try again with country code (e.g., 923710636110)'
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.json({
            error: 'Failed to generate code. Please try again.',
            details: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Access: http://localhost:${PORT}`);
});

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});
