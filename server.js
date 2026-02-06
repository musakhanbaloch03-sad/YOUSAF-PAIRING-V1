const express = require('express');
const app = express();
const { makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');

const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - Allow all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route - serve HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'YOUSAF-BALOCH-MD Pairing Server is running!',
        timestamp: new Date().toISOString() 
    });
});

// Pairing Code Generation - POST /code
app.post('/code', async (req, res) => {
    try {
        console.log('📱 Pairing code request received:', req.body);
        
        const { number } = req.body;
        
        // Validate phone number
        if (!number) {
            return res.status(400).json({
                error: 'Phone number is required',
                success: false
            });
        }

        // Clean phone number
        const phoneNumber = number.replace(/[^0-9]/g, '');
        
        if (phoneNumber.length < 10) {
            return res.status(400).json({
                error: 'Invalid phone number format',
                success: false
            });
        }

        console.log('🔄 Creating session for:', phoneNumber);

        // Create temporary session
        const sessionPath = `./sessions/session_${phoneNumber}_${Date.now()}`;
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        // Create WhatsApp socket
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: ['YOUSAF-BALOCH-MD', 'Chrome', '1.0.0'],
            defaultQueryTimeoutMs: undefined
        });

        // Handle credentials update
        sock.ev.on('creds.update', saveCreds);

        // Request pairing code
        if (!sock.authState.creds.registered) {
            console.log('🔐 Requesting pairing code...');
            
            await delay(1500);
            
            const code = await sock.requestPairingCode(phoneNumber);
            
            console.log('✅ Pairing code generated:', code);
            
            // Format code (XXXX-XXXX)
            const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
            
            // Close socket after 10 seconds
            setTimeout(() => {
                try {
                    sock.end(undefined);
                    console.log('🔌 Socket closed');
                } catch (e) {
                    console.log('Error closing socket:', e.message);
                }
            }, 10000);

            // Send success response with JSON
            return res.json({
                success: true,
                code: formattedCode,
                message: 'Pairing code generated successfully',
                phoneNumber: phoneNumber
            });
            
        } else {
            sock.end(undefined);
            return res.status(400).json({
                error: 'This number is already registered',
                success: false
            });
        }

    } catch (error) {
        console.error('❌ Error generating pairing code:', error);
        
        return res.status(500).json({
            error: 'Failed to generate pairing code',
            details: error.message,
            success: false
        });
    }
});

// QR Code endpoint (optional)
app.get('/qr', async (req, res) => {
    try {
        return res.json({
            success: false,
            error: 'QR code not implemented. Use pairing code method instead.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: {
            'POST /code': 'Generate pairing code',
            'GET /health': 'Health check',
            'GET /': 'Homepage'
        }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 YOUSAF-BALOCH-MD Pairing Server Started!');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 Available at: http://localhost:${PORT}`);
    console.log('✅ Ready to generate pairing codes!');
});
          
