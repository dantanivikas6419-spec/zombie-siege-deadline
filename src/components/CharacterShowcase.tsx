import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterItem, GunItem, WeaponVisualType } from '../types/game';
import { PRO_CHARACTERS, PRO_GUNS } from '../utils/proShopData';
import { HomeSurvivorCharacter } from './HomeSurvivorCharacter';
import { ArrowLeft, Check, Lock, X, AlertCircle } from 'lucide-react';

interface CharacterShowcaseProps {
  unlockedChars: string[];
  activeChar: string;
  unlockedGuns: string[];
  activeGun: string;
  onApplyLoadout: (char: CharacterItem, gun: GunItem) => boolean;
  onClose: () => void;
}

/**
 * Clean 2D Weapon Silhouette Thumbnail SVG for the Bottom Horizontal Weapon Strip
 */
const WeaponThumbnailSVG: React.FC<{
  type: WeaponVisualType;
  bodyColor: string;
  accentColor: string;
}> = ({ type, bodyColor, accentColor }) => {
  const renderArt = () => {
    switch (type) {
      case 'pistol':
        return (
          <g>
            <rect x="44" y="21" width="6" height="4" fill={accentColor} />
            <rect x="114" y="21" width="5" height="4" fill={accentColor} />
            <rect x="40" y="25" width="80" height="19" rx="3" fill={bodyColor} stroke="#94a3b8" strokeWidth="1.8" />
            <rect x="54" y="31" width="52" height="5" rx="1.5" fill={accentColor} />
            <rect x="74" y="44" width="38" height="6" rx="1.5" fill="#0b101b" stroke="#64748b" strokeWidth="1.4" />
            <rect x="120" y="27" width="15" height="15" rx="2" fill="#090d16" stroke={accentColor} strokeWidth="1.6" />
            <path d="M44 44 L64 44 L56 72 L36 72 Z" fill="#0b101b" stroke="#64748b" strokeWidth="1.6" />
            <rect x="34" y="71" width="24" height="5" rx="1.5" fill={accentColor} />
            <path d="M64 44 L78 44 L78 55 L60 55" fill="none" stroke={accentColor} strokeWidth="1.6" />
          </g>
        );
      case 'smg':
        return (
          <g>
            <path d="M16 30 L42 30 L42 39 L24 41 L16 50 Z" fill="#1e293b" stroke="#64748b" strokeWidth="1.6" />
            <rect x="12" y="28" width="5" height="24" rx="1.5" fill="#090d16" stroke={accentColor} strokeWidth="1.4" />
            <path d="M56 14 L78 14 L82 25 L52 25 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.5" />
            <rect x="42" y="25" width="74" height="21" rx="3" fill={bodyColor} stroke="#94a3b8" strokeWidth="1.8" />
            <rect x="52" y="31" width="50" height="5" rx="1.5" fill={accentColor} />
            <rect x="116" y="29" width="40" height="12" rx="2.5" fill="#090d16" stroke={accentColor} strokeWidth="1.6" />
            <path d="M80 46 L93 46 L102 75 L88 75 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.6" />
            <rect x="100" y="46" width="9" height="18" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1.3" />
            <path d="M46 46 L60 46 L53 68 L39 68 Z" fill="#0b101b" stroke="#64748b" strokeWidth="1.5" />
          </g>
        );
      case 'shotgun':
        return (
          <g>
            <path d="M10 48 L40 28 L40 45 L18 58 Z" fill="#27272a" stroke="#71717a" strokeWidth="1.7" />
            <rect x="40" y="25" width="60" height="18" rx="2.5" fill={bodyColor} stroke="#94a3b8" strokeWidth="1.8" />
            <rect x="49" y="30" width="6" height="9" rx="1" fill="#ef4444" />
            <rect x="58" y="30" width="6" height="9" rx="1" fill="#ef4444" />
            <rect x="67" y="30" width="6" height="9" rx="1" fill="#ef4444" />
            <rect x="76" y="30" width="6" height="9" rx="1" fill="#ef4444" />
            <rect x="100" y="25" width="52" height="9.5" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="100" y="34.5" width="47" height="7" fill="#334155" />
            <rect x="90" y="38" width="38" height="10" rx="2.5" fill={accentColor} stroke="#090d16" strokeWidth="1.5" />
            <rect x="152" y="23" width="12" height="17" rx="1.5" fill={accentColor} />
            <path d="M40 43 L54 43 L47 67 L33 67 Z" fill="#090d16" stroke="#64748b" strokeWidth="1.5" />
          </g>
        );
      case 'assault':
        return (
          <g>
            <path d="M10 27 L40 27 L40 45 L15 52 L10 45 Z" fill="#1e293b" stroke="#64748b" strokeWidth="1.6" />
            <rect x="7" y="25" width="5" height="23" rx="1.5" fill={accentColor} />
            <path d="M54 12 L84 12 L80 23 L58 23 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.6" />
            <rect x="40" y="24" width="86" height="21" rx="3" fill={bodyColor} stroke="#94a3b8" strokeWidth="1.8" />
            <line x1="48" y1="34.5" x2="118" y2="34.5" stroke={accentColor} strokeWidth="3.5" />
            <rect x="126" y="29" width="28" height="9" fill="#334155" stroke="#64748b" strokeWidth="1.3" />
            <rect x="152" y="26.5" width="12" height="14" rx="2" fill={accentColor} />
            <path d="M78 45 L92 45 L101 73 L85 73 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.6" />
            <path d="M45 45 L58 45 L51 67 L38 67 Z" fill="#090d16" stroke="#64748b" strokeWidth="1.5" />
            <polygon points="102,45 120,45 115,54 106,54" fill="#090d16" stroke={accentColor} strokeWidth="1.4" />
          </g>
        );
      case 'sniper':
        return (
          <g>
            <path d="M6 28 L36 28 L36 44 L10 51 Z" fill="#18181b" stroke={accentColor} strokeWidth="1.6" />
            <path d="M46 8 L98 8 L95 20 L50 20 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.6" />
            <rect x="56" y="20" width="5" height="5" fill="#475569" />
            <rect x="82" y="20" width="5" height="5" fill="#475569" />
            <rect x="36" y="25" width="76" height="18" rx="2.5" fill={bodyColor} stroke="#94a3b8" strokeWidth="1.8" />
            <line x1="42" y1="34" x2="106" y2="34" stroke={accentColor} strokeWidth="2.8" />
            <rect x="112" y="29.5" width="42" height="8" fill="#cbd5e1" />
            <polygon points="152,25 168,27 168,41 152,43" fill={accentColor} />
            <rect x="68" y="43" width="18" height="21" rx="2" fill="#090d16" stroke={accentColor} strokeWidth="1.5" />
            <path d="M40 43 L51 43 L46 65 L35 65 Z" fill="#090d16" stroke="#64748b" strokeWidth="1.4" />
          </g>
        );
      case 'plasma':
        return (
          <g>
            <path d="M14 27 L38 27 L38 46 L17 51 Z" fill="#1e1b4b" stroke={accentColor} strokeWidth="1.6" />
            <rect x="38" y="22" width="90" height="24" rx="8" fill={bodyColor} stroke="#94a3b8" strokeWidth="1.8" />
            <circle cx="58" cy="34" r="6.2" fill={accentColor} />
            <circle cx="78" cy="34" r="6.2" fill={accentColor} />
            <circle cx="98" cy="34" r="6.2" fill={accentColor} />
            <circle cx="116" cy="34" r="5" fill={accentColor} />
            <path d="M128 19 L152 25 L152 43 L128 49 Z" fill={accentColor} />
            <rect x="76" y="46" width="19" height="21" rx="3.5" fill="#3b0764" stroke={accentColor} strokeWidth="1.6" />
            <path d="M43 46 L57 46 L50 67 L36 67 Z" fill="#090d16" stroke="#64748b" strokeWidth="1.5" />
          </g>
        );
      case 'railgun':
        return (
          <g>
            <rect x="10" y="23" width="45" height="23" rx="3" fill={bodyColor} stroke="#94a3b8" strokeWidth="1.8" />
            <rect x="55" y="20" width="102" height="9" rx="1.5" fill="#1e293b" stroke={accentColor} strokeWidth="1.6" />
            <rect x="55" y="38" width="102" height="9" rx="1.5" fill="#1e293b" stroke={accentColor} strokeWidth="1.6" />
            <line x1="55" y1="33.5" x2="162" y2="33.5" stroke={accentColor} strokeWidth="4.5" strokeDasharray="8 3" />
            <path d="M38 46 L52 46 L45 68 L31 68 Z" fill="#090d16" stroke="#64748b" strokeWidth="1.5" />
            <rect x="74" y="47" width="22" height="19" rx="2.5" fill="#0f172a" stroke={accentColor} strokeWidth="1.6" />
          </g>
        );
      case 'cannon':
        return (
          <g>
            <rect x="16" y="16" width="102" height="31" rx="6" fill={bodyColor} stroke="#94a3b8" strokeWidth="2" />
            <rect x="34" y="25" width="66" height="13" rx="3" fill={accentColor} />
            <path d="M118 13 L150 9 L150 53 L118 49 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.8" />
            <rect x="38" y="47" width="14" height="21" rx="2" fill="#090d16" stroke="#64748b" strokeWidth="1.5" />
            <rect x="86" y="47" width="14" height="18" rx="2" fill="#090d16" stroke={accentColor} strokeWidth="1.5" />
          </g>
        );
      case 'scifi':
      default:
        return (
          <g>
            <polygon points="10,34 40,16 128,21 164,34 128,47 40,50" fill={bodyColor} stroke="#94a3b8" strokeWidth="2" />
            <polygon points="40,26 120,28 144,34 120,40 40,42" fill={accentColor} />
            <path d="M40 49 L54 49 L47 70 L33 70 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.5" />
            <rect x="92" y="47" width="14" height="18" rx="2" fill="#090d16" stroke={accentColor} strokeWidth="1.5" />
          </g>
        );
    }
  };

  return (
    <svg viewBox="0 0 176 82" className="w-full h-full overflow-visible">
      {renderArt()}
    </svg>
  );
};

export const CharacterShowcase: React.FC<CharacterShowcaseProps> = ({
  unlockedChars,
  activeChar,
  unlockedGuns,
  activeGun,
  onApplyLoadout,
  onClose
}) => {
  // Separate preview states initialized from currently equipped character and gun
  const [previewCharId, setPreviewCharId] = useState<string>(activeChar);
  const [previewGunId, setPreviewGunId] = useState<string>(activeGun);
  const [stageTransition, setStageTransition] = useState<boolean>(false);

  // Unsaved-changes confirmation dialog state & save error/guard state
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isApplyingRef = useRef<boolean>(false);

  const charItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const gunItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Smoothly center the selected character & weapon thumbnails in their horizontal strips
  useEffect(() => {
    const cBtn = charItemRefs.current[previewCharId];
    if (cBtn) {
      cBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [previewCharId]);

  useEffect(() => {
    const gBtn = gunItemRefs.current[previewGunId];
    if (gBtn) {
      gBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [previewGunId]);

  const previewChar = PRO_CHARACTERS.find((c) => c.id === previewCharId) || PRO_CHARACTERS[0];
  const previewGun = PRO_GUNS.find((g) => g.id === previewGunId) || PRO_GUNS[0];

  const isCharOwned = unlockedChars.includes(previewChar.id) || previewChar.cost === 0;
  const isGunOwned = unlockedGuns.includes(previewGun.id) || previewGun.cost === 0;
  const isSelectionOwned = isCharOwned && isGunOwned;

  const hasChanges = previewChar.id !== activeChar || previewGun.id !== activeGun;
  const canApply = isSelectionOwned && hasChanges;

  const handleSelectChar = (charId: string) => {
    setSaveError(null);
    if (charId === previewCharId) return;
    setStageTransition(true);
    setPreviewCharId(charId);
    window.setTimeout(() => setStageTransition(false), 150);
  };

  const handleSelectGun = (gunId: string) => {
    setSaveError(null);
    if (gunId === previewGunId) return;
    setStageTransition(true);
    setPreviewGunId(gunId);
    window.setTimeout(() => setStageTransition(false), 150);
  };

  // Top Close / Back handler: asks for confirmation if unsaved changes exist, otherwise exits directly
  const handleRequestClose = useCallback(() => {
    if (hasChanges) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  // Explicit Cancel / Confirm Discard: immediately discards preview changes and returns to Home
  const handleCancelAndDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
    setSaveError(null);
    setPreviewCharId(activeChar);
    setPreviewGunId(activeGun);
    onClose();
  }, [activeChar, activeGun, onClose]);

  // Apply & Close handler with double-tap guard, ownership validation, and save error handling
  const handleApplyAndClose = () => {
    if (isApplyingRef.current) return;
    setSaveError(null);

    if (!isSelectionOwned) {
      setSaveError('Locked — Not owned');
      return;
    }

    if (!hasChanges) {
      return;
    }

    isApplyingRef.current = true;
    try {
      const ok = onApplyLoadout(previewChar, previewGun);
      if (ok) {
        onClose();
      } else {
        setSaveError('Unable to save equipment selection. Please try again.');
        isApplyingRef.current = false;
      }
    } catch {
      setSaveError('Save failed. Please try again.');
      isApplyingRef.current = false;
    }
  };

  // Intercept browser/device Back (popstate) and Escape key inside Showcase
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showDiscardConfirm) {
          setShowDiscardConfirm(false);
        } else {
          handleRequestClose();
        }
      }
    };

    const handlePopState = () => {
      if (hasChanges) {
        try {
          window.history.pushState({ showcaseOpen: true }, '');
        } catch {
          // ignore
        }
        setShowDiscardConfirm(true);
      } else {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasChanges, handleRequestClose, onClose, showDiscardConfirm]);

  return (
    <div
      id="character-weapon-showcase"
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[210] flex flex-col justify-between overflow-hidden select-none modal-enter"
      style={{
        background:
          'radial-gradient(circle at 50% 44%, rgba(22, 34, 54, 0.96) 0%, rgba(10, 15, 25, 0.99) 58%, #04070d 100%)',
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right))'
      }}
    >
      {/* Subtle Studio Backdrop Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-12"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* ========== 1. TOP AREA: COMPACT CLOSE/BACK BUTTON + HORIZONTAL CHARACTER-SELECTION STRIP ========== */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="relative z-20 w-full max-w-[920px] mx-auto px-2 sm:px-3 flex flex-col gap-1.5 shrink-0"
      >
        {/* Minimal Top Header: Close/Back Button + Previewed Selection Name */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleRequestClose}
            className="px-2.5 py-1.5 rounded-xl theme-neutral font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98] transition-transform"
            title="Close Showcase"
          >
            <span className="ui-icon-box-sm icon-box-neutral">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <span>Close</span>
          </button>

          <div className="px-2.5 py-1 rounded-xl bg-[#0b111d]/95 border border-[#253449] flex items-center gap-1.5 text-[11px] font-extrabold truncate">
            <span style={{ color: previewChar.color || '#38bdf8' }} className="truncate">
              {previewChar.nameEn}
            </span>
            <span className="text-slate-500">·</span>
            <span
              style={{ color: previewGun.accentColor || previewGun.bulletColor || '#38bdf8' }}
              className="truncate"
            >
              {previewGun.nameEn}
            </span>
          </div>
        </div>

        {/* Compact Horizontal Scrollable Character Strip */}
        <div className="w-full rounded-2xl bg-[#0a101b]/95 border border-[#243349] p-1.5 shadow-lg">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto touch-pan-x pb-0.5">
            {PRO_CHARACTERS.map((char) => {
              const isOwned = unlockedChars.includes(char.id) || char.cost === 0;
              const isEquipped = activeChar === char.id;
              const isSelected = previewChar.id === char.id;

              return (
                <button
                  key={char.id}
                  ref={(el) => {
                    charItemRefs.current[char.id] = el;
                  }}
                  type="button"
                  onClick={() => handleSelectChar(char.id)}
                  className={`relative w-[72px] sm:w-[82px] shrink-0 rounded-xl p-1 flex flex-col items-center transition-all cursor-pointer active:scale-[0.97] ${
                    isSelected
                      ? 'bg-[#13233b] border-2 border-sky-400 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]'
                      : isOwned
                      ? 'bg-[#0e1624] border border-[#26354a] hover:border-[#3b5272]'
                      : 'bg-[#0b101a] border border-[#1f2a3c] opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Equipped or Locked Corner Status Badge */}
                  {isEquipped ? (
                    <span
                      className="absolute top-1 right-1 z-10 w-4 h-4 rounded-md theme-play flex items-center justify-center"
                      title="Currently Equipped"
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : !isOwned ? (
                    <span
                      className="absolute top-1 right-1 z-10 w-4 h-4 rounded-md theme-danger flex items-center justify-center"
                      title="Locked"
                    >
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  ) : null}

                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-[#070b13] border border-[#1d2a3d] flex items-center justify-center overflow-hidden">
                    <HomeSurvivorCharacter
                      character={char}
                      gun={previewGun}
                      compact
                      paused
                    />
                  </div>

                  <span
                    className={`mt-1 text-[10px] font-extrabold leading-tight truncate w-full text-center ${
                      isSelected ? 'text-sky-200' : 'text-slate-300'
                    }`}
                  >
                    {char.nameEn.replace(/^Operative\s+/i, '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========== 2. CENTER STUDIO STAGE: LARGE FULL-BODY CHARACTER HOLDING SELECTED WEAPON ========== */}
      <div className="relative z-10 flex-1 min-h-0 w-full flex flex-col items-center justify-center px-2 overflow-hidden">
        {/* Floor Studio Spotlight & Rim Reflection */}
        <div
          className="pointer-events-none absolute w-64 h-64 sm:w-88 sm:h-88 rounded-full blur-3xl opacity-20 transition-colors duration-300"
          style={{
            background: `radial-gradient(circle, ${previewChar.color || '#38bdf8'} 0%, transparent 70%)`
          }}
        />

        {/* Full-Body Character with Subtle Breathing/Idle Movement & Properly Gripped Weapon */}
        <div
          className={`flex items-center justify-center transition-all duration-150 ease-out ${
            stageTransition ? 'scale-[0.97] opacity-90' : 'scale-100 opacity-100'
          }`}
        >
          <HomeSurvivorCharacter
            character={previewChar}
            gun={previewGun}
            showcaseMode
            inspectPose="ready_stance"
          />
        </div>
      </div>

      {/* ========== 3. BOTTOM AREA: WEAPON STRIP + PROFESSIONAL CONFIRM / CANCEL ACTION BAR ========== */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="relative z-20 w-full max-w-[920px] mx-auto px-2 sm:px-3 flex flex-col gap-1.5 shrink-0"
      >
        {/* Compact Horizontal Weapon-Selection Strip */}
        <div className="w-full rounded-2xl bg-[#0a101b]/95 border border-[#243349] p-1.5 shadow-lg">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto touch-pan-x pb-0.5">
            {PRO_GUNS.map((gun) => {
              const isOwned = unlockedGuns.includes(gun.id) || gun.cost === 0;
              const isEquipped = activeGun === gun.id;
              const isSelected = previewGun.id === gun.id;

              return (
                <button
                  key={gun.id}
                  ref={(el) => {
                    gunItemRefs.current[gun.id] = el;
                  }}
                  type="button"
                  onClick={() => handleSelectGun(gun.id)}
                  className={`relative w-[82px] sm:w-[92px] shrink-0 rounded-xl p-1.5 flex flex-col items-center transition-all cursor-pointer active:scale-[0.97] ${
                    isSelected
                      ? 'bg-[#13233b] border-2 border-sky-400 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]'
                      : isOwned
                      ? 'bg-[#0e1624] border border-[#26354a] hover:border-[#3b5272]'
                      : 'bg-[#0b101a] border border-[#1f2a3c] opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Equipped or Locked Corner Status Badge */}
                  {isEquipped ? (
                    <span
                      className="absolute top-1 right-1 z-10 w-4 h-4 rounded-md theme-play flex items-center justify-center"
                      title="Currently Equipped"
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : !isOwned ? (
                    <span
                      className="absolute top-1 right-1 z-10 w-4 h-4 rounded-md theme-danger flex items-center justify-center"
                      title="Locked"
                    >
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  ) : null}

                  <div className="w-full h-9 sm:h-10 rounded-lg bg-[#070b13] border border-[#1d2a3d] px-1.5 py-0.5 flex items-center justify-center overflow-hidden">
                    <WeaponThumbnailSVG
                      type={gun.weaponType}
                      bodyColor={gun.bodyColor}
                      accentColor={gun.accentColor}
                    />
                  </div>

                  <span
                    className={`mt-1 text-[10px] font-extrabold leading-tight truncate w-full text-center ${
                      isSelected ? 'text-sky-200' : 'text-slate-300'
                    }`}
                  >
                    {gun.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Unified Dark Gunmetal Confirmation Action Bar (Cancel & Apply & Close) */}
        <div className="w-full rounded-2xl bg-[#0b111c]/95 border border-[#26354a] px-2.5 py-2 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Status / Validation Readout */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 min-w-0">
            {saveError ? (
              <div className="px-2.5 py-1 rounded-lg bg-[#2a1219] border border-[#7f2b3c] text-rose-200 text-[11px] font-bold flex items-center gap-1.5 truncate">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{saveError}</span>
              </div>
            ) : !isSelectionOwned ? (
              <div className="px-2.5 py-1 rounded-lg bg-[#261319] border border-[#6e2838] text-rose-200 text-[11px] font-extrabold flex items-center gap-1.5 truncate">
                <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">Locked — Not owned</span>
              </div>
            ) : !hasChanges ? (
              <div className="px-2.5 py-1 rounded-lg bg-[#0e2226] border border-[#1f4d53] text-teal-200 text-[11px] font-extrabold flex items-center gap-1.5 truncate">
                <Check className="w-3.5 h-3.5 text-teal-400 stroke-[2.5] shrink-0" />
                <span className="truncate">Equipped</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-lg bg-[#101c2e] border border-[#2a4365] text-sky-200 text-[11px] font-bold flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                <span className="truncate">Previewing new selection</span>
              </div>
            )}
          </div>

          {/* Action Buttons: Cancel (Neutral Charcoal/Slate) + Apply & Close (Deep-Teal Accent) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCancelAndDiscard}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#161f2e] hover:bg-[#1e293b] border border-[#33435a] text-slate-200 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
            >
              <X className="w-3.5 h-3.5 text-slate-300" />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              disabled={!canApply}
              onClick={handleApplyAndClose}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                canApply
                  ? 'bg-[#0f383c] hover:bg-[#14494e] border-2 border-[#2dd4bf]/80 text-teal-100 shadow-[0_2px_10px_rgba(20,184,166,0.25)] cursor-pointer active:scale-[0.98]'
                  : 'bg-[#121926] border border-[#253246] text-slate-500 cursor-not-allowed opacity-75'
              }`}
            >
              {!isSelectionOwned ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Apply & Close</span>
                </>
              ) : !hasChanges ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Equipped</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5] text-teal-300" />
                  <span>Apply & Close</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========== 4. UNSAVED CHANGES CONFIRMATION DIALOG (ON CLOSE / BACK) ========== */}
      {showDiscardConfirm && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[230] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 modal-enter"
        >
          <div className="w-full max-w-[330px] rounded-2xl bg-[#0c1320] border-2 border-[#2c3e57] p-4 shadow-2xl flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#2a161e] border border-[#7c2d3e] flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-300" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-100">
                  Discard selection changes?
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Your previewed character or weapon has not been applied yet.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#161f2e] hover:bg-[#1e293b] border border-[#33435a] text-slate-200 font-extrabold text-xs cursor-pointer active:scale-[0.98] transition-all"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleCancelAndDiscard}
                className="flex-1 py-2 px-3 rounded-xl bg-[#381620] hover:bg-[#491c29] border border-[#883247] text-rose-100 font-extrabold text-xs cursor-pointer active:scale-[0.98] transition-all"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
