const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const GRAPH_API_URL = 'https://graph.facebook.com/v19.0/me/messages';

function handleWebhookVerification(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully.');
    return res.status(200).send(challenge);
  }

  console.warn('Webhook verification failed.');
  return res.sendStatus(403);
}

async function sendMessage(recipientId, text) {
  // Messenger has a 2000 character limit per message; split if needed
  const chunks = splitMessage(text, 2000);

  for (const chunk of chunks) {
    try {
      await axios.post(
        GRAPH_API_URL,
        {
          recipient: { id: recipientId },
          message: { text: chunk },
        },
        {
          params: { access_token: PAGE_ACCESS_TOKEN },
        }
      );
    } catch (err) {
      console.error('Error sending message:', err.response?.data || err.message);
    }
  }
}

function splitMessage(text, maxLength) {
  if (text.length <= maxLength) return [text];

  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + maxLength));
    start += maxLength;
  }
  return chunks;
}

async function getUserName(psid) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${psid}`,
      {
        params: {
          fields: 'name',
          access_token: PAGE_ACCESS_TOKEN,
        },
      }
    );
    return response.data.name || `User ${psid}`;
  } catch (err) {
    console.error('Error fetching user name:', err.response?.data || err.message);
    return `User ${psid}`;
  }
}

module.exports = { handleWebhookVerification, sendMessage, getUserName };
