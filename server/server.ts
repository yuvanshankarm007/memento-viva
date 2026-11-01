import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initMongo, isMongoConnected, getAllOfrendas, addOfrenda, lightCandleOnOfrenda, updateCalaveraPoem, getRecentSeances, connectRuntimeMongo } from './db/mongoAtlas.js';
import { checkGemmaHealth } from './models/gemmaClient.js';
import { checkElevenLabsHealth, synthesizeVoiceWithElevenLabs, elevenLabsClient, setRuntimeElevenLabsKey, getRuntimeElevenLabsConfig } from './models/elevenLabsClient.js';
import { mastraHub } from './mastra/index.js';
import { SystemStatus } from './types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize MongoDB Atlas connection
initMongo().catch(err => console.error('MongoDB Atlas init error:', err));

// ====================================================================
// HEALTH & SPONSOR INTEGRATION STATUS
// ====================================================================

// API Root Index - Redirects web browsers to main app or returns JSON directory
app.get(['/api', '/api/'], (req, res) => {
  if (req.accepts('html')) {
    return res.redirect('/');
  }
  res.json({
    name: 'Memento Viva Paranormal API',
    version: '1.0.0',
    theme: 'Hacktoberfest 2026: Ghost in the Machine',
    webAppUrl: '/',
    endpoints: {
      health: '/api/health',
      status: '/api/status',
      ofrendas: '/api/ofrendas',
      folklore: '/api/folklore',
      calaveraGenerate: 'POST /api/calavera/generate',
      seanceChannel: 'POST /api/seance/channel',
      seanceLogs: '/api/seance/logs',
      ttsSpeak: 'POST /api/tts/speak',
      settingsElevenLabs: 'POST /api/settings/elevenlabs',
    },
  });
});

// Health check endpoint for Render Web Service Blueprint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'memento-viva',
    platform: 'Render',
  });
});

// Comprehensive system status covering the 5 sponsor categories
app.get('/api/status', async (req, res) => {
  const gemmaHealth = await checkGemmaHealth();
  const elevenHealth = await checkElevenLabsHealth();
  const ofrendas = await getAllOfrendas();

  const status: SystemStatus = {
    gemma: {
      status: gemmaHealth.available ? 'connected' : 'offline',
      mode: gemmaHealth.mode as any,
      model: gemmaHealth.model,
      details: gemmaHealth.details,
    },
    mongo: {
      status: isMongoConnected() ? 'connected' : 'in-memory',
      database: process.env.MONGODB_DB_NAME || 'memento_viva',
      itemCount: ofrendas.length,
    },
    elevenlabs: {
      status: elevenHealth.configured ? 'configured' : 'web-audio-fallback',
      voiceId: elevenHealth.voiceId,
    },
    mastra: {
      agents: mastraHub.getRegistry().map(a => a.id),
      version: mastraHub.version,
    },
  };

  res.json(status);
});

// ====================================================================
// DÍA DE LOS MUERTOS: OFRENDA & CALAVERA ROUTES
// ====================================================================

// Get all ofrendas
app.get('/api/ofrendas', async (req, res) => {
  try {
    const list = await getAllOfrendas();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve ofrendas', details: (error as Error).message });
  }
});

// Create new ofrenda
app.post('/api/ofrendas', async (req, res) => {
  try {
    const { personName, relationship, birthYear, passedYear, story, photoUrl, favoriteThings, offerings } = req.body;
    if (!personName) {
      return res.status(400).json({ error: 'personName is required' });
    }

    const created = await addOfrenda({
      personName,
      relationship: relationship || 'Cherished Soul',
      birthYear: birthYear || '',
      passedYear: passedYear || '',
      story: story || '',
      photoUrl: photoUrl || '',
      favoriteThings: Array.isArray(favoriteThings) ? favoriteThings : (favoriteThings ? [favoriteThings] : []),
      offerings: Array.isArray(offerings) ? offerings : ['candle', 'cempasuchil'],
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ofrenda', details: (error as Error).message });
  }
});

// Light a candle on an ofrenda
app.post('/api/ofrendas/:id/candle', async (req, res) => {
  try {
    const { id } = req.params;
    const count = await lightCandleOnOfrenda(id);
    res.json({ success: true, id, candlesCount: count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to light candle', details: (error as Error).message });
  }
});

// Generate a traditional Calavera Literaria with Mastra + Gemma 2
app.post('/api/calavera/generate', async (req, res) => {
  try {
    const { name, relationship, story, favoriteThings, offerings, tone, ofrendaId } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required to write a Calavera' });
    }

    const result = await mastraHub.agents.calaveraAgent.execute({
      name,
      relationship: relationship || 'Beloved Ancestor',
      story: story || 'A life remembered with love and devotion',
      favoriteThings: favoriteThings || ['marigolds', 'music'],
      offerings: offerings || ['cempasuchil', 'candle'],
      tone: tone || 'festive',
    });

    if (ofrendaId && result.poem) {
      await updateCalaveraPoem(ofrendaId, result.poem, result.modelUsed);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Calavera generation failed', details: (error as Error).message });
  }
});

// Get folklore symbols & Mesoamerican traditions
app.get('/api/folklore', (req, res) => {
  res.json(mastraHub.tools.getAllSymbols());
});

// ====================================================================
// HALLOWEEN SÉANCE: EVP SPIRIT BOX & HAUNTED TERMINAL ROUTES
// ====================================================================

// Channel supernatural presence using Mastra + Gemma 2
app.post('/api/seance/channel', async (req, res) => {
  try {
    const { question, frequency, emfReading } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'A question must be asked to the threshold' });
    }

    const freqNumber = parseFloat(frequency) || (88.0 + Math.random() * 20.0);
    const result = await mastraHub.agents.spiritBoxAgent.execute({
      question,
      frequency: Math.round(freqNumber * 10) / 10,
      emfReading: parseFloat(emfReading) || undefined,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Séance channeling disrupted by interference', details: (error as Error).message });
  }
});

// Retrieve recent spirit box logs
app.get('/api/seance/logs', async (req, res) => {
  try {
    const logs = await getRecentSeances();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve séance logs', details: (error as Error).message });
  }
});

// ====================================================================
// VOICE & AUDIO SYNTHESIS (ELEVENLABS)
// ====================================================================

app.post('/api/tts/speak', async (req, res) => {
  try {
    const { text, voiceId, apiKey } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for vocalization' });
    }

    const result = await synthesizeVoiceWithElevenLabs(text, voiceId, apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Audio synthesis failed', details: (error as Error).message });
  }
});

// Check server ElevenLabs key status
app.get('/api/settings/elevenlabs', (req, res) => {
  res.json(getRuntimeElevenLabsConfig());
});

// Dynamic configuration endpoint for setting ElevenLabs keys via UI
app.post('/api/settings/elevenlabs', (req, res) => {
  const { apiKey, voiceId } = req.body;
  if (apiKey) {
    if (!apiKey.trim().startsWith('sk_')) {
      return res.status(400).json({ 
        error: "ElevenLabs API keys must start with 'sk_'. You pasted the Key ID. In ElevenLabs, click '+ Create API Key' and copy the secret key." 
      });
    }
    setRuntimeElevenLabsKey(apiKey, voiceId);
    return res.json({ success: true, message: 'ElevenLabs configuration permanently saved to .env' });
  }
  res.status(400).json({ error: 'apiKey is required' });
});

// Dynamic configuration endpoint for connecting MongoDB Atlas via UI
app.post('/api/settings/mongo', async (req, res) => {
  const { uri, database } = req.body;
  if (!uri) {
    return res.status(400).json({ error: 'MongoDB connection URI is required' });
  }
  const result = await connectRuntimeMongo(uri, database);
  if (result.success) {
    return res.json({ success: true, message: result.message });
  }
  res.status(500).json({ error: result.message });
});

// Sound effects route powered by ElevenLabs Sound Generation API
app.post('/api/audio/sound-effect', async (req, res) => {
  const { type = 'owl', prompt, duration = 3.5 } = req.body;
  try {
    if (!elevenLabsClient.hasKey()) {
      return res.status(503).json({ error: 'ElevenLabs key not configured on server', fallbackToWebAudio: true });
    }

    let buffer: Buffer;
    if (type === 'owl') {
      buffer = await elevenLabsClient.generateOwlHoot();
    } else if (type === 'bat') {
      buffer = await elevenLabsClient.generateBatSwarm();
    } else {
      buffer = await elevenLabsClient.generateSoundEffect({ text: prompt || 'supernatural sound', durationSeconds: duration });
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=86400'
    });
    return res.send(buffer);
  } catch (error) {
    console.warn('ElevenLabs sound effect error, prompting fallback:', (error as Error).message);
    return res.status(500).json({ error: (error as Error).message, fallbackToWebAudio: true });
  }
});

// ====================================================================
// STATIC FILE SERVING FOR PRODUCTION (RENDER / DOCKER)
// ====================================================================

function resolveDistDir(): string {
  const candidate1 = path.resolve(__dirname, '../dist'); // dev with tsx: server/ -> dist/
  const candidate2 = path.resolve(__dirname, '..');      // prod compiled: dist/server/ -> dist/
  const candidate3 = path.resolve(__dirname, '../../dist');

  if (fs.existsSync(path.join(candidate2, 'index.html'))) return candidate2;
  if (fs.existsSync(path.join(candidate1, 'index.html'))) return candidate1;
  if (fs.existsSync(path.join(candidate3, 'index.html'))) return candidate3;
  return candidate1;
}

const clientDist = resolveDistDir();
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      // In development, Vite dev server handles index.html
      res.status(200).send('Memento Viva API Server running. Open Vite frontend at http://localhost:5173');
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🕯️ MEMENTO VIVA PORTAL AWAKENED ON PORT ${PORT}`);
  console.log(`💀 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌟 Hacktoberfest 2026: Ghost in the Machine`);
  console.log(`🌐 Web Application: http://localhost:${PORT}`);
  console.log(`🔗 API Base:        http://localhost:${PORT}/api\n`);
});
