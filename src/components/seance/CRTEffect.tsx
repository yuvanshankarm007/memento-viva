import React from 'react';

export const CRTEffect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Scanline pattern overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-20 opacity-15 mix-blend-overlay"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Subtle CRT Flicker & Phosphor Vignette */}
      <div className="pointer-events-none fixed inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.85)_100%)]" />

      {/* Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
