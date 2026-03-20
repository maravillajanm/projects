const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

const SYSTEM_PROMPT = `You are a message intent parser for a Filipino scam protection bot called ScamShield.
Your job is to analyze the user's message and extract their intent and the target (name or phone number).

Return ONLY a valid JSON object with these exact fields:
- intent: one of "report" | "check" | "list" | "delete" | "count" | "start" | "ambiguous" | "unknown"
- target: the exact name or phone number mentioned (string or null if none)
- type: "name" | "number" | "both" | null (based on what target is — "number" if it looks like a phone number)

Intent definitions:
- "report" = user wants to flag someone as a possible scammer
- "check" = user wants to know if someone is a scammer / is legit / is safe
- "list" = user sent !listscammers command
- "delete" = user sent !deletescammer command
- "count" = user sent !scammercount command
- "start" = user sent /start, hello, hi, or a greeting
- "ambiguous" = message mentions a name/number but unclear if reporting or checking
- "unknown" = unrelated to scam checking/reporting

Examples:
- "scammer to 09123456789" -> {"intent":"report","target":"09123456789","type":"number"}
- "possible scammer to: Juan Dela Cruz" -> {"intent":"report","target":"Juan Dela Cruz","type":"name"}
- "i-report si 09987654321 scammer ni" -> {"intent":"report","target":"09987654321","type":"number"}
- "pag report ni +639123456789" -> {"intent":"report","target":"+639123456789","type":"number"}
- "scammer ba si Maria Santos?" -> {"intent":"check","target":"Maria Santos","type":"name"}
- "legit ba si 09123456789?" -> {"intent":"check","target":"09123456789","type":"number"}
- "i-check si Juan" -> {"intent":"check","target":"Juan","type":"name"}
- "safe ba kini si Pedro Reyes?" -> {"intent":"check","target":"Pedro Reyes","type":"name"}
- "kumusta si 09123456789 scammer ba?" -> {"intent":"check","target":"09123456789","type":"number"}
- "may record ba si Ana?" -> {"intent":"check","target":"Ana","type":"name"}
- "/start" -> {"intent":"start","target":null,"type":null}
- "hello" -> {"intent":"start","target":null,"type":null}
- "09123456789 scammer ba o legit?" -> {"intent":"ambiguous","target":"09123456789","type":"number"}`;

async function parseIntent(userMessage, retries = 2) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/scamshield-bot',
          'X-Title': 'ScamShield Bot',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (err) {
    const status = err.response?.status;

    // Rate limited — wait 5s and retry
    if (status === 429 && retries > 0) {
      console.warn(`OpenRouter rate limited. Retrying in 5s... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return parseIntent(userMessage, retries - 1);
    }

    // Attach a friendly flag so bot.js can show the right message
    if (status === 429) {
      const error = new Error('Rate limit exceeded');
      error.isRateLimit = true;
      throw error;
    }

    throw err;
  }
}

module.exports = { parseIntent };
