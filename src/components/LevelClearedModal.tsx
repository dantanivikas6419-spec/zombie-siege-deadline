import React from 'react';
import { Star, Play, RotateCcw, Home } from 'lucide-react';
import { MissionRewardSummary } from '../types/game';

const RewardCoinSvg: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none">
    <circle cx="12" cy="12" r="9.5" fill="#d97706" stroke="#fde68a" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="6.5" fill="#b45309" stroke="#fcd34d" strokeWidth="1" />
    <path d="M12 7.5v9M9.5 9.8c0-1 1.1-1.6 2.5-1.6s2.5.6 2.5 1.6c0 1.8-5 1.4-5 3.4 0 1 1.1 1.7 2.5 1.7s2.5-.7 2.5-1.7" stroke="#fef3c7" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

interface LevelClearedModalProps {
  level: number;
  remainingAmmo: number;
  score: number;
  rewardSummary?: MissionRewardSummary | null;
  lang?: string;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevelSelect?: () => void;
  onMainMenu: () => void;
}

export const LevelClearedModal: React.FC<LevelClearedModalProps> = ({
  level,
  remainingAmmo,
  score,
  rewardSummary,
  onNextLevel,
  onReplay,
  onMainMenu
}) => {
  const stars = rewardSummary?.stars ?? (remainingAmmo >= 2 ? 3 : remainingAmmo === 1 ? 2 : 1);
  const isFirstClear = rewardSummary?.isFirstClear ?? true;
  const baseReward = rewardSummary?.baseReward ?? 0;
  const starBonus = rewardSummary?.starBonus ?? 0;
  const combatReward = rewardSummary?.combatReward ?? 0;
  const totalCoinsEarned = rewardSummary?.totalCoinsEarned ?? (baseReward + starBonus + combatReward);

  return (
    <div
      id="levelClearedScreen"
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-black/88 backdrop-blur-md"
    >
      <div className="w-full max-w-[350px] rounded-2xl ui-panel-box p-5 flex flex-col items-center text-center gap-3.5">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map(sIndex => (
            <Star
              key={sIndex}
              className={`w-8 h-8 ${
                sIndex <= stars
                  ? 'text-amber-400 fill-current'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md theme-play text-[10px] font-bold uppercase tracking-wider">
            {isFirstClear ? 'First-Clear Reward (100%)' : 'Repeat-Clear Patrol (25% Rate)'}
          </div>
          <h2 className="text-xl font-extrabold tracking-wider text-slate-100 uppercase pt-0.5">
            Level {level} Cleared
          </h2>
          <p className="text-xs text-slate-300">
            Sector secured with {remainingAmmo} {remainingAmmo === 1 ? 'round' : 'rounds'} remaining
          </p>
        </div>

        {/* Authoritative Reward Breakdown Panel */}
        <div className="w-full rounded-xl ui-inset-box p-3 flex flex-col gap-1.5 text-xs font-mono tabular-nums">
          <div className="flex items-center justify-between text-slate-300">
            <span>{isFirstClear ? 'First-Clear Bounty' : 'Repeat-Clear Bounty'}</span>
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <span>+{baseReward.toLocaleString()}</span>
              <RewardCoinSvg />
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Star Rating Bonus ({stars}/3 ★)</span>
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <span>+{starBonus.toLocaleString()}</span>
              <RewardCoinSvg />
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Combat Eliminations</span>
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <span>+{combatReward.toLocaleString()}</span>
              <RewardCoinSvg />
            </span>
          </div>
          <div className="h-px bg-[#1e293b] my-1" />
          <div className="flex items-center justify-between text-sm font-extrabold px-2.5 py-1.5 rounded-lg ui-coin-badge">
            <span className="text-amber-200">Total Earned</span>
            <span className="text-amber-300 flex items-center gap-1.5">
              <span className="ui-icon-box-sm icon-box-coin">
                <RewardCoinSvg />
              </span>
              <span>+{totalCoinsEarned.toLocaleString()}</span>
            </span>
          </div>
        </div>

        <div className="w-full py-2 px-4 rounded-xl ui-inset-box flex items-center justify-center gap-3 text-xs font-mono text-slate-300 tabular-nums">
          <span>
            Stars <strong className="text-amber-300">{stars}/3</strong>
          </span>
          <span className="text-slate-600">·</span>
          <span>
            Score <strong className="text-white">{score.toLocaleString()}</strong>
          </span>
        </div>

        <div className="w-full flex flex-col gap-2.5 pt-0.5">
          {level < 100 ? (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full py-2.5 px-4 rounded-xl theme-play font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span className="ui-icon-box-sm icon-box-play">
                <Play className="w-3.5 h-3.5 fill-current" />
              </span>
              <span>Next Level ({level + 1})</span>
            </button>
          ) : (
            <div className="py-2 px-3 rounded-xl ui-coin-badge text-xs font-bold">
              All 100 Campaign Levels Conquered!
            </div>
          )}

          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={onReplay}
              className="flex-1 py-2 px-3 rounded-xl theme-levels font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="ui-icon-box-sm icon-box-levels">
                <RotateCcw className="w-3.5 h-3.5" />
              </span>
              <span>Replay</span>
            </button>
            <button
              type="button"
              onClick={onMainMenu}
              className="flex-1 py-2 px-3 rounded-xl theme-neutral font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="ui-icon-box-sm icon-box-neutral">
                <Home className="w-3.5 h-3.5" />
              </span>
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
