/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     YOUSAF-BALOCH-MD WhatsApp Bot      ┃
┃   Premium Multi-Device Bot with 280+   ┃
┃              Commands                  ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

👨‍💻 Developer: Muhammad Yousaf Baloch
📞 Contact: +923710636110
🌐 GitHub: https://github.com/musakhanbaloch03-sad
📺 YouTube: https://www.youtube.com/@Yousaf_Baloch_Tech
📢 WhatsApp: https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
🎵 TikTok: https://tiktok.com/@loser_boy.110

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
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

// Initialize Store
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

// Display Banner
console.clear();
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.green(figlet.textSync('YOUSAF-BALOCH-MD', {
  font: 'Standard',
  horizontalLayout: 'default',
  verticalLayout: 'default'
})));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
console.log(chalk.yellow('🛡️  Premium Multi-Device WhatsApp Bot'));
console.log(chalk.yellow('📊  280+ Premium Commands Available'));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
console.log(chalk.green('👨‍💻 Developer: Muhammad Yousaf Baloch'));
console.log(chalk.green('📞 Contact: +923710636110'));
console.log(chalk.green('🌐 GitHub: https://github.com/musakhanbaloch03-sad'));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
console.log(chalk.magenta('📺 YouTube: https://www.youtube.com/@Yousaf_Baloch_Tech'));
console.log(chalk.magenta('📢 WhatsApp: https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j'));
console.log(chalk.magenta('🎵 TikTok: https://tiktok.com/@loser_boy.110'));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
console.log(chalk.yellow('⏳ Starting bot...\n'));

// Function to ask for connection method
const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

async function startBot() {
  const {state, saveCreds} = await useMultiFileAuthState(global.sessionName || 'session');
  const {version, isLatest} = await fetchLatestBaileysVersion();
  
  console.log(chalk.green(`✅ Using Baileys version: ${version}`));
  console.log(chalk.green(`✅ Latest version: ${isLatest ? 'Yes' : 'No'}\n`));

  // Check if already logged in
  let useQR = false;
  let usePairingCode = false;

  if (!state.creds.registered) {
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.yellow('📱 Choose your connection method:'));
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    console.log(chalk.green('1️⃣  Pairing Code (Recommended)'));
    console.log(chalk.green('2️⃣  QR Code\n'));
    
    const choice = await question(chalk.bold.cyan('Enter your choice (1 or 2): '));
    
    if (choice === '1') {
      usePairingCode = true;
      console.log(chalk.green('\n✅ Pairing Code method selected\n'));
    } else {
      useQR = true;
      console.log(chalk.green('\n✅ QR Code method selected\n'));
    }
  }
  
  const connectionOptions = {
    version,
    logger: pino({level: 'silent'}),
    printQRInTerminal: useQR,
    browser: ['YOUSAF-BALOCH-MD', 'Chrome', '1.0.0'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})),
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      let jid = jidNormalizedUser(key.remoteJid);
      let msg = await store.loadMessage(jid, key.id);
      return msg?.message || '';
    },
    msgRetryCounterMap: MessageRetryMap,
    defaultQueryTimeoutMs: undefined,
  };

  global.conn = makeWASocket(connectionOptions);
  conn.isInit = false;

  // Bind store to connection
  store.bind(conn.ev);

  // Handle Pairing Code
  if (usePairingCode && !conn.authState.creds.registered) {
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.yellow('📱 Enter your WhatsApp number'));
    console.log(chalk.gray('Format: Country code + number (e.g., 923710636110)'));
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    
    let phoneNumber = await question(chalk.bold.cyan('Phone Number: '));
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (!phoneNumber) {
      console.log(chalk.red('❌ Invalid phone number!\n'));
      process.exit(0);
    }

    console.log(chalk.yellow('\n⏳ Generating pairing code...\n'));

    setTimeout(async () => {
      try {
        let code = await conn.requestPairingCode(phoneNumber);
        code = code?.match(/.{1,4}/g)?.join('-') || code;
        
        console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.bold.green(`\n🔐 YOUR PAIRING CODE: ${code}\n`));
        console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
        console.log(chalk.yellow('⏰ Enter this code in WhatsApp within 60 seconds!'));
        console.log(chalk.gray('   WhatsApp > Linked Devices > Link a Device > Link with Phone Number\n'));
      } catch (error) {
        console.log(chalk.red('❌ Error generating pairing code:'), error);
      }
    }, 3000);
  }

  if (!opts['test']) {
    if (global.db) {
      setInterval(async () => {
        if (global.db.data) await global.db.write();
      }, 30 * 1000);
    }
  }

  conn.ev.on('connection.update', async (update) => {
    const {connection, lastDisconnect, isNewLogin} = update;
    
    if (isNewLogin) conn.isInit = true;
    
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
    
    if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
      console.log(chalk.yellow('⚠️  Connection closed, reconnecting...'));
      // Reload logic normally goes here, calling startBot again or a reload function
      startBot(); 
    }
    
    if (connection === 'open') {
      console.log(chalk.bold.greenBright('\n✅ Bot Connected Successfully!'));
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.green('🎉 YOUSAF-BALOCH-MD is now online!'));
      console.log(chalk.green('📱 Connected Number: ' + conn.user.id.split(':')[0]));
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    }
    
    if (connection === 'close') {
      console.log(chalk.bold.red('❌ Connection closed!'));
      console.log(chalk.yellow('⏳ Attempting to reconnect...\n'));
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // Load plugins
  global.plugins = {};
  async function loadPlugins() {
    const pluginFolder = path.join(__dirname, './plugins');
    if (!existsSync(pluginFolder)) rmSync(pluginFolder, { recursive: true, force: true });
    if (!existsSync(pluginFolder)) readdirSync(path.join(__dirname, '.'), {withFileTypes: true}).filter(dirent => dirent.isDirectory() && dirent.name === 'plugins').length === 0 ? path.mkdirSync(pluginFolder) : null;
    
    const pluginFiles = readdirSync(pluginFolder).filter(file => file.endsWith('.js'));
    
    console.log(chalk.cyan(`📦 Loading ${pluginFiles.length} plugins...\n`));
    
    for (const file of pluginFiles) {
      try {
        const filePath = pathToFileURL(path.join(pluginFolder, file)).href;
        const plugin = await import(filePath);
        global.plugins[file] = plugin.default || plugin;
        console.log(chalk.green(`✅ Loaded: ${file}`));
      } catch (e) {
        console.log(chalk.red(`❌ Error loading ${file}:`), e);
        delete global.plugins[file];
      }
    }
    
    console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.green(`✅ Successfully loaded ${Object.keys(global.plugins).length} plugins`));
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  }
  
  await loadPlugins();

  return true;
}

startBot();

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
});
        
