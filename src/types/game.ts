export type Language = 'hi' | 'en';

export type GameState = 'LOADING' | 'MENU' | 'PLAYING' | 'SHOP' | 'LEVEL_CLEARED' | 'GAME_OVER' | 'ALL_CLEARED';

export type ArmorStyle = 'soldier' | 'cyber' | 'ranger' | 'phantom' | 'juggernaut' | 'reaper';

export interface CharacterItem {
  id: string;
  nameHi: string;
  nameEn: string;
  roleEn?: string;
  color: string;
  skinColor: string;
  armorStyle?: ArmorStyle;
  armorPrimary?: string;
  armorSecondary?: string;
  fabricColor?: string;
  rimColor?: string;
  cost: number;
  requiredLevel?: number;
}

export type WeaponVisualType =
  | 'pistol'
  | 'smg'
  | 'shotgun'
  | 'assault'
  | 'sniper'
  | 'plasma'
  | 'railgun'
  | 'cannon'
  | 'scifi';

export interface GunItem {
  id: string;
  nameHi: string;
  nameEn: string;
  categoryLabel?: string;
  weaponType: WeaponVisualType;
  ammo: number; // Base mission ammo capacity
  magSize: number; // Rounds per magazine before reload
  reloadTime: number; // Reload duration in seconds
  power: number; // Base damage per hit
  fireRate: number; // Rounds per second
  penetration: number; // Number of zombies a single bullet can hit (1 = stops on first, 2+ = pierces through)
  penetrationDecay: number; // Damage multiplier after each pierced enemy (e.g. 0.75)
  maxRange: number; // Maximum travel range in pixels
  cost: number;
  requiredLevel?: number; // Minimum campaign level required to unlock
  bulletColor: string;
  bodyColor: string;
  accentColor: string;
  bounces: number;
  speed: number;
  barrelLength: number;
  pellets?: number;
}

export interface MissionRewardSummary {
  level: number;
  stars: number;
  isFirstClear: boolean;
  baseReward: number;
  starBonus: number;
  combatReward: number;
  totalCoinsEarned: number;
}

export type StructureType = 'stone' | 'ice' | 'metal' | 'bounce' | 'platform' | 'hazard';

export interface Structure {
  x: number;
  y: number;
  w: number;
  h: number;
  type: StructureType;
  broken?: boolean;
  // Optional moving obstacle/platform properties (used in Levels 51-100)
  vx?: number;
  vy?: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export interface TNTBarrel {
  id: number;
  x: number;
  y: number;
  r: number;
  exploded: boolean;
  purpose?: string;
}

export type ZombieType = 'normal' | 'runner' | 'fat' | 'armored' | 'crawler' | 'spitter' | 'boss';

export type ZombieAnimState = 'walk' | 'attack' | 'hit' | 'fall' | 'dead';

export interface Zombie {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: ZombieType;
  variant?: number;
  color: string;
  alive: boolean;
  health: number;
  maxHealth: number;
  vx?: number;
  vy?: number;
  minX?: number;
  maxX?: number;
  facing?: 1 | -1;
  animPhase?: number;
  animState?: ZombieAnimState;
  hitTimer?: number;
  attackCooldown?: number;
  attackCharge?: number;
  alerted?: boolean;
  isGrounded?: boolean;
  isFalling?: boolean;
  fallStartY?: number;
  rewarded?: boolean;
  ragdoll?: {
    vx: number;
    vy: number;
    angle: number;
    vAngle: number;
  };
}

export interface EnemyProjectile {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  color: string;
}

export interface TapReticle {
  id: number;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  radius: number;
  bounces: number;
  maxBounces: number;
  damage: number;
  penetrationLeft: number;
  penetrationDecay: number;
  hitZombieIds: number[];
  distanceTraveled: number;
  maxRange: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
}

export interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity?: number;
}

export interface FloatingText {
  id: number;
  text: number | string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  dy: number;
}

export interface Player {
  x: number;
  y: number;
  vy: number;
  angle: number;
  hp: number;
  maxHp: number;
  hitTimer: number;
  isGrounded: boolean;
  isFalling: boolean;
  fallStartY: number;
  alive: boolean;
  deathAngle?: number;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
}

export type BackdropArchitecture =
  | 'ruins'
  | 'warehouse'
  | 'refinery'
  | 'cryo'
  | 'bunker'
  | 'subway'
  | 'prison'
  | 'skyway'
  | 'citadel'
  | 'nexus';

export interface EnvironmentTheme {
  backdrop: BackdropArchitecture;
  skyTopColor: string;
  skyMidColor: string;
  floorColor: string;
  gridColor: string;
  accentLightColor: string;
  ambientLabel: string;
}

export interface LevelData {
  level: number;
  levelSetVersion: string;
  nameHi: string;
  nameEn: string;
  sectorId: number;
  sectorNameHi: string;
  sectorNameEn: string;
  environmentTheme: EnvironmentTheme;
  objectiveText: string;
  primaryChallenge: string;
  mechanicsUsed: string[];
  ammoAssumption: string;
  winCondition: string;
  failCondition: string;
  intendedSolution: string;
  ammo: number;
  structures: Structure[];
  zombies: Zombie[];
  waveReinforcements?: Zombie[];
  tntBarrels: TNTBarrel[];
  playerPos: { x: number; y: number };
  platformWidth?: number;
  destructiblePlayerSupport?: boolean;
  initialAngle?: number;
}

export type EmoteId =
  | 'victory_groove'
  | 'survivor_shuffle'
  | 'battle_bounce'
  | 'neon_footwork'
  | 'robot_pulse'
  | 'midnight_step'
  | 'champion_spin'
  | 'siege_celebration';

export type EmoteRarity = 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface EmoteItem {
  id: EmoteId;
  nameEn: string;
  nameHi: string;
  subtitleEn: string;
  rarity: EmoteRarity;
  cost: number;
  requiredLevel: number;
  accentColor: string;
  secondaryColor: string;
  durationMs: number;
  bpm: number;
}

export interface GameSaveData {
  highestLevelUnlocked: number;
  levelStars: Record<number, number>;
  coins: number;
  unlockedChars: string[];
  activeChar: string;
  unlockedGuns: string[];
  activeGun: string;
  unlockedEmotes: EmoteId[];
  equippedEmotes: [EmoteId | null, EmoteId | null];
  highScore: number;
  totalKills: number;
  userName?: string;
  userPhoto?: string;
  soundMuted?: boolean;
  homeVol?: number;
  gameVol?: number;
  sfxVol?: number;
}
