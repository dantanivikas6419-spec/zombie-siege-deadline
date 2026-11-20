import React from 'react';
import { Language } from '../types/game';
import { RotateCcw, Home, List, AlertTriangle } from 'lucide-react';

interface GameOverModalProps {
  level: number;
  score: number;
  failureReason?: string;
  lang: Language;
  onRetry: () => void;
  onOpenLevelSelect: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  score,
  failureReason,
  onRetry,
  onOpenLevelSelect,
  onMainMenu
}) => {
  return (
    <div
      id="gameOverScreen"
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-black/88 backdrop-blur-md"
    >
      <div className="w-full max-w-[340px] rounded-2xl ui-panel-box p-6 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl theme-danger flex items-center justify-center">
          <span className="ui-icon-box icon-box-danger">
            <AlertTriangle className="w-5 h-5" />
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-wider text-rose-400 uppercase">
            Mission Failed
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {failureReason || 'Objective not completed. Adjust your angle or target supports and TNT!'}
          </p>
        </div>

        <div className="w-full py-2.5 px-4 rounded-xl ui-inset-box flex items-center justify-center gap-3 text-xs font-mono text-slate-300 tabular-nums">
          <span>
            Level <strong className="text-sky-300">{level}</strong>
          </span>
          <span className="text-slate-600">·</span>
          <span>
            Score <strong className="text-amber-300">{score}</strong>
          </span>
        </div>

        <div className="w-full flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={onRetry}
            className="w-full py-2.5 px-4 rounded-xl theme-play font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span className="ui-icon-box-sm icon-box-play">
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
            <span>Retry Level {level}</span>
          </button>

          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={onOpenLevelSelect}
              className="flex-1 py-2 px-3 rounded-xl theme-levels font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="ui-icon-box-sm icon-box-levels">
                <List className="w-3.5 h-3.5" />
              </span>
              <span>Levels</span>
            </button>
            <button
              type="button"
              onClick={onMainMenu}
              className="flex-1 py-2 px-3 rounded-xl theme-danger font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="ui-icon-box-sm icon-box-danger">
                <Home className="w-3.5 h-3.5" />
              </span>
              <span>Exit Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
