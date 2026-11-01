/**
 * Mastra Agent Hub
 * Category: Best Use of Mastra (Hacktoberfest 2026 Week 4)
 * 
 * Provides unified Mastra instance, agent registry, and workflow execution for Memento Viva.
 */

import { Mastra } from '@mastra/core';

// Silence telemetry warning for self-contained runtime
(globalThis as any).___MASTRA_TELEMETRY___ = true;

import { calaveraAgent, nativeCalaveraAgent } from './agents/calaveraAgent.js';
import { spiritBoxAgent, nativeSpiritBoxAgent } from './agents/spiritBoxAgent.js';
import { getAllSymbols, folkloreLookupTool, allSymbolsTool } from './tools/remembranceTools.js';

/**
 * Official Mastra Core Instance
 */
export const mastra = new Mastra({
  agents: {
    CalaveraLiterariaAgent: nativeCalaveraAgent,
    SpiritBoxAgent: nativeSpiritBoxAgent,
  },
});

export const mastraHub = {
  version: '1.81.0',
  mastra,
  agents: {
    calaveraAgent,
    spiritBoxAgent,
  },
  tools: {
    getAllSymbols,
    folkloreLookupTool,
    allSymbolsTool,
  },
  getRegistry() {
    return [
      {
        id: calaveraAgent.name,
        role: calaveraAgent.role,
        description: calaveraAgent.description,
      },
      {
        id: spiritBoxAgent.name,
        role: spiritBoxAgent.role,
        description: spiritBoxAgent.description,
      },
    ];
  },
};
