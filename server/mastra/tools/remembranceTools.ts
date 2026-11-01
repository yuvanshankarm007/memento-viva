/**
 * Mastra Agent Tools - Remembrance & Folklore Engine
 * Category: Best Use of Mastra (Hacktoberfest 2026 Week 4)
 * 
 * Powered by @mastra/core/tools and Zod schemas for authentic Mesoamerican symbol lookup.
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export interface FolkloreSymbol {
  name: string;
  nuhuMeaning: string;
  element: 'earth' | 'wind' | 'fire' | 'water';
  lore: string;
}

export const FOLKLORE_SYMBOLS: Record<string, FolkloreSymbol> = {
  cempasuchil: {
    name: 'Cempasúchil (Flor de Muerto / Marigold)',
    nuhuMeaning: 'The 20-petaled golden flower that captures the scent and warmth of the sun.',
    element: 'earth',
    lore: 'Its vibrant orange petals are scattered in paths from cemetery gates to household altars so returning souls can find their way home by scent and color.',
  },
  copal: {
    name: 'Copal Incense',
    nuhuMeaning: 'Sacred aromatic tree resin used since pre-Hispanic Mesoamerica.',
    element: 'wind',
    lore: 'Rising fragrant smoke carries prayers to the heavens and cleanses the altar space of wandering malevolent energies.',
  },
  pan_de_muerto: {
    name: 'Pan de Muerto (Bread of the Dead)',
    nuhuMeaning: 'Sweet brioche topped with crossbone shapes and round teardrop tears.',
    element: 'earth',
    lore: 'Represents the cycle of life and death, nourishing souls after their long journey from the Mictlán.',
  },
  candle: {
    name: 'Veladora (Altar Candle)',
    nuhuMeaning: 'Light, faith, and hope illuminating the darkness.',
    element: 'fire',
    lore: 'Each candle lit guides a specific soul; four main candles face the cardinal directions to anchor the spirit portal.',
  },
  sugar_skull: {
    name: 'Calavera de Azúcar (Sugar Skull)',
    nuhuMeaning: 'Whimsical depiction of death bearing the name of the living or dead on its forehead.',
    element: 'earth',
    lore: 'Reminds us that death is not a grim finality to dread, but a sweet and inevitable waltz in the rhythm of existence.',
  },
  water: {
    name: 'Vaso de Agua (Vessel of Fresh Water)',
    nuhuMeaning: 'Purity and thirst-quenching replenishment.',
    element: 'water',
    lore: 'Offered to quench the great thirst of souls after their arduous voyage across the rivers of the underworld.',
  },
};

export function getSymbolLore(symbolKey: string): FolkloreSymbol | undefined {
  return FOLKLORE_SYMBOLS[symbolKey.toLowerCase()];
}

export function getAllSymbols(): FolkloreSymbol[] {
  return Object.values(FOLKLORE_SYMBOLS);
}

/**
 * Mastra Tool: Look up specific Mesoamerican folklore symbol lore
 */
export const folkloreLookupTool = createTool({
  id: 'folklore-lookup',
  description: 'Looks up Mesoamerican and Aztec folklore symbols and traditions for Día de los Muertos offerings',
  inputSchema: z.object({
    symbolKey: z.string().describe('Key of the symbol, e.g. cempasuchil, copal, pan_de_muerto, candle, sugar_skull, water'),
  }),
  outputSchema: z.object({
    name: z.string(),
    nuhuMeaning: z.string(),
    element: z.enum(['earth', 'wind', 'fire', 'water']),
    lore: z.string(),
  }).optional(),
  execute: async ({ context }) => {
    return getSymbolLore(context.symbolKey);
  },
});

/**
 * Mastra Tool: Retrieve the entire pantheon of altar symbols
 */
export const allSymbolsTool = createTool({
  id: 'all-symbols-catalog',
  description: 'Retrieves all traditional Día de los Muertos altar offerings and their Aztec elemental associations',
  inputSchema: z.object({}),
  outputSchema: z.array(
    z.object({
      name: z.string(),
      nuhuMeaning: z.string(),
      element: z.enum(['earth', 'wind', 'fire', 'water']),
      lore: z.string(),
    })
  ),
  execute: async () => {
    return getAllSymbols();
  },
});
