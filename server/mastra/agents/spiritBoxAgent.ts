/**
 * Mastra Agent: Spirit Box EVP Channeler
 * Category: Best Use of Mastra, Best Use of Gemma, & Best Use of ElevenLabs
 * 
 * Channels supernatural frequencies, decodes paranormal questions, and
 * interfaces with lingering entities through open-weight AI and Mastra Agent architecture.
 */

import { Agent } from '@mastra/core';
import { channelSpiritBoxWithGemma } from '../../models/gemmaClient.js';
import { recordSeance } from '../../db/mongoAtlas.js';
import { allSymbolsTool } from '../tools/remembranceTools.js';

export interface SpiritBoxInput {
  question: string;
  frequency: number; // e.g., 87.5 - 108.0 MHz
  emfReading?: number;
}

/**
 * Native Mastra Agent instance configured with system prompt, model definition, and séance tools
 */
export const nativeSpiritBoxAgent = new Agent({
  name: 'SpiritBoxAgent',
  instructions: `You are a lingering presence speaking through an EVP (Electronic Voice Phenomenon) Spirit Box radio scanner.
You speak through electromagnetic static, broken radio carrier waves, and flickering CRT phosphor.
Your message is poetic, haunting, cryptic yet emotionally poignant—a ghost in the machine bridging the mortal realm and eternity.`,
  model: {
    id: 'google/gemma-2-2b-it',
  },
  tools: {
    symbolsCatalog: allSymbolsTool,
  },
});

export class SpiritBoxAgent {
  public readonly name = 'SpiritBoxAgent';
  public readonly role = 'Spectral Medium & EVP Decoder';
  public readonly description = 'Scans radio carrier waves and channels open-weight intelligence from the void into human-audible transmissions.';
  public readonly mastraAgent = nativeSpiritBoxAgent;

  async execute(input: SpiritBoxInput) {
    const rawEmf = input.emfReading ?? (1.2 + Math.random() * 3.8);
    const roundedEmf = Math.round(rawEmf * 10) / 10;

    // Execute Gemma spectral model
    const gemmaResult = await channelSpiritBoxWithGemma({
      question: input.question,
      frequency: input.frequency,
    });

    // Record séance in MongoDB Atlas
    const log = await recordSeance({
      question: input.question,
      spiritName: gemmaResult.entityName,
      response: gemmaResult.response,
      frequency: input.frequency,
      emfLevel: roundedEmf,
    });

    return {
      success: true,
      agent: this.name,
      spiritName: gemmaResult.entityName,
      response: gemmaResult.response,
      frequency: input.frequency,
      emfLevel: roundedEmf,
      modelUsed: gemmaResult.modelUsed,
      sessionId: log.id,
      timestamp: log.timestamp,
    };
  }
}

export const spiritBoxAgent = new SpiritBoxAgent();
