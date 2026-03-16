const ngrok = require('ngrok');
const fs = require('fs');
const path = require('path');

(async function() {
  // ensure ngrok yml config exists to avoid ENOENT issue in some versions
  const ngrokConfigDir = path.join(process.env.LOCALAPPDATA || process.env.APPDATA || '', 'ngrok');
  const ngrokConfigFile = path.join(ngrokConfigDir, 'ngrok.yml');
  try {
    if (!fs.existsSync(ngrokConfigDir)) {
      fs.mkdirSync(ngrokConfigDir, { recursive: true });
    }
    if (!fs.existsSync(ngrokConfigFile)) {
      fs.writeFileSync(ngrokConfigFile, '');
    }
  } catch (err) {
    console.warn('Could not create ngrok config file:', err.message);
  }

  try {
    const url = await ngrok.connect({
      addr: process.env.PORT || 3000,
      authtoken: process.env.NGROK_AUTHTOKEN,
      proto: 'http',
      name: 'massage-ai-bot-tunnel'
    });
    console.log('ngrok tunnel:', url);
    console.log('Webhook URL (POST):', `${url}/webhook`);
  } catch (err) {
    console.error('ngrok failed', err);
    process.exit(1);
  }
})();
