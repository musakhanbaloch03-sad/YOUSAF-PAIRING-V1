/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     YOUSAF-BALOCH-MD Configuration     ┃
┃   Premium Multi-Device Bot Settings    ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/

import { watchFile, unwatchFile, existsSync, readFileSync } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';

/*============= OWNER INFORMATION =============*/
global.owner = [
  ['923710636110', 'Muhammad Yousaf Baloch', true],
  ['923710636110', 'Yousaf Tech', true]
];

global.mods = ['923710636110']; 
global.prems = ['923710636110'];

/*============= BOT INFORMATION =============*/
global.botName = 'YOUSAF-BALOCH-MD';
global.botVersion = '2.0.0';
global.packname = 'YOUSAF-BALOCH-MD';
global.author = 'Muhammad Yousaf Baloch';
global.sessionName = 'session'; // Default session folder name

// Bot Owner Details
global.nameowner = 'Muhammad Yousaf Baloch';
global.numberowner = '923710636110';

/*============= SOCIAL LINKS =============*/
global.github = 'https://github.com/musakhanbaloch03-sad';
global.youtube = 'https://www.youtube.com/@Yousaf_Baloch_Tech';
global.whatsappChannel = 'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j';
global.tiktok = 'https://tiktok.com/@loser_boy.110';

/*============= WEBSITE & API =============*/
global.website = 'https://github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD';
global.APIs = {
  nrtm: 'https://nurutomo.herokuapp.com',
  bg: 'http://bochil.ddns.net',
  xteam: 'https://api.xteam.xyz',
  zahir: 'https://zahirr-web.herokuapp.com',
  zeks: 'https://api.zeks.me',
  pencarikode: 'https://pencarikode.xyz',
  LeysCoder: 'https://leyscoders-api.herokuapp.com',
  violetics: 'https://violetics.pw'
};

global.APIKeys = {
  'https://api.xteam.xyz': 'HIRO',
  'https://zahirr-web.herokuapp.com': 'zahirgans',
  'https://api.zeks.me': 'apivinz',
  'https://pencarikode.xyz': 'pais',
  'https://leyscoders-api.herokuapp.com': 'MIMINGANZ',
  'https://violetics.pw': 'beta'
};

/*============= BOT SETTINGS =============*/
global.autoread = false; // Auto read messages
global.autorecording = false; // Auto recording status
global.autoTyping = false; // Auto typing status
global.autobio = false; // Auto bio status
global.autolevelup = true; // Auto level up
global.multiplier = 69; // XP multiplier

/*============= MESSAGES & REPLIES =============*/
global.wait = '⏳ *Please wait, YOUSAF-BALOCH-MD is processing...*';
global.done = '✅ *Success! Task completed.*';
global.error = '❌ *Internal Error occurred!*';
global.success = '✅ *Done!*';

global.message = {
  admin: '❌ This command is only for *Admins*!',
  botAdmin: '❌ Bot must be *Admin* to use this command!',
  owner: '❌ This command is only for *Owner*!',
  group: '❌ This command is only for *Groups*!',
  private: '❌ This command is only for *Private Chat*!',
  bot: '❌ This command is only for *Bot*!',
  wait: '⏳ *Please wait...*',
  error: '❌ *Error! Please try again.*',
  endLimit: '📵 Your daily limit has expired, the limit will be reset every 12 hours',
  premium: '❌ This is a *Premium* feature. Contact Muhammad Yousaf Baloch to become premium!',
};

/*============= GAME SETTINGS =============*/
global.gamewaktu = 60; // Game time limit (seconds)
global.limit = {
  free: 100,
  premium: 999,
  vip: 'Unlimited'
};

global.uang = {
  free: 10000,
  premium: 1000000,
  vip: 10000000
};

/*============= RPG SETTINGS =============*/
global.rpg = {
  emoticon(string) {
    string = string.toLowerCase();
    let emot = {
      exp: '✉️',
      money: '💵',
      potion: '🥤',
      diamond: '💎',
      common: '📦',
      uncommon: '🎁',
      mythic: '🗳️',
      legendary: '🗃️',
      pet: '🎁',
      trash: '🗑',
      armor: '🥼',
      sword: '⚔️',
      wood: '🪵',
      rock: '🪨',
      string: '🕸️',
      horse: '🐎',
      cat: '🐈',
      dog: '🐕',
      fox: '🦊',
      petFood: '🍖',
      iron: '⛓️',
      gold: '👑',
      emerald: '💚'
    };
    let results = Object.keys(emot).map(v => [v, new RegExp(v, 'gi')]).filter(v => v[1].test(string));
    if (!results.length) return '';
    else return emot[results[0][0]];
  }
};

/*============= TIME & DATE SETTINGS =============*/
global.wib = 'Asia/Karachi'; // Pakistan Time Zone
global.wktuwib = moment.tz('Asia/Karachi').format('HH:mm:ss');

/*============= IMAGES & MEDIA =============*/
// Media Files checking system to prevent crashes
let thumbPath = './media/yousaf.jpg';
global.thumb = existsSync(thumbPath) ? readFileSync(thumbPath) : 'https://github.com/musakhanbaloch03-sad.png';
global.imagebot = global.thumb;
global.giflogo = global.thumb;

/*============= DATABASE =============*/
global.mongodb = process.env.MONGODB_URI || ''; // MongoDB URI from env

/*============= OTHER SETTINGS =============*/
global.fla = 'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=';

// Max upload size
global.maxUploadSize = 100; // MB

// Temporary folder
global.tmpdir = './tmp';

/*============= DEVELOPMENT SETTINGS =============*/
global.development = false; // Enable development mode

/*============= LOGGER & UPDATE =============*/
let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright("Update 'config.js' detected. Reloading..."));
  import(`${file}?update=${Date.now()}`);
});
