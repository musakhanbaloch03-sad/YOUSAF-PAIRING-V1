/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     YOUSAF-BALOCH-MD WhatsApp Bot      ┃
┃        Web Pairing Server File         ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
👨‍💻 Developer: Muhammad Yousaf Baloch
© 2026 YOUSAF-BALOCH-MD - All Rights Reserved
*/

import './config.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import * as ws from 'ws';
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import lodash from 'lodash';
import chalk from 'chalk';
import pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import figlet from 'figlet';
import readline from 'readline';
import express from 'express'; // FIX: High-level web support
import http from 'http';      // FIX: Connection bridge

const { 
    DisconnectReason, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    makeInMemoryStore 
} = await import('@whiskeysockets/baileys');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000; // Koyeb port compatibility

// Aapki professional HTML file yahan se load hogi
app.use(express.static('public')); 

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

protoType();
serialize();

// Professional Path & Global Configs
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};

const __dirname = global.__dirname(import.meta.url);
global.db = new Low(new JSONFile('database.json'));

// --- ERROR FIX: PROFESSIONAL WEB API FOR PAIRING ---
app.get('/code', async (req, res) => {
    let num = req.query.number || req.query.code;
    if (!num) return res.status(400).json({ error: "Number is required" });
    
    try {
        if (!global.conn) return res.status(500).json({ error: "Server Starting..." });
        let code = await global.conn.requestPairingCode(num.replace(/[^0-9]/g, ''));
        code = code?.match(/.{1,4}/g)?.join('-') || code;
        res.json({ code: code }); // Design file ko code bhejna
    } catch (err) {
        console.log(chalk.red('Pairing Error: '), err);
        res.status(500).json({ error: "Failed to get code" });
    }
});

// Display Banner
console.clear();
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.green(figlet.textSync('YOUSAF-BALOCH-MD', { font: 'Standard' })));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

async function startBot() {
  const {state, saveCreds} = await useMultiFileAuthState('session');
  const {version} = await fetchLatestBaileysVersion();
  
  const connectionOptions = {
    version,
    logger: pino({level: 'silent'}),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"], // Secure browser
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})),
    }
  };

  global.conn = makeWASocket(connectionOptions);
  store.bind(conn.ev);

  conn.ev.on('creds.update', saveCreds);
  
  conn.ev.on('connection.update', async (update) => {
    const {connection, lastDisconnect} = update;
    if (connection === 'open') {
      console.log(chalk.bold.greenBright('\n✅ YOUSAF-BALOCH-MD WEB SYSTEM ONLINE!'));
    }
    if (connection === 'close') {
        startBot(); // Auto-restart on close
    }
  });

  // Start Web Server
  server.listen(PORT, () => {
    console.log(chalk.cyan(`🚀 Professional Web Interface running on Port: ${PORT}`));
  });
}

startBot();
