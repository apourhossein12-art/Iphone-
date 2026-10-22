# ALI phone — PWA + free AI router

## Run
    npm install
    cp .env.example .env      # add HF_TOKEN (optional – Pollinations works without any key)
    npm run dev               # development
    npm run build && NODE_ENV=production npm start   # production

## AI providers (automatic switching)
Order: Pollinations → Hugging Face → Groq → OpenRouter → Gemini.
- Providers without a key are skipped (Pollinations needs none).
- The fastest recent provider goes first; if it is slower than AI_HEDGE_MS (2.5 s) the next one starts in parallel and the first answer wins.
- A failing provider is paused (15 s, 30 s, … up to 5 min) and retried automatically.
- Check live health: GET /api/ai/status

## Install on iPhone
Host over HTTPS (iOS requires it), open in Safari → Share → Add to Home Screen.

## Terminal
Off in production unless ENABLE_TERMINAL=true (personal use: just set it). TERMINAL_TOKEN is optional.
