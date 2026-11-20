import { EmoteId, GameSaveData, Language } from '../types/game';

const STORAGE_KEY = 'ultimate_zombie_hunter_pro_save_v2';
const OLD_STORAGE_KEY = 'cyber_hunter_pro_save_v1';
const LANG_STORAGE_KEY = 'zombie_hunter_pro_lang';

const VALID_EMOTE_IDS: EmoteId[] = [
  'victory_groove',
  'survivor_shuffle',
  'battle_bounce',
  'neon_footwork',
  'robot_pulse',
  'midnight_step',
  'champion_spin',
  'siege_celebration'
];

export const DEFAULT_SAVE: GameSaveData = {
  highestLevelUnlocked: 1,
  levelStars: {},
  coins: 100, // Starting bonus coins so player can check out characters/guns
  unlockedChars: ['soldier'],
  activeChar: 'soldier',
  unlockedGuns: ['laser'],
  activeGun: 'laser',
  unlockedEmotes: [],
  equippedEmotes: [null, null],
  highScore: 0,
  totalKills: 0,
  userName: 'OPERATIVE_X',
  soundMuted: false,
  homeVol: 70,
  gameVol: 60,
  sfxVol: 80
};

export function loadGameData(): GameSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const rawUnlockedGuns = Array.isArray(parsed.unlockedGuns) && parsed.unlockedGuns.length > 0
        ? parsed.unlockedGuns
        : DEFAULT_SAVE.unlockedGuns;
      const unlockedGuns = rawUnlockedGuns.includes('laser')
        ? rawUnlockedGuns
        : ['laser', ...rawUnlockedGuns];
      const rawUnlockedChars = Array.isArray(parsed.unlockedChars) && parsed.unlockedChars.length > 0
        ? parsed.unlockedChars
        : DEFAULT_SAVE.unlockedChars;
      const unlockedChars = rawUnlockedChars.includes('soldier')
        ? rawUnlockedChars
        : ['soldier', ...rawUnlockedChars];

      const unlockedEmotes: EmoteId[] = Array.isArray(parsed.unlockedEmotes)
        ? parsed.unlockedEmotes.filter((id: string): id is EmoteId => VALID_EMOTE_IDS.includes(id as EmoteId))
        : [];

      let equippedEmotes: [EmoteId | null, EmoteId | null] = [null, null];
      if (Array.isArray(parsed.equippedEmotes) && parsed.equippedEmotes.length >= 2) {
        const s0 = parsed.equippedEmotes[0];
        const s1 = parsed.equippedEmotes[1];
        equippedEmotes = [
          s0 && unlockedEmotes.includes(s0) ? s0 : null,
          s1 && unlockedEmotes.includes(s1) ? s1 : null
        ];
      }

      return {
        ...DEFAULT_SAVE,
        ...parsed,
        levelStars: parsed.levelStars || {},
        unlockedChars,
        unlockedGuns,
        unlockedEmotes,
        equippedEmotes,
        activeChar: parsed.activeChar || 'soldier',
        activeGun: parsed.activeGun || 'laser',
        userName: parsed.userName || 'OPERATIVE_X',
        userPhoto: parsed.userPhoto || '',
        soundMuted: typeof parsed.soundMuted === 'boolean' ? parsed.soundMuted : false,
        homeVol: typeof parsed.homeVol === 'number' ? parsed.homeVol : 70,
        gameVol: typeof parsed.gameVol === 'number' ? parsed.gameVol : 60,
        sfxVol: typeof parsed.sfxVol === 'number' ? parsed.sfxVol : 80
      };
    }

    // Attempt migration from v1 if present
    const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldRaw) {
      const oldParsed = JSON.parse(oldRaw);
      const migrated: GameSaveData = {
        ...DEFAULT_SAVE,
        highestLevelUnlocked: oldParsed.highestLevelUnlocked || 1,
        levelStars: oldParsed.levelStars || {},
        coins: typeof oldParsed.coins === 'number' ? oldParsed.coins : 100,
        highScore: oldParsed.highScore || 0,
        totalKills: oldParsed.totalKills || 0
      };
      return migrated;
    }
  } catch (e) {
    console.error('Failed to load save data', e);
  }
  return { ...DEFAULT_SAVE };
}

export function saveGameData(data: GameSaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save game data', e);
  }
}

export function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'hi' || saved === 'en') return saved;
  } catch {
    // fallback
  }
  return 'hi';
}

export function saveLanguage(lang: Language) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}
