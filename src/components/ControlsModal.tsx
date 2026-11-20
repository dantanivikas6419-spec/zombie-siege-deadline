import React from 'react';
import { X, Play, Crosshair, Target, ShieldAlert, Star, Coins, Zap, BookOpen } from 'lucide-react';

interface ControlsModalProps {
  lang?: string;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6 bg-black/88 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg ui-panel-box rounded-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#273449] bg-[#0b101b]">
          <div className="flex items-center gap-2.5 text-left">
            <span className="ui-icon-box icon-box-rules">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-teal-300 uppercase">
                ZOMBIE SIEGE: DEADLINE
              </div>
              <h2 className="text-base md:text-lg font-bold text-slate-100 tracking-wide">
                Official Combat Rules & Guide
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 theme-neutral rounded-xl transition-colors cursor-pointer"
            title="Close Rules"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7 Point-by-Point Combat Rules */}
        <div className="p-4 space-y-3 overflow-y-auto text-xs md:text-sm text-slate-300">
          {/* Rule 1: Hold to Aim, Release to Fire & Cancel Zone */}
          <div className="p-3 ui-card-standard rounded-xl flex items-start gap-3">
            <div className="ui-icon-box icon-box-rules font-mono font-extrabold text-xs">
              1
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-teal-200">
                <Zap className="w-3.5 h-3.5" />
                Hold to Aim • Release to Fire • Drag Down to Cancel
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong>Touch and hold</strong> (or mouse press and drag) anywhere inside the battlefield frame to aim your laser sight. <strong>Release</strong> to fire! To cancel a shot without wasting ammo, drag your finger down into the <strong>“⬇ नीचे खींचें: Cancel Shot”</strong> box at the bottom before releasing.
              </p>
            </div>
          </div>

          {/* Rule 2: Weapon Penetration & Magazine Reload */}
          <div className="p-3 ui-card-standard rounded-xl flex items-start gap-3">
            <div className="ui-icon-box icon-box-danger font-mono font-extrabold text-xs">
              2
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-rose-300">
                <ShieldAlert className="w-3.5 h-3.5" />
                Bullet Penetration & Magazine Reloads
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Advanced rifles, snipers, and railguns feature <strong>2x to 4x Bullet Penetration</strong>—their rounds pierce straight through the first zombie to hit targets behind it! Watch your <strong>MAG</strong> and <strong>TOTAL</strong> ammo in the bottom HUD and tap <strong>RELOAD</strong> when needed.
              </p>
            </div>
          </div>

          {/* Rule 3: Gravity & Destructible Platform Supports */}
          <div className="p-3 ui-card-standard rounded-xl flex items-start gap-3">
            <div className="ui-icon-box icon-box-levels font-mono font-extrabold text-xs">
              3
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-sky-300">
                <Target className="w-3.5 h-3.5" />
                Gravity & Destructible Ice Bridges
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Shattering cyan <strong>Ice Bridges or Supports</strong> under elevated zombies removes their footing—causing them to plummet under gravity onto lower floors, red spike hazards, or explosive TNT barrels!
              </p>
            </div>
          </div>

          {/* Rule 4: Zombie Classes & Hazards */}
          <div className="p-3 ui-card-standard rounded-xl flex items-start gap-3">
            <div className="ui-icon-box icon-box-play font-mono font-extrabold text-xs">
              4
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-emerald-300">
                <Crosshair className="w-3.5 h-3.5" />
                Zombie Classes, Spitters & TNT
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Battle shambling <strong>Walkers</strong>, fast <strong>Sprinters</strong>, armored <strong>Heavy Brutes</strong>, ranged <strong>Toxic Spitters</strong> (interrupt their <em>⚠️ SPIT!</em> charge or shoot down their acid globs!), and <strong>Sector Warlord Bosses</strong>.
              </p>
            </div>
          </div>

          {/* Rule 5: Mission Objectives & Star Ratings */}
          <div className="p-3 ui-card-standard rounded-xl flex items-start gap-3">
            <div className="ui-icon-box icon-box-shop font-mono font-extrabold text-xs">
              5
            </div>
            <div className="space-y-2 w-full text-left">
              <h4 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-300">
                <Star className="w-3.5 h-3.5 fill-current" />
                Mission Objectives & Star Ratings
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Eliminate all active and reinforcement zombies. Spare ammo earns up to 3 stars:
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2 ui-inset-box rounded-lg">
                  <div className="text-amber-300 font-bold">★★★</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">2+ Bullets Left</div>
                </div>
                <div className="p-2 ui-inset-box rounded-lg">
                  <div className="text-amber-300 font-bold">★★</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">1 Bullet Left</div>
                </div>
                <div className="p-2 ui-inset-box rounded-lg">
                  <div className="text-amber-300 font-bold">★</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Last Bullet</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rule 6: Weapons, Characters & Emotes Store */}
          <div className="p-3 ui-card-standard rounded-xl flex items-start gap-3">
            <div className="ui-icon-box icon-box-emote font-mono font-extrabold text-xs">
              6
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-purple-300">
                <Coins className="w-3.5 h-3.5 text-amber-300" />
                Weapons, Operatives & Celebration Emotes
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Visit the <strong>Store</strong> to unlock <strong>9 Weapons</strong>, <strong>6 Operative Suits</strong>, and <strong>8 Celebration Emotes</strong> that can be selected and played from the Home Emote button under Settings.
              </p>
            </div>
          </div>

          {/* Rule 7: Sectors & Levels */}
          <div className="p-3 ui-card-standard rounded-xl flex items-start gap-3">
            <div className="ui-icon-box icon-box-levels font-mono font-extrabold text-xs">
              7
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-sky-300">
                <Play className="w-3.5 h-3.5 fill-current" />
                100-Level Tactical Campaign
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Progress across 10 unique sectors with boss battles every 10th level. All coins, unlocked weapons, characters, emotes, and star ratings save automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#273449] bg-[#0b101b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 theme-rules font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <span className="ui-icon-box-sm icon-box-rules">
              <X className="w-3.5 h-3.5" />
            </span>
            <span>Close Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};
