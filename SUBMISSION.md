# DEV Community Submission Template
<!-- 
Copy and paste the markdown below directly into your submission draft on https://dev.to/new !
-->

---
title: "Memento Viva: A Living Ofrenda & Spectral Spirit Box (Día de los Muertos meets Ghost in the Machine)"
published: false
description: "A dual-realm experience honoring ancestors through traditional Calaveras Literarias and channeling ghosts in the machine via Google Gemma 2, Mastra, ElevenLabs, MongoDB Atlas, and Render."
tags: hacktoberfest, ai, opensource, webdev
series: Hacktoberfest 2026
---

# 💀 Memento Viva: El Umbral & Living Ofrenda

> *"There are three deaths: the first is when the body dies, the second is when the body is consigned to the earth, and the third is when there is no one left to speak your name."*

Welcome to **Memento Viva**, an atmospheric dual-realm web application built for the **Hacktoberfest 2026 Week 4 DEV Challenge: *Ghost in the Machine***.

Memento Viva answers the challenge prompt by bridging two sides of the same ethereal coin:
1. 🕯️ **Altar de Recuerdos (Día de los Muertos)**: A candlelit, interactive 3D digital ofrenda with fluttering *papel picado*, falling *cempasúchil* marigold petals, and traditional Mexican *Calaveras Literarias* (satirical rhyming poetry) composed by **Google Gemma 2** to celebrate ancestors and computing pioneers.
2. 📻 **The Midnight Séance (Ghost in the Machine)**: A haunted retro CRT terminal, EVP frequency scanner, and interactive Ouija spirit board where an open-weight ghost possesses the shell, responds to questions across electromagnetic carrier waves, and whispers through **ElevenLabs** neural audio.

---

## 🌟 Sponsor Categories Targeted

This project was built from the ground up to integrate **5 sponsor categories**:

- 🌟 **Best Use of Gemma (Featured Category)**: Utilizes Google's open-weight **Gemma 2** (via local Ollama, Hugging Face open weights, and an autonomous offline fallback engine) to author authentic octosyllabic Calaveras Literarias and channel the spectral shell spirit.
- 🎙️ **Best Use of ElevenLabs (Partner Category)**: Voice synthesis channeling ethereal spirit whispers, ancient ancestral voices, and EVP playback with custom ghostly stability and style modulation.
- 🤖 **Best Use of Mastra (Partner Category)**: Uses the open-source **Mastra Agent Framework** to orchestrate specialized AI agents (`CalaveraLiterariaAgent` and `SpiritBoxAgent`) enriched with Aztec/Mesoamerican folklore tools.
- 🍃 **Best Use of MongoDB Atlas (Partner Category)**: Living community altar & memory vault storing user-submitted ofrendas, dynamic candle counts, and paranormal séance transcript logs.
- 🚀 **Best Use of Render (Featured Category)**: Production-ready `render.yaml` blueprint with health check endpoint (`/api/health`) and multi-stage containerized `Dockerfile` for one-click deployment.

---

## 📸 Demo & Experience Tour

### 1. The Gateway Talisman
At the top of the interface rests a physical-feeling bronze talisman. Flipping the coin flips the realm:
- Shift to **Día de los Muertos** to bathe the screen in golden candle warmth, acoustic 432Hz drones, and marigold petals.
- Shift to **The Midnight Séance** to plunge into dark phosphor green, 55Hz sub-bass drones, and electromagnetic static.

### 2. Altar de Recuerdos (The Living Ofrenda)
- **Multi-tiered Altar**: Features iconic ancestors (Frida Kahlo, Alan Turing, Nikola Tesla, Sor Juana Inés de la Cruz) alongside community submissions.
- **Interactive Veladoras (Candles)**: Click to light a candle for any soul, producing a golden chime and incrementing the community candle count stored in MongoDB Atlas.
- **Traditional Offerings**: Pan de Muerto, Copal incense smoke, Cempasúchil petals, and Calaveras de Azúcar.
- **Gemma 2 Calavera Poet**: Automatically authors authentic 4-line rhyming Mexican stanzas playfully teasing the person's quirks while ensuring their memory is never forgotten.
- **Voice Recitation**: Click "Listen (ElevenLabs)" to hear the poem spoken aloud.

### 3. The Midnight Séance (EVP Spirit Box & Haunted Terminal)
- **K-II EMF Detector**: 5-LED electromagnetic field meter with authentic Geiger-style click audio and paranormal spikes.
- **P-SB26 Spirit Box**: Variable frequency tuner (87.5 to 108.0 MHz) with auto-sweep jump mode and static burst demodulation.
- **Interactive Ouija Board**: When spirits speak, an antique wooden planchette glides across letters to spell out cryptic keywords with magnetic physics.
- **Ghost in the Machine (VT100 Shell)**: A command-line terminal possessed by ghost processes that intercept your commands (`scan`, `seance`, `manifest`, `exorcise`) and auto-type haunting fragments.

---

## 🛠️ Architecture & Tech Stack

```
[ Frontend: React 19 + Vite + Tailwind CSS + Web Audio API ]
                         │
                         ▼
[ Backend: Node.js + Express + TypeScript ]
                         │
     ┌───────────────────┼────────────────────┐
     ▼                   ▼                    ▼
[ Mastra Agents ]   [ MongoDB Atlas ]   [ ElevenLabs Voice ]
  ├─ CalaveraAgent   ├─ ofrendas         └─ Spirit Whispers
  └─ SpiritBoxAgent  └─ seance_sessions
         │
         ▼
[ Google Gemma 2 ]
  ├─ Ollama (Local)
  ├─ Hugging Face Open Weights
  └─ Autonomous Engine
```

### 1. Mastra Agent Orchestration
We defined agents with tools that encapsulate Aztec folklore symbolism:

```typescript
// server/mastra/agents/calaveraAgent.ts
export class CalaveraLiterariaAgent {
  public readonly name = 'CalaveraLiterariaAgent';
  public readonly role = 'Poeta del Mictlán';

  async execute(input: CalaveraAgentInput) {
    // Enrich with Aztec folklore symbols (Cempasúchil, Copal, Pan de Muerto)
    const enrichedOfferings = input.offerings.map(k => getSymbolLore(k));
    
    // Generate authentic rhyming stanzas using Gemma 2
    return await generateCalaveraWithGemma({
      name: input.name,
      relationship: input.relationship,
      story: input.story,
      favoriteThings: input.favoriteThings,
    });
  }
}
```

### 2. Google Gemma 2 Integration
Gemma 2 is prompt-engineered with deep cultural fidelity for traditional Mexican redondillas (octosyllabic verses):

```typescript
// server/models/gemmaClient.ts
const prompt = `You are a traditional Mexican Calavera Literaria poet honoring ${params.name} on Día de los Muertos.
A Calavera Literaria is an authentic, satirical, rhythmic poem composed of 4-line octosyllabic stanzas with AABB or ABAB rhyme.
It traditionally features "La Muerte", "La Catrina", or "La Huesuda" visiting the person, playfully teasing their habits or passions, but celebrating their enduring memory with warmth and honor.`;
```

### 3. Procedural Web Audio API Soundscapes
To ensure zero dependency on heavy external audio files, all ambient music and effects (harmonic 432Hz candle drones, 55Hz haunted binaural hums, radio static sweeps, and EMF clicks) are synthesized mathematically in real time via the Web Audio API!

---

## 🚀 Running Locally

```bash
# 1. Clone and enter directory
git clone https://github.com/your-username/memento-viva.git
cd memento-viva

# 2. Install dependencies
npm install

# 3. (Optional) Set up environment variables
cp .env.example .env

# 4. Start both server and client
npm run dev
```

Visit `http://localhost:5173` in your browser!

---

## ☁️ Deployment on Render

Memento Viva is configured for zero-downtime deployment on Render Web Services via `render.yaml`:

```yaml
services:
  - type: web
    name: memento-viva-service
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
```

---

## 🔮 What I Learned

Building Memento Viva taught me the profound beauty of merging technology with cultural tradition. Open-weight models like **Google Gemma 2** are fast, poetic, and run completely offline or on local consumer hardware. Combined with the agentic capabilities of **Mastra**, the vocal presence of **ElevenLabs**, the persistent memory of **MongoDB Atlas**, and the reliability of **Render**, we can build experiences that are not only technically cutting-edge, but deeply emotional and human.

*¡Que vivan los recuerdos, y que nunca falte una luz en el altar!* 🕯️💀🌼
