import React, { useState } from 'react';
import { SECTORS } from '../utils/levels';
import { ArrowLeft, Lock, Star, Play, CheckCircle2, Trophy, Skull } from 'lucide-react';

interface LevelSelectModalProps {
  highestUnlocked: number;
  currentLevel: number;
  levelStars: Record<number, number>;
  lang?: string;
  onSelectLevel: (level: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  highestUnlocked,
  currentLevel,
  levelStars,
  onSelectLevel,
  onClose
}) => {
  const initialSectorId = Math.min(10, Math.max(1, Math.ceil(highestUnlocked / 10)));
  const [selectedSectorId, setSelectedSectorId] = useState<number>(initialSectorId);

  const activeSector = SECTORS.find(s => s.id === selectedSectorId) || SECTORS[0];
  const sectorLevels = Array.from(
    { length: activeSector.endLevel - activeSector.startLevel + 1 },
    (_, i) => activeSector.startLevel + i
  );

  // Total stars calculation
  const totalStarsEarned = Object.values(levelStars).reduce((acc, curr) => acc + curr, 0);

  const handleLevelClick = (lvl: number) => {
    if (lvl > highestUnlocked) return; // Prevent locked levels
    onSelectLevel(lvl);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6 bg-black/88 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] ui-panel-box rounded-2xl flex flex-col overflow-hidden">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#273449] bg-[#0b101b]">
          <div className="flex items-center gap-3 text-left">
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 theme-neutral rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Return to Home Screen"
            >
              <span className="ui-icon-box-sm icon-box-neutral">
                <ArrowLeft className="w-3.5 h-3.5" />
              </span>
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2.5">
              <span className="ui-icon-box icon-box-levels hidden sm:inline-flex">
                <Trophy className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base md:text-lg font-extrabold text-slate-100 tracking-wide">
                  Mission Level Select
                </h2>
                <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
                  <span>Unlocked: <strong className="text-sky-300">{highestUnlocked}</strong>/100</span>
                  <span>·</span>
                  <span className="px-2 py-0.5 rounded-md ui-coin-badge flex items-center gap-1 font-bold text-[11px]">
                    <Star className="w-3 h-3 fill-current" />
                    {totalStarsEarned}/300
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Cleared
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Ready
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Locked
            </span>
          </div>
        </div>

        {/* Sector Tabs (10 Sectors of 10 Levels) */}
        <div className="flex items-center gap-1.5 p-3 overflow-x-auto border-b border-[#1e293b] bg-[#070b14] shrink-0">
          {SECTORS.map(s => {
            const isSectorUnlocked = highestUnlocked >= s.startLevel;
            const isCurrent = s.id === selectedSectorId;

            return (
              <button
                key={s.id}
                onClick={() => setSelectedSectorId(s.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? 'theme-levels ring-1 ring-sky-400/50'
                    : isSectorUnlocked
                    ? 'theme-neutral'
                    : 'ui-card-locked opacity-80'
                }`}
              >
                <span
                  className={`ui-icon-box-sm ${
                    isCurrent
                      ? 'icon-box-levels'
                      : isSectorUnlocked
                      ? 'icon-box-neutral'
                      : 'icon-box-locked'
                  }`}
                >
                  {isSectorUnlocked ? (
                    <span className="text-[10px] font-mono font-extrabold">{s.id}</span>
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                </span>
                <span>Sector {s.id}</span>
              </button>
            );
          })}
        </div>

        {/* Level Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          <div className="p-3 rounded-xl theme-levels flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <span className="ui-icon-box icon-box-levels">
                <Trophy className="w-4 h-4" />
              </span>
              <div>
                <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                  Sector {activeSector.id} · Levels {activeSector.startLevel} to {activeSector.endLevel}
                </div>
                <h3 className="text-sm md:text-base font-bold text-slate-100">
                  {activeSector.nameEn}
                </h3>
              </div>
            </div>
            <div className="text-[11px] text-sky-200/80 hidden sm:block">
              Tap any unlocked level to deploy
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {sectorLevels.map(lvl => {
              const isUnlocked = lvl <= highestUnlocked;
              const stars = levelStars[lvl] || 0;
              const isCompleted = stars > 0;
              const isReadyNext = isUnlocked && !isCompleted;
              const isCurrentSelection = lvl === currentLevel;
              const isBoss = lvl % 10 === 0;

              return (
                <button
                  key={lvl}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => handleLevelClick(lvl)}
                  className={`relative p-3 rounded-xl flex flex-col items-center justify-between gap-2 transition-all text-center select-none ${
                    !isUnlocked
                      ? 'ui-card-locked opacity-75 cursor-not-allowed'
                      : isCompleted
                      ? isCurrentSelection
                        ? 'theme-play ring-1 ring-emerald-400/60 cursor-pointer'
                        : 'bg-[#09211d] hover:bg-[#0d2d28] border-[1.5px] border-[#1f7a68] text-emerald-100 cursor-pointer shadow-md'
                      : isReadyNext
                      ? 'theme-levels ring-1 ring-sky-400/60 cursor-pointer'
                      : 'ui-card-standard cursor-pointer'
                  }`}
                >
                  {/* Top Row: Role Badge + Status Icon Box */}
                  <div className="flex items-center justify-between w-full text-[10px] font-bold">
                    {isBoss ? (
                      <span className="px-1.5 py-0.5 rounded theme-danger text-[9px] font-extrabold tracking-wider flex items-center gap-1">
                        <Skull className="w-2.5 h-2.5" />
                        <span>BOSS</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-[#090f1a]/80 border border-[#26354d] text-slate-300 font-mono text-[9px]">
                        LVL
                      </span>
                    )}

                    {isCompleted ? (
                      <span className="ui-icon-box-sm icon-box-play">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    ) : isReadyNext ? (
                      <span className="ui-icon-box-sm icon-box-levels">
                        <Play className="w-3 h-3 fill-current" />
                      </span>
                    ) : !isUnlocked ? (
                      <span className="ui-icon-box-sm icon-box-locked">
                        <Lock className="w-3 h-3" />
                      </span>
                    ) : null}
                  </div>

                  {/* Level Number */}
                  <span className={`text-2xl font-mono font-extrabold tabular-nums ${
                    isCompleted ? 'text-emerald-100' : isReadyNext ? 'text-sky-100' : 'text-slate-500'
                  }`}>
                    {lvl}
                  </span>

                  {/* Star Rating Display or Locked Tag */}
                  {isUnlocked ? (
                    <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[#070b14]/80 border border-[#1e2d42] text-xs">
                      {[1, 2, 3].map(s => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= stars
                              ? 'text-amber-400 fill-current'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-[#090d15] border border-[#232f42] text-[10px] text-slate-400 font-semibold">
                      Locked
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#273449] bg-[#0b101b] flex items-center justify-between text-xs text-slate-400">
          <span className="truncate">
            Select any unlocked mission to deploy immediately.
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-2 theme-neutral font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <span className="ui-icon-box-sm icon-box-neutral">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
