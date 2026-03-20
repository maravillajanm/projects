require('dotenv').config();
const express = require('express');
const { handleWebhookVerification } = require('./messenger');
const { handleMessage } = require('./bot');

const app = express();
app.use(express.json());

// Facebook webhook verification (GET)
app.get('/webhook', handleWebhookVerification);

// Receive messages from Messenger (POST)
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object !== 'page') {
    return res.sendStatus(404);
  }

  // Respond immediately to Facebook (must be within 20s)
  res.sendStatus(200);

  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      // Skip echo messages and non-text messages
      if (!event.message || event.message.is_echo) continue;
      if (!event.message.text) continue;

      const senderId = event.sender.id;
      const messageText = event.message.text;

      await handleMessage(senderId, messageText).catch((err) => {
        console.error(`Error handling message from ${senderId}:`, err.message);
      });
    }
  }
});

// Health check
app.get('/', (req, res) => res.send('ScamShield Bot is running.'));

// Privacy policy (required for Facebook App Review / going Live)
app.get('/privacy', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Privacy Policy - ScamShield</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #333; line-height: 1.6; }
        h1 { color: #1a1a1a; }
        h2 { color: #444; margin-top: 30px; }
      </style>
    </head>
    <body>
      <h1>Privacy Policy</h1>
      <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <h2>1. What We Collect</h2>
      <p>ScamShield collects only the following data submitted by users:</p>
      <ul>
        <li>Names or phone numbers reported as possible scammers</li>
        <li>The reporter's Facebook display name</li>
        <li>The date and time of the report</li>
      </ul>

      <h2>2. How We Use the Data</h2>
      <p>The data collected is used solely to warn community members about possible scammers. It is displayed when other users query the bot about a reported name or number.</p>

      <h2>3. Data Sharing</h2>
      <p>We do not sell, trade, or share any collected data with third parties. Data is stored securely in our database and is only accessible within the bot's functionality.</p>

      <h2>4. Disclaimer</h2>
      <p>All records in ScamShield are based on community reports and are not verified facts. This database is not an official legal document. Records should be used as a reference only, not as a final judgment.</p>

      <h2>5. Data Removal</h2>
      <p>If you believe a record about you is incorrect or you wish to have it removed, please contact the page administrator directly via Facebook Messenger.</p>

      <h2>6. Contact</h2>
      <p>For any privacy concerns, please message us through our Facebook Page.</p>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ScamShield Bot running on port ${PORT}`));
