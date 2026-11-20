import React, { useEffect, useState } from 'react';
import { validateAllLevels, LEVEL_SET_VERSION } from '../utils/levels';
import { PRO_CHARACTERS, PRO_GUNS } from '../utils/proShopData';

interface LoadingScreenProps {
  onFinished: () => void;
}

// Module-level cache keyed by LEVEL_SET_VERSION so updated level sets are always verified once per launch
let cachedVerifiedVersion: string | null = null;
let cachedFontsReady = false;

export const STARTUP_DURATION_MS = 8000; // 8-second branded startup presentation

const ATMOSPHERIC_PARTICLES = [
  { left: '14%', top: '76%', size: 2.5, delay: '0s', duration: '6.5s', color: '#38bdf8' },
  { left: '28%', top: '82%', size: 2, delay: '1.1s', duration: '7.5s', color: '#f43f5e' },
  { left: '46%', top: '72%', size: 3, delay: '0.5s', duration: '6.8s', color: '#00e5ff' },
  { left: '64%', top: '84%', size: 2, delay: '1.8s', duration: '7.2s', color: '#fb7185' },
  { left: '82%', top: '75%', size: 2.5, delay: '0.9s', duration: '7.8s', color: '#38bdf8' }
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished }) => {
  const [progress, setProgress] = useState<number>(1);
  const [statusLabel, setStatusLabel] = useState<string>('Initializing Tactical Systems...');
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let initReady = cachedVerifiedVersion === LEVEL_SET_VERSION && cachedFontsReady;
    let exitStarted = false;
    const startTime = performance.now();

    // 1. Real Asset, Armory & 100-Level Configuration Initialization (decoupled from 8s timer)
    const runRealInitialization = async () => {
      try {
        // Verify all 100 explicit level configurations for current LEVEL_SET_VERSION
        if (cachedVerifiedVersion !== LEVEL_SET_VERSION) {
          const report = validateAllLevels();
          if (!isMounted) return;
          if (report.validCount === 100 && report.errors.length === 0) {
            cachedVerifiedVersion = LEVEL_SET_VERSION;
          }
        }

        // Verify character & weapon catalog integrity for Home reveal
        const hasCatalog = PRO_CHARACTERS.length >= 6 && PRO_GUNS.length >= 9;

        if (!cachedFontsReady && typeof document !== 'undefined' && 'fonts' in document) {
          await Promise.race([
            document.fonts.ready,
            new Promise(resolve => setTimeout(resolve, 1200))
          ]);
          cachedFontsReady = true;
        } else {
          cachedFontsReady = true;
        }

        if (isMounted && hasCatalog && cachedVerifiedVersion === LEVEL_SET_VERSION) {
          initReady = true;
        }
      } catch {
        if (isMounted) {
          initReady = true;
        }
      }
    };

    runRealInitialization();

    // 2. Smooth ~8-Second (8,000ms) Branded Startup Counter (1% -> 100%)
    let rafId: number;
    const tick = (now: number) => {
      if (!isMounted || exitStarted) return;
      const elapsed = now - startTime;
      const timeRatio = Math.min(1, elapsed / STARTUP_DURATION_MS);

      // Smooth progression from 1% to 100% across the 8-second window
      const easedRatio = 1 - Math.pow(1 - timeRatio, 1.15);
      const rawPct = Math.max(1, Math.min(100, Math.floor(1 + easedRatio * 99)));

      if (timeRatio < 1) {
        if (rawPct < 28) {
          setStatusLabel('Initializing Tactical Engine...');
        } else if (rawPct < 58) {
          setStatusLabel(`Loading 100 Campaign Sectors (${LEVEL_SET_VERSION})...`);
        } else if (rawPct < 86) {
          setStatusLabel('Preparing Operative & Armory Assets...');
        } else {
          setStatusLabel('Finalizing Command Deck...');
        }
        setProgress(Math.min(99, rawPct));
        rafId = requestAnimationFrame(tick);
        return;
      }

      // If 8 seconds have elapsed but real initialization is NOT yet finished, never show a false Ready state
      if (!initReady) {
        setProgress(99);
        setStatusLabel('Verifying Campaign Data & Assets — Please Wait...');
        rafId = requestAnimationFrame(tick);
        return;
      }

      // Both 8-second presentation and real initialization are complete
      exitStarted = true;
      setProgress(100);
      setStatusLabel('Ready');
      setIsExiting(true);

      setTimeout(() => {
        if (isMounted) {
          onFinished();
        }
      }, 260);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
    };
  }, [onFinished]);

  return (
    <div
      id="loading-screen"
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute inset-0 z-[300] flex flex-col items-center justify-between px-6 py-8 select-none overflow-hidden transition-opacity duration-250 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 36%, rgba(15, 29, 52, 0.94) 0%, rgba(7, 11, 20, 0.98) 60%, #03050a 100%)'
      }}
    >
      {/* Subtle Tactical Grid Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Restrained Atmospheric Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {ATMOSPHERIC_PARTICLES.map((p, idx) => (
          <span
            key={idx}
            className="absolute rounded-full opacity-40 animate-pulse"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size * 2}px`,
              height: `${p.size * 2}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
              animationDelay: p.delay,
              animationDuration: p.duration
            }}
          />
        ))}
      </div>

      {/* Top Classification Header */}
      <div className="relative z-10 w-full flex items-center justify-center pt-1">
        <div className="px-3.5 py-1.5 rounded-lg ui-inset-box text-[10px] font-mono font-bold tracking-[0.22em] text-slate-200 uppercase">
          Tactical Siege Protocol · 100 Missions
        </div>
      </div>

      {/* Center Original Game Emblem & Logo Composition */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-[350px] px-2">
        <div
          className="pointer-events-none absolute w-48 h-48 rounded-full blur-3xl opacity-25"
          style={{
            background: 'radial-gradient(circle, #0284c7 0%, #be123c 65%, transparent 100%)'
          }}
        />

        {/* Custom Vector Tactical Crest & Crosshair Emblem */}
        <div className="relative mb-5 flex items-center justify-center">
          <svg
            width="132"
            height="132"
            viewBox="0 0 140 140"
            className="drop-shadow-[0_10px_24px_rgba(0,0,0,0.85)]"
            aria-label="Zombie Siege Deadline Emblem"
          >
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="55%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="cyanEdge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
              <linearGradient id="crimsonCore" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>
            </defs>

            <circle
              cx="70"
              cy="70"
              r="61"
              fill="none"
              stroke="rgba(148, 163, 184, 0.22)"
              strokeWidth="1.4"
              strokeDasharray="8 6"
            />
            <circle
              cx="70"
              cy="70"
              r="53"
              fill="none"
              stroke="rgba(244, 63, 94, 0.24)"
              strokeWidth="1.1"
            />

            <line x1="70" y1="5" x2="70" y2="18" stroke="#38bdf8" strokeWidth="2" />
            <line x1="70" y1="122" x2="70" y2="135" stroke="#38bdf8" strokeWidth="2" />
            <line x1="5" y1="70" x2="18" y2="70" stroke="#38bdf8" strokeWidth="2" />
            <line x1="122" y1="70" x2="135" y2="70" stroke="#38bdf8" strokeWidth="2" />

            <polygon
              points="70,16 114,38 106,96 70,122 34,96 26,38"
              fill="url(#shieldGrad)"
              stroke="url(#cyanEdge)"
              strokeWidth="2.2"
            />
            <polygon
              points="70,23 107,42 100,92 70,114 40,92 33,42"
              fill="none"
              stroke="rgba(148, 163, 184, 0.22)"
              strokeWidth="1"
            />

            <polyline
              points="36,52 70,34 104,52"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeOpacity="0.65"
            />
            <polyline
              points="40,86 70,104 100,86"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="1.8"
              strokeOpacity="0.7"
            />

            <circle
              cx="70"
              cy="68"
              r="21"
              fill="rgba(9, 13, 22, 0.95)"
              stroke="url(#crimsonCore)"
              strokeWidth="2.2"
            />
            <path d="M70 50 L82 70 L70 86 L58 70 Z" fill="url(#crimsonCore)" />
            <circle cx="70" cy="68" r="5" fill="#38bdf8" />
          </svg>
        </div>

        {/* Dark Metallic Title Frame */}
        <div className="w-full text-center px-4 py-4 rounded-xl ui-panel-box">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-sky-400/85 mb-1">
            TACTICAL BALLISTICS & RICOCHET
          </div>
          <h1 className="title-primary text-2xl sm:text-3xl tracking-[0.16em]">
            ZOMBIE SIEGE
          </h1>
          <div className="title-subtitle mt-1.5">
            <span className="subtitle-line" />
            <span className="subtitle-text tracking-[0.4em]">DEADLINE</span>
            <span className="subtitle-line" />
          </div>
        </div>
      </div>

      {/* Bottom Framed Progress Bar & 1% - 100% Counter */}
      <div className="relative z-10 w-full max-w-[345px] p-3 rounded-xl ui-inset-box flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-200 tracking-wide truncate pr-2">{statusLabel}</span>
          <span className="setting-value-badge text-sky-300 shrink-0">
            {progress}%
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-[#060910] border border-[#2d3e57] overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)',
              boxShadow: '0 0 8px rgba(56, 189, 248, 0.35)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
