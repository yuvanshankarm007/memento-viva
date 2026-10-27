/**
 * ElevenLabs Voice & EVP Audio Client
 * Category: Best Use of ElevenLabs (Hacktoberfest 2026 Week 4)
 * 
 * Generates ethereal spirit whispers and ancestral voices using ElevenLabs TTS API,
 * with graceful fallback to browser Web Audio DSP synthesis.
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
      details: 'Connected to ElevenLabs Voice API. Ethereal spirit narration active.',
    };
  }
  return {
    configured: false,
    voiceId: config.defaultVoiceId,
    details: 'Operating in procedural Web Audio + SpeechSynthesis mode. Add ELEVENLABS_API_KEY in settings or .env to activate neural voices.',
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
