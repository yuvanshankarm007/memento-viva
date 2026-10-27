import React from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Server, Volume2, Database, Shield, ExternalLink } from 'lucide-react';
import { SystemStatus } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SystemStatus | null;
  onRefreshStatus: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, status, onRefreshStatus }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[92vh] overflow-y-auto font-mono text-xs md:text-sm text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                System Diagnostics & Sponsor Integrations
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Hacktoberfest 2026 Week 4 DEV Challenge Architecture Status
            </p>
          </div>
          <button
            onClick={onRefreshStatus}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Sponsor Grid */}
        <div className="space-y-4">
          {/* 1. Google Gemma Open-Weight Model */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Featured Category: Best Use of Gemma (Google)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/40 text-amber-200 border border-amber-600/50">
                Mode: {status?.gemma.mode || 'ollama'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              {status?.gemma.details || 'Powers the Calavera Literaria Poet and the Haunted Shell spirit channeler.'}
            </p>
            <div className="text-[11px] text-amber-400/80 bg-black/50 p-2.5 rounded-lg border border-amber-900/40">
              Active Model: <code className="text-amber-200">{status?.gemma.model || 'gemma2:2b'}</code>
              <br />
              Local Command: <code className="text-slate-400">ollama run gemma2:2b</code>
            </div>
          </div>

          {/* 2. ElevenLabs Voice & Audio */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-purple-300 text-sm flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                Partner Category: Best Use of ElevenLabs
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded border ${
                status?.elevenlabs.status === 'configured'
                  ? 'bg-purple-900/40 text-purple-200 border-purple-600/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}>
                {status?.elevenlabs.status === 'configured' ? 'Neural API Connected' : 'Web Audio Fallback Active'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Generates breathy, ethereal spirit whispers and resonant ancestor readings. If no API key is supplied, automatically utilizes procedural Web Audio synthesis so the app remains 100% playable anywhere!
            </p>
            <div className="text-[11px] text-purple-300/80 bg-black/50 p-2.5 rounded-lg border border-purple-900/40">
              Active Voice ID: <code className="text-purple-200">{status?.elevenlabs.voiceId || '21m00Tcm4TlvDq8ikWAM (Rachel)'}</code>
            </div>
          </div>

          {/* 3. Mastra Open-Source Agent Framework */}
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-blue-300 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                Partner Category: Best Use of Mastra
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/40 text-blue-200 border border-blue-600/50">
                v{status?.mastra.version || '1.0.0'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Mastra orchestrates multi-agent pipelines with folklore memory lookup tools:
            </p>
            <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
              <li><code className="text-blue-300">CalaveraLiterariaAgent</code>: Synthesizes octosyllabic rhyming stanzas.</li>
              <li><code className="text-blue-300">SpiritBoxAgent</code>: Channels lingering ghosts with radio carrier sweeps.</li>
            </ul>
          </div>

          {/* 4. MongoDB Atlas */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Partner Category: Best Use of MongoDB Atlas
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded border ${
                status?.mongo.status === 'connected'
                  ? 'bg-emerald-900/40 text-emerald-200 border-emerald-600/50'
                  : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}>
                {status?.mongo.status === 'connected' ? 'Atlas Cluster Connected' : 'High-Speed In-Memory Store'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Stores global community ofrendas, candle light counters, and supernatural séance session logs.
            </p>
            <div className="text-[11px] text-emerald-400/80 bg-black/50 p-2.5 rounded-lg border border-emerald-900/40 flex justify-between">
              <span>Database: <code className="text-emerald-200">{status?.mongo.database}</code></span>
              <span>Total Altar Items: <code className="text-emerald-200">{status?.mongo.itemCount ?? 4}</code></span>
            </div>
          </div>

          {/* 5. Render */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Featured Category: Best Use of Render
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-200 border border-cyan-600/50">
                Blueprint Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Includes <code className="text-cyan-300">render.yaml</code> specification and multi-stage <code className="text-cyan-300">Dockerfile</code> for automated zero-downtime deployment to Render Web Services with health check at <code className="text-cyan-300">/api/health</code>.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition-all"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
