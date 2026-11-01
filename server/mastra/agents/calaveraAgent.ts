/**
 * Mastra Agent: Calavera Literaria Poet
 * Category: Best Use of Mastra & Best Use of Gemma
 * 
 * Built with @mastra/core Agent architecture, equipped with Aztec folklore tools
 * and powered by Google Gemma 2 open weights.
 */

import { Agent } from '@mastra/core';
import { generateCalaveraWithGemma } from '../../models/gemmaClient.js';
import { folkloreLookupTool, getSymbolLore } from '../tools/remembranceTools.js';

export interface CalaveraAgentInput {
  name: string;
  relationship: string;
  story: string;
  favoriteThings: string[];
  offerings?: string[];
  tone?: 'festive' | 'reverent' | 'humorous';
}

/**
 * Native Mastra Agent instance configured with system prompt, model definition, and remembrance tools
 */
export const nativeCalaveraAgent = new Agent({
  name: 'CalaveraLiterariaAgent',
  instructions: `You are an authentic Mexican Calavera Literaria poet honoring the spirit of the deceased on Día de los Muertos.
A Calavera Literaria is an authentic, satirical, rhythmic poem composed of 4-line octosyllabic stanzas (redondillas or cuartetas) with AABB or ABAB rhyme.
It traditionally features "La Muerte", "La Catrina", or "La Huesuda" visiting the person, playfully teasing their habits or passions, but celebrating their enduring memory with warmth and honor.`,
  model: {
    id: 'google/gemma-2-2b-it',
  },
  tools: {
    folkloreLookup: folkloreLookupTool,
  },
});

export class CalaveraLiterariaAgent {
  public readonly name = 'CalaveraLiterariaAgent';
  public readonly role = 'Poeta del Mictlán';
  public readonly description = 'Orchestrates traditional Mexican poetic epitaphs honoring ancestors on Día de los Muertos using Mastra and Google Gemma 2.';
  public readonly mastraAgent = nativeCalaveraAgent;

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
