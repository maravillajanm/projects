const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());

const PACKAGE_AND_PERSON_SELECTION = 'PACKAGE_AND_PERSON_SELECTION';
const FORM_COLLECTION = 'FORM_COLLECTION';
const COMPLETED = 'COMPLETED';

const packages = [
  { name: 'Relax Classic', description: '60-minute gentle full-body massage.' },
  { name: 'Deep Relax', description: '90-minute deep tissue and stress relief.' },
  { name: 'Couple Bliss', description: 'For two, side-by-side relaxation.' }
];

const persons = [
  { name: 'Luna', photoUrl: 'https://example.com/luna.jpg' },
  { name: 'Maya', photoUrl: 'https://example.com/maya.jpg' },
  { name: 'Aria', photoUrl: 'https://example.com/aria.jpg' }
];

const sessions = new Map();
const bookings = [];

const humanEscalationKeywords = ['availability', 'details', 'available', 'when', 'time'];

function formatPackages() {
  return packages.map(p => `- ${p.name}: ${p.description}`).join('\n');
}

function formatPersons() {
  return persons.map(p => `- ${p.name}`).join('\n');
}

function findPackage(name) {
  return packages.find(p => p.name.toLowerCase() === name.toLowerCase());
}

function findPerson(name) {
  return persons.find(p => p.name.toLowerCase() === name.toLowerCase());
}

function isQuestion(msg) {
  return /\?$/.test(msg.trim()) || /(what|how|why|where|who)/i.test(msg);
}

function isHumanEscalation(msg) {
  return humanEscalationKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(msg));
}

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {
      stage: PACKAGE_AND_PERSON_SELECTION,
      selectedPackage: null,
      selectedPerson: null,
      form: {}
    });
  }
  return sessions.get(chatId);
}

function askPackageAndPerson(session) {
  const selected = session.selectedPackage ? `You chose *${session.selectedPackage.name}*.` : '';
  const person = session.selectedPerson ? `You chose *${session.selectedPerson.name}*.` : '';
  const next = session.selectedPackage && session.selectedPerson ? 'Great, you can now proceed with the form.' : 'Please choose one package and one individual.';
  return `${selected} ${person}\n\nPackages:\n${formatPackages()}\n\nIndividuals:\n${formatPersons()}\n\n${next}`;
}

async function getAiResponse(userPrompt) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const ollamaUrl = process.env.OLLAMA_URL; // e.g. http://localhost:11434
  const model = process.env.OPENROUTER_MODEL || 'gpt-4o-mini';

  if (ollamaUrl) {
    try {
      const ollamaModel = process.env.OLLAMA_MODEL || 'sailor2';
      const response = await axios.post(`${ollamaUrl}/v1/generate`, {
        model: ollamaModel,
        prompt: userPrompt,
        max_tokens: 200,
        temperature: 0.7
      });
      const text = response.data?.results?.[0]?.content || response.data?.output || '';
      if (text) return text.trim();
    } catch (error) {
      console.warn('Ollama request failed:', error.message);
    }
  }

  if (openRouterKey) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/v1/chat/completions',
        {
          model,
          messages: [
            { role: 'system', content: 'You are a concise, flirty sales assistant for massage booking.' },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const choice = response.data?.choices?.[0]?.message?.content;
      if (choice) return choice.trim();
    } catch (error) {
      console.warn('OpenRouter request failed:', error.message);
    }
  }

  return userPrompt;
}

async function toFlirty(text) {
  const base = text;
  const result = await getAiResponse(base);
  if (!result || result.length === 0) return base;
  return result;
}

async function sendTelegram(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('Telegram token missing');
    return;
  }

  await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
}

async function reply(chatId, res, text) {
  const built = await toFlirty(text);

  if (chatId && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      await sendTelegram(chatId, built);
      return res.sendStatus(200);
    } catch (error) {
      console.warn('Telegram send failed:', error.message);
      return res.status(500).json({ error: 'Failed to send telegram message' });
    }
  }

  return res.json({ reply: built });
}

app.post('/webhook', async (req, res) => {
  const incoming = req.body;
  const chatId = incoming?.message?.chat?.id;
  const text = (incoming?.message?.text || '').trim();

  if (!chatId || !text) {
    return res.status(400).send('missing chat or text');
  }

  const session = getSession(chatId);

  if (session.stage === PACKAGE_AND_PERSON_SELECTION) {
    if (isHumanEscalation(text)) {
      return reply(chatId, res, 'A human agent will assist with availability and details very soon. Meanwhile, please pick a package from the list.');
    }

    const matchedPackage = findPackage(text);
    const matchedPerson = findPerson(text);

    if (matchedPackage && !session.selectedPackage) {
      session.selectedPackage = matchedPackage;
      return reply(chatId, res, `Lovely choice, sweetie. *${matchedPackage.name}* is reserved for you. Please choose one individual: ${formatPersons()}`);
    }

    if (matchedPerson) {
      if (!session.selectedPackage) {
        return reply(chatId, res, `Awww, ${matchedPerson.name} is a hit! Please choose your package first, then I’ll lock in your favorite.`);
      }
      session.selectedPerson = matchedPerson;
      session.stage = FORM_COLLECTION;
      return reply(chatId, res, `Perfect match! *${matchedPerson.name}* plus *${session.selectedPackage.name}* is dreamy. Now please fill this form:\nName:\nAddress/hotel:\nContact number:\nPackage: ${session.selectedPackage.name}`);
    }

    if (text.toLowerCase().includes('package')) {
      return reply(chatId, res, `Here are the available packages:\n${formatPackages()}\n\nPick one package name so we can move forward.`);
    }

    if (isQuestion(text)) {
      return reply(chatId, res, 'Yes, I can answer quickly: we’re here to help pick a package and escort you through the booking. Now, please select a package from the list.');
    }

    return reply(chatId, res, `Let’s keep it simple, darling: choose one package first from\n${formatPackages()}\nThen pick one individual: ${formatPersons()}`);
  }

  if (session.stage === FORM_COLLECTION) {
    const raw = text;
    const lines = raw.split('\n').map(l => l.trim());
    const form = { ...session.form };

    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.startsWith('name:')) form.name = line.substring(5).trim();
      if (lower.startsWith('address') || lower.startsWith('address/hotel:')) form.address = line.split(':')[1]?.trim();
      if (lower.startsWith('contact')) form.contact = line.split(':')[1]?.trim();
      if (lower.startsWith('package:')) form.package = line.split(':')[1]?.trim();
    });

    session.form = form;

    if (form.name && form.address && form.contact) {
      bookings.push({
        chatId,
        name: form.name,
        address: form.address,
        contact: form.contact,
        package: session.selectedPackage?.name || form.package,
        person: session.selectedPerson?.name,
        timestamp: new Date().toISOString()
      });
      session.stage = COMPLETED;

      return reply(chatId, res, 'Fantastic! Your booking request is sent. Our team will review and contact you soon. Ready to keep this lovely chat open for the next step?');
    }

    return reply(chatId, res, 'Almost done, babe. Please complete all fields exactly like this:\nName:\nAddress/hotel:\nContact number:\nPackage: ' + (session.selectedPackage?.name || ''));
  }

  if (session.stage === COMPLETED) {
    return reply(chatId, res, 'A member of our team is now assisting you.');
  }

  return reply(chatId, res, 'Sorry, I need a quick clarification: select a package first please.');
});

app.get('/status', (req, res) => {
  res.json({ sessions: Array.from(sessions.entries()), bookings });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Massage AI sales assistant running on port ${port}`);
});
