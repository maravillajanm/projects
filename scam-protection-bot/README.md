# ScamShield Bot

Facebook Messenger bot for scam protection. Reports and checks scammers in a community.

## Stack

- **Runtime**: Node.js (Express)
- **AI**: OpenRouter API (intent parsing)
- **Database**: Supabase
- **Deploy**: Railway

---

## Setup

### 1. Supabase — Create the table

Run this SQL in your Supabase project's SQL Editor:

```sql
CREATE TABLE scammers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_value TEXT NOT NULL,
  type        TEXT CHECK (type IN ('name', 'number', 'both')) NOT NULL DEFAULT 'name',
  reported_by TEXT NOT NULL,
  date_reported TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  report_count  INTEGER NOT NULL DEFAULT 1,
  reporters   TEXT[] NOT NULL DEFAULT '{}'
);

-- Case-insensitive unique index to prevent duplicates
CREATE UNIQUE INDEX scammers_reported_value_idx ON scammers (LOWER(reported_value));
```

### 2. Facebook App Setup

1. Go to [Meta for Developers](https://developers.facebook.com/) and create/open your app.
2. Add the **Messenger** product.
3. Under **My Apps > Select App > Use Cases > Customize > Messenger API Settings**:
   - Generate a **Page Access Token** for your Facebook Page.
   - Set the **Webhook URL** to: `https://your-railway-domain.up.railway.app/webhook`
   - Set the **Verify Token** to your chosen string (same as `VERIFY_TOKEN` in `.env`).
   - Subscribe to: `messages`, `messaging_postbacks`

### 3. OpenRouter

1. Sign up at [openrouter.ai](https://openrouter.ai).
2. Create an API key.
3. The default model is `arcee-ai/trinity-large-preview:free` (free tier).
   Change `OPENROUTER_MODEL` in `.env` for a different model.

### 4. Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PAGE_ACCESS_TOKEN` | Facebook Page Access Token |
| `VERIFY_TOKEN` | Any string you choose for webhook verification |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `OPENROUTER_MODEL` | Model to use (default: llama-3.1-8b free) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase **service role** key (not anon key) |
| `ADMIN_PSIDS` | Comma-separated Facebook PSIDs of admins |
| `PORT` | Server port (Railway sets this automatically) |

**Finding your PSID:** Send a message to your page, then check Railway logs — the PSID appears in the incoming webhook payload.

### 5. Local Development

```bash
npm install
cp .env.example .env
# fill in .env values
npm run dev
```

Use [ngrok](https://ngrok.com) to expose your local server for webhook testing:
```bash
ngrok http 3000
# Use the https URL as your webhook URL in Meta developer console
```

### 6. Deploy to Railway

1. Push this repo to GitHub.
2. Create a new project on [Railway](https://railway.app) from the GitHub repo.
3. Add all environment variables from `.env` in Railway's **Variables** tab.
4. Railway auto-detects `npm start` and deploys.
5. Copy the Railway-generated domain and set it as the Messenger webhook URL.

---

## Bot Commands

| Message | Action |
|---|---|
| `Scammer to: [name/number]` | Report a scammer |
| `Scammer ba si [name/number]?` | Check if someone is a scammer |
| `i-report si [name/number]` | Report (Bisaya/Tagalog variant) |
| `i-check si [name/number]` | Check (Bisaya/Tagalog variant) |
| `legit ba si [name/number]?` | Check |
| `/start` | Show welcome message |
| `!scammercount` | Total number of reports (all users) |
| `!listscammers [page]` | List all scammers — **admin only** |
| `!deletescammer [name/number]` | Delete a record — **admin only** |
