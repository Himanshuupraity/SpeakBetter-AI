# SpeakBetter AI

**Practice English. Speak Confidently. Improve Every Day.**

A mobile-first English learning and speaking practice app. Emma, your AI English coach, talks with you, lets you speak freely without interrupting, and gives you a full report afterwards: your score, every mistake, why it's wrong, a natural alternative, and a short practice question.

It runs fully in **Demo Mode** out of the box. No API key and no backend are needed.

---

## Quick start

Requirements: **Node.js 20+** (check with `node -v`).

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. The first screen is the welcome page. Tap **Start Practicing**, answer three setup questions, and leave **"Load sample progress (demo)"** ticked so the dashboard, charts, history and mistakes are filled with realistic sample data.

### Use it on your phone

`npm run dev` also prints a **Network** URL, for example `http://192.168.1.20:5173`. Open that on your phone while it's on the same Wi-Fi.

> **Microphone on a phone:** browsers only allow the microphone on **https** or `localhost`. Over a plain `http://192.168…` address, voice input is blocked and the app switches to typing. To use your voice on your phone, deploy the app (see *Deploying*, which gives you https), or use a tunnel such as `npx localtunnel --port 5173`.

### Other commands

| Command | What it does |
|---|---|
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run server:install` | Install the optional AI backend's dependencies |
| `npm run server` | Start the optional AI backend (see below) |

---

## The main flow

```
Open app → See today's goal → Start Practice → Talk with Emma → End session
        → Get score → See every mistake → Practise those mistakes → Track progress
```

| Section | What's inside |
|---|---|
| **Dashboard** | Greeting, today's goal ring, streak, level, skill scores, overall score, words learned, mistakes corrected, Emma's tip, *Your Recommended Practice*, recent sessions |
| **AI Speaking** | 15 topics, 5 difficulty levels, 4 personalities (Friendly Teacher, Professional Interviewer, Casual Friend, Strict Coach). Big mic button, live transcript, voice replies with replay, timer, recording indicator, typing fallback, hands-free mode |
| **Speaking report** | Score out of 100 with a transparent breakdown, strengths, focus areas, every mistake (what you said, correct version, why, practice question), common-mistake categories, *Better way to say it* (basic, natural, professional), full transcript |
| **Conversation** | A role-play library with useful phrases you can listen to. Starts the speaking session in that scenario |
| **Pronunciation** | Word of the day, 11 difficult sounds (TH, R, V, W, L, Z, S, SH, CH, J, word stress), IPA, slow pronunciation, example sentence, your own recording, an estimated score, tips |
| **Speaking Speed** | Read a passage aloud or speak freely. Measures your **words per minute** and tells you if you're too slow, a little slow, at the **perfect pace**, a little fast or too fast, for Conversation (120–160 wpm), Interview (120–150) or Presentation (100–140). Includes a live speedometer, a pace guide that highlights words at the ideal speed, "Hear the ideal pace", a score, pauses, steadiness, a pace-over-time chart, tips, your recording, and a history chart. Works with a timer in browsers without speech recognition |
| **Grammar** | 14 topics, each with an explanation, rules, examples, common mistakes, **Practice** mode (instant feedback) and **Quiz** mode (score plus an explanation for each wrong answer) |
| **Vocabulary** | Word of the day, daily 10 words, 11 categories, flashcards, synonyms and antonyms, pronunciation, mark as learned, favourites, **spaced-repetition review** |
| **Writing** | 12 types (journal, professional email, bug report, leave request…). Scores for grammar, spelling, structure, vocabulary, tone, clarity and professionalism. Corrected and more-professional versions |
| **Reading** | 10 articles from A1 to C1 with multiple-choice, true/false, vocabulary, main-idea and fill-in-the-blank questions |
| **Listening** | 10 dialogues and talks read aloud (two voices, speed control). Difficulty adapts: 80%+ moves you up a level, under 50% moves you down |
| **Daily Practice** | A personalised plan with a progress ring, goals of 10–60 minutes, and a 7-day streak view. Activities tick themselves off |
| **My Mistakes** | Collected automatically from speaking, writing, grammar, vocabulary and pronunciation. Top weak areas, filters, quick practice, *Practice again*, mark as mastered |
| **Progress** | Overall score, weekly and monthly trend charts per skill, minutes per day against your goal, totals, XP levels, achievements |
| **History** | Every session grouped by day. Tap one to see its full report |
| **Settings** | Profile, level, goal, daily time, theme (light/dark/system), Emma's voice and speed, personality, difficulty, sample data, export/import backup, reset |
| **Level Test** | 24 questions across grammar, vocabulary, reading and sentence formation. Gives an estimated A1–C1 level and a learning plan |

**Emma adapts to you.** She reads your weak areas. If you keep making tense mistakes, she says *"Today let's practise the past tense…"* and the daily plan points you to that grammar topic. Speaking difficulty goes up after strong sessions and down after weak ones.

**Gamification:** daily streak 🔥, XP, levels (Beginner → Explorer → Communicator → Confident Speaker → Fluent Speaker), and achievements (7-day streak, 10 speaking sessions, 100 words, 10 writing practices, first 90+ score…).

---

## Demo Mode: what's real and what's simulated

| Feature | In Demo Mode |
|---|---|
| Speech-to-text and text-to-speech | **Real**, using the browser's Web Speech API (best in Chrome, Edge and Safari) |
| Emma's replies | **Simulated.** A rule-based engine reacts to your topic, mood, questions and short answers, then asks follow-ups |
| Grammar feedback on your speaking and writing | **Real, rule-based.** It checks about 40 common learner mistakes: tenses, articles, prepositions, *he go*, *from 2 years*, *discuss about*, *revert back*, *many informations*, spelling… |
| Pronunciation and fluency scores | **Estimates** from speech-recognition confidence and speaking rate. The app labels them clearly as estimates |
| Sample progress (sessions, charts, mistakes) | **Sample data**, marked with a yellow *Demo data* / *Sample* badge. Remove it in **Settings → Clear sample data** |

> Honest note on pronunciation: browser speech recognition can't judge individual sounds. The score only reflects how confidently your word was recognised. For real phoneme-level assessment, connect a speech-assessment API (see below).

---

## Connecting a real AI backend (where your API key goes)

**Never put an API key in frontend code or in a `VITE_*` variable.** Anything prefixed `VITE_` is bundled into the JavaScript that every visitor downloads. The key belongs only on the server.

```
Browser (React)  ──►  /api/ai/<action>  ──►  server/index.js  ──►  Claude API
                      no key here             key lives here (server/.env)
```

### Step 1: Add your key to the backend

```bash
npm run server:install          # installs server dependencies (@anthropic-ai/sdk, zod)
cp server/.env.example server/.env
```

Edit **`server/.env`**. This is the only place the key goes:

```bash
ANTHROPIC_API_KEY=sk-ant-...        # ← your key (get one at console.anthropic.com)
ANTHROPIC_MODEL=claude-opus-5
PORT=8787
ALLOWED_ORIGINS=http://localhost:5173
```

`server/.env` is already listed in `.gitignore`.

### Step 2: Point the frontend at the backend

```bash
cp .env.example .env.local
```

Edit **`.env.local`** (these values are public, and there's no secret in them):

```bash
VITE_AI_PROVIDER=api
VITE_API_BASE_URL=/api
```

### Step 3: Run both

```bash
npm run server     # terminal 1 → http://localhost:8787
npm run dev        # terminal 2 → http://localhost:5173 (proxies /api to the server)
```

**Settings → AI engine** now shows **Connected**. If the backend is unreachable or returns an error, the app falls back to demo logic automatically and tells you, so practice never stops.

### What the backend does

`server/index.js` is a small Node server with no framework:

| Endpoint | Purpose | Model settings |
|---|---|---|
| `POST /api/ai/conversation` | Emma's next reply | effort `low` for fast, natural replies |
| `POST /api/ai/analyze-speaking` | Full speaking report (structured JSON output) | effort `medium` |
| `POST /api/ai/analyze-writing` | Writing scores, corrections, professional rewrite | effort `medium` |
| `POST /api/ai/analyze-grammar` | Emma's comment after a quiz | effort `low` |
| `POST /api/ai/analyze-pronunciation` | Currently the speech-recognition estimate. Plug a speech-assessment service in here | – |

Every Claude request enables **server-side refusal fallback** (`fallbacks: "default"`). If the model declines a request, the API retries it on Anthropic's recommended fallback model automatically. Pronunciation and fluency scores still come from the speech signal, not from the LLM. The server reuses the frontend's scoring engine for those.

### Using OpenAI or Gemini instead

Only `server/index.js` changes. Replace the Anthropic calls with your provider's SDK and return the same JSON shapes. The shapes are documented by the matching methods in `src/services/providers/mockAiProvider.js`. The frontend doesn't change.

### Deploying the backend

Any Node host works (Render, Railway, Fly.io, a VPS). Set `ANTHROPIC_API_KEY` and `ALLOWED_ORIGINS=https://your-frontend-domain` as environment variables there. Then build the frontend with `VITE_API_BASE_URL=https://your-backend-domain/api`.

---

## Deploying the frontend

`npm run build` creates a static site in `dist/`. It works on Vercel, Netlify, Cloudflare Pages or GitHub Pages. SPA fallbacks are included: `vercel.json` and `public/_redirects` for Netlify. Hosting gives you **https**, which is what enables the microphone on your phone.

---

## Project structure

```
src/
├── App.jsx                      # Routes (lazy-loaded pages) + onboarding guard
├── main.jsx                     # Providers: Router, Toasts, App state, ErrorBoundary
├── context/
│   ├── AppContext.jsx           # Learner state + actions (sessions, mistakes, vocab, XP, achievements)
│   └── ToastContext.jsx
├── services/
│   ├── aiService.js             # ← the ONLY entry point the UI uses for AI (provider switch + fallback)
│   ├── providers/
│   │   ├── mockAiProvider.js    # Demo AI (default)
│   │   └── remoteAiProvider.js  # Calls your backend
│   ├── engine/                  # Demo "brain": grammar rules, text analyser, scoring, conversation engine
│   ├── speechService.js         # Web Speech API wrappers + friendly error messages
│   ├── storageService.js        # ← the ONLY module that touches localStorage (swap for a real DB later)
│   ├── grammarService.js        # Quiz grading → mistakes
│   └── teacherService.js        # Emma's memory: insights, focus tips, adaptive difficulty
├── hooks/                       # useSpeechRecognition, useTextToSpeech, useAudioRecorder, useTimer…
├── data/                        # Grammar topics, vocabulary, pronunciation, readings, listening, level test, demo seed
├── utils/                       # Stats selectors, daily plan generator, levels/XP, dates, text helpers
├── components/
│   ├── layout/                  # Sidebar (desktop), bottom nav (mobile), top bar
│   ├── common/                  # Button, Card, Quiz, MistakeCard, Charts, ProgressRing, Tabs, dialogs…
│   ├── speaking/                # ChatBubble, MicButton, SessionSetup, SpeakingReport
│   ├── dashboard/               # RecommendedPractice, SessionListItem
│   └── learning/                # WordCard, Flashcards, WritingFeedback
└── pages/                       # One file per section
server/
└── index.js                     # Optional backend holding the API key
```

### Replacing localStorage with a real database

Everything is saved through `src/services/storageService.js` (`load`, `save`, `clear`, `exportData`, `importData`). Keep that interface and change the function bodies to call your API. Nothing else in the app touches storage.

---

## Accessibility and error handling

- Keyboard navigation, visible focus rings, a skip link, ARIA labels, radio/tab semantics, and live regions for Emma's status and results.
- Touch targets of at least 44px, readable font sizes, and `prefers-reduced-motion` support.
- Friendly messages when:
  - microphone permission is denied
  - speech recognition is unsupported
  - the page isn't https
  - no speech is heard
  - you're offline
  - the AI service fails (with automatic demo fallback)
  - you submit an empty or too-short input
  - storage is blocked
- Charts include a *Show as table* view.

## Browser support

| Browser | Speaking (voice input) | Emma's voice |
|---|---|---|
| Chrome / Edge (desktop and Android) | ✅ | ✅ |
| Safari (macOS and iOS 14.5+) | ✅ | ✅ |
| Firefox | ❌ (type instead) | ✅ |
