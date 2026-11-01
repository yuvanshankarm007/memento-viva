import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ofrendaAudio } from '../../audio/ofrendaAudio';

interface CopalBurnerProps {
  className?: string;
  onIgniteChange?: (isIgnited: boolean) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  alpha: number;
  decay: number;
  rotation: number;
  rotSpeed: number;
}

interface EmberSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
}

export const CopalBurner: React.FC<CopalBurnerProps> = ({ className = '', onIgniteChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isIgnited, setIsIgnited] = useState<boolean>(false);
  const [crackleVol, setCrackleVol] = useState<number>(75);
  const [droneVol, setDroneVol] = useState<number>(55);
  const [draftLabel, setDraftLabel] = useState<string>('Calm');

  const mouseRef = useRef({ x: -100, y: -100, vx: 0, vy: 0, lastX: 0, lastY: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const embersRef = useRef<EmberSpark[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Initialize and handle Ignite toggle
  const toggleIgnite = () => {
    if (!isIgnited) {
      ofrendaAudio.ignite();
      setIsIgnited(true);
      onIgniteChange?.(true);

      // Trigger initial smoke puff
      if (canvasRef.current) {
        const burnerX = canvasRef.current.width / (2 * window.devicePixelRatio);
        const burnerY = (canvasRef.current.height / window.devicePixelRatio) - 95;
        triggerSmokeBurst(burnerX, burnerY, 15);
      }
    } else {
      ofrendaAudio.extinguish();
      setIsIgnited(false);
      onIgniteChange?.(false);
    }
  };

  const triggerSmokeBurst = (x: number, y: number, count: number = 10) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x + (Math.random() * 16 - 8),
        y: y,
        vx: (Math.random() * 1.6 - 0.8),
        vy: -(1.4 + Math.random() * 1.8),
        size: 16 + Math.random() * 14,
        maxSize: 65 + Math.random() * 30,
        alpha: 0.45 + Math.random() * 0.25,
        decay: 0.0035 + Math.random() * 0.003,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    for (let i = 0; i < count + 5; i++) {
      embersRef.current.push({
        x: x + (Math.random() * 20 - 10),
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: -(1.8 + Math.random() * 2.8),
        size: Math.random() * 2.5 + 1,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.02
      });
    }
  };

  // Add a tear of copal resin
  const handleAddCopalTear = () => {
    if (canvasRef.current) {
      const rectW = canvasRef.current.width / window.devicePixelRatio;
      const rectH = canvasRef.current.height / window.devicePixelRatio;
      triggerSmokeBurst(rectW / 2, rectH - 95, 14);
    }
    if (isIgnited) {
      ofrendaAudio.triggerEmberPop(false);
      setTimeout(() => ofrendaAudio.triggerEmberPop(true), 60);
      setTimeout(() => ofrendaAudio.triggerEmberPop(false), 140);
    }
  };

  // Canvas drawing & animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.resetTransform();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    let counter = 0;
    const render = (time: number) => {
      const rectW = canvas.width / window.devicePixelRatio;
      const rectH = canvas.height / window.devicePixelRatio;
      const burnerX = rectW / 2;
      const burnerY = rectH - 95;

      const wind = Math.sin(time * 0.001) * 0.35 + (mouseRef.current.vx * 0.12);

      // Track mouse velocity
      mouseRef.current.vx = (mouseRef.current.x - mouseRef.current.lastX) * 0.2;
      mouseRef.current.vy = (mouseRef.current.y - mouseRef.current.lastY) * 0.2;
      mouseRef.current.lastX = mouseRef.current.x;
      mouseRef.current.lastY = mouseRef.current.y;

      ctx.clearRect(0, 0, rectW, rectH);

      // Continuous emission if burning
      if (isIgnited) {
        counter++;
        if (counter % 3 === 0) {
          particlesRef.current.push({
            x: burnerX + (Math.random() * 14 - 7),
            y: burnerY - 5,
            vx: (Math.random() * 0.6 - 0.3),
            vy: -(0.9 + Math.random() * 1.3),
            size: 14 + Math.random() * 14,
            maxSize: 60 + Math.random() * 25,
            alpha: 0.32 + Math.random() * 0.25,
            decay: 0.003 + Math.random() * 0.002,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02
          });
        }

        if (Math.random() < 0.28) {
          embersRef.current.push({
            x: burnerX + (Math.random() * 22 - 11),
            y: burnerY - 4,
            vx: (Math.random() - 0.5) * 1.4,
            vy: -(1.2 + Math.random() * 2.2),
            size: Math.random() * 2.2 + 1,
            alpha: 1,
            decay: 0.012 + Math.random() * 0.018
          });
        }
      }

      // Update & render smoke
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx + wind;
        p.y += p.vy;
        p.size += (p.maxSize - p.size) * 0.015;
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed;

        if (p.alpha <= 0 || p.y < -50) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, `rgba(255, 250, 240, ${p.alpha * 0.6})`);
        grad.addColorStop(0.35, `rgba(245, 230, 210, ${p.alpha * 0.35})`);
        grad.addColorStop(0.7, `rgba(220, 185, 140, ${p.alpha * 0.15})`);
        grad.addColorStop(1, 'rgba(180, 140, 100, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Update & render ember sparks
      for (let i = embersRef.current.length - 1; i >= 0; i--) {
        const emb = embersRef.current[i];
        emb.x += emb.vx + wind * 0.7;
        emb.y += emb.vy;
        emb.alpha -= emb.decay;

        if (emb.alpha <= 0 || emb.y < -30) {
          embersRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = `rgba(255, ${120 + Math.random() * 90}, 20, ${emb.alpha})`;
        ctx.shadowColor = 'rgba(255, 110, 0, 0.9)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Sahumador Vessel
      drawVessel(ctx, burnerX, burnerY, isIgnited);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isIgnited]);

  // Sahumador ceramic art
  const drawVessel = (c: CanvasRenderingContext2D, x: number, y: number, burning: boolean) => {
    c.save();
    c.translate(x, y);

    // Pedestal foot
    c.fillStyle = '#1c1917';
    c.strokeStyle = '#78350f';
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(0, 68, 42, 10, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // Stem
    c.beginPath();
    c.moveTo(-14, 65);
    c.lineTo(-10, 32);
    c.lineTo(10, 32);
    c.lineTo(14, 65);
    c.closePath();
    c.fillStyle = '#292524';
    c.fill();
    c.stroke();

    // Goblet bowl
    c.beginPath();
    c.moveTo(-52, 0);
    c.bezierCurveTo(-46, 36, -20, 32, 0, 33);
    c.bezierCurveTo(20, 32, 46, 36, 52, 0);
    c.bezierCurveTo(50, -8, -50, -8, -52, 0);
    c.closePath();

    const bowlGrad = c.createLinearGradient(-40, 0, 40, 35);
    bowlGrad.addColorStop(0, '#442314');
    bowlGrad.addColorStop(0.5, '#633119');
    bowlGrad.addColorStop(1, '#2c150c');
    c.fillStyle = bowlGrad;
    c.fill();
    c.strokeStyle = '#9a3412';
    c.stroke();

    // Coals
    const coalGrad = c.createRadialGradient(0, 0, 3, 0, 0, 44);
    if (burning) {
      const pulse = Math.sin(Date.now() * 0.003) * 0.15 + 0.85;
      coalGrad.addColorStop(0, `rgba(255, 235, 170, ${0.95 * pulse})`);
      coalGrad.addColorStop(0.25, `rgba(255, 100, 10, 0.9)`);
      coalGrad.addColorStop(0.65, `rgba(180, 40, 5, 0.75)`);
      coalGrad.addColorStop(1, 'rgba(40, 15, 10, 0.9)');
      c.shadowColor = 'rgba(255, 90, 0, 0.75)';
      c.shadowBlur = 20;
    } else {
      coalGrad.addColorStop(0, 'rgba(80, 60, 55, 0.7)');
      coalGrad.addColorStop(1, 'rgba(25, 20, 20, 0.95)');
    }

    c.fillStyle = coalGrad;
    c.beginPath();
    c.ellipse(0, 0, 44, 12, 0, 0, Math.PI * 2);
    c.fill();
    c.shadowBlur = 0;

    // Copal Resin chunks
    c.fillStyle = burning ? 'rgba(255, 240, 200, 0.85)' : 'rgba(200, 190, 175, 0.6)';
    c.beginPath();
    c.ellipse(-12, -2, 6, 4, 0.4, 0, Math.PI * 2);
    c.ellipse(10, 1, 8, 5, -0.3, 0, Math.PI * 2);
    c.ellipse(0, -3, 7, 4, 0, 0, Math.PI * 2);
    c.fill();

    c.restore();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;

    if (Math.abs(mouseRef.current.vx) > 1.2) {
      setDraftLabel(mouseRef.current.vx > 0 ? 'Right draft' : 'Left draft');
    } else {
      setDraftLabel('Calm');
    }
  };

  const handleMouseLeave = () => {
    mouseRef.current.x = -100;
    mouseRef.current.y = -100;
    mouseRef.current.vx = 0;
    mouseRef.current.vy = 0;
    setDraftLabel('Calm');
  };

  return (
    <div className={`flex flex-col bg-slate-900/80 border border-amber-900/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md ${className}`}>
      {/* Title & Status */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-900/30">
        <div>
          <h3 className="font-serif font-bold text-amber-200 text-base md:text-lg flex items-center gap-2">
            <span>🌿</span> Sahumador de Copal Sagrado
          </h3>
          <p className="text-xs text-amber-300/60 font-sans">
            Aromatic incense purifying the threshold between worlds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isIgnited ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-red-500'}`} />
          <span className="text-xs font-mono text-amber-300/80">
            {isIgnited ? 'Glowing' : 'Extinguished'}
          </span>
        </div>
      </div>

      {/* Interactive Canvas */}
      <div className="relative w-full aspect-[4/3] my-4 rounded-xl bg-gradient-to-b from-slate-950 via-amber-950/20 to-slate-950 border border-amber-900/30 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleAddCopalTear}
          className="w-full h-full cursor-pointer"
          title="Click to add copal resin; move to stir the smoke"
        />

        {/* Ambient Overlay tags */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none text-[11px] bg-black/60 backdrop-blur-sm border border-amber-500/20 px-2 py-0.5 rounded text-amber-300/90 font-mono">
          Air: {draftLabel}
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] text-amber-300/50 bg-black/40 px-3 py-0.5 rounded-full backdrop-blur-sm border border-amber-900/30">
          Click burner to add copal tear & spark embers
        </div>
      </div>

      {/* Controls & Sound Sliders */}
      <div className="space-y-3.5">
        <div className="flex gap-2">
          <button
            onClick={toggleIgnite}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 ${
              isIgnited
                ? 'bg-slate-800 text-amber-200 hover:bg-slate-700 border border-amber-800/40'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:from-amber-400 hover:to-orange-500 shadow-orange-950/40'
            }`}
          >
            <span>{isIgnited ? '💨 Extinguish Copal' : '🔥 Ignite Copal'}</span>
          </button>

          <button
            onClick={handleAddCopalTear}
            className="py-2 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/40 text-amber-200 text-xs font-medium transition-all"
          >
            + Add Resin Tear
          </button>

          <button
            onClick={() => ofrendaAudio.playVeladoraChime()}
            className="py-2 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/40 text-amber-200 text-xs font-medium transition-all"
            title="Ring 528Hz Solfeggio Veladora Chime"
          >
            🔔 Chime
          </button>
        </div>

        {/* Volume Mixers */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-amber-900/30">
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-amber-200/90">
              <span>🪵 Ember Crackle</span>
              <span className="font-mono text-amber-400">{crackleVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={crackleVol}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setCrackleVol(val);
                ofrendaAudio.setCrackleVolume(val / 100);
              }}
              className="w-full h-1 bg-slate-800 rounded appearance-none accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-amber-200/90">
              <span>🕉️ 432Hz Sacred Drone</span>
              <span className="font-mono text-amber-400">{droneVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={droneVol}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setDroneVol(val);
                ofrendaAudio.setDroneVolume(val / 100);
              }}
              className="w-full h-1 bg-slate-800 rounded appearance-none accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopalBurner;
