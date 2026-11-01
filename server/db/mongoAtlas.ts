import { MongoClient, Db, Collection } from 'mongodb';
import { OfrendaItem, SeanceLog } from '../types.js';

let db: Db | null = null;
let client: MongoClient | null = null;
let isConnected = false;

// Default initial ofrendas honoring legendary figures in culture & computing
const INITIAL_OFRENDAS: OfrendaItem[] = [
  {
    id: 'frida-kahlo',
    personName: 'Frida Kahlo',
    relationship: 'Visionary Artist & Cultural Icon',
    birthYear: '1907',
    passedYear: '1954',
    story: 'Pioneering painter whose vibrant self-portraits explored identity, passion, Mexican folk heritage, and profound resilience in the face of pain.',
    photoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    favoriteThings: ['Copal incense', 'Marigolds', 'Vibrant paints', 'Tequila'],
    offerings: ['cempasuchil', 'candle', 'copal', 'sugar_skull', 'pan_de_muerto'],
    candlesCount: 142,
    calaveraPoem: 
`Llegó la Catrina al taller de Coyoacán,
buscando colores que en el lienzo están.
"Deja las brochas, mi querida Frida,
que en el Mictlán tu arte nunca se olvida!"`,
    calaveraAuthor: 'Gemma 2 Open-Weight Poet',
    createdAt: new Date('2026-10-26T12:00:00Z').toISOString(),
  },
  {
    id: 'alan-turing',
    personName: 'Alan Turing',
    relationship: 'Father of Modern Computing & Cryptanalysis',
    birthYear: '1912',
    passedYear: '1954',
    story: 'Brilliant mathematician and codebreaker who unraveled the Enigma cipher and conceived the foundations of artificial intelligence and universal computing machines.',
    photoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    favoriteThings: ['Mathematical puzzles', 'Apples', 'Enigma rotors', 'Long distance running'],
    offerings: ['candle', 'cempasuchil', 'pan_de_muerto'],
    candlesCount: 89,
    calaveraPoem:
`La Muerte en su lógica un código inventó,
pero ante Alan Turing su cálculo falló.
"Tus máquinas piensan", la Huesuda exclamó,
y al gran matemático a cenar invitó.`,
    calaveraAuthor: 'Gemma 2 Open-Weight Poet',
    createdAt: new Date('2026-10-26T14:30:00Z').toISOString(),
  },
  {
    id: 'nikola-tesla',
    personName: 'Nikola Tesla',
    relationship: 'Pioneer of Alternating Current & Wireless Wonders',
    birthYear: '1856',
    passedYear: '1943',
    story: 'Visionary engineer whose discoveries in electromagnetism, radio transmission, and AC power illuminated the modern electrified world.',
    photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    favoriteThings: ['Lightning coils', 'Pigeons', 'Number 3, 6, 9', 'Black coffee'],
    offerings: ['candle', 'copal', 'sugar_skull'],
    candlesCount: 114,
    calaveraPoem:
`Relámpagos danzan en la noche fría,
la Muerte buscando a quien luz producía.
"Ven Tesla querido, sin cables ni error,
enciende en el cielo un rayo mejor!"`,
    calaveraAuthor: 'Gemma 2 Open-Weight Poet',
    createdAt: new Date('2026-10-26T16:00:00Z').toISOString(),
  },
  {
    id: 'sor-juana',
    personName: 'Sor Juana Inés de la Cruz',
    relationship: 'The Tenth Muse & Baroque Literary Titan',
    birthYear: '1648',
    passedYear: '1695',
    story: 'Courageous Mexican scholar, poet, and philosopher who fearlessly defended women’s right to education and intellectual pursuit.',
    photoUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
    favoriteThings: ['Library of manuscripts', 'Quill and ink', 'Sweet Mexican chocolate'],
    offerings: ['cempasuchil', 'candle', 'pan_de_muerto', 'copal'],
    candlesCount: 76,
    calaveraPoem:
`Hombres necios que acusáis a la Parca sin razón,
dijo Sor Juana con rima y con devoción.
La Muerte encantada leyó su soneto,
y guardó a la musa con hondo respeto.`,
    calaveraAuthor: 'Gemma 2 Open-Weight Poet',
    createdAt: new Date('2026-10-26T18:00:00Z').toISOString(),
  }
];

// In-memory store fallback
let memoryOfrendas: OfrendaItem[] = [...INITIAL_OFRENDAS];
let memorySeances: SeanceLog[] = [
  {
    id: 'seance-001',
    question: 'Are there spirits listening on this frequency?',
    spiritName: 'Echo of 1954',
    response: 'THE ELECTRONS HUM... WE PERSIST BEYOND THE SILICON COLD... KEEP THE LIGHT BURNING...',
    frequency: 94.7,
    emfLevel: 4.8,
    timestamp: new Date('2026-10-27T10:00:00Z').toISOString(),
  }
];

export async function initMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️ [MongoDB Atlas] No MONGODB_URI provided. Running in high-performance in-memory mode.');
    return false;
  }

  try {
    console.log('🔄 [MongoDB Atlas] Connecting to cluster...');
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const dbName = process.env.MONGODB_DB_NAME || 'memento_viva';
    db = client.db(dbName);
    isConnected = true;
    console.log(`✅ [MongoDB Atlas] Connected successfully to database: "${dbName}"`);

    // Ensure collections and initial seed if empty
    const ofrendasCol = db.collection<OfrendaItem>('ofrendas');
    const count = await ofrendasCol.countDocuments();
    if (count === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial ofrenda memorials...');
      await ofrendasCol.insertMany(INITIAL_OFRENDAS);
    }
    return true;
  } catch (error) {
    console.warn('⚠️ [MongoDB Atlas] Connection failed, falling back to in-memory store:', (error as Error).message);
    isConnected = false;
    return false;
  }
}

export function isMongoConnected(): boolean {
  return isConnected;
}

export async function connectRuntimeMongo(uri: string, customDbName?: string): Promise<{ success: boolean; message: string }> {
  try {
    if (client) {
      try { await client.close(); } catch {}
    }
    client = new MongoClient(uri.trim(), { serverSelectionTimeoutMS: 6000 });
    await client.connect();
    const dbName = customDbName || process.env.MONGODB_DB_NAME || 'memento_viva';
    db = client.db(dbName);
    isConnected = true;

    // Persist to .env permanently on disk
    try {
      const fs = await import('fs');
      const path = await import('path');
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        let content = fs.readFileSync(envPath, 'utf8');
        const regex = /^MONGODB_URI=.*$/m;
        if (regex.test(content)) {
          content = content.replace(regex, `MONGODB_URI=${uri.trim()}`);
        } else {
          content += `\nMONGODB_URI=${uri.trim()}`;
        }
        fs.writeFileSync(envPath, content, 'utf8');
      }
    } catch {}

    const ofrendasCol = db.collection<OfrendaItem>('ofrendas');
    const count = await ofrendasCol.countDocuments();
    if (count === 0) {
      await ofrendasCol.insertMany(INITIAL_OFRENDAS);
    }
    return { success: true, message: `Connected to database: ${dbName}` };
  } catch (err) {
    isConnected = false;
    return { success: false, message: (err as Error).message };
  }
}

export async function getAllOfrendas(): Promise<OfrendaItem[]> {
  if (isConnected && db) {
    try {
      const col = db.collection<OfrendaItem>('ofrendas');
      return await col.find({}).sort({ createdAt: -1 }).toArray();
    } catch (e) {
      console.error('MongoDB read error, using memory store', e);
    }
  }
  return [...memoryOfrendas].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addOfrenda(item: Omit<OfrendaItem, 'id' | 'candlesCount' | 'createdAt'>): Promise<OfrendaItem> {
  const newItem: OfrendaItem = {
    ...item,
    id: 'ofrenda-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    candlesCount: 1,
    createdAt: new Date().toISOString(),
  };

  if (isConnected && db) {
    try {
      const col = db.collection<OfrendaItem>('ofrendas');
      await col.insertOne(newItem);
      return newItem;
    } catch (e) {
      console.error('MongoDB insert error, writing to memory store', e);
    }
  }

  memoryOfrendas.unshift(newItem);
  return newItem;
}

export async function lightCandleOnOfrenda(id: string): Promise<number> {
  if (isConnected && db) {
    try {
      const col = db.collection<OfrendaItem>('ofrendas');
      const res = await col.findOneAndUpdate(
        { id },
        { $inc: { candlesCount: 1 } },
        { returnDocument: 'after' }
      );
      if (res && res.candlesCount) return res.candlesCount;
    } catch (e) {
      console.error('MongoDB candle update error', e);
    }
  }

  const found = memoryOfrendas.find(o => o.id === id);
  if (found) {
    found.candlesCount += 1;
    return found.candlesCount;
  }
  return 1;
}

export async function updateCalaveraPoem(id: string, poem: string, author: string): Promise<boolean> {
  if (isConnected && db) {
    try {
      const col = db.collection<OfrendaItem>('ofrendas');
      await col.updateOne({ id }, { $set: { calaveraPoem: poem, calaveraAuthor: author } });
      return true;
    } catch (e) {
      console.error('MongoDB update calavera error', e);
    }
  }

  const found = memoryOfrendas.find(o => o.id === id);
  if (found) {
    found.calaveraPoem = poem;
    found.calaveraAuthor = author;
    return true;
  }
  return false;
}

export async function recordSeance(seance: Omit<SeanceLog, 'id' | 'timestamp'>): Promise<SeanceLog> {
  const newLog: SeanceLog = {
    ...seance,
    id: 'seance-' + Date.now(),
    timestamp: new Date().toISOString(),
  };

  if (isConnected && db) {
    try {
      const col = db.collection<SeanceLog>('seances');
      await col.insertOne(newLog);
      return newLog;
    } catch (e) {
      console.error('MongoDB seance log error', e);
    }
  }

  memorySeances.unshift(newLog);
  if (memorySeances.length > 50) memorySeances.pop();
  return newLog;
}

export async function getRecentSeances(): Promise<SeanceLog[]> {
  if (isConnected && db) {
    try {
      const col = db.collection<SeanceLog>('seances');
      return await col.find({}).sort({ timestamp: -1 }).limit(20).toArray();
    } catch (e) {
      console.error('MongoDB get seances error', e);
    }
  }
  return [...memorySeances];
}
