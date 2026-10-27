import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, Sparkles, Ghost, CornerDownLeft } from 'lucide-react';
import { channelSpirit } from '../../lib/api';
import { soundManager } from '../../audio/soundManager';

interface TerminalLine {
  type: 'input' | 'output' | 'system' | 'ghost';
  text: string;
}

export const HauntedTerminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', text: 'MEMENTO-OS v26.10-GHOST (tty0) - KERNEL 0.40.11-GEMMA' },
    { type: 'system', text: 'ELECTROMAGNETIC DAEMON ATTACHED TO MEMORY SPACE 0x7FFF00' },
    { type: 'ghost', text: '...the terminal is breathing... type "help" or speak into the shell...' },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Periodic subtle ghost possession intervention
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.85 && !isProcessing) {
        const ghostGlitches = [
          "...why did you leave the terminal running in the dark?...",
          "...01010111 01000101 00100000 01010011 01000101 01000101... (WE SEE)",
          "...the electrons carry the warmth of everyone you ever coded with...",
          "...a memory is just a bit that refuses to flip to zero...",
        ];
        const glitch = ghostGlitches[Math.floor(Math.random() * ghostGlitches.length)];
        soundManager.playEmfClick();
        setLines(prev => [...prev, { type: 'ghost', text: `[GHOST]: ${glitch}` }]);
      }
    }, 18000);

    return () => clearInterval(timer);
  }, [isProcessing]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    soundManager.playEmfClick();
    setLines(prev => [...prev, { type: 'input', text: `$ ${cmd}` }]);
    setInputVal('');

    const [action, ...args] = cmd.split(' ');
    const lowerAction = action.toLowerCase();
    const argStr = args.join(' ');

    if (lowerAction === 'clear') {
      setLines([]);
      return;
    }

    if (lowerAction === 'help') {
      setLines(prev => [
        ...prev,
        { type: 'output', text: 'AVAILABLE COMMANDS:' },
        { type: 'output', text: '  help              - Display this manual' },
        { type: 'output', text: '  scan              - Sweep spectral radio frequencies' },
        { type: 'output', text: '  seance <question> - Channel lingering entities with Gemma 2' },
        { type: 'output', text: '  manifest <name>   - Summon historical pioneer spirit' },
        { type: 'output', text: '  ofrenda           - Check bridge to Día de los Muertos altar' },
        { type: 'output', text: '  exorcise          - Cleanse background noise & buffer' },
        { type: 'output', text: '  clear             - Clear terminal screen' },
      ]);
      return;
    }

    if (lowerAction === 'scan') {
      soundManager.playRadioStaticBurst(300);
      const freq = (88.0 + Math.random() * 20.0).toFixed(1);
      const emf = (1.5 + Math.random() * 3.5).toFixed(1);
      setLines(prev => [
        ...prev,
        { type: 'system', text: `[SCANNER]: Frequency locked at ${freq} MHz | EMF Sensor: ${emf} mG` },
        { type: 'output', text: `Spectral carrier detected. Sub-harmonics active. Use "seance <question>" to speak.` },
      ]);
      return;
    }

    if (lowerAction === 'seance') {
      if (!argStr) {
        setLines(prev => [...prev, { type: 'system', text: 'Usage: seance <what would you like to ask the spirits?>' }]);
        return;
      }

      setIsProcessing(true);
      soundManager.playRadioStaticBurst(400);
      setLines(prev => [...prev, { type: 'system', text: 'Modulating carrier wave through Google Gemma 2 open weights...' }]);

      try {
        const res = await channelSpirit({
          question: argStr,
          frequency: 97.3,
          emfReading: 4.8,
        });

        setLines(prev => [
          ...prev,
          { type: 'ghost', text: `[${res.spiritName}]: ${res.response}` },
          { type: 'system', text: `(Demodulated via ${res.modelUsed} | Latency: 210ms)` },
        ]);
      } catch (err) {
        setLines(prev => [...prev, { type: 'system', text: '[INTERFERENCE ERROR]: Void buffer disconnected.' }]);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (lowerAction === 'manifest') {
      const pioneer = argStr || 'Alan Turing';
      setIsProcessing(true);
      soundManager.playRadioStaticBurst(300);

      try {
        const res = await channelSpirit({
          question: `I summon the spirit of ${pioneer}. What words do you leave for the builders of tomorrow?`,
          frequency: 104.2,
          emfReading: 4.9,
        });

        setLines(prev => [
          ...prev,
          { type: 'ghost', text: `[MANIFESTED: ${pioneer}]: ${res.response}` },
        ]);
      } catch {
        setLines(prev => [...prev, { type: 'system', text: `Could not manifest ${pioneer}.` }]);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (lowerAction === 'ofrenda') {
      setLines(prev => [
        ...prev,
        { type: 'output', text: 'BRIDGE TO DÍA DE LOS MUERTOS: ACTIVE' },
        { type: 'output', text: 'Cempasúchil petals detected at threshold. Switch modes via top talisman to view living altar.' },
      ]);
      return;
    }

    if (lowerAction === 'exorcise') {
      soundManager.playRadioStaticBurst(500);
      setLines(prev => [
        ...prev,
        { type: 'system', text: 'PURGING ELECTROMAGNETIC STATIC... FLUSHING STACK...' },
        { type: 'output', text: 'Terminal cleansed. The machine is quiet... for now.' },
      ]);
      return;
    }

    // Unrecognized command
    setLines(prev => [
      ...prev,
      { type: 'ghost', text: `command not found: "${action}". Did you mean to speak to the dead? Try "help".` }
    ]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 rounded-3xl bg-black border-2 border-emerald-900/60 shadow-[0_0_40px_rgba(16,185,129,0.15)] font-mono text-xs md:text-sm">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80 mb-3 text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-emerald-300">GHOST-SHELL (VT100)</span>
          <span className="text-[10px] text-emerald-600 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
            Open-Weight AI Possessed
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
      </div>

      {/* Terminal Content Screen */}
      <div className="h-72 md:h-84 overflow-y-auto space-y-1.5 p-2 bg-slate-950/90 rounded-xl border border-emerald-950 scrollbar-thin">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={`leading-relaxed ${
              line.type === 'input'
                ? 'text-white font-bold'
                : line.type === 'ghost'
                  ? 'text-emerald-400 italic drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                  : line.type === 'system'
                    ? 'text-emerald-600 font-mono text-[11px]'
                    : 'text-slate-300'
            }`}
          >
            {line.text}
          </div>
        ))}
        {isProcessing && (
          <div className="text-emerald-500 animate-pulse text-xs">
            Channeling through neural weights...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Prompt Input */}
      <form onSubmit={handleCommand} className="mt-3 flex items-center gap-2">
        <span className="text-emerald-400 font-bold">$</span>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="Type 'help', 'scan', 'manifest Alan Turing', or 'seance <query>'..."
          disabled={isProcessing}
          className="flex-1 bg-transparent border-none text-emerald-200 placeholder-emerald-800 focus:outline-none font-mono"
        />
        <button
          type="submit"
          disabled={isProcessing || !inputVal.trim()}
          className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
