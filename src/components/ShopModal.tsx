import React, { useState, useRef, useEffect } from 'react';
import { CharacterItem, EmoteId, EmoteItem, GunItem, WeaponVisualType } from '../types/game';
import { PRO_CHARACTERS, PRO_EMOTES, PRO_GUNS } from '../utils/proShopData';
import { HomeSurvivorCharacter } from './HomeSurvivorCharacter';
import { sound } from '../utils/audio';
import { Check, Lock, AlertCircle, Crosshair, Zap, Shield, Layers, RotateCw, Sparkles, Play, ArrowLeft, ShoppingBag } from 'lucide-react';

export type ShopCategoryTab = 'weapons' | 'characters' | 'emotes';

const ShopCoinSvg: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none">
    <circle cx="12" cy="12" r="9.5" fill="#d97706" stroke="#fde68a" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="6.5" fill="#b45309" stroke="#fcd34d" strokeWidth="1" />
    <path d="M12 7.5v9M9.5 9.8c0-1 1.1-1.6 2.5-1.6s2.5.6 2.5 1.6c0 1.8-5 1.4-5 3.4 0 1 1.1 1.7 2.5 1.7s2.5-.7 2.5-1.7" stroke="#fef3c7" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

interface ShopModalProps {
  coins: number;
  highestLevelUnlocked: number;
  unlockedChars: string[];
  activeChar: string;
  unlockedGuns: string[];
  activeGun: string;
  unlockedEmotes: EmoteId[];
  equippedEmotes: [EmoteId | null, EmoteId | null];
  initialTab?: ShopCategoryTab;
  preferredEmoteSlot?: 0 | 1;
  lang?: string;
  onBuyOrEquipCharacter: (char: CharacterItem) => boolean;
  onBuyOrEquipGun: (gun: GunItem) => boolean;
  onBuyEmote: (emote: EmoteItem, targetSlot: 0 | 1) => boolean;
  onEquipEmoteSlot: (emoteId: EmoteId, slotIndex: 0 | 1) => void;
  onClose: () => void;
}

export const EmoteVectorBadge: React.FC<{
  emoteId: EmoteId;
  accentColor: string;
  size?: 'sm' | 'md';
}> = ({ emoteId, accentColor, size = 'md' }) => {
  const dim = size === 'sm' ? 'w-6 h-6' : 'w-10 h-10';
  return (
    <svg viewBox="0 0 40 40" className={`${dim} shrink-0`}>
      <circle cx="20" cy="20" r="18" fill="#090d16" stroke={accentColor} strokeWidth="1.4" opacity="0.95" />
      {emoteId === 'victory_groove' && (
        <g stroke={accentColor} strokeWidth="2.1" strokeLinecap="round" fill="none">
          <circle cx="20" cy="11" r="3" fill={accentColor} stroke="none" />
          <path d="M20 15 L20 25 M20 17 L13 21 M20 17 L27 10 M20 25 L15 33 M20 25 L25 32" />
        </g>
      )}
      {emoteId === 'survivor_shuffle' && (
        <g stroke={accentColor} strokeWidth="2.1" strokeLinecap="round" fill="none">
          <circle cx="20" cy="10.5" r="3" fill={accentColor} stroke="none" />
          <path d="M20 14.5 L19 24 M13 18 L27 18 M19 24 L12 31 M19 24 L27 31 M10 34 L16 34 M24 34 L30 34" />
        </g>
      )}
      {emoteId === 'battle_bounce' && (
        <g stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" fill="none">
          <circle cx="20" cy="12" r="3" fill={accentColor} stroke="none" />
          <path d="M20 16 L20 24 M20 18 L12 13 M20 18 L28 13 M20 24 L13 28 L14 33 M20 24 L27 28 L26 33" />
        </g>
      )}
      {emoteId === 'neon_footwork' && (
        <g stroke={accentColor} strokeWidth="2.1" strokeLinecap="round" fill="none">
          <circle cx="20" cy="10.5" r="3" fill={accentColor} stroke="none" />
          <path d="M20 14.5 L20 23 M12 20 L28 15 M20 23 L26 32 M20 23 L13 30" />
        </g>
      )}
      {emoteId === 'robot_pulse' && (
        <g stroke={accentColor} strokeWidth="2.1" strokeLinecap="square" fill="none">
          <rect x="16.5" y="8" width="7" height="6" rx="1" fill={accentColor} stroke="none" />
          <path d="M20 15 L20 25 M20 17 L12 17 L12 11 M20 17 L28 17 L28 23 M20 25 L15 33 M20 25 L25 33" />
        </g>
      )}
      {emoteId === 'midnight_step' && (
        <g stroke={accentColor} strokeWidth="2.1" strokeLinecap="round" fill="none">
          <circle cx="19" cy="11" r="3" fill={accentColor} stroke="none" />
          <path d="M19 15 L21 24 M20 17 L29 13 M20 17 L13 22 M21 24 L14 32 M21 24 L27 32" />
        </g>
      )}
      {emoteId === 'champion_spin' && (
        <g stroke={accentColor} strokeWidth="2" strokeLinecap="round" fill="none">
          <circle cx="20" cy="11" r="3" fill={accentColor} stroke="none" />
          <path d="M20 15 L20 24 M20 17 L12 10 M20 17 L28 10 M20 24 L15 32 M20 24 L25 32" />
          <ellipse cx="20" cy="22" rx="12" ry="4.5" strokeDasharray="3 2" />
        </g>
      )}
      {emoteId === 'siege_celebration' && (
        <g stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" fill="none">
          <circle cx="20" cy="10.5" r="3.2" fill={accentColor} stroke="none" />
          <path d="M20 14.5 L20 24 M20 17 L11 9 M20 17 L29 9 M20 24 L14 32 M20 24 L26 32" />
          <path d="M9 34 Q20 37 31 34" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
};

const WeaponPreviewSVG: React.FC<{
  type: WeaponVisualType;
  bodyColor: string;
  accentColor: string;
}> = ({ type, bodyColor, accentColor }) => {
  switch (type) {
    case 'pistol':
      return (
        <svg viewBox="0 0 96 44" className="w-full h-full">
          <rect x="20" y="9" width="4" height="3" fill={accentColor} />
          <rect x="60" y="9" width="3" height="3" fill={accentColor} />
          <rect x="18" y="12" width="46" height="11" rx="2" fill={bodyColor} stroke={accentColor} strokeWidth="1.5" />
          <rect x="38" y="23" width="22" height="3.5" rx="1" fill="#0f172a" stroke="#475569" strokeWidth="1" />
          <rect x="25" y="15.5" width="30" height="3.5" rx="1" fill={accentColor} />
          <rect x="64" y="13" width="8" height="9" rx="1.5" fill="#090d16" stroke={accentColor} strokeWidth="1.3" />
          <path d="M21 23 L32 23 L27 38 L16 38 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
          <rect x="15" y="38" width="13" height="3" rx="1" fill={accentColor} />
          <path d="M32 23 L40 23 L40 29 L30 29" fill="none" stroke={accentColor} strokeWidth="1.2" />
          <line x1="35" y1="23" x2="34" y2="27" stroke="#ffffff" strokeWidth="1.2" />
        </svg>
      );
    case 'smg':
      return (
        <svg viewBox="0 0 96 44" className="w-full h-full">
          <path d="M6 15 L20 15 L20 20 L10 21 L6 26 Z" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect x="4" y="14" width="3" height="13" rx="1" fill="#090d16" stroke={accentColor} strokeWidth="1" />
          <path d="M28 6 L40 6 L42 12 L26 12 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.2" />
          <rect x="20" y="12" width="42" height="12" rx="2" fill={bodyColor} stroke={accentColor} strokeWidth="1.5" />
          <rect x="26" y="15.5" width="28" height="3" fill={accentColor} />
          <rect x="62" y="14.5" width="24" height="7" rx="2" fill="#090d16" stroke={accentColor} strokeWidth="1.3" />
          <line x1="68" y1="15.5" x2="68" y2="20.5" stroke={accentColor} strokeWidth="1" />
          <line x1="74" y1="15.5" x2="74" y2="20.5" stroke={accentColor} strokeWidth="1" />
          <path d="M42 24 L49 24 L54 41 L46 41 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.2" />
          <rect x="53" y="24" width="5" height="10" rx="1" fill="#1e293b" />
          <path d="M23 24 L31 24 L27 36 L19 36 Z" fill="#0f172a" stroke="#475569" strokeWidth="1" />
        </svg>
      );
    case 'shotgun':
      return (
        <svg viewBox="0 0 96 44" className="w-full h-full">
          <path d="M4 25 L20 15 L20 24 L8 31 Z" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
          <rect x="20" y="13" width="34" height="10" rx="1.5" fill={bodyColor} stroke={accentColor} strokeWidth="1.4" />
          <rect x="25" y="15.5" width="3.5" height="5" fill="#ef4444" />
          <rect x="30" y="15.5" width="3.5" height="5" fill="#ef4444" />
          <rect x="35" y="15.5" width="3.5" height="5" fill="#ef4444" />
          <rect x="54" y="13" width="30" height="5.5" fill="#1e293b" stroke={accentColor} strokeWidth="1.2" />
          <rect x="54" y="18.5" width="27" height="4" fill="#334155" />
          <rect x="48" y="20" width="22" height="5.5" rx="2" fill={accentColor} stroke="#090d16" strokeWidth="1" />
          <rect x="84" y="12" width="7" height="10" rx="1" fill={accentColor} />
          <path d="M20 23 L28 23 L24 36 L16 36 Z" fill="#090d16" stroke="#475569" strokeWidth="1" />
        </svg>
      );
    case 'assault':
      return (
        <svg viewBox="0 0 96 44" className="w-full h-full">
          <path d="M4 14 L20 14 L20 24 L6 28 L4 24 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
          <rect x="2" y="13" width="3" height="13" rx="1" fill={accentColor} />
          <path d="M28 5 L45 5 L43 11 L30 11 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.3" />
          <rect x="20" y="12" width="50" height="12" rx="2" fill={bodyColor} stroke={accentColor} strokeWidth="1.5" />
          <line x1="25" y1="18" x2="65" y2="18" stroke={accentColor} strokeWidth="2.5" />
          <rect x="70" y="15" width="16" height="5" fill="#334155" />
          <rect x="85" y="13.5" width="7" height="8" rx="1" fill={accentColor} />
          <path d="M42 24 L50 24 L55 40 L46 40 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.3" />
          <path d="M23 24 L30 24 L26 36 L19 36 Z" fill="#090d16" stroke="#475569" strokeWidth="1" />
          <polygon points="56,24 66,24 63,29 58,29" fill="#090d16" stroke={accentColor} strokeWidth="1" />
        </svg>
      );
    case 'sniper':
      return (
        <svg viewBox="0 0 96 44" className="w-full h-full">
          <path d="M2 15 L18 15 L18 24 L4 28 Z" fill="#18181b" stroke={accentColor} strokeWidth="1.2" />
          <path d="M24 3 L54 3 L52 10 L26 10 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.3" />
          <rect x="30" y="10" width="3" height="3" fill="#475569" />
          <rect x="44" y="10" width="3" height="3" fill="#475569" />
          <rect x="18" y="13" width="44" height="10" rx="1.5" fill={bodyColor} stroke={accentColor} strokeWidth="1.4" />
          <rect x="62" y="15.5" width="24" height="4.5" fill="#cbd5e1" />
          <polygon points="85,13 94,14 94,22 85,23" fill={accentColor} />
          <rect x="36" y="23" width="10" height="12" fill="#090d16" stroke={accentColor} strokeWidth="1.2" />
          <path d="M20 23 L26 23 L23 35 L17 35 Z" fill="#090d16" />
        </svg>
      );
    case 'plasma':
      return (
        <svg viewBox="0 0 96 44" className="w-full h-full">
          <path d="M6 14 L20 14 L20 25 L8 28 Z" fill="#1e1b4b" stroke={accentColor} strokeWidth="1.2" />
          <rect x="20" y="11" width="52" height="14" rx="5" fill={bodyColor} stroke={accentColor} strokeWidth="1.5" />
          <circle cx="32" cy="18" r="3.8" fill={accentColor} />
          <circle cx="44" cy="18" r="3.8" fill={accentColor} />
          <circle cx="56" cy="18" r="3.8" fill={accentColor} />
          <path d="M72 9 L84 13 L84 23 L72 27 Z" fill={accentColor} />
          <rect x="42" y="25" width="11" height="12" rx="2" fill="#3b0764" stroke={accentColor} strokeWidth="1.2" />
          <path d="M23 25 L31 25 L27 37 L19 37 Z" fill="#090d16" />
        </svg>
      );
    case 'railgun':
      return (
        <svg viewBox="0 0 96 44" className="w-full h-full">
          <rect x="4" y="12" width="26" height="13" rx="2" fill={bodyColor} stroke={accentColor} strokeWidth="1.5" />
          <rect x="30" y="10" width="58" height="5" rx="1" fill="#1e293b" stroke={accentColor} strokeWidth="1.3" />
          <rect x="30" y="20" width="58" height="5" rx="1" fill="#1e293b" stroke={accentColor} strokeWidth="1.3" />
          <line x1="30" y1="17.5" x2="90" y2="17.5" stroke={accentColor} strokeWidth="3" strokeDasharray="5 2" />
          <path d="M20 25 L28 25 L24 37 L16 37 Z" fill="#090d16" />
          <rect x="40" y="25" width="13" height="11" rx="1.5" fill="#0f172a" stroke={accentColor} strokeWidth="1.2" />
        </svg>
      );
    case 'cannon':
      return (
        <svg viewBox="0 0 96 44" className="w-full h-full">
          <rect x="8" y="8" width="58" height="18" rx="4" fill={bodyColor} stroke={accentColor} strokeWidth="1.8" />
          <rect x="18" y="13" width="38" height="8" rx="2" fill={accentColor} />
          <path d="M66 6 L84 4 L84 28 L66 26 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.6" />
          <rect x="20" y="26" width="8" height="12" rx="1.5" fill="#090d16" stroke="#475569" strokeWidth="1" />
          <rect x="48" y="26" width="8" height="10" rx="1.5" fill="#090d16" stroke={accentColor} strokeWidth="1" />
        </svg>
      );
    case 'scifi':
    default:
      return (
        <svg viewBox="0 0 96 44" className="w-full h-full">
          <polygon points="4,18 22,8 72,11 92,18 72,25 22,27" fill={bodyColor} stroke={accentColor} strokeWidth="1.7" />
          <polygon points="22,14 68,15 80,18 68,21 22,22" fill={accentColor} />
          <path d="M22 26 L30 26 L26 38 L18 38 Z" fill="#090d16" stroke={accentColor} strokeWidth="1.1" />
          <rect x="52" y="25" width="8" height="10" rx="1.5" fill="#090d16" stroke={accentColor} strokeWidth="1.1" />
        </svg>
      );
  }
};

export const ShopModal: React.FC<ShopModalProps> = ({
  coins,
  highestLevelUnlocked,
  unlockedChars,
  activeChar,
  unlockedGuns,
  activeGun,
  unlockedEmotes,
  equippedEmotes,
  initialTab = 'weapons',
  onBuyOrEquipCharacter,
  onBuyOrEquipGun,
  onBuyEmote,
  onEquipEmoteSlot,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<ShopCategoryTab>(initialTab);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [previewEmoteId, setPreviewEmoteId] = useState<EmoteId | null>(null);
  const [previewTriggerKey, setPreviewTriggerKey] = useState<number>(0);
  const lockTapRef = useRef<boolean>(false);

  const activeCharItem = PRO_CHARACTERS.find(c => c.id === activeChar) || PRO_CHARACTERS[0];
  const activeGunItem = PRO_GUNS.find(g => g.id === activeGun) || PRO_GUNS[0];
  const previewEmoteItem = PRO_EMOTES.find(e => e.id === previewEmoteId) || null;
  const activeHomeEmoteId = equippedEmotes[0] || equippedEmotes[1] || unlockedEmotes[0] || 'victory_groove';

  useEffect(() => {
    return () => {
      sound.stopEmoteMusic();
    };
  }, []);

  const showNotice = (text: string, type: 'error' | 'success') => {
    setFeedbackMsg({ text, type });
  };

  const handleCloseShop = () => {
    sound.stopEmoteMusic();
    setPreviewEmoteId(null);
    onClose();
  };

  const handleTriggerPreview = (emote: EmoteItem) => {
    setPreviewEmoteId(emote.id);
    setPreviewTriggerKey(k => k + 1);
    sound.playEmoteBeat(emote.id, emote.durationMs);
  };

  const handleGunAction = (gun: GunItem) => {
    if (lockTapRef.current) return;
    lockTapRef.current = true;
    setTimeout(() => {
      lockTapRef.current = false;
    }, 220);

    const reqLvl = gun.requiredLevel || 1;
    const isUnlocked = unlockedGuns.includes(gun.id) || gun.cost === 0;
    const isEquipped = activeGun === gun.id;

    if (isEquipped) return;

    if (isUnlocked) {
      onBuyOrEquipGun(gun);
      showNotice(`Equipped ${gun.nameEn}!`, 'success');
      return;
    }

    if (highestLevelUnlocked < reqLvl) {
      showNotice(
        `Locked! Reach Level ${reqLvl} (Current: Lv ${highestLevelUnlocked}) & ${gun.cost.toLocaleString()} Coins to unlock ${gun.nameEn}.`,
        'error'
      );
      return;
    }

    if (coins < gun.cost) {
      const needed = gun.cost - coins;
      showNotice(`Need ${needed.toLocaleString()} more Coins to buy ${gun.nameEn}.`, 'error');
      return;
    }

    const ok = onBuyOrEquipGun(gun);
    if (ok) {
      showNotice(`Purchased & Equipped ${gun.nameEn}! (-${gun.cost.toLocaleString()} Coins)`, 'success');
    }
  };

  const handleCharAction = (char: CharacterItem) => {
    if (lockTapRef.current) return;
    lockTapRef.current = true;
    setTimeout(() => {
      lockTapRef.current = false;
    }, 220);

    const reqLvl = char.requiredLevel || 1;
    const isUnlocked = unlockedChars.includes(char.id) || char.cost === 0;
    const isEquipped = activeChar === char.id;

    if (isEquipped) return;

    if (isUnlocked) {
      onBuyOrEquipCharacter(char);
      showNotice(`Equipped operative ${char.nameEn}!`, 'success');
      return;
    }

    if (highestLevelUnlocked < reqLvl) {
      showNotice(
        `Locked! Reach Level ${reqLvl} (Current: Lv ${highestLevelUnlocked}) & ${char.cost.toLocaleString()} Coins to unlock ${char.nameEn}.`,
        'error'
      );
      return;
    }

    if (coins < char.cost) {
      const needed = char.cost - coins;
      showNotice(`Need ${needed.toLocaleString()} more Coins to unlock ${char.nameEn}.`, 'error');
      return;
    }

    const ok = onBuyOrEquipCharacter(char);
    if (ok) {
      showNotice(`Unlocked & Equipped ${char.nameEn}! (-${char.cost.toLocaleString()} Coins)`, 'success');
    }
  };

  const handleBuyEmoteAction = (emote: EmoteItem) => {
    if (lockTapRef.current) return;
    lockTapRef.current = true;
    setTimeout(() => {
      lockTapRef.current = false;
    }, 220);

    if (highestLevelUnlocked < emote.requiredLevel) {
      showNotice(
        `Locked! Reach Level ${emote.requiredLevel} (Current: Lv ${highestLevelUnlocked}) & ${emote.cost.toLocaleString()} Coins to unlock ${emote.nameEn}.`,
        'error'
      );
      return;
    }

    if (coins < emote.cost) {
      const needed = emote.cost - coins;
      showNotice(`Need ${needed.toLocaleString()} more Coins to buy ${emote.nameEn}.`, 'error');
      return;
    }

    const ok = onBuyEmote(emote, 0);
    if (ok) {
      handleTriggerPreview(emote);
      showNotice(
        `Purchased ${emote.nameEn} (-${emote.cost.toLocaleString()} Coins) & set as Home Emote!`,
        'success'
      );
    }
  };

  const handleEquipSingleEmote = (emote: EmoteItem) => {
    onEquipEmoteSlot(emote.id, 0);
    handleTriggerPreview(emote);
    showNotice(`Equipped ${emote.nameEn} on Home Emote Button!`, 'success');
  };

  const getRarityBadgeStyle = (rarity: EmoteItem['rarity']) => {
    switch (rarity) {
      case 'Mythic':
        return 'bg-purple-950/90 border-purple-500/70 text-purple-200';
      case 'Legendary':
        return 'bg-amber-950/90 border-amber-500/70 text-amber-200';
      case 'Epic':
        return 'bg-fuchsia-950/90 border-fuchsia-500/60 text-fuchsia-200';
      case 'Rare':
        return 'bg-sky-950/90 border-sky-500/60 text-sky-200';
      case 'Uncommon':
      default:
        return 'bg-slate-800/95 border-slate-500 text-slate-200';
    }
  };

  return (
    <div
      id="shopScreen"
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[200] bg-[#050811]/98 backdrop-blur-md flex flex-col overflow-hidden"
    >
      {/* Top Sticky Header — Role-Coloured Store Badge, Coin Counter & Back Button */}
      <div className="w-full px-4 py-3 border-b border-[#273449] bg-[#0b101b] flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5 text-left">
          <span className="ui-icon-box icon-box-shop">
            <ShoppingBag className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-amber-200 text-sm md:text-base font-extrabold tracking-widest uppercase">
              ARMORY, OPERATIVES & EMOTES
            </h2>
            <p className="text-[11px] text-slate-400">
              Campaign Progress: <span className="text-sky-300 font-bold">Lv {highestLevelUnlocked}/100</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1.5 rounded-lg ui-coin-badge font-mono font-bold text-xs flex items-center gap-1.5 tabular-nums">
            <span className="ui-icon-box-sm icon-box-coin">
              <ShopCoinSvg className="w-3.5 h-3.5" />
            </span>
            <span>{coins.toLocaleString()}</span>
          </div>
          <button
            type="button"
            onClick={handleCloseShop}
            className="px-2.5 py-1.5 rounded-lg theme-neutral font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <span className="ui-icon-box-sm icon-box-neutral">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <span>BACK</span>
          </button>
        </div>
      </div>

      {/* Category Switcher Tabs: Role-Coloured Tabs with Styled Inner Icon Boxes */}
      <div className="px-3.5 pt-2.5 pb-2 bg-[#070b14] border-b border-[#1e293b] grid grid-cols-3 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            sound.stopEmoteMusic();
            setPreviewEmoteId(null);
            setActiveTab('weapons');
            setFeedbackMsg(null);
          }}
          className={`py-2 px-2.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
            activeTab === 'weapons'
              ? 'theme-shop ring-1 ring-amber-400/50'
              : 'theme-neutral opacity-85 hover:opacity-100'
          }`}
        >
          <span className="ui-icon-box-sm icon-box-shop">
            <Crosshair className="w-3.5 h-3.5 shrink-0" />
          </span>
          <span className="truncate">Guns ({PRO_GUNS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.stopEmoteMusic();
            setPreviewEmoteId(null);
            setActiveTab('characters');
            setFeedbackMsg(null);
          }}
          className={`py-2 px-2.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
            activeTab === 'characters'
              ? 'theme-levels ring-1 ring-sky-400/50'
              : 'theme-neutral opacity-85 hover:opacity-100'
          }`}
        >
          <span className="ui-icon-box-sm icon-box-levels">
            <Shield className="w-3.5 h-3.5 shrink-0" />
          </span>
          <span className="truncate">Suits ({PRO_CHARACTERS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('emotes');
            setFeedbackMsg(null);
          }}
          className={`py-2 px-2.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
            activeTab === 'emotes'
              ? 'theme-emote ring-1 ring-purple-400/50'
              : 'theme-neutral opacity-85 hover:opacity-100'
          }`}
        >
          <span className="ui-icon-box-sm icon-box-emote">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
          </span>
          <span className="truncate">Emotes ({PRO_EMOTES.length})</span>
        </button>
      </div>

      {/* Status / Insufficient Coins or Level Notice Banner */}
      {feedbackMsg && (
        <div
          className={`mx-4 mt-2 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between shrink-0 ${
            feedbackMsg.type === 'error'
              ? 'theme-danger'
              : 'theme-play'
          }`}
        >
          <div className="flex items-center gap-2 text-left">
            <span className={`ui-icon-box-sm ${feedbackMsg.type === 'error' ? 'icon-box-danger' : 'icon-box-play'}`}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            </span>
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-[11px] opacity-80 hover:opacity-100 ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Scrollable Store Body */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-2.5 touch-pan-y">
        {activeTab === 'weapons' ? (
          <>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
              <span>Tactical Sidearms to Heavy Piercing Rifles</span>
              <span className="text-amber-300 font-semibold">Real Combat & Pierce Stats</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {PRO_GUNS.map((gun: GunItem) => {
                const reqLvl = gun.requiredLevel || 1;
                const isUnlocked = unlockedGuns.includes(gun.id) || gun.cost === 0;
                const isEquipped = activeGun === gun.id;
                const meetsLevel = highestLevelUnlocked >= reqLvl;
                const canAfford = coins >= gun.cost;

                return (
                  <div
                    key={gun.id}
                    className={`rounded-xl p-3 transition-all flex flex-col gap-2.5 ${
                      isEquipped
                        ? 'ui-card-equipped'
                        : isUnlocked
                        ? 'ui-card-standard'
                        : 'ui-card-locked'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-28 h-16 rounded-lg ui-inset-box flex items-center justify-center p-1.5 shrink-0 relative overflow-hidden"
                        style={{
                          borderColor: isEquipped ? '#258f7d' : '#2b3d54'
                        }}
                      >
                        <WeaponPreviewSVG
                          type={gun.weaponType}
                          bodyColor={gun.bodyColor}
                          accentColor={gun.accentColor}
                        />
                        <span className="absolute bottom-0.5 right-1.5 text-[8px] font-mono uppercase tracking-wider text-slate-400">
                          {gun.weaponType}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between gap-1">
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-100 truncate">
                              {gun.nameEn}
                            </h4>
                            <div className="text-[10px] text-slate-400 truncate">
                              {gun.categoryLabel || gun.weaponType.toUpperCase()}
                            </div>
                          </div>

                          {gun.cost === 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded theme-play shrink-0">
                              STARTER
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded theme-levels shrink-0">
                              OWNED
                            </span>
                          ) : (
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg ui-coin-badge shrink-0 tabular-nums flex items-center gap-1">
                              <ShopCoinSvg className="w-3.5 h-3.5" />
                              <span>{gun.cost.toLocaleString()}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                              meetsLevel || isUnlocked
                                ? 'bg-[#0c261e] border-emerald-500/50 text-emerald-300'
                                : 'bg-[#261019] border-[#9f1239] text-rose-200'
                            }`}
                          >
                            {meetsLevel || isUnlocked ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Req. Level {reqLvl}</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Requires Level {reqLvl}</span>
                              </>
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1 mt-2 text-[10px]">
                          <div className="ui-inset-box rounded px-1.5 py-1 text-center">
                            <div className="text-slate-400 text-[8px] flex items-center justify-center gap-0.5">
                              <Zap className="w-2.5 h-2.5 text-rose-400" />
                              <span>DMG</span>
                            </div>
                            <div className="font-mono font-bold text-rose-300">
                              {gun.power}{gun.pellets && gun.pellets > 1 ? `x${gun.pellets}` : ''}
                            </div>
                          </div>

                          <div className="ui-inset-box rounded px-1.5 py-1 text-center">
                            <div className="text-slate-400 text-[8px]">RATE</div>
                            <div className="font-mono font-bold text-sky-300">
                              {gun.fireRate}/s
                            </div>
                          </div>

                          <div className="ui-inset-box rounded px-1.5 py-1 text-center">
                            <div className="text-slate-400 text-[8px] flex items-center justify-center gap-0.5">
                              <RotateCw className="w-2.5 h-2.5 text-amber-400" />
                              <span>MAG</span>
                            </div>
                            <div className="font-mono font-bold text-amber-300">
                              {gun.magSize}/{gun.ammo}
                            </div>
                          </div>

                          <div className="ui-inset-box rounded px-1.5 py-1 text-center">
                            <div className="text-slate-400 text-[8px] flex items-center justify-center gap-0.5">
                              <Layers className="w-2.5 h-2.5 text-emerald-400" />
                              <span>PIERCE</span>
                            </div>
                            <div className="font-mono font-bold text-emerald-300">
                              {gun.penetration}x
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-1.5 border-t border-[#1e293b]">
                      {isEquipped ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2 px-4 rounded-xl ui-card-equipped font-extrabold text-xs flex items-center justify-center gap-2 cursor-default"
                        >
                          <span className="ui-icon-box-sm icon-box-play">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                          <span>EQUIPPED WEAPON</span>
                        </button>
                      ) : isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => handleGunAction(gun)}
                          className="w-full py-2 px-4 rounded-xl theme-play font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <span className="ui-icon-box-sm icon-box-play">
                            <Crosshair className="w-3.5 h-3.5" />
                          </span>
                          <span>EQUIP WEAPON</span>
                        </button>
                      ) : !meetsLevel ? (
                        <button
                          type="button"
                          onClick={() => handleGunAction(gun)}
                          className="w-full py-2 px-4 rounded-xl theme-danger font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span className="ui-icon-box-sm icon-box-danger">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                          <span>LOCKED • REACH LEVEL {reqLvl} & {gun.cost.toLocaleString()} COINS</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGunAction(gun)}
                          className={`w-full py-2 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            canAfford ? 'theme-shop' : 'theme-neutral text-slate-300'
                          }`}
                        >
                          <span className={`ui-icon-box-sm ${canAfford ? 'icon-box-shop' : 'icon-box-neutral'}`}>
                            <ShopCoinSvg className="w-3.5 h-3.5" />
                          </span>
                          <span>BUY FOR {gun.cost.toLocaleString()} COINS</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : activeTab === 'characters' ? (
          <>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
              <span>Original Survivor Operatives (Dark Rugged Armor)</span>
              <span className="text-sky-300 font-semibold">Applies in Home & Combat</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {PRO_CHARACTERS.map((char: CharacterItem) => {
                const reqLvl = char.requiredLevel || 1;
                const isUnlocked = unlockedChars.includes(char.id) || char.cost === 0;
                const isEquipped = activeChar === char.id;
                const meetsLevel = highestLevelUnlocked >= reqLvl;
                const canAfford = coins >= char.cost;

                return (
                  <div
                    key={char.id}
                    className={`rounded-xl p-3 transition-all flex flex-col gap-2.5 ${
                      isEquipped
                        ? 'ui-card-equipped'
                        : isUnlocked
                        ? 'ui-card-standard'
                        : 'ui-card-locked'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-24 h-24 rounded-xl ui-inset-box flex items-center justify-center shrink-0 relative overflow-hidden p-1"
                        style={{
                          borderColor: isEquipped ? '#258f7d' : '#2b3d54'
                        }}
                      >
                        <HomeSurvivorCharacter
                          character={char}
                          gun={activeGunItem}
                          compact
                        />
                      </div>

                      <div className="flex-1 min-w-0 text-left space-y-1.5">
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h4 className="text-sm font-bold text-slate-100 truncate">
                              {char.nameEn}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {char.roleEn || 'Tactical Survivor Operative'}
                            </p>
                          </div>

                          {char.cost === 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded theme-play shrink-0">
                              STARTER
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded theme-levels shrink-0">
                              OWNED
                            </span>
                          ) : (
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg ui-coin-badge shrink-0 tabular-nums flex items-center gap-1">
                              <ShopCoinSvg className="w-3.5 h-3.5" />
                              <span>{char.cost.toLocaleString()}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                              meetsLevel || isUnlocked
                                ? 'bg-[#0c261e] border-emerald-500/50 text-emerald-300'
                                : 'bg-[#261019] border-[#9f1239] text-rose-200'
                            }`}
                          >
                            {meetsLevel || isUnlocked ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Req. Level {reqLvl}</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Requires Level {reqLvl}</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-1.5 border-t border-[#1e293b]">
                      {isEquipped ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2 px-4 rounded-xl ui-card-equipped font-extrabold text-xs flex items-center justify-center gap-2 cursor-default"
                        >
                          <span className="ui-icon-box-sm icon-box-play">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                          <span>EQUIPPED OPERATIVE</span>
                        </button>
                      ) : isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => handleCharAction(char)}
                          className="w-full py-2 px-4 rounded-xl theme-play font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <span className="ui-icon-box-sm icon-box-play">
                            <Shield className="w-3.5 h-3.5" />
                          </span>
                          <span>EQUIP OPERATIVE</span>
                        </button>
                      ) : !meetsLevel ? (
                        <button
                          type="button"
                          onClick={() => handleCharAction(char)}
                          className="w-full py-2 px-4 rounded-xl theme-danger font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span className="ui-icon-box-sm icon-box-danger">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                          <span>LOCKED • REACH LEVEL {reqLvl} & {char.cost.toLocaleString()} COINS</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCharAction(char)}
                          className={`w-full py-2 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            canAfford ? 'theme-shop' : 'theme-neutral text-slate-300'
                          }`}
                        >
                          <span className={`ui-icon-box-sm ${canAfford ? 'icon-box-shop' : 'icon-box-neutral'}`}>
                            <ShopCoinSvg className="w-3.5 h-3.5" />
                          </span>
                          <span>UNLOCK FOR {char.cost.toLocaleString()} COINS</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* ========== EMOTES & CELEBRATION DANCES TAB ========== */
          <>
            {/* Live Interactive Emote Preview Stage */}
            <div className="rounded-xl ui-panel-box p-3 flex items-center gap-3">
              <div className="w-28 h-28 rounded-xl ui-inset-box flex items-center justify-center shrink-0 overflow-hidden p-1">
                <HomeSurvivorCharacter
                  character={activeCharItem}
                  gun={activeGunItem}
                  compact
                  activeEmote={previewEmoteId}
                  emoteTriggerKey={previewTriggerKey}
                  onEmoteComplete={() => {
                    setPreviewEmoteId(null);
                    sound.stopEmoteMusic();
                  }}
                />
              </div>

              <div className="flex-1 min-w-0 text-left space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded theme-emote text-[10px] font-bold uppercase tracking-wider">
                    {previewEmoteItem ? '★ LIVE PREVIEW' : 'STAGE READY'}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-100 truncate">
                  {previewEmoteItem ? previewEmoteItem.nameEn : 'Tap "Preview" on Any Emote'}
                </h3>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {previewEmoteItem
                    ? previewEmoteItem.subtitleEn
                    : 'Preview full-body dances with weapon back-sling before buying. All owned emotes can be played from the Home Emote button.'}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-300 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg theme-emote flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    <span>
                      Home Emote: <b className="text-purple-200">{PRO_EMOTES.find(e => e.id === activeHomeEmoteId)?.nameEn || 'Victory Groove'}</b>
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* 8 Original Celebration & Dance Emote Cards */}
            <div className="grid grid-cols-1 gap-2.5">
              {PRO_EMOTES.map((emote: EmoteItem) => {
                const isUnlocked = unlockedEmotes.includes(emote.id);
                const isActiveHomeEmote = activeHomeEmoteId === emote.id;
                const meetsLevel = highestLevelUnlocked >= emote.requiredLevel;
                const canAfford = coins >= emote.cost;
                const isPreviewingThis = previewEmoteId === emote.id;

                return (
                  <div
                    key={emote.id}
                    className={`rounded-xl p-3 transition-all flex flex-col gap-2.5 ${
                      isActiveHomeEmote
                        ? 'ui-card-equipped'
                        : isUnlocked
                        ? 'ui-card-standard'
                        : 'ui-card-locked'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Emote Animated Vector Badge + Dedicated Preview Trigger */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <div
                          className="w-16 h-16 rounded-xl ui-inset-box flex items-center justify-center relative"
                          style={{
                            borderColor: isPreviewingThis
                              ? emote.accentColor
                              : isActiveHomeEmote
                              ? '#258f7d'
                              : '#2b3d54'
                          }}
                        >
                          <EmoteVectorBadge emoteId={emote.id} accentColor={emote.accentColor} />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTriggerPreview(emote)}
                          className={`w-16 py-1 px-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                            isPreviewingThis ? 'theme-play' : 'theme-emote'
                          }`}
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{isPreviewingThis ? 'Active' : 'Preview'}</span>
                        </button>
                      </div>

                      {/* Emote Details, Rarity, Level Requirement & Price */}
                      <div className="flex-1 min-w-0 text-left space-y-1.5">
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-100 truncate">
                                {emote.nameEn}
                              </h4>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${getRarityBadgeStyle(
                                  emote.rarity
                                )}`}
                              >
                                {emote.rarity}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                              {emote.subtitleEn}
                            </p>
                          </div>

                          {isUnlocked ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded theme-emote shrink-0">
                              OWNED
                            </span>
                          ) : (
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg ui-coin-badge shrink-0 tabular-nums flex items-center gap-1">
                              <ShopCoinSvg className="w-3.5 h-3.5" />
                              <span>{emote.cost.toLocaleString()}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                              meetsLevel || isUnlocked
                                ? 'bg-[#0c261e] border-emerald-500/50 text-emerald-300'
                                : 'bg-[#261019] border-[#9f1239] text-rose-200'
                            }`}
                          >
                            {meetsLevel || isUnlocked ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Req. Level {emote.requiredLevel}</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Requires Level {emote.requiredLevel}</span>
                              </>
                            )}
                          </span>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded ui-inset-box text-slate-300">
                            {(emote.durationMs / 1000).toFixed(1)}s • Dance
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Row: Single Home Emote Equip or Buy */}
                    <div className="pt-1.5 border-t border-[#1e293b]">
                      {isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => handleEquipSingleEmote(emote)}
                          className={`w-full py-2 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                            isActiveHomeEmote ? 'ui-card-equipped' : 'theme-emote'
                          }`}
                        >
                          <span className={`ui-icon-box-sm ${isActiveHomeEmote ? 'icon-box-play' : 'icon-box-emote'}`}>
                            {isActiveHomeEmote ? (
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <span>{isActiveHomeEmote ? 'EQUIPPED ON HOME' : 'EQUIP ON HOME'}</span>
                        </button>
                      ) : !meetsLevel ? (
                        <button
                          type="button"
                          onClick={() => handleBuyEmoteAction(emote)}
                          className="w-full py-2 px-4 rounded-xl theme-danger font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span className="ui-icon-box-sm icon-box-danger">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                          <span>LOCKED • REACH LEVEL {emote.requiredLevel} & {emote.cost.toLocaleString()} COINS</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBuyEmoteAction(emote)}
                          className={`w-full py-2 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            canAfford ? 'theme-shop' : 'theme-neutral text-slate-300'
                          }`}
                        >
                          <span className={`ui-icon-box-sm ${canAfford ? 'icon-box-shop' : 'icon-box-neutral'}`}>
                            <ShopCoinSvg className="w-3.5 h-3.5" />
                          </span>
                          <span>BUY EMOTE FOR {emote.cost.toLocaleString()} COINS</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Bottom Footer Back Button */}
      <div className="p-3 border-t border-[#273449] bg-[#0b101b] shrink-0">
        <button
          type="button"
          onClick={handleCloseShop}
          className="w-full py-2.5 px-4 rounded-xl theme-neutral font-extrabold text-xs tracking-wider uppercase cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          <span className="ui-icon-box-sm icon-box-neutral">
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>
          <span>BACK TO COMMAND DECK</span>
        </button>
      </div>
    </div>
  );
};
