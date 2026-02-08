/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     YOUSAF-BALOCH-MD WhatsApp Bot      ┃
┃        Ultra Premium Edition           ┃
┃           FIXED VERSION                ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import yargs from 'yargs';
import chalk from 'chalk';
import Pino from 'pino';
import figlet from 'figlet';
import express from 'express';

// ✅ Fixed Import Logic for Baileys
const baileys = await import('@whiskeysockets/baileys');
const { 
    DisconnectReason, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    makeWASocket 
} = baileys.default || baileys;

const PORT = process.env.PORT || 8000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());

console.clear();
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.green(figlet.textSync('YOUSAF-BALOCH-MD', { font: 'Standard' })));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
console.log(chalk.yellow('🚀 Ultra Premium WhatsApp Bot - FIXED VERSION'));
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

const app = express();
let currentQR = null;
let connectionStatus = 'waiting';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🎨 Keeping Your Original UI Style, Logo and Colors Exactly
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
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
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.3; }
            90% { opacity: 0.3; }
            100% { transform: translateY(-100vh) translateX(100px) rotate(360deg); opacity: 0; }
        }
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
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
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
            background: linear-gradient(45deg, transparent, rgba(139, 92, 246, 0.1), transparent);
            transform: rotate(45deg);
            animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        @keyframes scaleUp {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
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
        .status-badge {
            display: inline-block;
            padding: 12px 30px;
            border-radius: 50px;
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            font-size: 1em;
            margin-bottom: 30px;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 128, 0, 0.2));
            border: 2px solid var(--accent);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            animation: pulse 2s ease infinite;
            position: relative;
            z-index: 1;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
            50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); }
        }
        .status.connected {
            background: linear-gradient(135deg, rgba(0, 255, 128, 0.2), rgba(0, 242, 255, 0.2));
            border-color: var(--primary);
            box-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
        }
        .method-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }
        .tab-btn {
            flex: 1;
            padding: 15px;
            border: 2px solid rgba(139, 92, 246, 0.5);
            background: rgba(139, 92, 246, 0.1);
            color: white;
            border-radius: 15px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 600;
            font-size: 1em;
            cursor: pointer;
            transition: all 0.3s;
        }
        .tab-btn:hover {
            background: rgba(139, 92, 246, 0.3);
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
        }
        .tab-btn.active {
            background: linear-gradient(135deg, var(--purple), var(--primary));
            border-color: var(--primary);
            box-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
        }
        .method-section {
            display: none;
            animation: fadeIn 0.5s ease;
            position: relative;
            z-index: 1;
        }
        .method-section.active {
            display: block;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .qr-container {
            background: white;
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 20px
            
