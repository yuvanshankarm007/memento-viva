import { OfrendaItem, SeanceLog, SystemStatus, FolkloreItem } from '../types';

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function fetchOfrendas(): Promise<OfrendaItem[]> {
  const res = await fetch('/api/ofrendas');
  if (!res.ok) throw new Error('Failed to fetch ofrendas');
  return res.json();
}

export async function createOfrenda(data: Partial<OfrendaItem>): Promise<OfrendaItem> {
  const res = await fetch('/api/ofrendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create ofrenda');
  return res.json();
}

export async function lightCandle(ofrendaId: string): Promise<number> {
  const res = await fetch(`/api/ofrendas/${ofrendaId}/candle`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to light candle');
  const data = await res.json();
  return data.candlesCount;
}

export async function generateCalavera(params: {
  name: string;
  relationship: string;
  story: string;
  favoriteThings: string[];
  offerings?: string[];
  tone?: string;
  ofrendaId?: string;
}): Promise<{ poem: string; modelUsed: string; source: string }> {
  const res = await fetch('/api/calavera/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Calavera generation failed');
  return res.json();
}

export async function channelSpirit(params: {
  question: string;
  frequency: number;
  emfReading?: number;
}): Promise<{
  spiritName: string;
  response: string;
  frequency: number;
  emfLevel: number;
  modelUsed: string;
  sessionId: string;
}> {
  const res = await fetch('/api/seance/channel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Spirit channeling disrupted');
  return res.json();
}

export async function fetchSeanceLogs(): Promise<SeanceLog[]> {
  const res = await fetch('/api/seance/logs');
  if (!res.ok) throw new Error('Failed to fetch séance logs');
  return res.json();
}

export async function fetchFolklore(): Promise<FolkloreItem[]> {
  const res = await fetch('/api/folklore');
  if (!res.ok) throw new Error('Failed to fetch folklore');
  return res.json();
}
