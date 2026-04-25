# Deployment — Free Tier (Vercel + Render + Groq)

This stack runs on free tiers with no credit card:

| Piece | Host | Why |
|---|---|---|
| Frontend (chat) | **Vercel** | Free Next.js hosting |
| Dashboard (staff) | **Vercel** | Free Next.js hosting |
| Backend (API)   | **Render**  | Free 512 MB Node service, persistent in-memory state, supports WebSocket |
| LLM             | **Groq**    | Free OpenAI-compatible API for Llama 3.1 |

> Vercel can't host the backend reliably because the in-memory `escalatedConversations` map would be wiped between serverless invocations and the dashboard would lose escalations. Render keeps a single long-running process, so state survives.

---

## 1. Get a free Groq API key

1. Sign up at https://console.groq.com
2. Create an API key
3. Save it for step 2

## 2. Deploy the backend on Render

1. Go to https://render.com → **New** → **Blueprint**
2. Connect this GitHub repo (`Abbhhiiii/creditunion`)
3. Render reads `render.yaml` automatically — confirm the service plan is **Free**
4. In the env-var step, set:
   - `GROQ_API_KEY` → the key from step 1
   - `CORS_ORIGINS` → leave blank for now (we don't have Vercel URLs yet); we'll fill it in step 4
5. Click **Apply**. Build takes ~2 min. When the URL appears (e.g. `https://creditassist-backend.onrender.com`), copy it.

> Free tier sleeps after 15 min idle and cold-starts in ~30 s. Acceptable for demo use.

## 3. Deploy the chat frontend on Vercel

1. https://vercel.com → **Add New** → **Project** → Import `Abbhhiiii/creditunion`
2. **Root Directory**: `frontend`
3. Framework: **Next.js** (auto-detected)
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = the Render backend URL from step 2
5. Deploy. Note the public URL (e.g. `https://creditunion-frontend.vercel.app`).

## 4. Deploy the dashboard on Vercel

1. Same flow, **Add New → Project** → Import the same repo
2. **Root Directory**: `dashboard`
3. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = the Render backend URL
4. Deploy. Note the public URL.

## 5. Lock CORS to your two Vercel URLs

Back in Render → service → **Environment** → set:

```
CORS_ORIGINS = https://creditunion-frontend.vercel.app,https://creditunion-dashboard.vercel.app
```

(The backend also auto-allows any `*.vercel.app` preview deploy, so PR previews still work.)

Render will redeploy automatically.

## 6. Smoke test

- Open the frontend → log in with `john.doe@example.com` / `password123`
- Send: *"someone made an unauthorized $500 charge"*
- Open the dashboard in another tab → escalation appears within ~5 s with the conversation transcript

---

## Local development (optional)

Two ways to run the LLM locally:

**Option A — Groq (no install):** put `GROQ_API_KEY=...` in `backend/.env`. Same as production.

**Option B — Ollama (offline):** leave `GROQ_API_KEY` empty; install https://ollama.ai and run:
```
ollama serve
ollama pull mistral
```

Then in three terminals from the repo root:
```
cd backend   && cp .env.example .env && npm install && npm run dev
cd frontend  && cp .env.example .env.local && npm install && npm run dev
cd dashboard && cp .env.example .env.local && npm install && npm run dev
```
