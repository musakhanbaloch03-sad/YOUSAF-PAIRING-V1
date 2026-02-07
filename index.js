/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     YOUSAF-BALOCH-MD WhatsApp Bot      ┃
┃   Premium Multi-Device Bot with 280+   ┃
┃              Commands                  ┃
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
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';
import figlet from 'figlet';
import readline from 'readline';
import express from 'express'; // FIX: Professional Web Support
import http from 'http';      // FIX: Web Server Integration

const { 
    DisconnectReason, 
    useMultiFileAuthState, 
    MessageRetryMap, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    jidNormalizedUser, 
    PHONENUMBER_MCC, 
    makeInMemoryStore 
} = await import('@whiskeysockets/baileys');

const { CONNECTING } = ws;
const { chain } = lodash;

// Professional Web Server Setup
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

// Serve your professional HTML from 'public' folder
app.use(express.static('public'));

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

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

global.timestamp = {start: new Date};
const __dirname = global.__dirname(import.meta.url);

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.db = new Low(new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`));

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return;
  await global.db.read().catch(console.error);
  global.db.data = { users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {}, ...(global.db.data || {}) };
  global.db.chain = chain(global.db.data);
};
loadDatabase();

// --- PROFESSIONAL WEB API FOR PAIRING ---
app.get('/code', async (req, res) => {
    let num = req.query.number || req.query.code;
    if (!num) return res.status(400).json({ error: "Number missing" });
    try {
        if (!global.conn) return res.status(500).json({ error: "Bot initializing..." });
        let code = await global.conn.requestPairingCode(num);
        code = code?.match(/.{1,4}/g)?.join('-') || code;
        res.json({ code: code });
    } catch (err) {
        res.status(500).json({ error: "Connection failed" });
    }
});

// Display Banner
console.clear();
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.green(figlet.textSync('YOUSAF-BALOCH-MD', { font: 'Standard' })));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => { rl.question(text, (answer) => { rl.close(); resolve(answer); }); });
};

async function startBot() {
  const {state, saveCreds} = await useMultiFileAuthState('session');
  const {version} = await fetchLatestBaileysVersion();
  
  const connectionOptions = {
    version,
    logger: pino({level: 'silent'}),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})),
    },
    getMessage: async (key) => {
        let jid = jidNormalizedUser(key.remoteJid);
        let msg = await store.loadMessage(jid, key.id);
        return msg?.message || '';
    }
  };

  global.conn = makeWASocket(connectionOptions);
  store.bind(conn.ev);

  // Terminal logic remains for manual users
  if (!state.creds.registered) {
    console.log(chalk.yellow('🌐 Web Server is active. Access your site to pair.'));
  }

  conn.ev.on('connection.update', async (update) => {
    const {connection, lastDisconnect} = update;
    if (connection === 'open') {
      console.log(chalk.bold.greenBright('\n✅ YOUSAF-BALOCH-MD is Online!'));
    }
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error instanceof Boom) ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : true;
      if (shouldReconnect) startBot();
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // Start Server
  server.listen(PORT, () => {
    console.log(chalk.cyan(`🚀 Professional Server running on Port: ${PORT}`));
  });

  // Load Plugins logic...
  // (Yousuf, baqi plugin loading wala code jo aapne diya tha, wo yahan niche waise hi rahe ga)
}

startBot();
