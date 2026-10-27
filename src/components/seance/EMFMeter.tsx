import React, { useEffect, useState } from 'react';
import { Radio, Zap } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface EMFMeterProps {
  reading: number; // 0 to 5+
  isScanning?: boolean;
}

export const EMFMeter: React.FC<EMFMeterProps> = ({ reading, isScanning = false }) => {
  const [jitterReading, setJitterReading] = useState(reading);

  useEffect(() => {
    const interval = setInterval(() => {
      // Natural sensor fluctuation jitter
      const delta = (Math.random() - 0.5) * (isScanning ? 0.8 : 0.2);
      const val = Math.max(0.5, Math.min(5.0, reading + delta));
      setJitterReading(val);

      if (val > 3.0 && Math.random() > 0.6) {
        soundManager.playEmfClick();
      }
    }, 180);

    return () => clearInterval(interval);
  }, [reading, isScanning]);

  // K-II 5-light threshold levels
  const lights = [
    { level: 1, color: 'bg-emerald-500 shadow-[0_0_10px_#10b981]', label: 'Normal' },
    { level: 2, color: 'bg-emerald-400 shadow-[0_0_10px_#34d399]', label: 'Low' },
    { level: 3, color: 'bg-amber-400 shadow-[0_0_10px_#f59e0b]', label: 'Moderate' },
    { level: 4, color: 'bg-orange-500 shadow-[0_0_10px_#f97316]', label: 'High' },
    { level: 5, color: 'bg-red-600 shadow-[0_0_15px_#dc2626]', label: 'Spike' },
  ];

  return (
    <div className="flex flex-col items-center justify-between p-3.5 rounded-2xl bg-black/90 border border-slate-800 shadow-xl font-mono">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-[10px] text-slate-400 tracking-wider uppercase flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          K-II EMF Detector
        </span>
        <span className={`text-[11px] font-bold ${
          jitterReading > 3.5 ? 'text-red-400 animate-pulse' : 'text-emerald-400'
        }`}>
          {jitterReading.toFixed(1)} mG
        </span>
      </div>

      {/* 5-LED Indicator Bar */}
      <div className="grid grid-cols-5 gap-2 w-full py-1.5 px-2 bg-slate-950/80 rounded-xl border border-slate-900">
        {lights.map(l => {
          const isActive = jitterReading >= l.level - 0.2;
          return (
            <div key={l.level} className="flex flex-col items-center gap-1">
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isActive ? l.color : 'bg-slate-800 opacity-30'
                }`}
              />
              <span className="text-[8px] text-slate-500 uppercase">{l.level}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
