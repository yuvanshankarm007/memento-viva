export interface OfrendaItem {
  id: string;
  personName: string;
  relationship: string;
  birthYear?: string;
  passedYear?: string;
  story: string;
  photoUrl?: string;
  favoriteThings?: string[];
  offerings: string[]; // e.g., ['candle', 'cempasuchil', 'pan_de_muerto', 'copal', 'sugar_skull']
  candlesCount: number;
  calaveraPoem?: string;
  calaveraAuthor?: string;
  createdAt: string;
}

export interface SeanceLog {
  id: string;
  question: string;
  spiritName?: string;
  response: string;
  frequency: number;
  emfLevel: number;
  timestamp: string;
}

export interface SystemStatus {
  gemma: {
    status: 'connected' | 'offline' | 'fallback';
    mode: 'ollama' | 'huggingface' | 'fallback';
    model: string;
    details?: string;
  };
  mongo: {
    status: 'connected' | 'in-memory';
    database: string;
    itemCount: number;
  };
  elevenlabs: {
    status: 'configured' | 'web-audio-fallback';
    voiceId: string;
  };
  mastra: {
    agents: string[];
    version: string;
  };
}
