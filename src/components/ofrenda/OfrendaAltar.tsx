import React, { useState } from 'react';
import { Flame, Sparkles, Volume2, Plus, Heart, BookOpen, Share2, Check, Music } from 'lucide-react';
import { OfrendaItem } from '../../types';
import { soundManager } from '../../audio/soundManager';
import { speakSpokenText, stopSpeaking } from '../../audio/speechSynthesis';
import { lightCandle, generateCalavera } from '../../lib/api';
import { CopalBurner } from './CopalBurner';

interface OfrendaAltarProps {
  ofrendas: OfrendaItem[];
  onOpenAddModal: () => void;
  onRefresh: () => void;
}

export const OfrendaAltar: React.FC<OfrendaAltarProps> = ({ ofrendas, onOpenAddModal, onRefresh }) => {
  const [activeItem, setActiveItem] = useState<OfrendaItem | null>(null);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);
  const [lightingIds, setLightingIds] = useState<Set<string>>(new Set());
  const [filterSearch, setFilterSearch] = useState('');

  const handleLightCandle = async (item: OfrendaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playCandleChime();
    setLightingIds(prev => new Set(prev).add(item.id));

    try {
      await lightCandle(item.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setLightingIds(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }, 1000);
    }
  };

  const handleSpeakCalavera = async (item: OfrendaItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isSpeakingId === item.id) {
      stopSpeaking();
      setIsSpeakingId(null);
      return;
    }

    const textToSpeak = item.calaveraPoem || `${item.personName}. ${item.relationship}. ${item.story}`;
    setIsSpeakingId(item.id);

    await speakSpokenText(textToSpeak, {
      isSpooky: false,
      pitch: 0.9,
      rate: 0.9,
      onEnd: () => setIsSpeakingId(null),
    });
  };

  const handleGenerateCalavera = async (item: OfrendaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setGeneratingForId(item.id);

    try {
      await generateCalavera({
        name: item.personName,
        relationship: item.relationship,
        story: item.story,
        favoriteThings: item.favoriteThings || ['pan de muerto', 'cempasúchil'],
        offerings: item.offerings,
        ofrendaId: item.id,
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to generate calavera', err);
    } finally {
      setGeneratingForId(null);
    }
  };

  const filteredOfrendas = ofrendas.filter(o => 
    o.personName.toLowerCase().includes(filterSearch.toLowerCase()) ||
    o.relationship.toLowerCase().includes(filterSearch.toLowerCase()) ||
    o.story.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 relative z-10">
      {/* Altar Introduction Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>El Umbral de la Memoria • Tier III Altar</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-amber-100 tracking-wide mb-3">
          Altar de Recuerdos Eternos
        </h2>
        <p className="text-sm md:text-base text-amber-200/80 leading-relaxed font-sans">
          "Hay tres muertes: cuando se muere el cuerpo, cuando se sepulta, y cuando te olvidan." 
          Place an offering, light a warm veladora, and let Google Gemma 2 compose a traditional rhyming Calavera Literaria to celebrate their spirit!
        </p>

        {/* Action Controls: Search & Add */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <input
            type="text"
            placeholder="Search ancestors, icons, and memories..."
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 rounded-xl bg-black/60 border border-amber-800/60 text-amber-100 placeholder-amber-400/40 text-sm focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={onOpenAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-semibold text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Place an Offering / Honor Someone</span>
          </button>
        </div>
      </div>

      {/* Sahumador de Copal (Sacred Incense & 432Hz Drone) */}
      <div className="max-w-md mx-auto mb-10">
        <CopalBurner />
      </div>

      {/* The Multi-Tier Altar Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredOfrendas.map((item) => {
          const isLighting = lightingIds.has(item.id);
          const isSpeaking = isSpeakingId === item.id;
          const isGenerating = generatingForId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group relative rounded-2xl bg-gradient-to-b from-ofrenda-altar/90 to-black/95 border-2 border-amber-900/40 hover:border-amber-500/80 p-5 shadow-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] flex flex-col justify-between cursor-pointer"
            >
              {/* Ornate Gold Frame Header */}
              <div>
                <div className="relative mb-4 overflow-hidden rounded-xl border border-amber-500/40 bg-black/50 aspect-[4/3]">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.personName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter contrast-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-950/40 to-black text-amber-400/60 p-4">
                      <Flame className="w-12 h-12 text-amber-500/40 mb-2 animate-pulse" />
                      <span className="text-xs font-mono uppercase text-center">En Memoria Eterna</span>
                    </div>
                  )}

                  {/* Veladora Candle Floating Badge */}
                  <button
                    onClick={(e) => handleLightCandle(item, e)}
                    className={`absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all ${
                      isLighting
                        ? 'bg-amber-400 text-black scale-110 shadow-[0_0_20px_#f59e0b]'
                        : 'bg-black/70 border border-amber-500/50 text-amber-300 hover:bg-amber-500 hover:text-black hover:scale-105'
                    }`}
                    title="Click to light a veladora candle for this soul"
                  >
                    <Flame className={`w-4 h-4 ${isLighting ? 'animate-bounce' : 'animate-pulse text-amber-400'}`} />
                    <span className="text-xs font-bold font-mono">{item.candlesCount}</span>
                  </button>

                  {/* Lifespan Tag */}
                  {(item.birthYear || item.passedYear) && (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/75 border border-amber-900/60 text-amber-200/90 text-[11px] font-mono">
                      {item.birthYear || '—'} – {item.passedYear || 'Mictlán'}
                    </div>
                  )}
                </div>

                {/* Identity & Story */}
                <h3 className="text-xl font-serif font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                  {item.personName}
                </h3>
                <p className="text-xs font-medium text-amber-400/90 font-mono mb-2">
                  {item.relationship}
                </p>
                <p className="text-xs text-slate-300/90 line-clamp-3 leading-relaxed mb-4">
                  {item.story}
                </p>

                {/* Offerings Pills */}
                {item.offerings && item.offerings.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.offerings.map((off, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-300/80 font-mono"
                      >
                        {off === 'cempasuchil' && '🌼 Cempasúchil'}
                        {off === 'pan_de_muerto' && '🍞 Pan de Muerto'}
                        {off === 'candle' && '🕯️ Veladora'}
                        {off === 'copal' && '💨 Copal'}
                        {off === 'sugar_skull' && '💀 Calaverita'}
                        {!['cempasuchil', 'pan_de_muerto', 'candle', 'copal', 'sugar_skull'].includes(off) && `✨ ${off}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Calavera Poem Preview or Generation Trigger */}
              <div className="pt-3 border-t border-amber-900/40 mt-2">
                {item.calaveraPoem ? (
                  <div className="bg-black/50 rounded-xl p-3 border border-amber-500/20 mb-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-amber-400/80 mb-1">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        Calavera Literaria
                      </span>
                      <span className="text-[10px] text-amber-500/60">Gemma 2</span>
                    </div>
                    <p className="text-[11px] text-amber-100/90 italic font-serif line-clamp-3 whitespace-pre-line">
                      "{item.calaveraPoem.split('---')[0].trim()}"
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-2 mb-3">
                    <span className="text-[11px] text-amber-300/70 italic">No Calavera written yet.</span>
                  </div>
                )}

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-between gap-2">
                  {item.calaveraPoem ? (
                    <button
                      onClick={(e) => handleSpeakCalavera(item, e)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-mono border transition-all ${
                        isSpeaking
                          ? 'bg-amber-500 text-black border-amber-400 font-bold animate-pulse'
                          : 'bg-amber-950/40 hover:bg-amber-900/60 border-amber-700/50 text-amber-300'
                      }`}
                      title="Speak using ElevenLabs voice or neural synthesizer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking ? 'Reciting...' : 'Listen (ElevenLabs)'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleGenerateCalavera(item, e)}
                      disabled={isGenerating}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-mono bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-black font-semibold transition-all disabled:opacity-50"
                      title="Compose traditional 4-line rhyming Mexican stanzas using Gemma 2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGenerating ? 'Composing...' : 'Write Poem (Gemma 2)'}</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => handleLightCandle(item, e)}
                    className="p-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/50 text-amber-400 transition-all hover:scale-105"
                    title="Light Candle"
                  >
                    <Flame className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Modal for Reading Full Calavera Poem */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-ofrenda-altar to-black border-2 border-amber-500/60 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.3)] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 p-2 text-amber-400 hover:text-white rounded-full bg-black/50 border border-amber-800"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              {activeItem.photoUrl && (
                <img
                  src={activeItem.photoUrl}
                  alt={activeItem.personName}
                  className="w-28 h-28 object-cover rounded-2xl border-2 border-amber-500/50 shadow-lg"
                />
              )}
              <div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-amber-100">
                  {activeItem.personName}
                </h3>
                <p className="text-sm font-mono text-amber-400">{activeItem.relationship}</p>
                {(activeItem.birthYear || activeItem.passedYear) && (
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    {activeItem.birthYear} — {activeItem.passedYear}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    🕯️ {activeItem.candlesCount} Veladoras Encendidas
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed mb-6 bg-black/40 p-4 rounded-xl border border-amber-900/40">
              {activeItem.story}
            </p>

            {/* Calavera Section */}
            <div className="bg-gradient-to-b from-amber-950/30 to-black/60 rounded-2xl p-5 border border-amber-500/40 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Calavera Literaria (Poema Tradicional)
                </span>
                <span className="text-[11px] font-mono text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
                  Model: {activeItem.calaveraAuthor || 'Gemma 2'}
                </span>
              </div>

              {activeItem.calaveraPoem ? (
                <div className="whitespace-pre-line font-serif text-sm md:text-base text-amber-100/90 leading-relaxed">
                  {activeItem.calaveraPoem}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-amber-200/60 italic mb-4">
                    No Calavera has been composed for this soul yet.
                  </p>
                  <button
                    onClick={(e) => handleGenerateCalavera(activeItem, e)}
                    disabled={generatingForId === activeItem.id}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-xs uppercase font-mono shadow-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{generatingForId === activeItem.id ? 'Composing...' : 'Write Calavera with Gemma 2'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3">
              {activeItem.calaveraPoem && (
                <button
                  onClick={() => handleSpeakCalavera(activeItem)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/50 text-purple-200 text-xs font-mono transition-all"
                >
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <span>{isSpeakingId === activeItem.id ? 'Stop Voice' : 'Recite with ElevenLabs'}</span>
                </button>
              )}

              <button
                onClick={(e) => handleLightCandle(activeItem, e)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold text-xs font-mono hover:scale-105 transition-all shadow-[0_0_15px_#f59e0b]"
              >
                <Flame className="w-4 h-4" />
                <span>Light Veladora (+1)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
