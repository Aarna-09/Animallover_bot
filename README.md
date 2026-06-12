# AnimalsLover WhatsApp Bot

AI-powered WhatsApp sales bot for AnimalsLover pet company.

## Setup (Local)

```bash
# 1. Install dependencies
npm install

# 2. Add your keys in .env
GROQ_API_KEY=your_key_here


# 3. Run bot
node index.js

# 4. Scan QR with NEW WhatsApp number
```

## Deploy on Railway (24/7)

1. Push this folder to GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Select your repo
4. Add environment variables in Railway dashboard:
   - `GROQ_API_KEY` = your Groq key
   - `EXECUTIVE_NUMBER` = 918809506230
5. Deploy → wait for build
6. Open logs → scan QR with new number
7. Bot live 24/7!

## Files

| File | Purpose |
|------|---------|
| `index.js` | Main bot code |
| `.env` | API keys (never commit!) |
| `Procfile` | Railway entry point |
| `customer_memory.json` | Auto-created, stores customer data |
| `auth_info/` | Auto-created, WhatsApp session |
| `f1.jpeg`, `f2.jpeg` | (optional) Pet photos to send |
| `f3.mp4` | (optional) Pet video to send |

## Features

- AI sales assistant (Groq/Llama)
- Memory per customer (breed, city, budget, gender, email)
- Hindi / English / Hinglish auto-detect
- FAQ auto-replies (delivery, vaccination, payment, etc.)
- Executive alerts (photo request, price negotiation, complaint, email)
- Breed availability sequence with photos
- Duplicate message protection
- Auto-reconnect on disconnect

## Get Groq API Key

Free at: https://console.groq.com
