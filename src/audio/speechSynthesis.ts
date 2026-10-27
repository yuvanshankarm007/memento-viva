/**
 * Voice & Spirit Audio Channeler
 * Category: Best Use of ElevenLabs (Hacktoberfest 2026 Week 4)
 * 
 * Plays high-fidelity ElevenLabs neural voice audio stream,
 * with fallback to Web Speech API when operating in offline/demo mode.
 */

export async function speakSpokenText(
  text: string,
  options?: {
    voiceId?: string;
    rate?: number;
    pitch?: number;
    isSpooky?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
  }
): Promise<void> {
  const { voiceId, rate = 0.9, pitch = 0.85, isSpooky = false, onStart, onEnd } = options || {};

  // Clean text of markdown or stage direction cues like [STATIC]
  const spokenText = text.replace(/\[.*?\]/g, '').replace(/[*_#]/g, '').trim();
  if (!spokenText) return;

  onStart?.();

  try {
    // 1. Attempt ElevenLabs synthesis via backend
    const res = await fetch('/api/tts/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: spokenText, voiceId }),
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.useFallback && data.audioBase64) {
        const audio = new Audio(`data:${data.contentType || 'audio/mpeg'};base64,${data.audioBase64}`);
        audio.onended = () => onEnd?.();
        audio.onerror = () => onEnd?.();
        await audio.play();
        return;
      }
    }
  } catch {
    // Continue to browser fallback
  }

  // 2. Browser SpeechSynthesis Fallback
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = isSpooky ? 0.8 : rate;
    utterance.pitch = isSpooky ? 0.7 : pitch;

    const voices = window.speechSynthesis.getVoices();
    // Prefer English/Spanish expressive voices if available
    const preferred = voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Natural') || 
      v.name.includes('Daniel') || 
      v.name.includes('Paulina')
    ) || voices[0];

    if (preferred) {
      utterance.voice = preferred;
    }

    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
  } else {
    onEnd?.();
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
