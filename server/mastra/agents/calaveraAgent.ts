/**
 * Mastra Agent: Calavera Literaria Poet
 * Category: Best Use of Mastra & Best Use of Gemma
 * 
 * Specializes in authoring authentic, lyrical Mexican Calaveras Literarias
 * honoring deceased persons, historical pioneers, and ancestral memories.
 */

import { generateCalaveraWithGemma } from '../../models/gemmaClient.js';
import { getSymbolLore } from '../tools/remembranceTools.js';

export interface CalaveraAgentInput {
  name: string;
  relationship: string;
  story: string;
  favoriteThings: string[];
  offerings?: string[];
  tone?: 'festive' | 'reverent' | 'humorous';
}

export class CalaveraLiterariaAgent {
  public readonly name = 'CalaveraLiterariaAgent';
  public readonly role = 'Poeta del Mictlán';
  public readonly description = 'Orchestrates traditional Mexican poetic epitaphs honoring ancestors on Día de los Muertos using Google Gemma 2.';

  async execute(input: CalaveraAgentInput) {
    // Enrich with symbolic folklore tools
    const enrichedOfferings = (input.offerings || []).map(offeringKey => {
      const lore = getSymbolLore(offeringKey);
      return lore ? `${lore.name}: ${lore.lore}` : offeringKey;
    });

    const enrichedFavorites = [...input.favoriteThings];
    if (enrichedOfferings.length > 0) {
      enrichedFavorites.push(enrichedOfferings[0]);
    }

    // Call Gemma open-weight model engine
    const result = await generateCalaveraWithGemma({
      name: input.name,
      relationship: input.relationship,
      story: input.story,
      favoriteThings: enrichedFavorites,
      tone: input.tone,
    });

    return {
      success: true,
      agent: this.name,
      poem: result.poem,
      modelUsed: result.modelUsed,
      source: result.source,
      timestamp: new Date().toISOString(),
    };
  }
}

export const calaveraAgent = new CalaveraLiterariaAgent();
