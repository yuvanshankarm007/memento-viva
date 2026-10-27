import React, { useState, useEffect } from 'react';
import { GatewayMode, OfrendaItem, SystemStatus } from './types';
import { fetchOfrendas, fetchSystemStatus } from './lib/api';
import { soundManager } from './audio/soundManager';

import { Header } from './components/Header';
import { GatewaySwitch } from './components/GatewaySwitch';
import { SettingsModal } from './components/SettingsModal';

// Ofrenda Components
import { MarigoldPetalCanvas } from './components/ofrenda/MarigoldPetalCanvas';
import { PapelPicadoBanner } from './components/ofrenda/PapelPicadoBanner';
import { OfrendaAltar } from './components/ofrenda/OfrendaAltar';
import { AddOfferingModal } from './components/ofrenda/AddOfferingModal';
import { FolkloreDrawer } from './components/ofrenda/FolkloreDrawer';

// Séance Components
import { CRTEffect } from './components/seance/CRTEffect';
import { SpiritBox } from './components/seance/SpiritBox';
import { OuijaBoard } from './components/seance/OuijaBoard';
import { HauntedTerminal } from './components/seance/HauntedTerminal';

export const App: React.FC = () => {
  const [mode, setMode] = useState<GatewayMode>('ofrenda');
  const [ofrendas, setOfrendas] = useState<OfrendaItem[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFolkloreOpen, setIsFolkloreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [lastSpiritSpoken, setLastSpiritSpoken] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [ofrendaList, status] = await Promise.all([
        fetchOfrendas().catch(() => []),
        fetchSystemStatus().catch(() => null),
      ]);
      setOfrendas(ofrendaList);
      setSystemStatus(status);
    } catch (e) {
      console.error('Failed to load initial data', e);
    }
  };

  useEffect(() => {
    loadData();
    soundManager.setMode(mode);
  }, []);

  const handleModeChange = (newMode: GatewayMode) => {
    setMode(newMode);
  };

  const isOfrenda = mode === 'ofrenda';

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${
      isOfrenda ? 'bg-gradient-to-b from-ofrenda-night via-[#120a1a] to-black text-amber-50' : 'bg-black text-emerald-50'
    }`}>
      {/* Background Ambience / Canvas */}
      {isOfrenda && <MarigoldPetalCanvas />}

      {/* Header */}
      <Header
        mode={mode}
        systemStatus={systemStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFolklore={() => setIsFolkloreOpen(true)}
      />

      {/* Dual Realm Switcher */}
      <GatewaySwitch
        currentMode={mode}
        onModeChange={handleModeChange}
      />

      {/* Main Content Areas */}
      <main className="relative z-10 pb-16">
        {isOfrenda ? (
          <div>
            <PapelPicadoBanner />
            <OfrendaAltar
              ofrendas={ofrendas}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onRefresh={loadData}
            />
          </div>
        ) : (
          <CRTEffect>
            <div className="space-y-12 px-4 py-6">
              {/* Spirit Box Scanner */}
              <SpiritBox onSpiritSpoke={text => setLastSpiritSpoken(text)} />

              {/* Ouija Oracle Planchette */}
              <OuijaBoard spellTargetText={lastSpiritSpoken} />

              {/* Haunted Terminal Possession */}
              <HauntedTerminal />
            </div>
          </CRTEffect>
        )}
      </main>

      {/* Footer & DEV Challenge Submission Credits */}
      <footer className="relative z-10 border-t border-slate-900 bg-black/90 py-8 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-300">MEMENTO VIVA</span> — Built for Hacktoberfest 2026 Week 4 DEV Challenge
            <span className="text-slate-600 block mt-0.5">Theme: "Ghost in the Machine" (Día de los Muertos & Halloween)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span className="text-amber-400">✨ Gemma 2</span>
            <span>•</span>
            <span className="text-purple-400">🎙️ ElevenLabs</span>
            <span>•</span>
            <span className="text-blue-400">🤖 Mastra</span>
            <span>•</span>
            <span className="text-emerald-400">🍃 MongoDB Atlas</span>
            <span>•</span>
            <span className="text-cyan-400">🚀 Render</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AddOfferingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
      />

      <FolkloreDrawer
        isOpen={isFolkloreOpen}
        onClose={() => setIsFolkloreOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        status={systemStatus}
        onRefreshStatus={loadData}
      />
    </div>
  );
};

export default App;
