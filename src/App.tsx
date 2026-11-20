/**
 * ZOMBIE SIEGE: DEADLINE
 * Tactical Sci-Fi Zombie Shooter with Hold-to-Aim / Release-to-Fire & Cancel Zone,
 * Weapon Penetration, Gravity & Destructible Support Physics, Moving Obstacles,
 * 100 Explicit Tactical Levels, Armory, Operatives & Celebration Emotes Shop
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  Language,
  GameSaveData,
  CharacterItem,
  GunItem,
  EmoteId,
  EmoteItem,
  MissionRewardSummary
} from './types/game';
import {
  loadGameData,
  saveGameData,
  loadLanguage
} from './utils/storage';
import { PRO_CHARACTERS, PRO_EMOTES, PRO_GUNS } from './utils/proShopData';
import { sound } from './utils/audio';
import { GameCanvas } from './components/GameCanvas';
import { ShopModal, ShopCategoryTab, EmoteVectorBadge } from './components/ShopModal';
import { LevelClearedModal } from './components/LevelClearedModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { ControlsModal } from './components/ControlsModal';
import { ProfileModal } from './components/ProfileModal';
import { HomeSurvivorCharacter } from './components/HomeSurvivorCharacter';
import { CharacterShowcase } from './components/CharacterShowcase';
import { LoadingScreen } from './components/LoadingScreen';
import {
  ShoppingBag,
  SlidersHorizontal,
  Trophy,
  BookOpen,
  Play,
  Pause,
  RotateCw,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  Crosshair,
  Shield,
  Sparkles,
  Lock,
  Check,
  X,
  User,
  Layers
} from 'lucide-react';

export const GoldCoinIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 20 20" className={`${className} shrink-0`} fill="none">
    <circle cx="10" cy="10" r="8" fill="#452708" stroke="#fbbf24" strokeWidth="1.6" />
    <circle cx="10" cy="10" r="5.3" fill="#78350f" stroke="#fcd34d" strokeWidth="1" strokeDasharray="2 1.2" />
    <path d="M10 6.2V13.8M7.8 8.3H11.6C12.2 8.3 12.2 9.8 11.4 9.9H8.5C7.7 10 7.7 11.7 8.5 11.7H12.2" stroke="#fde68a" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export function computeMissionReward(
  level: number,
  remainingAmmo: number,
  combatCoins: number,
  prevStars: number
): MissionRewardSummary {
  const stars = remainingAmmo >= 2 ? 3 : remainingAmmo === 1 ? 2 : 1;
  const isFirstClear = prevStars === 0;
  const fullBaseBounty = 380 + level * 22;
  const perStarUnit = 35 + level * 4;

  const baseReward = isFirstClear
    ? fullBaseBounty
    : Math.round(fullBaseBounty * 0.25);

  const improvedStars = Math.max(0, stars - prevStars);
  const starBonus = isFirstClear
    ? stars * perStarUnit
    : improvedStars * perStarUnit + Math.round(stars * perStarUnit * 0.25);

  const combatReward = isFirstClear
    ? Math.max(0, Math.round(combatCoins))
    : Math.max(0, Math.round(combatCoins * 0.4));

  const totalCoinsEarned = baseReward + starBonus + combatReward;

  return {
    level,
    stars,
    isFirstClear,
    baseReward,
    starBonus,
    combatReward,
    totalCoinsEarned
  };
}

export default function App() {
  const [saveData, setSaveData] = useState<GameSaveData>(() => loadGameData());
  const [lang] = useState<Language>(() => loadLanguage());

  // Core screen state starts at 'MENU'; branded 8s LoadingScreen runs on fresh launch / reload
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isShowingLoading, setIsShowingLoading] = useState<boolean>(true);

  const [shopReturnState, setShopReturnState] = useState<GameState>('MENU');
  const [shopInitialTab, setShopInitialTab] = useState<ShopCategoryTab>('weapons');
  const [preferredEmoteSlot, setPreferredEmoteSlot] = useState<0 | 1>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(() => saveData.highestLevelUnlocked || 1);

  // Home Single-Entry Emote Playback & Selection Panel State
  const [activeHomeEmote, setActiveHomeEmote] = useState<EmoteId | null>(null);
  const [homeEmoteTriggerKey, setHomeEmoteTriggerKey] = useState<number>(0);
  const [emoteSlotPickerFor, setEmoteSlotPickerFor] = useState<0 | 1 | null>(null);

  // Fullscreen Character & Weapon Showcase State (Opened via Double-Tap / Double-Click on Home Character)
  const [showShowcase, setShowShowcase] = useState<boolean>(false);
  const lastCharTapRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 });

  // In-game dynamic stats
  const [ammo, setAmmo] = useState<number>(6);
  const [magAmmo, setMagAmmo] = useState<number>(3);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [isAiming, setIsAiming] = useState<boolean>(false);
  const [isCancelZone, setIsCancelZone] = useState<boolean>(false);
  const [zombiesLeft, setZombiesLeft] = useState<number>(0);
  const [playerHp, setPlayerHp] = useState<{ hp: number; maxHp: number }>({ hp: 3, maxHp: 3 });
  const [score, setScore] = useState<number>(0);
  const [lastRemainingAmmo, setLastRemainingAmmo] = useState<number>(0);
  const [lastRewardSummary, setLastRewardSummary] = useState<MissionRewardSummary | null>(null);
  const [failureReason, setFailureReason] = useState<string>('');

  // Persisted Audio & Settings State initialized from saveData
  const [soundMuted, setSoundMuted] = useState<boolean>(() => Boolean(saveData.soundMuted));
  const [homeVol, setHomeVol] = useState<number>(() => typeof saveData.homeVol === 'number' ? saveData.homeVol : 70);
  const [gameVol, setGameVol] = useState<number>(() => typeof saveData.gameVol === 'number' ? saveData.gameVol : 60);
  const [sfxVol, setSfxVol] = useState<number>(() => typeof saveData.sfxVol === 'number' ? saveData.sfxVol : 80);
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(true);

  // Modals
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showExitPrompt, setShowExitPrompt] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showControlsModal, setShowControlsModal] = useState<boolean>(false);

  const [canvasKey, setCanvasKey] = useState<number>(0);

  // Authoritative single-payout guard per mission run
  const victoryClaimedForRunRef = useRef<number>(-1);
  const activeRunIdRef = useRef<number>(0);

  // Refs for background pause protection & system dialog tracking
  const gameStateRef = useRef<GameState>(gameState);
  const showProfileModalRef = useRef<boolean>(showProfileModal);
  const isSystemDialogOpenRef = useRef<boolean>(false);
  const isShowingLoadingRef = useRef<boolean>(isShowingLoading);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    showProfileModalRef.current = showProfileModal;
  }, [showProfileModal]);

  useEffect(() => {
    isShowingLoadingRef.current = isShowingLoading;
  }, [isShowingLoading]);

  const stopHomeEmote = useCallback(() => {
    setActiveHomeEmote(null);
    sound.stopEmoteMusic();
  }, []);

  const openShowcase = useCallback(() => {
    stopHomeEmote();
    setEmoteSlotPickerFor(null);
    setShowShowcase(true);
    try {
      window.history.pushState({ showcaseOpen: true }, '');
    } catch {
      // ignore if history pushState is restricted
    }
  }, [stopHomeEmote]);

  const closeShowcase = useCallback(() => {
    setShowShowcase(false);
  }, []);

  // Isolated Double-Tap / Double-Click Handler on Home Character Only
  const handleHomeCharacterPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const now = performance.now();
      const prev = lastCharTapRef.current;
      const dt = now - prev.time;
      const dist = Math.hypot(e.clientX - prev.x, e.clientY - prev.y);

      if (dt > 40 && dt < 340 && dist < 28) {
        lastCharTapRef.current = { time: 0, x: 0, y: 0 };
        openShowcase();
      } else {
        lastCharTapRef.current = { time: now, x: e.clientX, y: e.clientY };
      }
    },
    [openShowcase]
  );

  // Pause active combat or stop emote safely on background switch without re-running the 8-second startup screen
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isSystemDialogOpenRef.current || showProfileModalRef.current) {
          return;
        }
        sound.stopEmoteMusic();
        setActiveHomeEmote(null);
        if (gameStateRef.current === 'PLAYING') {
          setIsAiming(false);
          setIsCancelZone(false);
          setShowExitPrompt(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Initialize audio volumes and mute state
  useEffect(() => {
    sound.setHomeVolume(homeVol / 100);
    sound.setGameVolume(gameVol / 100);
    sound.setSfxVolume(sfxVol / 100);
    sound.setMuted(soundMuted);

    const handleFirstTouch = () => {
      sound.init();
      sound.setMuted(soundMuted);
      if (!sound.getMuted() && !isShowingLoadingRef.current) {
        sound.playHomeMusic();
      }
      window.removeEventListener('pointerdown', handleFirstTouch);
    };
    window.addEventListener('pointerdown', handleFirstTouch, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstTouch);
    };
  }, []);

  const updateSave = useCallback((updater: (prev: GameSaveData) => GameSaveData) => {
    setSaveData(prev => {
      const next = updater(prev);
      saveGameData(next);
      return next;
    });
  }, []);

  const toggleSoundMute = useCallback(() => {
    sound.init();
    setSoundMuted(prevMuted => {
      const nextMuted = !prevMuted;
      sound.setMuted(nextMuted);
      updateSave(prev => ({
        ...prev,
        soundMuted: nextMuted
      }));
      return nextMuted;
    });
  }, [updateSave]);

  const handleLoadingFinished = useCallback(() => {
    isShowingLoadingRef.current = false;
    setIsShowingLoading(false);
    if (!sound.getMuted() && gameStateRef.current === 'MENU') {
      sound.playHomeMusic();
    }
  }, []);

  const startNewRun = useCallback(() => {
    stopHomeEmote();
    setEmoteSlotPickerFor(null);
    activeRunIdRef.current += 1;
    victoryClaimedForRunRef.current = -1;
    setLastRewardSummary(null);
    setIsAiming(false);
    setIsCancelZone(false);
    setFailureReason('');
    setPlayerHp({ hp: 3, maxHp: 3 });
    setScore(0);
    setCanvasKey(k => k + 1);
    setGameState('PLAYING');
  }, [stopHomeEmote]);

  const startGame = useCallback(() => {
    sound.init();
    sound.playGameMusic();
    startNewRun();
  }, [startNewRun]);

  const resetLevel = useCallback(() => {
    sound.init();
    sound.playGameMusic();
    startNewRun();
  }, [startNewRun]);

  const goHome = useCallback(() => {
    stopHomeEmote();
    setShowExitPrompt(false);
    setIsAiming(false);
    setIsCancelZone(false);
    sound.playHomeMusic();
    setGameState('MENU');
  }, [stopHomeEmote]);

  const confirmExit = useCallback((confirmed: boolean) => {
    setShowExitPrompt(false);
    if (confirmed) {
      goHome();
    }
  }, [goHome]);

  const handleScoreEarned = useCallback((pts: number) => {
    setScore(s => {
      const newScore = s + pts;
      updateSave(prev => ({
        ...prev,
        highScore: Math.max(prev.highScore, newScore),
        totalKills: prev.totalKills + 1
      }));
      return newScore;
    });
  }, [updateSave]);

  const handleAmmoStateChange = useCallback((nextMag: number, nextTotal: number, nextReloading: boolean) => {
    setMagAmmo(nextMag);
    setAmmo(nextTotal);
    setIsReloading(nextReloading);
  }, []);

  const handleAimStateChange = useCallback((aiming: boolean, cancel: boolean) => {
    setIsAiming(aiming);
    setIsCancelZone(cancel);
  }, []);

  const handlePlayerHpChange = useCallback((hp: number, maxHp: number) => {
    setPlayerHp({ hp, maxHp });
  }, []);

  // Authoritative single-payout victory handler
  const handleLevelCleared = useCallback((remainingAmmo: number, combatCoins: number) => {
    if (victoryClaimedForRunRef.current === activeRunIdRef.current) {
      return;
    }
    victoryClaimedForRunRef.current = activeRunIdRef.current;
    setLastRemainingAmmo(remainingAmmo);

    updateSave(prev => {
      const prevStars = prev.levelStars[currentLevel] || 0;
      const summary = computeMissionReward(currentLevel, remainingAmmo, combatCoins, prevStars);
      setLastRewardSummary(summary);

      const nextLvl = currentLevel < 100 ? currentLevel + 1 : 100;
      return {
        ...prev,
        coins: prev.coins + summary.totalCoinsEarned,
        highestLevelUnlocked: Math.max(prev.highestLevelUnlocked, nextLvl),
        levelStars: {
          ...prev.levelStars,
          [currentLevel]: Math.max(prevStars, summary.stars)
        }
      };
    });

    setGameState('LEVEL_CLEARED');
  }, [currentLevel, updateSave]);

  const handleGameOver = useCallback((reason?: string) => {
    if (reason) {
      setFailureReason(reason);
    }
    setGameState('GAME_OVER');
  }, []);

  const handleNextLevel = useCallback(() => {
    if (currentLevel < 100) {
      const next = currentLevel + 1;
      setCurrentLevel(next);
      sound.playGameMusic();
      startNewRun();
    } else {
      goHome();
    }
  }, [currentLevel, goHome, startNewRun]);

  const handleSelectLevel = useCallback((lvl: number) => {
    setCurrentLevel(lvl);
    setShowLevelSelect(false);
    sound.init();
    sound.playGameMusic();
    startNewRun();
  }, [startNewRun]);

  // Store Buy / Equip Logic for Operative Characters (enforces both coin cost & requiredLevel)
  const handleBuyOrEquipCharacter = useCallback((char: CharacterItem): boolean => {
    let success = false;
    updateSave(prev => {
      const isOwned = prev.unlockedChars.includes(char.id) || char.cost === 0;
      if (isOwned) {
        success = true;
        return {
          ...prev,
          activeChar: char.id
        };
      }
      const reqLvl = char.requiredLevel || 1;
      if (prev.highestLevelUnlocked < reqLvl || prev.coins < char.cost) {
        success = false;
        return prev;
      }
      success = true;
      return {
        ...prev,
        coins: prev.coins - char.cost,
        unlockedChars: [...prev.unlockedChars, char.id],
        activeChar: char.id
      };
    });
    return success;
  }, [updateSave]);

  // Store Buy / Equip Logic for Weapons & Guns (enforces both coin cost & requiredLevel)
  const handleBuyOrEquipGun = useCallback((gun: GunItem): boolean => {
    let success = false;
    updateSave(prev => {
      const isOwned = prev.unlockedGuns.includes(gun.id) || gun.cost === 0;
      if (isOwned) {
        success = true;
        return {
          ...prev,
          activeGun: gun.id
        };
      }
      const reqLvl = gun.requiredLevel || 1;
      if (prev.highestLevelUnlocked < reqLvl || prev.coins < gun.cost) {
        success = false;
        return prev;
      }
      success = true;
      return {
        ...prev,
        coins: prev.coins - gun.cost,
        unlockedGuns: [...prev.unlockedGuns, gun.id],
        activeGun: gun.id
      };
    });
    return success;
  }, [updateSave]);

  // Store Buy Logic for Celebration Emotes (single deduction & auto-equip to target slot)
  const handleBuyEmote = useCallback((emote: EmoteItem, targetSlot: 0 | 1): boolean => {
    let success = false;
    updateSave(prev => {
      const alreadyOwned = prev.unlockedEmotes.includes(emote.id);
      if (alreadyOwned) {
        const nextSlots: [EmoteId | null, EmoteId | null] = [...prev.equippedEmotes] as [EmoteId | null, EmoteId | null];
        nextSlots[targetSlot] = emote.id;
        success = true;
        return {
          ...prev,
          equippedEmotes: nextSlots
        };
      }
      if (prev.highestLevelUnlocked < emote.requiredLevel || prev.coins < emote.cost) {
        success = false;
        return prev;
      }
      const nextSlots: [EmoteId | null, EmoteId | null] = [...prev.equippedEmotes] as [EmoteId | null, EmoteId | null];
      nextSlots[targetSlot] = emote.id;
      success = true;
      return {
        ...prev,
        coins: prev.coins - emote.cost,
        unlockedEmotes: [...prev.unlockedEmotes, emote.id],
        equippedEmotes: nextSlots
      };
    });
    return success;
  }, [updateSave]);

  // Equip an owned Emote as the active Home Emote (preserves saveData.equippedEmotes structure)
  const handleEquipEmoteSlot = useCallback((emoteId: EmoteId, slotIndex: 0 | 1 = 0) => {
    updateSave(prev => {
      if (!prev.unlockedEmotes.includes(emoteId)) return prev;
      const nextSlots: [EmoteId | null, EmoteId | null] = [...prev.equippedEmotes] as [EmoteId | null, EmoteId | null];
      nextSlots[slotIndex] = emoteId;
      if (slotIndex === 0 && nextSlots[1] === emoteId) {
        nextSlots[1] = null;
      }
      return {
        ...prev,
        equippedEmotes: nextSlots
      };
    });
  }, [updateSave]);

  const openShopAtTab = useCallback((tab: ShopCategoryTab, returnTo: GameState = 'MENU', slotIndex: 0 | 1 = 0) => {
    stopHomeEmote();
    setEmoteSlotPickerFor(null);
    setShopInitialTab(tab);
    setPreferredEmoteSlot(slotIndex);
    setShopReturnState(returnTo);
    setGameState('SHOP');
  }, [stopHomeEmote]);

  const activeCharItem = PRO_CHARACTERS.find(c => c.id === saveData.activeChar) || PRO_CHARACTERS[0];
  const activeGunItem = PRO_GUNS.find(g => g.id === saveData.activeGun) || PRO_GUNS[0];

  // Resolve active selected emote (supports previously saved slot 0, slot 1, or first owned emote)
  const activeSelectedEmoteId: EmoteId | null =
    saveData.equippedEmotes[0] ||
    saveData.equippedEmotes[1] ||
    (saveData.unlockedEmotes.length > 0 ? saveData.unlockedEmotes[0] : null);
  const activeSelectedEmote = PRO_EMOTES.find(e => e.id === activeSelectedEmoteId) || null;
  const currentlyPlayingEmote = PRO_EMOTES.find(e => e.id === activeHomeEmote) || activeSelectedEmote;

  const isAnyHomeModalOpen =
    isShowingLoading ||
    showShowcase ||
    showSettings ||
    showLevelSelect ||
    showProfileModal ||
    showControlsModal ||
    emoteSlotPickerFor !== null;

  // Sort emotes in the compact selector so owned emotes appear first, followed by locked emotes
  const sortedEmotesForPicker = [
    ...PRO_EMOTES.filter(e => saveData.unlockedEmotes.includes(e.id)),
    ...PRO_EMOTES.filter(e => !saveData.unlockedEmotes.includes(e.id))
  ];

  return (
    <div id="container">
      {/* ========== BRANDED 8-SECOND LOGO STARTUP SCREEN (FRESH LAUNCH / RELOAD) ========== */}
      {isShowingLoading && (
        <LoadingScreen
          onFinished={handleLoadingFinished}
        />
      )}

      {/* ========== HOME SCREEN ========== */}
      {gameState === 'MENU' && (
        <div
          id="home"
          className={
            showShowcase
              ? 'hidden'
              : !isShowingLoading
              ? 'home-reveal-ready'
              : 'opacity-0'
          }
        >
          {/* Unified Header Bar: Profile + Coins on Left, Store + Settings on Right */}
          <div className="top-bar">
            <button
              type="button"
              className="player-info"
              onClick={() => {
                stopHomeEmote();
                setShowProfileModal(true);
              }}
              title="Edit Profile"
            >
              <div className="avatar">
                {saveData.userPhoto ? (
                  <img src={saveData.userPhoto} alt="Profile" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-5 h-5 text-sky-300" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="player-name">{saveData.userName || 'OPERATIVE_X'}</span>
                <span className="player-coin-tag font-mono tabular-nums">
                  <GoldCoinIcon className="w-3.5 h-3.5" />
                  <span>{saveData.coins.toLocaleString()}</span>
                </span>
              </div>
            </button>

            <div className="top-actions">
              <button
                type="button"
                className="compact-chip store-btn theme-shop"
                onClick={() => openShopAtTab('weapons', 'MENU', 0)}
                title="Armory & Emote Store"
              >
                <span className="ui-icon-box ui-icon-box-sm icon-box-shop">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </span>
                <span>Store</span>
              </button>
              <button
                type="button"
                className="compact-chip settings-btn theme-settings"
                onClick={() => {
                  stopHomeEmote();
                  setShowSettings(true);
                }}
                title="Settings & Audio"
              >
                <span className="ui-icon-box ui-icon-box-sm icon-box-settings">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>

          {/* Game Title: ZOMBIE SIEGE: DEADLINE */}
          <div className="home-title-container">
            <h1 className="title-primary">ZOMBIE SIEGE</h1>
            <div className="title-subtitle">
              <span className="subtitle-line" />
              <span className="subtitle-text">DEADLINE</span>
              <span className="subtitle-line" />
            </div>
          </div>

          {/* Central Survivor Character + Compact Emote Entry Under Settings (Right Side Only) */}
          <div className="character-area">
            <div className="character-stage-single">
              {/* CENTER ANIMATED CHARACTER — DOUBLE-TAP / DOUBLE-CLICK TO OPEN SHOWCASE */}
              <div
                className="home-character-touch-box cursor-pointer select-none"
                onPointerUp={handleHomeCharacterPointerUp}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  openShowcase();
                }}
                title="Double-tap or double-click character to open Character & Weapon Showcase"
              >
                <HomeSurvivorCharacter
                  character={activeCharItem}
                  gun={activeGunItem}
                  paused={isAnyHomeModalOpen}
                  activeEmote={activeHomeEmote}
                  emoteTriggerKey={homeEmoteTriggerKey}
                  onEmoteComplete={() => {
                    setActiveHomeEmote(null);
                    sound.stopEmoteMusic();
                  }}
                />
              </div>

              {/* SINGLE COMPACT EMOTE / DANCE ENTRY BELOW SETTINGS (Right Side — Isolated from character double-tap) */}
              <div
                className="home-single-emote-dock"
                onPointerUp={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setEmoteSlotPickerFor(0)}
                  className={`home-emote-entry-btn theme-emote ${
                    activeHomeEmote ? 'active-playing' : ''
                  }`}
                  title="Open Celebration Emotes & Dances"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#331c4a] border border-[#864eb5] flex items-center justify-center shadow-inner shrink-0">
                    {currentlyPlayingEmote ? (
                      <EmoteVectorBadge
                        emoteId={currentlyPlayingEmote.id}
                        accentColor={currentlyPlayingEmote.accentColor}
                        size="sm"
                      />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    )}
                  </div>
                  <span className="text-[9.5px] font-extrabold text-purple-100 leading-tight line-clamp-1 w-full">
                    {currentlyPlayingEmote ? currentlyPlayingEmote.nameEn : 'Emotes'}
                  </span>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-purple-300 leading-none">
                    {activeHomeEmote
                      ? '▶ Dancing'
                      : saveData.unlockedEmotes.length > 0
                      ? `Dance (${saveData.unlockedEmotes.length})`
                      : 'Select'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Action Panel: Levels & Rules Row + Hero PLAY Button */}
          <div className="home-action-panel">
            <div className="secondary-btns-row">
              <button
                type="button"
                className="secondary-btn levels-btn theme-levels"
                onClick={() => {
                  stopHomeEmote();
                  setShowLevelSelect(true);
                }}
                title="Select Mission Level"
              >
                <span className="ui-icon-box icon-box-levels">
                  <Trophy className="w-3.5 h-3.5" />
                </span>
                <span className="whitespace-nowrap">Levels ({saveData.highestLevelUnlocked}/100)</span>
              </button>

              <button
                type="button"
                className="secondary-btn rules-btn theme-rules"
                onClick={() => {
                  stopHomeEmote();
                  setShowControlsModal(true);
                }}
                title="Combat Rules & Guide"
              >
                <span className="ui-icon-box icon-box-rules">
                  <BookOpen className="w-3.5 h-3.5" />
                </span>
                <span className="whitespace-nowrap">Rules</span>
              </button>
            </div>

            <button
              type="button"
              className="hero-play-btn theme-play"
              onClick={startGame}
            >
              <span className="ui-icon-box ui-icon-box-lg icon-box-play">
                <Play className="w-4 h-4 fill-current" />
              </span>
              <span>PLAY MISSION {currentLevel}</span>
            </button>
          </div>

          {/* ========== COMPACT EMOTE SELECTION PANEL (OPENED FROM SINGLE EMOTE ICON UNDER SETTINGS) ========== */}
          {emoteSlotPickerFor !== null && (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              className="fixed inset-0 z-[190] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 modal-enter"
            >
              <div className="w-full max-w-[355px] rounded-2xl ui-panel-box p-4 flex flex-col gap-3 text-left">
                <div className="flex items-center justify-between border-b border-[#223044] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="ui-icon-box icon-box-emote">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                        Celebration Dances ({saveData.unlockedEmotes.length}/{PRO_EMOTES.length} Owned)
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-100">
                        Select Emote to Dance
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmoteSlotPickerFor(null)}
                    className="p-1.5 rounded-lg theme-neutral cursor-pointer flex items-center justify-center"
                    title="Close Emote Panel"
                  >
                    <X className="w-4 h-4 text-slate-200" />
                  </button>
                </div>

                {saveData.unlockedEmotes.length === 0 && (
                  <div className="px-3 py-2 rounded-xl ui-inset-box flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-300">
                      No emotes owned yet. Unlock dances in the Emote Shop!
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 shrink-0 font-bold">
                      {saveData.coins.toLocaleString()} Coins
                    </span>
                  </div>
                )}

                <div className="max-h-64 overflow-y-auto space-y-2 pr-0.5">
                  {sortedEmotesForPicker.map(emote => {
                    const isOwned = saveData.unlockedEmotes.includes(emote.id);
                    const isSelected = activeSelectedEmoteId === emote.id;
                    const meetsLevel = saveData.highestLevelUnlocked >= emote.requiredLevel;

                    return (
                      <div
                        key={emote.id}
                        className={`p-2.5 rounded-xl flex items-center justify-between gap-2.5 ${
                          isOwned
                            ? isSelected
                              ? 'ui-card-equipped'
                              : 'ui-card-standard'
                            : 'ui-card-locked'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                              isOwned
                                ? 'bg-[#1a1029] border-[#7843a8]'
                                : 'bg-[#0b101b] border-[#1e293b] opacity-65'
                            }`}
                          >
                            <EmoteVectorBadge
                              emoteId={emote.id}
                              accentColor={isOwned ? emote.accentColor : '#64748b'}
                              size="sm"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs font-bold truncate ${
                                  isOwned ? 'text-slate-100' : 'text-slate-400'
                                }`}
                              >
                                {emote.nameEn}
                              </span>
                            </div>
                            {isOwned ? (
                              <div className="text-[10px] text-purple-300 truncate">
                                {emote.rarity} · {(emote.durationMs / 1000).toFixed(1)}s Dance
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                                <span className={meetsLevel ? 'text-emerald-400' : 'text-rose-300'}>
                                  Lv {emote.requiredLevel}
                                </span>
                                <span>·</span>
                                <span className="text-amber-300">
                                  {emote.cost.toLocaleString()} Coins
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {isOwned ? (
                          <button
                            type="button"
                            onClick={() => {
                              handleEquipEmoteSlot(emote.id, 0);
                              setEmoteSlotPickerFor(null);
                              setActiveHomeEmote(emote.id);
                              setHomeEmoteTriggerKey(k => k + 1);
                              sound.playEmoteBeat(emote.id, emote.durationMs);
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer shrink-0 theme-emote flex items-center gap-1.5"
                          >
                            <span className="ui-icon-box ui-icon-box-sm icon-box-emote">
                              <Play className="w-3 h-3 fill-current" />
                            </span>
                            <span>Dance</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openShopAtTab('emotes', 'MENU', 0)}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer shrink-0 theme-shop flex items-center gap-1.5"
                            title={`Locked: Requires Level ${emote.requiredLevel} & ${emote.cost.toLocaleString()} Coins. Tap to view in Emote Shop.`}
                          >
                            <span className="ui-icon-box ui-icon-box-sm icon-box-shop">
                              <Lock className="w-3 h-3" />
                            </span>
                            <span>In Shop</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-1.5 border-t border-[#223044]">
                  <button
                    type="button"
                    onClick={() => openShopAtTab('emotes', 'MENU', 0)}
                    className="flex-1 py-2 px-3 rounded-xl theme-shop font-extrabold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="ui-icon-box ui-icon-box-sm icon-box-shop">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </span>
                    <span>Emote Shop ({PRO_EMOTES.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmoteSlotPickerFor(null)}
                    className="py-2 px-3 rounded-xl theme-neutral font-bold text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="ui-icon-box ui-icon-box-sm icon-box-neutral">
                      <X className="w-3.5 h-3.5" />
                    </span>
                    <span>Back</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== FULLSCREEN CHARACTER & WEAPON SHOWCASE (DOUBLE-TAP FROM HOME CHARACTER) ========== */}
      {gameState === 'MENU' && showShowcase && (
        <CharacterShowcase
          unlockedChars={saveData.unlockedChars}
          activeChar={saveData.activeChar}
          unlockedGuns={saveData.unlockedGuns}
          activeGun={saveData.activeGun}
          onApplyLoadout={(char, gun) => {
            const charOwned = saveData.unlockedChars.includes(char.id) || char.cost === 0;
            const gunOwned = saveData.unlockedGuns.includes(gun.id) || gun.cost === 0;
            if (!charOwned || !gunOwned) {
              return false;
            }
            try {
              updateSave((prev) => {
                const cOk = prev.unlockedChars.includes(char.id) || char.cost === 0;
                const gOk = prev.unlockedGuns.includes(gun.id) || gun.cost === 0;
                if (!cOk || !gOk) return prev;
                return {
                  ...prev,
                  activeChar: char.id,
                  activeGun: gun.id
                };
              });
              return true;
            } catch {
              return false;
            }
          }}
          onClose={closeShowcase}
        />
      )}

      {/* ========== GAME SCREEN (FRAMED BATTLEFIELD + UNIFIED TOP & BOTTOM HUD BARS) ========== */}
      {gameState === 'PLAYING' && (
        <div id="game" style={{ display: 'flex' }}>
          {/* 1. TOP HUD BAR (COLOURED STATUS CHIPS + STYLED PAUSE BUTTON) */}
          <div
            className="top-hud-bar"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="hud-status-strip">
              <div className="hud-metric-chip theme-levels">
                <span className="ui-icon-box ui-icon-box-sm icon-box-levels">
                  <Layers className="w-3 h-3" />
                </span>
                <span className="font-mono tabular-nums">
                  LV <b id="level" className="text-sky-200">{currentLevel}</b>
                </span>
              </div>

              <div className="hud-metric-chip theme-rules">
                <span className="ui-icon-box ui-icon-box-sm icon-box-rules">
                  <Crosshair className="w-3 h-3" />
                </span>
                <span className="font-mono tabular-nums">
                  <b className="text-teal-200">{zombiesLeft}</b>
                </span>
              </div>

              <div className={`hud-metric-chip ${playerHp.hp > 1 ? 'theme-play' : 'theme-danger'}`}>
                <span className={`ui-icon-box ui-icon-box-sm ${playerHp.hp > 1 ? 'icon-box-play' : 'icon-box-danger'}`}>
                  <Shield className="w-3 h-3" />
                </span>
                <span className="font-mono tabular-nums">
                  <b className={playerHp.hp > 1 ? 'text-emerald-200' : 'text-rose-200'}>
                    {playerHp.hp}/{playerHp.maxHp}
                  </b>
                </span>
              </div>

              <div className="hud-metric-chip ui-coin-badge">
                <span className="ui-icon-box ui-icon-box-sm icon-box-coin">
                  <GoldCoinIcon className="w-3.5 h-3.5" />
                </span>
                <span className="font-mono font-bold tabular-nums">
                  <b id="coins">{saveData.coins.toLocaleString()}</b>
                </span>
              </div>
            </div>

            <button
              type="button"
              id="inGameExitBtn"
              className="theme-neutral"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setShowExitPrompt(true);
              }}
              title="Pause / Exit Mission"
            >
              <span className="ui-icon-box ui-icon-box-sm icon-box-neutral">
                <Pause className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          {/* 2. FRAMED BATTLEFIELD AREA */}
          <div id="canvas-area">
            <div className="battlefield-frame">
              <GameCanvas
                key={canvasKey}
                currentLevel={currentLevel}
                activeChar={saveData.activeChar}
                activeGun={saveData.activeGun}
                lang={lang}
                particlesEnabled={particlesEnabled}
                reloadTrigger={reloadTrigger}
                onZombiesChange={setZombiesLeft}
                onAmmoChange={setAmmo}
                onAmmoStateChange={handleAmmoStateChange}
                onAimStateChange={handleAimStateChange}
                onPlayerHpChange={handlePlayerHpChange}
                onScoreEarned={handleScoreEarned}
                onLevelCleared={handleLevelCleared}
                onGameOver={handleGameOver}
                isPaused={isShowingLoading || gameState !== 'PLAYING' || showExitPrompt || showSettings}
              />

              {/* Pause / Resume Modal */}
              {showExitPrompt && (
                <div
                  id="exitPromptModal"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="modal-title">MISSION PAUSED</div>
                  <p className="text-xs text-slate-300 mb-4">
                    Resume combat when ready or return to the Home command deck.
                  </p>
                  <div className="modal-btn-row">
                    <button
                      type="button"
                      className="flex-1 py-2.5 px-3 rounded-xl theme-danger font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => confirmExit(true)}
                    >
                      <span className="ui-icon-box ui-icon-box-sm icon-box-danger">
                        <Home className="w-3.5 h-3.5" />
                      </span>
                      <span>EXIT HOME</span>
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-2.5 px-3 rounded-xl theme-play font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => confirmExit(false)}
                    >
                      <span className="ui-icon-box ui-icon-box-sm icon-box-play">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </span>
                      <span>RESUME</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. BOTTOM HUD BAR (AMMO, RELOAD, PIERCE STATUS & COLOURED CONTROLS) */}
          <div
            className="bottom-panel"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="combat-status-row">
              <div className="ammo-readout">
                <span className="ui-icon-box icon-box-settings">
                  <Crosshair className="w-4 h-4" />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 truncate">
                    {activeGunItem.nameEn} · {activeGunItem.penetration}x Pierce
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 tabular-nums">
                    <span className="text-xs font-bold text-white">
                      MAG <b className="text-sky-300 font-mono">{magAmmo}/{activeGunItem.magSize}</b>
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-bold text-white">
                      TOTAL <b id="bullets" className="text-amber-300 font-mono">{ammo}</b>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isAiming ? (
                  <div
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap flex items-center gap-1.5 ${
                      isCancelZone
                        ? 'theme-danger'
                        : 'theme-rules'
                    }`}
                  >
                    <span className={`ui-icon-box ui-icon-box-sm ${isCancelZone ? 'icon-box-danger' : 'icon-box-rules'}`}>
                      {isCancelZone ? <X className="w-3 h-3" /> : <Crosshair className="w-3 h-3" />}
                    </span>
                    <span>{isCancelZone ? 'Release: Cancel' : 'Release: Fire'}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isReloading || magAmmo >= activeGunItem.magSize || magAmmo >= ammo || ammo <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setReloadTrigger(r => r + 1);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isReloading
                        ? 'theme-shop cursor-wait'
                        : magAmmo < activeGunItem.magSize && magAmmo < ammo && ammo > 0
                        ? 'theme-levels cursor-pointer'
                        : 'ui-card-locked text-slate-500 cursor-default'
                    }`}
                  >
                    <span
                      className={`ui-icon-box ui-icon-box-sm ${
                        isReloading
                          ? 'icon-box-shop'
                          : magAmmo < activeGunItem.magSize && magAmmo < ammo && ammo > 0
                          ? 'icon-box-levels'
                          : 'icon-box-locked'
                      }`}
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
                    </span>
                    <span>{isReloading ? 'RELOADING' : 'RELOAD'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="game-btns">
              <button
                type="button"
                className="theme-neutral"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExitPrompt(true);
                }}
              >
                <span className="ui-icon-box ui-icon-box-sm icon-box-neutral">
                  <Home className="w-3.5 h-3.5" />
                </span>
                <span>HOME</span>
              </button>
              <button
                type="button"
                className="theme-levels"
                onClick={(e) => {
                  e.stopPropagation();
                  resetLevel();
                }}
              >
                <span className="ui-icon-box ui-icon-box-sm icon-box-levels">
                  <RotateCcw className="w-3.5 h-3.5" />
                </span>
                <span>RETRY</span>
              </button>
              <button
                type="button"
                className="theme-shop"
                onClick={(e) => {
                  e.stopPropagation();
                  openShopAtTab('weapons', 'PLAYING', 0);
                }}
              >
                <span className="ui-icon-box ui-icon-box-sm icon-box-shop">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </span>
                <span>SHOP</span>
              </button>
              <button
                type="button"
                className="theme-settings"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(true);
                }}
              >
                <span className="ui-icon-box ui-icon-box-sm icon-box-settings">
                  <Volume2 className="w-3.5 h-3.5" />
                </span>
                <span>AUDIO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== SETTINGS MODAL ========== */}
      {showSettings && (
        <div
          id="settings-panel"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-[350px] rounded-2xl ui-panel-box p-4 md:p-5 flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-[#2a3950] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="ui-icon-box icon-box-settings">
                  <SlidersHorizontal className="w-4 h-4" />
                </span>
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    System Configuration
                  </div>
                  <h2 className="text-sm md:text-base font-extrabold tracking-wider text-slate-100 uppercase leading-tight">
                    Settings & Audio
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-xl theme-neutral cursor-pointer flex items-center justify-center"
                title="Close Settings"
              >
                <span className="ui-icon-box-sm icon-box-neutral">
                  <X className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>

            <div className="settings-box">
              {/* 1. Master Audio Toggle Row */}
              <div className="setting-row">
                <div className="flex items-center gap-2.5">
                  <span className={`ui-icon-box ui-icon-box-sm ${soundMuted ? 'icon-box-danger' : 'icon-box-play'}`}>
                    {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </span>
                  <div className="text-left">
                    <label className="font-extrabold text-slate-100 text-xs block leading-tight">
                      Master Audio
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {soundMuted ? 'All channels muted' : 'Audio output active'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleSoundMute}
                  className={`setting-toggle-pill ${
                    soundMuted
                      ? 'theme-danger'
                      : 'theme-play'
                  }`}
                >
                  <span
                    className="setting-status-dot"
                    style={{
                      backgroundColor: soundMuted ? '#fb7185' : '#34d399',
                      boxShadow: soundMuted
                        ? '0 0 6px rgba(251, 113, 133, 0.7)'
                        : '0 0 6px rgba(52, 211, 153, 0.7)'
                    }}
                  />
                  <span>{soundMuted ? 'Sound: OFF' : 'Sound: ON'}</span>
                </button>
              </div>

              {/* 2. Home & Emote Audio Slider Row */}
              <div
                className="setting-row flex-col items-stretch gap-2"
                style={{ opacity: soundMuted ? 0.55 : 1 }}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-100">
                    <span className="ui-icon-box ui-icon-box-sm icon-box-emote">
                      <Sparkles className="w-3 h-3" />
                    </span>
                    <span>Home & Emote Audio</span>
                  </span>
                  <span className="setting-value-badge text-purple-300">
                    {soundMuted ? `MUTED (${homeVol}%)` : `${homeVol}%`}
                  </span>
                </div>
                <div className="slider-track-frame">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={homeVol}
                    className="slider-emote"
                    style={{
                      background: `linear-gradient(90deg, #7e22ce 0%, #c084fc ${homeVol}%, #090d16 ${homeVol}%)`
                    }}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setHomeVol(val);
                      sound.setHomeVolume(val / 100);
                      updateSave(prev => ({ ...prev, homeVol: val }));
                    }}
                  />
                </div>
              </div>

              {/* 3. Combat Music Slider Row */}
              <div
                className="setting-row flex-col items-stretch gap-2"
                style={{ opacity: soundMuted ? 0.55 : 1 }}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-100">
                    <span className="ui-icon-box ui-icon-box-sm icon-box-levels">
                      <Volume2 className="w-3 h-3" />
                    </span>
                    <span>Combat Music</span>
                  </span>
                  <span className="setting-value-badge text-sky-300">
                    {soundMuted ? `MUTED (${gameVol}%)` : `${gameVol}%`}
                  </span>
                </div>
                <div className="slider-track-frame">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={gameVol}
                    className="slider-levels"
                    style={{
                      background: `linear-gradient(90deg, #0284c7 0%, #38bdf8 ${gameVol}%, #090d16 ${gameVol}%)`
                    }}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setGameVol(val);
                      sound.setGameVolume(val / 100);
                      updateSave(prev => ({ ...prev, gameVol: val }));
                    }}
                  />
                </div>
              </div>

              {/* 4. Zombie & Weapon SFX Slider Row */}
              <div
                className="setting-row flex-col items-stretch gap-2"
                style={{ opacity: soundMuted ? 0.55 : 1 }}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 font-bold text-slate-100">
                    <span className="ui-icon-box ui-icon-box-sm icon-box-shop">
                      <Crosshair className="w-3 h-3" />
                    </span>
                    <span>Zombie & Weapon SFX</span>
                  </span>
                  <span className="setting-value-badge text-amber-300">
                    {soundMuted ? `MUTED (${sfxVol}%)` : `${sfxVol}%`}
                  </span>
                </div>
                <div className="slider-track-frame">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sfxVol}
                    className="slider-shop"
                    style={{
                      background: `linear-gradient(90deg, #b45309 0%, #f59e0b ${sfxVol}%, #090d16 ${sfxVol}%)`
                    }}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setSfxVol(val);
                      sound.setSfxVolume(val / 100);
                      updateSave(prev => ({ ...prev, sfxVol: val }));
                    }}
                  />
                </div>
              </div>

              {/* 5. Combat Particles Toggle Row */}
              <div className="setting-row">
                <div className="flex items-center gap-2.5">
                  <span className={`ui-icon-box ui-icon-box-sm ${particlesEnabled ? 'icon-box-rules' : 'icon-box-neutral'}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <div className="text-left">
                    <label className="text-xs font-extrabold text-slate-100 block leading-tight">
                      Combat Particles
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {particlesEnabled ? 'Sparks & hit FX enabled' : 'Minimal FX mode'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setParticlesEnabled(p => !p)}
                  className={`setting-toggle-pill ${
                    particlesEnabled ? 'theme-rules' : 'theme-neutral'
                  }`}
                >
                  <span
                    className="setting-status-dot"
                    style={{
                      backgroundColor: particlesEnabled ? '#2dd4bf' : '#64748b',
                      boxShadow: particlesEnabled
                        ? '0 0 6px rgba(45, 212, 191, 0.65)'
                        : 'none'
                    }}
                  />
                  <span>{particlesEnabled ? 'Enabled' : 'Off'}</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl theme-play font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => setShowSettings(false)}
            >
              <span className="ui-icon-box ui-icon-box-sm icon-box-play">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
              <span>SAVE & CLOSE SETTINGS</span>
            </button>
          </div>
        </div>
      )}

      {/* ========== STORE MODAL ========== */}
      {gameState === 'SHOP' && (
        <ShopModal
          coins={saveData.coins}
          highestLevelUnlocked={saveData.highestLevelUnlocked}
          unlockedChars={saveData.unlockedChars}
          activeChar={saveData.activeChar}
          unlockedGuns={saveData.unlockedGuns}
          activeGun={saveData.activeGun}
          unlockedEmotes={saveData.unlockedEmotes}
          equippedEmotes={saveData.equippedEmotes}
          initialTab={shopInitialTab}
          preferredEmoteSlot={preferredEmoteSlot}
          lang={lang}
          onBuyOrEquipCharacter={handleBuyOrEquipCharacter}
          onBuyOrEquipGun={handleBuyOrEquipGun}
          onBuyEmote={handleBuyEmote}
          onEquipEmoteSlot={handleEquipEmoteSlot}
          onClose={() => setGameState(shopReturnState)}
        />
      )}

      {/* ========== GAME OVER MODAL ========== */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          level={currentLevel}
          score={score}
          failureReason={failureReason}
          lang={lang}
          onRetry={resetLevel}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onMainMenu={goHome}
        />
      )}

      {/* ========== LEVEL CLEARED MODAL ========== */}
      {gameState === 'LEVEL_CLEARED' && (
        <LevelClearedModal
          level={currentLevel}
          remainingAmmo={lastRemainingAmmo}
          score={score}
          rewardSummary={lastRewardSummary}
          lang={lang}
          onNextLevel={handleNextLevel}
          onReplay={resetLevel}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onMainMenu={goHome}
        />
      )}

      {/* ========== LEVEL SELECT MODAL ========== */}
      {showLevelSelect && (
        <LevelSelectModal
          highestUnlocked={saveData.highestLevelUnlocked}
          levelStars={saveData.levelStars}
          currentLevel={currentLevel}
          lang={lang}
          onSelectLevel={handleSelectLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {/* ========== COMBAT RULES MODAL ========== */}
      {showControlsModal && (
        <ControlsModal
          lang={lang}
          onClose={() => setShowControlsModal(false)}
        />
      )}

      {/* ========== PROFILE EDIT MODAL ========== */}
      {showProfileModal && (
        <ProfileModal
          currentName={saveData.userName || 'OPERATIVE_X'}
          currentPhoto={saveData.userPhoto || ''}
          onSystemDialogChange={(open) => {
            isSystemDialogOpenRef.current = open;
          }}
          onSave={(newName, newPhoto) => {
            isSystemDialogOpenRef.current = false;
            updateSave(prev => ({
              ...prev,
              userName: newName,
              userPhoto: newPhoto
            }));
            setShowProfileModal(false);
          }}
          onClose={() => {
            isSystemDialogOpenRef.current = false;
            setShowProfileModal(false);
          }}
        />
      )}
    </div>
  );
}
