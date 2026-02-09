import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export async function generateSessionId(sessionPath) {
  try {
    // Read all session files
    const files = readdirSync(sessionPath);
    const sessionData = {};
    
    // Collect all session files
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = join(sessionPath, file);
        const content = readFileSync(filePath, 'utf-8');
        sessionData[file] = JSON.parse(content);
      }
    }
    
    // Convert entire session to base64
    const sessionString = JSON.stringify(sessionData, null, 2);
    const sessionId = Buffer.from(sessionString).toString('base64');
    
    return sessionId;
  } catch (error) {
    console.error('Session ID generation error:', error);
    return null;
  }
}

export function formatSessionMessage(sessionId, userNumber) {
  const message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *YOUSAF-BALOCH-MD CONNECTED*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Your bot is now connected successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *OWNER INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Name: *Muhammad Yousaf Baloch*
• Number: *+923710636110*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 *SOCIAL MEDIA LINKS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• GitHub: github.com/musakhanbaloch03-sad
• YouTube: youtube.com/@Yousaf_Baloch_Tech
• TikTok: tiktok.com/@loser_boy.110
• WhatsApp: whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 *YOUR SESSION ID*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Copy the code below and use it when deploying:

\`\`\`${sessionId}\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 *DEPLOYMENT PLATFORMS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You can deploy on ANY platform:
• Heroku
• Koyeb
• Railway
• Render
• Replit
• VPS/Server

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 *HOW TO DEPLOY*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD
2. Click "Fork" to copy the repository
3. Choose your deployment platform
4. Paste this SESSION_ID when asked
5. Configure your settings
6. Deploy and enjoy! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *IMPORTANT*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Keep this SESSION_ID safe
• Don't share with anyone
• Use environment variable: SESSION_ID
• If lost, reconnect to get new one

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need help? Contact: +923710636110

© 2026 YOUSAF-BALOCH-MD`;

  return message;
}
