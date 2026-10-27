# 💀 MEMENTO VIVA (El Umbral & Living Ofrenda)

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026-orange.svg)](https://hacktoberfest.com/)
[![Theme](https://img.shields.io/badge/Theme-Ghost%20in%20the%20Machine-red.svg)](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)
[![Model](https://img.shields.io/badge/Open--Weight-Google%20Gemma%202-blue.svg)](https://ai.google.dev/gemma)
[![Framework](https://img.shields.io/badge/Agent%20Framework-Mastra-purple.svg)](https://mastra.ai/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Audio](https://img.shields.io/badge/Voice%20AI-ElevenLabs-black.svg)](https://elevenlabs.io/)
[![Deployment](https://img.shields.io/badge/Deploy-Render-cyan.svg)](https://render.com/)

> *"Hay tres muertes: cuando se muere el cuerpo, cuando se sepulta, y cuando te olvidan."*  
> *A dual-realm open-weight AI experience bridging the vibrant remembrance of **Día de los Muertos** with the supernatural mystery of **The Ghost in the Machine**.*

---

## 🌟 Overview & Sponsor Integrations

Memento Viva was crafted for the **Hacktoberfest 2026 Week 4 DEV Challenge** (`hacktoberfest-week4-2026-10-26`) under the theme **"Ghost in the Machine"**.

It targets **5 of the official sponsor and partner categories**:

| Sponsor / Category | Integration in Memento Viva |
|--------------------|-----------------------------|
| **Google Gemma 2** (Featured) | Generates traditional Mexican *Calaveras Literarias* (satirical rhyming stanzas) and powers the haunted shell spirit entity via local Ollama, Hugging Face, or autonomous engine. |
| **ElevenLabs** (Partner) | Generates ethereal spirit whispers, ancient ancestor readings, and supernatural EVP transmissions. |
| **Mastra** (Partner) | TypeScript agent harness orchestrating `CalaveraLiterariaAgent` and `SpiritBoxAgent` equipped with Aztec folklore tools. |
| **MongoDB Atlas** (Partner) | Cloud repository for community ofrendas, dynamic candle counts, and paranormal séance transcript archives (with zero-config in-memory fallback). |
| **Render** (Featured) | Native `render.yaml` Blueprint specification, multi-stage `Dockerfile`, and `/api/health` monitoring for 1-click cloud deployment. |

---

## 🕹️ Features

### 1. 🕯️ Día de los Muertos: Altar de Recuerdos
- **Multi-tiered 3D Altar**: Ornate golden frames honoring legendary pioneers (Frida Kahlo, Alan Turing, Nikola Tesla, Sor Juana Inés de la Cruz) and community members.
- **Interactive Veladoras (Candles)**: Light dynamic flickering candles that produce harmonic chime notes and increment live counters in MongoDB Atlas.
- **Floating Cempasúchil Canvas**: Organic golden marigold petals and warm embers gently falling across the screen with wind physics.
- **Papel Picado Garland**: Cut-paper banners in vibrant magenta, amber, and turquoise swaying softly in the breeze.
- **Gemma 2 Calavera Literaria Poet**: Generates traditional 4-line octosyllabic rhyming stanzas in Spanish with English poetic translations.
- **Vocalize with ElevenLabs**: Listen to poems recited with gentle ancestral voices.
- **Folklore & Symbolism Drawer**: Explains the Aztec cosmology of the 4 elements (earth, wind, fire, water) and traditional offerings.

### 2. 📻 The Midnight Séance: Ghost in the Machine
- **P-SB26 EVP Spirit Box**: Sweep radio carrier frequencies (87.5 - 108.0 MHz) manually or engage automated frequency jumping to catch spectral voice formants.
- **K-II EMF Detector**: 5-LED electromagnetic field meter with authentic Geiger clicks and spikes when entities speak.
- **Interactive Ouija Board**: An antique wooden planchette with realistic physics that glides across the board to spell out spirit keywords.
- **Haunted VT100 Shell**: Retro green CRT terminal with ghost possession, command interpretation (`help`, `scan`, `seance`, `manifest`, `exorcise`), and phosphor scanlines.
- **Procedural Web Audio API Soundscapes**: Harmonic 432Hz candle drones and 55Hz haunted binaural drones generated entirely in browser memory.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ (tested on Node v22 and v24)
- (Optional) [Ollama](https://ollama.com/) with `gemma2:2b` or `gemma2:9b` for local hardware inference

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/memento-viva.git
cd memento-viva

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment
cp .env.example .env

# 4. Start concurrent development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🏗️ Project Architecture

```
memento-viva/
├── render.yaml                    # Render Web Service Blueprint
├── Dockerfile                     # Multi-stage production container
├── package.json                   # NPM manifest
├── tsconfig.json                  # Client TS configuration
├── tsconfig.server.json           # Server TS configuration
├── tailwind.config.js             # Dual-palette styling (Ofrenda & Séance)
├── SUBMISSION.md                  # DEV.to post template
├── server/                        # Backend Node.js / Express Agent Hub
│   ├── server.ts                  # Express API & static serving
│   ├── types.ts                   # Unified data contracts
│   ├── db/
│   │   └── mongoAtlas.ts          # MongoDB Atlas client & memory fallback
│   ├── models/
│   │   ├── gemmaClient.ts         # Google Gemma 2 client (Ollama/HF/fallback)
│   │   └── elevenLabsClient.ts    # ElevenLabs voice synthesis
│   └── mastra/
│       ├── index.ts               # Mastra agent registry
│       ├── tools/
│       │   └── remembranceTools.ts # Folklore & memory lookup tools
│       └── agents/
│           ├── calaveraAgent.ts   # Día de los Muertos poet
│           └── spiritBoxAgent.ts  # Paranormal EVP channeler
└── src/                           # Frontend React 19 + Tailwind
    ├── main.tsx                   # Client entry point
    ├── App.tsx                    # Root application component
    ├── index.css                  # Typography & global styles
    ├── types/                     # Frontend types
    ├── lib/api.ts                 # Backend API client
    ├── audio/
    │   ├── soundManager.ts        # Procedural Web Audio API synthesizer
    │   └── speechSynthesis.ts    # ElevenLabs + Web Speech integration
    └── components/
        ├── Header.tsx             # Header with 5 sponsor status badges
        ├── GatewaySwitch.tsx      # Dual talisman realm switcher
        ├── SettingsModal.tsx      # Live diagnostics modal
        ├── ofrenda/               # Día de los Muertos UI
        │   ├── MarigoldPetalCanvas.tsx
        │   ├── PapelPicadoBanner.tsx
        │   ├── OfrendaAltar.tsx
        │   ├── AddOfferingModal.tsx
        │   └── FolkloreDrawer.tsx
        └── seance/                # Séance & Ghost in Machine UI
            ├── CRTEffect.tsx
            ├── EMFMeter.tsx
            ├── SpiritBox.tsx
            ├── OuijaBoard.tsx
            └── HauntedTerminal.tsx
```

---

## ☁️ Deployment

### One-Click Deploy to Render
1. Push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), choose **New > Blueprint**.
3. Select this repo — Render will automatically read `render.yaml` and configure the service.

### Docker Run
```bash
docker build -t memento-viva .
docker run -p 3001:3001 memento-viva
```

---

## 📜 License
MIT License. Created with love and remembrance for Hacktoberfest 2026.
