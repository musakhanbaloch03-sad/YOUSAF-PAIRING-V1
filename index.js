/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     YOUSAF-BALOCH-MD WhatsApp Bot      ┃
┃        Ultra Premium Edition           ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/

import './config.js';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import { readdirSync } from 'fs';
import yargs from 'yargs';
import lodash from 'lodash';
import chalk from 'chalk';
import Pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import figlet from 'figlet';
import express from 'express';

const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys');

const { chain } = lodash;
const PORT = process.env.PORT || 8000;

protoType();
serialize();

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({...query, ...(apikeyqueryname ? {[apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]} : {})})) : '');

global.timestamp = {start: new Date};
const __dirname = global.__dirname(import.meta.url);

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-.@').replace(/[|\\{}()[\]^$+*+?.\-\^]/g, '\\$&') + ']');

global.db = new Low(new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`));

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function() {
      if (!global.db.READ) {
        clearInterval(this);
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
      }
    }, 1 * 1000));
  }
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = chain(global.db.data);
};
loadDatabase();

console.clear();
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.green(figlet.textSync('YOUSAF-BALOCH-MD', { font: 'Standard' })));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

const app = express();
let currentQR = null;
let connectionStatus = 'waiting';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOUSAF-BALOCH-MD - Premium WhatsApp Bot</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Poppins:wght@300;400;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #00f2ff;
            --secondary: #ff0080;
            --accent: #ffd700;
            --dark: #0a0a0a;
            --purple: #8b5cf6;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(-45deg, #000000, #0a0033, #1a0033, #330066, #000033);
            background-size: 400% 400%;
            animation: gradientShift 20s ease infinite;
            min-height: 100vh;
            overflow-x: hidden;
            color: white;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* Animated Particles */
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
        }
        
        .particle {
            position: absolute;
            background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
            border-radius: 50%;
            animation: float 20s infinite;
            opacity: 0.3;
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0) translateX(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 0.3;
            }
            90% {
                opacity: 0.3;
            }
            100% {
                transform: translateY(-100vh) translateX(100px) rotate(360deg);
                opacity: 0;
            }
        }
        
        /* Main Container */
        .container {
            position: relative;
            z-index: 1;
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        /* Header with Time */
        .header-time {
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(20px);
            border: 2px solid rgba(0, 242, 255, 0.3);
            border-radius: 25px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 0 40px rgba(0, 242, 255, 0.2);
            animation: slideDown 0.8s ease;
        }
        
        @keyframes slideDown {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .time-display {
            font-family: 'Orbitron', monospace;
            font-size: 2.5em;
            font-weight: 900;
            text-align: center;
            background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent));
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientFlow 3s ease infinite;
            margin-bottom: 10px;
            text-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
        }
        
        @keyframes gradientFlow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .date-display {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.1em;
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
        }
        
        /* Main Card */
        .main-card {
            background: rgba(10, 10, 10, 0.8);
            backdrop-filter: blur(30px);
            border: 2px solid rgba(139, 92, 246, 0.4);
            border-radius: 30px;
            padding: 40px 30px;
            box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
            animation: scaleUp 0.8s ease;
            position: relative;
            overflow: hidden;
        }
        
        .main-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                45deg,
                transparent,
                rgba(139, 92, 246, 0.1),
                transparent
            );
            transform: rotate(45deg);
            animation: shimmer 3s linear infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        @keyframes scaleUp {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        /* Logo/Title */
        .bot-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 2.2em;
            font-weight: 900;
            text-align: center;
            background: linear-gradient(135deg, var(--primary), var(--purple), var(--secondary));
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: rainbowShift 5s ease infinite;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        @keyframes rainbowShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .bot-subtitle {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.9em;
            text-align: center;
            color: var(--accent);
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
        }
        
        /* Developer Info */
        .dev-info {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
        }
        
        .dev-name {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.3em;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 5px;
        }
        
        .dev-contact {
            font-size: 0.95em;
            color: rgba(255, 255, 255, 0.7);
        }
        
        /* Status */
        .status-badge {
            background: rgba(255, 215, 0, 0.1);
            border: 2px solid var(--accent);
            border-radius: 50px;
            padding: 12px 25px;
            text-align: center;
            margin-bottom: 30px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 600;
            animation: pulse 2s ease infinite;
            position: relative;
            z-index: 1;
        }
        
        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
            50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
        }
        
        .status-text {
            color: var(--accent);
        }
        
        .status.connected {
            color: #00ff00;
        }
        
        /* Buttons Container */
        .buttons-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
        }
        
        .method-btn {
            background: linear-gradient(135deg, rgba(0, 242, 255, 0.2), rgba(139, 92, 246, 0.2));
            border: 2px solid var(--primary);
            border-radius: 20px;
            padding: 25px 15px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            position: relative;
            overflow: hidden;
        }
        
        .method-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, rgba(0, 242, 255, 0.3), transparent);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
            border-radius: 50%;
        }
        
        .method-btn:hover::before {
            width: 300px;
            height: 300px;
        }
        
        .method-btn:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 15px 40px rgba(0, 242, 255, 0.4);
            border-color: var(--secondary);
        }
        
        .method-icon {
            font-size: 3em;
            margin-bottom: 10px;
            filter: drop-shadow(0 0 10px currentColor);
        }
        
        .method-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.1em;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .method-desc {
            font-size: 0.85em;
            color: rgba(255, 255, 255, 0.6);
        }
        
        /* Modal Sections */
        .modal-section {
            display: none;
            animation: modalFadeIn 0.5s ease;
            position: relative;
            z-index: 1;
        }
        
        .modal-section.active {
            display: block;
        }
        
        @keyframes modalFadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .modal-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.5em;
            text-align: center;
            color: var(--primary);
            margin-bottom: 20px;
        }
        
        /* QR Code Section */
        .qr-container {
            background: white;
            border-radius: 20px;
            padding: 20px;
            margin: 20px 0;
            display: flex;
            justify-content: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        
        #qrcode {
            display: inline-block;
        }
        
        .qr-timer {
            font-family: 'Orbitron', monospace;
            font-size: 1.2em;
            color: var(--accent);
            text-align: center;
            margin-top: 15px;
        }
        
        /* Input Section */
        .input-wrapper {
            margin: 20px 0;
        }
        
        input {
            width: 100%;
            padding: 18px 20px;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid rgba(0, 242, 255, 0.3);
            border-radius: 15px;
            color: white;
            font-size: 1.1em;
            font-family: 'Space Grotesk', sans-serif;
            transition: all 0.3s;
            margin-bottom: 15px;
        }
        
        input::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }
        
        input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 25px rgba(0, 242, 255, 0.3);
            background: rgba(0, 0, 0, 0.7);
        }
        
        .generate-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, var(--primary), var(--purple));
            border: none;
            border-radius: 15px;
            color: white;
            font-size: 1.1em;
            font-weight: 700;
            font-family: 'Orbitron', sans-serif;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }
        
        .generate-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(139, 92, 246, 0.5);
        }
        
        .generate-btn:active {
            transform: translateY(-1px);
        }
        
        /* Code Display */
        .code-display {
            font-family: 'Orbitron', monospace;
            font-size: 2.5em;
            font-weight: 900;
            letter-spacing: 15px;
            color: var(--primary);
            text-align: center;
            padding: 30px;
            background: rgba(0, 0, 0, 0.6);
            border: 3px solid var(--primary);
            border-radius: 20px;
            margin: 20px 0;
            text-shadow: 0 0 30px var(--primary);
            animation: codeGlow 2s ease infinite;
        }
        
        @keyframes codeGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 242, 255, 0.5); }
            50% { box-shadow: 0 0 40px rgba(0, 242, 255, 0.8); }
        }
        
        .info-text {
            text-align: center;
            color: rgba(255, 255, 255, 0.7);
            margin: 15px 0;
            font-size: 0.95em;
        }
        
        /* Social Links */
        .social-links {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 30px;
            position: relative;
            z-index: 1;
        }
        
        .social-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            color: white;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
            font-size: 0.9em;
        }
        
        .social-btn:hover {
            background: rgba(255, 0, 128, 0.2);
            border-color: var(--secondary);
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(255, 0, 128, 0.3);
        }
        
        .social-icon {
            font-size: 1.3em;
        }
        
        /* Footer */
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.9em;
            position: relative;
            z-index: 1;
        }
        
        /* Loading Spinner */
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(0, 242, 255, 0.3);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Mobile Responsive */
        @media (max-width: 600px) {
            .time-display { font-size: 2em; }
            .bot-title { font-size: 1.8em; }
            .method-icon { font-size: 2.5em; }
            .code-display {
                font-size: 1.8em;
                letter-spacing: 8px;
            }
        }
    </style>
</head>
<body>
    <!-- Animated Particles -->
    <div class="particles" id="particles"></div>

    <div class="container">
        <!-- Header with Time -->
        <div class="header-time">
            <div class="time-display" id="time">00:00:00</div>
            <div class="date-display" id="date">Loading...</div>
        </div>

        <!-- Main Card -->
        <div class="main-card">
            <h1 class="bot-title">⚡ YOUSAF-BALOCH-MD ⚡</h1>
            <div class="bot-subtitle">ULTRA PREMIUM EDITION</div>
            
            <div class="dev-info">
                <div class="dev-name">MUHAMMAD YOUSAF BALOCH</div>
                <div class="dev-contact">📞 +923710636110</div>
            </div>
            
            <div class="status-badge">
                <div class="status-text">
                    Status: <span id="status">⏳ Waiting...</span>
                </div>
            
</div>
            </div>
            
            <!-- Method Selection Buttons -->
            <div class="buttons-grid">
                <div class="method-btn" onclick="showQR()">
                    <div class="method-icon">📱</div>
                    <div class="method-title">QR CODE</div>
                    <div class="method-desc">Scan & Connect</div>
                </div>
                
                <div class="method-btn" onclick="showPairing()">
                    <div class="method-icon">🔐</div>
                    <div class="method-title">PAIRING</div>
                    <div class="method-desc">8-Digit Code</div>
                </div>
            </div>
            
            <!-- QR Code Section -->
            <div id="qr-section" class="modal-section">
                <div class="modal-title">📱 SCAN QR CODE</div>
                <div class="info-text">WhatsApp → Linked Devices → Link a Device</div>
                <div class="qr-container" id="qrcode"></div>
                <div class="qr-timer" id="qr-timer"></div>
            </div>
            
            <!-- Pairing Code Section -->
            <div id="pairing-section" class="modal-section">
                <div class="modal-title">🔐 PAIRING CODE</div>
                <div class="input-wrapper">
                    <input 
                        type="tel" 
                        id="phone" 
                        placeholder="923710636110" 
                        maxlength="15"
                        autocomplete="tel"
                    >
                    <button class="generate-btn" onclick="generateCode()">
                        🚀 GENERATE CODE
                    </button>
                </div>
                <div id="code-result"></div>
            </div>
            
            <!-- Social Links -->
            <div class="social-links">
                <a href="https://github.com/musakhanbaloch03-sad" target="_blank" class="social-btn">
                    <span class="social-icon">💻</span>
                    <span>GitHub</span>
                </a>
                <a href="https://www.youtube.com/@Yousaf_Baloch_Tech" target="_blank" class="social-btn">
                    <span class="social-icon">📺</span>
                    <span>YouTube</span>
                </a>
                <a href="https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j" target="_blank" class="social-btn">
                    <span class="social-icon">📢</span>
                    <span>Channel</span>
                </a>
                <a href="https://tiktok.com/@loser_boy.110" target="_blank" class="social-btn">
                    <span class="social-icon">🎵</span>
                    <span>TikTok</span>
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            © 2026 YOUSAF-BALOCH-MD | All Rights Reserved
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <script>
        // Create floating particles
        function createParticles() {
            const particles = document.getElementById('particles');
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                const size = Math.random() * 5 + 2;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 20 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
                particles.appendChild(particle);
            }
        }
        createParticles();

        // Update Time & Date
        function updateDateTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            document.getElementById('time').textContent = \`\${hours}:\${minutes}:\${seconds}\`;
            
            const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const day = days[now.getDay()];
            const month = months[now.getMonth()];
            const date = now.getDate();
            const year = now.getFullYear();
            
            document.getElementById('date').textContent = \`\${day}, \${month} \${date}, \${year}\`;
        }
        setInterval(updateDateTime, 1000);
        updateDateTime();

        // Status Check
        function updateStatus() {
            fetch('/status')
                .then(r => r.json())
                .then(data => {
                    const statusEl = document.getElementById('status');
                    if (data.connected) {
                        statusEl.className = 'status connected';
                        statusEl.innerHTML = '✅ CONNECTED: ' + data.number;
                    } else {
                        statusEl.className = 'status';
                        statusEl.textContent = '⏳ Waiting...';
                    }
                })
                .catch(() => {});
        }
        setInterval(updateStatus, 3000);

        // Show QR
        function showQR() {
            document.getElementById('qr-section').classList.add('active');
            document.getElementById('pairing-section').classList.remove('active');
            loadQR();
        }

        // Show Pairing
        function showPairing() {
            document.getElementById('pairing-section').classList.add('active');
            document.getElementById('qr-section').classList.remove('active');
        }

        // Load QR
        function loadQR() {
            fetch('/qr')
                .then(r => r.json())
                .then(data => {
                    if (data.qr) {
                        const qrDiv = document.getElementById('qrcode');
                        qrDiv.innerHTML = '';
                        new QRCode(qrDiv, {
                            text: data.qr,
                            width: 256,
                            height: 256,
                            colorDark: '#000000',
                            colorLight: '#ffffff'
                        });
                        startQRTimer();
                    }
                });
        }

        // QR Timer
        let timerInterval;
        function startQRTimer() {
            let seconds = 60;
            const timerEl = document.getElementById('qr-timer');
            clearInterval(timerInterval);
            
            timerInterval = setInterval(() => {
                seconds--;
                timerEl.textContent = \`⏰ EXPIRES IN \${seconds}S\`;
                
                if (seconds <= 0) {
                    clearInterval(timerInterval);
                    timerEl.textContent = '⚠️ EXPIRED! REFRESH PAGE';
                }
            }, 1000);
        }

        // Generate Pairing Code
        async function generateCode() {
            const phone = document.getElementById('phone').value.replace(/[^0-9]/g, '');
            const resultEl = document.getElementById('code-result');
            
            if (!phone || phone.length < 10) {
                resultEl.innerHTML = '<div class="info-text" style="color: #ff0080;">❌ INVALID NUMBER</div>';
                return;
            }
            
            resultEl.innerHTML = '<div class="info-text"><span class="spinner"></span> GENERATING...</div>';
            
            try {
                const response = await fetch('/pairing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone })
                });
                
                const data = await response.json();
                
                if (data.code) {
                    resultEl.innerHTML = \`
                        <div class="code-display">\${data.code}</div>
                        <div class="info-text">⏰ ENTER IN WHATSAPP WITHIN 60 SECONDS</div>
                        <div class="info-text">WhatsApp → Linked Devices → Link with Phone Number</div>
                    \`;
                } else {
                    resultEl.innerHTML = '<div class="info-text" style="color: #ff0080;">❌ ' + data.error + '</div>';
                }
            } catch (error) {
                resultEl.innerHTML = '<div class="info-text" style="color: #ff0080;">❌ ERROR OCCURRED</div>';
            }
        }

        // Allow Enter key for phone input
        document.getElementById('phone').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                generateCode();
            }
        });
    </script>
</body>
</html>
  `);
});

app.get('/status', (req, res) => {
  res.json({
    connected: connectionStatus === 'connected',
    number: global.conn?.user?.id?.split(':')[0] || null
  });
});

app.get('/qr', (req, res) => {
  res.json({ qr: currentQR });
});

app.post('/pairing', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.json({ error: 'Invalid phone number' });
    }
    const code = await global.conn.requestPairingCode(phone);
    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
    console.log(chalk.green(`\n🔐 Code: ${formattedCode} for ${phone}\n`));
    res.json({ code: formattedCode });
  } catch (error) {
    res.json({ error: 'Failed to generate' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(chalk.green(`\n✅ Server: http://localhost:${PORT}\n`));
});

async function startBot() {
  const {state, saveCreds} = await useMultiFileAuthState(global.sessionName);
  const {version} = await fetchLatestBaileysVersion();
  
  const connectionOptions = {
    version,
    logger: Pino({level: 'silent'}),
    printQRInTerminal: false,
    browser: ['YOUSAF-BALOCH-MD', 'Safari', '1.0.0'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, Pino({level: 'silent'})),
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      let jid = jidNormalizedUser(key.remoteJid);
      let msg = await store?.loadMessage(jid, key.id);
      return msg?.message || '';
    },
    msgRetryCounterMap: MessageRetryMap,
  };

  global.conn = makeWASocket(connectionOptions);

  if (global.db) {
    setInterval(async () => {
      if (global.db.data) await global.db.write();
    }, 30 * 1000);
  }

  conn.ev.on('connection.update', async (update) => {
    const {connection, lastDisconnect, qr} = update;
    
    if (qr) currentQR = qr;
    
    const code = lastDisconnect?.error?.output?.statusCode;
    
    if (code && code !== DisconnectReason.loggedOut && !conn?.ws.socket) {
      console.log(chalk.yellow('⚠️ Reconnecting...'));
      connectionStatus = 'reconnecting';
      setTimeout(() => startBot(), 3000);
    }
    
    if (connection === 'open') {
      connectionStatus = 'connected';
      console.log(chalk.green('\n✅ BOT CONNECTED!\n'));
    }
  });

  conn.ev.on('creds.update', saveCreds);

  global.plugins = {};
  const pluginFolder = path.join(__dirname, './plugins');
  if (existsSync(pluginFolder)) {
    const files = readdirSync(pluginFolder).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const plugin = await import(pathToFileURL(path.join(pluginFolder, file)).href);
        global.plugins[file] = plugin.default || plugin;
      } catch (e) {}
    }
  }
}

startBot();

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);
