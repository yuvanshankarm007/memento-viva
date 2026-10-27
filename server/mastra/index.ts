/**
 * Mastra Agent Hub
 * Category: Best Use of Mastra (Hacktoberfest 2026 Week 4)
 * 
 * Provides unified agent registry and workflow execution for Memento Viva.
 */

import { calaveraAgent } from './agents/calaveraAgent.js';
import { spiritBoxAgent } from './agents/spiritBoxAgent.js';
import { getAllSymbols } from './tools/remembranceTools.js';

export const mastraHub = {
  version: '1.0.0',
  agents: {
    calaveraAgent,
    spiritBoxAgent,
  },
  tools: {
    getAllSymbols,
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
