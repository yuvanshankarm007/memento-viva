import React, { useRef, useState, useEffect, useCallback } from 'react';
import { seanceAudio } from '../../audio/seanceAudio';
import { elevenLabsAudio } from '../../audio/elevenLabsAudio';

interface OuijaBoardProps {
  className?: string;
  onLetterHover?: (letter: string) => void;
  onMessageComplete?: (message: string) => void;
}

const LETTERS_ROW_1 = 'ABCDEFGHIJKLM'.split('');
const LETTERS_ROW_2 = 'NOPQRSTUVWXYZ'.split('');
const NUMBERS = '1234567890'.split('');

export const OuijaBoard: React.FC<OuijaBoardProps> = ({
  className = '',
  onLetterHover,
  onMessageComplete
}) => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [planchettePos, setPlanchettePos] = useState({ x: 50, y: 65 }); // percentage (0-100)
  const [isDragging, setIsDragging] = useState(false);
  const [activeGlyph, setActiveGlyph] = useState<string>('');
  const [spelledMessage, setSpelledMessage] = useState<string>('');
  const [activeAudioSource, setActiveAudioSource] = useState<'elevenlabs' | 'procedural' | null>(null);

  const lastPosRef = useRef({ x: 50, y: 65, time: performance.now() });
  const isAutoSpellingRef = useRef(false);

  // Play Owl with ElevenLabs
  const handleOwlHoot = async () => {
    const source = await elevenLabsAudio.playOwlHoot();
    setActiveAudioSource(source);
    setTimeout(() => setActiveAudioSource(null), 3500);
  };

  // Play Bat with ElevenLabs
  const handleBatSwarm = async () => {
    const source = await elevenLabsAudio.playBatSwarm();
    setActiveAudioSource(source);
    setTimeout(() => setActiveAudioSource(null), 3000);
  };

  // Handle Planchette Dragging & Real-time Wooden Scrape Friction
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    lastPosRef.current = { x: planchettePos.x, y: planchettePos.y, time: performance.now() };
    seanceAudio.init();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const clientX = Math.max(rect.left + 30, Math.min(rect.right - 30, e.clientX));
    const clientY = Math.max(rect.top + 30, Math.min(rect.bottom - 30, e.clientY));

    const newX = ((clientX - rect.left) / rect.width) * 100;
    const newY = ((clientY - rect.top) / rect.height) * 100;

    const now = performance.now();
    const dt = Math.max(8, now - lastPosRef.current.time);
    const dx = newX - lastPosRef.current.x;
    const dy = newY - lastPosRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Speed calculation normalized (0.0 to 1.0)
    const speed = Math.min(1.0, (dist / dt) * 1.8);
    seanceAudio.updatePlanchetteDrag(speed);

    setPlanchettePos({ x: newX, y: newY });
    lastPosRef.current = { x: newX, y: newY, time: now };

    // Detect which letter/symbol is under the planchette viewing aperture
    detectApertureTarget(newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    seanceAudio.updatePlanchetteDrag(0);
    seanceAudio.playPlanchetteTap();

    // If resting over an active letter, append to message
    if (activeGlyph && activeGlyph !== 'YES' && activeGlyph !== 'NO' && activeGlyph !== 'GOODBYE') {
      setSpelledMessage(prev => prev + activeGlyph);
    }
  };

  // Check what letter or word is inside the circular glass lens
  const detectApertureTarget = (px: number, py: number) => {
    let found = '';

    // Check YES / NO
    if (py > 16 && py < 28) {
      if (px > 16 && px < 32) found = 'YES';
      else if (px > 68 && px < 84) found = 'NO';
    }

    // Check Arc 1 (A - M) around y = 38-48
    if (!found && py > 36 && py < 48) {
      const idx = Math.floor(((px - 14) / 72) * LETTERS_ROW_1.length);
      if (idx >= 0 && idx < LETTERS_ROW_1.length) {
        found = LETTERS_ROW_1[idx];
      }
    }

    // Check Arc 2 (N - Z) around y = 50-62
    if (!found && py > 48 && py < 60) {
      const idx = Math.floor(((px - 16) / 68) * LETTERS_ROW_2.length);
      if (idx >= 0 && idx < LETTERS_ROW_2.length) {
        found = LETTERS_ROW_2[idx];
      }
    }

    // Check Numbers (0-9) around y = 64-74
    if (!found && py > 62 && py < 72) {
      const idx = Math.floor(((px - 22) / 56) * NUMBERS.length);
      if (idx >= 0 && idx < NUMBERS.length) {
        found = NUMBERS[idx];
      }
    }

    // Check GOODBYE around bottom
    if (!found && py > 78 && py < 92 && px > 35 && px < 65) {
      found = 'GOODBYE';
    }

    if (found !== activeGlyph) {
      setActiveGlyph(found);
      if (found) {
        onLetterHover?.(found);
      }
    }
  };

  // Trigger automated ghost spelling of a word
  const spellWord = (word: string) => {
    if (isAutoSpellingRef.current) return;
    isAutoSpellingRef.current = true;
    setSpelledMessage('');

    const targetCoords: Record<string, { x: number; y: number }> = {
      'G': { x: 50, y: 40 },
      'E': { x: 38, y: 41 },
      'M': { x: 80, y: 42 },
      'A': { x: 18, y: 44 },
      'S': { x: 44, y: 53 },
      'O': { x: 25, y: 53 },
      'U': { x: 55, y: 53 },
      'L': { x: 75, y: 41 },
      'Y': { x: 74, y: 54 },
      'N': { x: 20, y: 53 }
    };

    let charIndex = 0;
    const chars = word.toUpperCase().split('');

    const moveToNextChar = () => {
      if (charIndex >= chars.length) {
        isAutoSpellingRef.current = false;
        seanceAudio.updatePlanchetteDrag(0);
        seanceAudio.playPlanchetteTap();
        return;
      }

      const char = chars[charIndex];
      const target = targetCoords[char] || { x: 50, y: 50 };

      // Animate glide
      const startX = planchettePos.x;
      const startY = planchettePos.y;
      const duration = 750;
      const startTime = performance.now();

      const glide = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Smooth ease-in-out
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

        const curX = startX + (target.x - startX) * ease;
        const curY = startY + (target.y - startY) * ease;

        const currentSpeed = Math.sin(progress * Math.PI) * 0.7;
        seanceAudio.updatePlanchetteDrag(currentSpeed);
        setPlanchettePos({ x: curX, y: curY });

        if (progress < 1) {
          requestAnimationFrame(glide);
        } else {
          seanceAudio.updatePlanchetteDrag(0);
          seanceAudio.playPlanchetteTap();
          setActiveGlyph(char);
          setSpelledMessage(prev => prev + char);
          charIndex++;
          setTimeout(moveToNextChar, 400);
        }
      };

      requestAnimationFrame(glide);
    };

    moveToNextChar();
  };

  return (
    <div className={`flex flex-col items-center bg-stone-950 border border-stone-800 rounded-2xl p-4 md:p-6 shadow-2xl ${className}`}>
      {/* Board Header & Controls */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-stone-800 text-stone-300">
        <div>
          <h3 className="font-serif font-bold text-stone-100 text-base md:text-lg flex items-center gap-2">
            <span>🔮</span> Tablero de Espíritus (Antique Ouija)
          </h3>
          <p className="text-xs text-stone-400">
            Drag the planchette across the walnut board to channel spiritual messages
          </p>
        </div>

        {/* Ambient Nocturnal Fauna Triggers (ElevenLabs Powered) */}
        <div className="flex items-center gap-2">
          {activeAudioSource && (
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border animate-pulse ${
              activeAudioSource === 'elevenlabs'
                ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
            }`}>
              {activeAudioSource === 'elevenlabs' ? '✨ ElevenLabs AI' : '⚡ Web Audio'}
            </span>
          )}

          <button
            onClick={handleOwlHoot}
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-amber-900/40 text-amber-300 text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow"
            title="Tecolote / Owl: Synthesized with ElevenLabs Sound Effects API"
          >
            <span>🦉</span>
            <span>Owl Hoot (ElevenLabs)</span>
          </button>

          <button
            onClick={handleBatSwarm}
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-purple-900/40 text-purple-300 text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow"
            title="Murciélago / Bat: Synthesized with ElevenLabs Sound Effects API"
          >
            <span>🦇</span>
            <span>Bat Swarm (ElevenLabs)</span>
          </button>
        </div>
      </div>

      {/* The Physical Wood Board */}
      <div
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full max-w-2xl aspect-[16/10] bg-[#2a1a12] border-4 border-[#1a100b] rounded-2xl shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] overflow-hidden select-none cursor-grab active:cursor-grabbing p-4 flex flex-col justify-between"
        style={{
          backgroundImage: `radial-gradient(ellipse at center, rgba(82, 45, 25, 0.45) 0%, rgba(18, 10, 6, 0.95) 100%)`
        }}
      >
        {/* Subtle wood grain overlay lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.3)_3px,rgba(0,0,0,0.3)_6px)]" />

        {/* Top: YES / NO & Sun / Moon Symbols */}
        <div className="relative z-10 flex justify-between items-center px-8 pt-2">
          <div className="text-center group">
            <div className="text-xl text-amber-500/80 mb-0.5">☀️</div>
            <div className={`font-serif font-black tracking-widest text-lg md:text-xl transition-colors ${activeGlyph === 'YES' ? 'text-amber-300 scale-110 drop-shadow-[0_0_8px_#f59e0b]' : 'text-amber-100/50'}`}>
              YES
            </div>
          </div>

          <div className="text-center text-xs font-serif tracking-widest text-amber-200/40 uppercase">
            MEMENTO VIVA • 1926
          </div>

          <div className="text-center group">
            <div className="text-xl text-amber-500/80 mb-0.5">🌙</div>
            <div className={`font-serif font-black tracking-widest text-lg md:text-xl transition-colors ${activeGlyph === 'NO' ? 'text-amber-300 scale-110 drop-shadow-[0_0_8px_#f59e0b]' : 'text-amber-100/50'}`}>
              NO
            </div>
          </div>
        </div>

        {/* Middle: Alphabet Arcs (A-M and N-Z) */}
        <div className="relative z-10 my-auto text-center space-y-3">
          {/* Arc 1 */}
          <div className="flex justify-center gap-2 md:gap-4 font-serif font-bold text-sm md:text-xl tracking-wider">
            {LETTERS_ROW_1.map(letter => (
              <span
                key={letter}
                className={`transition-all duration-150 ${activeGlyph === letter ? 'text-amber-300 scale-125 drop-shadow-[0_0_10px_#f59e0b] font-black' : 'text-amber-100/60'}`}
              >
                {letter}
              </span>
            ))}
          </div>

          {/* Arc 2 */}
          <div className="flex justify-center gap-2 md:gap-4 font-serif font-bold text-sm md:text-xl tracking-wider">
            {LETTERS_ROW_2.map(letter => (
              <span
                key={letter}
                className={`transition-all duration-150 ${activeGlyph === letter ? 'text-amber-300 scale-125 drop-shadow-[0_0_10px_#f59e0b] font-black' : 'text-amber-100/60'}`}
              >
                {letter}
              </span>
            ))}
          </div>

          {/* Numbers 1-0 */}
          <div className="flex justify-center gap-3 md:gap-5 font-serif font-semibold text-xs md:text-base tracking-widest pt-1">
            {NUMBERS.map(num => (
              <span
                key={num}
                className={`transition-all duration-150 ${activeGlyph === num ? 'text-amber-300 scale-125 drop-shadow-[0_0_8px_#f59e0b]' : 'text-amber-100/40'}`}
              >
                {num}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom: GOODBYE */}
        <div className="relative z-10 text-center pb-2">
          <span className={`font-serif font-black tracking-[0.25em] text-sm md:text-base transition-colors ${activeGlyph === 'GOODBYE' ? 'text-amber-300 drop-shadow-[0_0_10px_#f59e0b]' : 'text-amber-100/40'}`}>
            GOODBYE
          </span>
        </div>

        {/* --- Draggable Walnut Planchette --- */}
        <div
          onPointerDown={handlePointerDown}
          style={{
            left: `${planchettePos.x}%`,
            top: `${planchettePos.y}%`,
            transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.04)' : 'scale(1)'}`
          }}
          className="absolute z-20 w-20 h-28 md:w-24 md:h-32 transition-transform duration-75 ease-out touch-none cursor-grab active:cursor-grabbing"
        >
          {/* Heart/Teardrop wooden body with drop shadow */}
          <div
            className="w-full h-full relative rounded-t-full rounded-b-2xl border-2 border-[#5c3016] shadow-[0_12px_24px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center p-2"
            style={{
              background: 'radial-gradient(circle at 50% 30%, #4a2815 0%, #291409 100%)'
            }}
          >
            {/* Pointer tip highlight */}
            <div className="w-2 h-2 rounded-full bg-amber-400/80 mb-2 shadow-[0_0_6px_#f59e0b]" />

            {/* Glass Viewing Lens Aperture */}
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-amber-600/70 bg-cyan-950/40 shadow-inner flex items-center justify-center backdrop-blur-none relative overflow-hidden">
              {/* Glass crosshair */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <div className="w-full h-[1px] bg-amber-300" />
                <div className="h-full w-[1px] bg-amber-300 absolute" />
              </div>
              <span className="font-serif font-bold text-amber-200 text-base md:text-lg z-10 drop-shadow">
                {activeGlyph || '•'}
              </span>
            </div>

            {/* Decorative engraving */}
            <div className="text-[9px] font-mono tracking-widest text-amber-600/60 uppercase mt-2">
              ORÁCULO
            </div>
          </div>
        </div>
      </div>

      {/* Message Output & Séance Spirit Word Presets */}
      <div className="w-full mt-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-stone-900/60 p-3 rounded-xl border border-stone-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">Transcript:</span>
          <span className="font-mono text-stone-200 tracking-wider bg-black/50 px-2 py-1 rounded border border-stone-700 min-w-[120px]">
            {spelledMessage || '...'}
          </span>
          {spelledMessage && (
            <button
              onClick={() => setSpelledMessage('')}
              className="text-stone-500 hover:text-stone-300 underline text-[11px]"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-400 text-[11px]">Channel Word:</span>
          {['SOUL', 'GEMMA', 'MICTLAN'].map(word => (
            <button
              key={word}
              onClick={() => spellWord(word)}
              className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-amber-200/90 rounded border border-stone-700 text-[11px] transition-all"
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OuijaBoard;
