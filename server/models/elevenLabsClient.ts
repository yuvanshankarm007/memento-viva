/**
 * ElevenLabs Voice, EVP & Sound Effects Client
 * Category: Best Use of ElevenLabs (Hacktoberfest 2026 Week 4)
 * 
 * 1. Generates ethereal spirit whispers and ancestral voices using ElevenLabs TTS API
 * 2. Generates hyper-realistic nocturnal fauna (Owl / Tecolote, Bat / Murciélago) using Sound Generation API
 */

interface ElevenLabsConfig {
  apiKey?: string;
  defaultVoiceId: string;
}

const config: ElevenLabsConfig = {
  apiKey: process.env.ELEVENLABS_API_KEY,
  defaultVoiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Rachel / Ethereal Whisper
};

export async function checkElevenLabsHealth(): Promise<{
  configured: boolean;
  voiceId: string;
  details: string;
}> {
  if (config.apiKey) {
    return {
      configured: true,
      voiceId: config.defaultVoiceId,
      details: 'Connected to ElevenLabs Voice API. Ethereal spirit narration & sound effects active.',
    };
  }
  return {
    configured: false,
    voiceId: config.defaultVoiceId,
    details: 'Operating in procedural Web Audio + SpeechSynthesis mode. Add ELEVENLABS_API_KEY to activate neural voices and AI sound effects.',
  };
}

export async function synthesizeVoiceWithElevenLabs(text: string, voiceId?: string): Promise<{
  audioBase64?: string;
  contentType?: string;
  useFallback: boolean;
}> {
  const activeVoiceId = voiceId || config.defaultVoiceId;

  if (!config.apiKey) {
    return { useFallback: true };
  }

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${activeVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.35, // lower stability adds breathiness / ghostly quiver
          similarity_boost: 0.75,
          style: 0.6,
          use_speaker_boost: true,
        },
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const audioBase64 = buffer.toString('base64');
      return {
        audioBase64,
        contentType: 'audio/mpeg',
        useFallback: false,
      };
    } else {
      console.warn('ElevenLabs API request returned error status:', res.status);
    }
  } catch (error) {
    console.warn('ElevenLabs API error, activating fallback:', (error as Error).message);
  }

  return { useFallback: true };
}

// ====================================================================
// ELEVENLABS SOUND EFFECTS (SOUND GENERATION API)
// ====================================================================

export interface SoundEffectOptions {
  text: string;
  durationSeconds?: number;
  promptInfluence?: number;
}

export class ElevenLabsClient {
  private cache: Map<string, Buffer> = new Map();

  public hasKey(): boolean {
    return Boolean(config.apiKey && config.apiKey.trim().length > 0);
  }

  public async generateSoundEffect(options: SoundEffectOptions): Promise<Buffer> {
    const cacheKey = `${options.text}_${options.durationSeconds || 3}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (!this.hasKey()) {
      throw new Error('ElevenLabs API key is missing. Set ELEVENLABS_API_KEY environment variable.');
    }

    const payload = {
      text: options.text,
      duration_seconds: options.durationSeconds || 3.5,
      prompt_influence: options.promptInfluence ?? 0.35
    };

    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': config.apiKey!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ElevenLabs Sound API error (${response.status}): ${errText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    this.cache.set(cacheKey, buffer);
    return buffer;
  }

  public async generateOwlHoot(): Promise<Buffer> {
    return this.generateSoundEffect({
      text: 'Haunted Mexican barn owl hooting deep in a foggy ancient forest, eerie hollow vocal resonance and night wind echo',
      durationSeconds: 3.5
    });
  }

  public async generateBatSwarm(): Promise<Buffer> {
    return this.generateSoundEffect({
      text: 'Swarm of cave bats fluttering leathery wings with sharp high-frequency echolocation chirps inside a damp stone crypt',
      durationSeconds: 3.0
    });
  }
}

export const elevenLabsClient = new ElevenLabsClient();
