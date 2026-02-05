import express from 'express';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Store active pairing sessions
const sessions = new Map();

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate pairing code
app.post('/code', async (req, res) => {
    const { number } = req.body;
    
    if (!number) {
        return res.json({ error: 'Please provide phone number' });
    }
    
    // Clean phone number
    const phoneNumber = number.replace(/[^0-9]/g, '');
    
    if (phoneNumber.length < 10) {
        return res.json({ error: 'Invalid phone number' });
    }
    
    try {
        const sessionId = Date.now().toString();
        const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${sessionId}`);
        const { version } = await fetchLatestBaileysVersion();
        
        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: state,
            browser: ['YOUSAF-BALOCH-MD', 'Chrome', '1.0.0']
        });
        
        // Request pairing code
        if (!sock.authState.creds.registered) {
            const code = await sock.requestPairingCode(phoneNumber);
            
            // Format code as XXXX-XXXX
            const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
            
            sessions.set(sessionId, { sock, phoneNumber });
            
            // Listen for connection
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;
                
                if (connection === 'open') {
                    const sessionData = JSON.stringify(state.creds, null, 2);
                    sessions.delete(sessionId);
                    
                    // Send session data
                    res.json({
                        success: true,
                        code: formattedCode,
                        sessionId: sessionData
                    });
                }
                
                if (connection === 'close') {
                    sessions.delete(sessionId);
                }
            });
            
            sock.ev.on('creds.update', saveCreds);
            
            // Send code immediately
            return res.json({
                success: true,
                code: formattedCode,
                message: 'Enter this code in WhatsApp > Linked Devices'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.json({
            error: 'Failed to generate code. Please try again.'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Pairing Code Server Running on Port ${PORT}`);
    console.log(`🌐 Access: http://localhost:${PORT}`);
});

export default app;
