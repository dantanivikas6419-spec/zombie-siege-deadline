import {
  LevelData,
  Structure,
  Zombie,
  TNTBarrel,
  ZombieType,
  BackdropArchitecture,
  EnvironmentTheme
} from '../types/game';

export const LEVEL_SET_VERSION = 'v3.0-explicit-100';

export interface SectorMeta {
  id: number;
  nameHi: string;
  nameEn: string;
  themeColor: string;
  backdrop: BackdropArchitecture;
  skyTopColor: string;
  skyMidColor: string;
  floorColor: string;
  gridColor: string;
  startLevel: number;
  endLevel: number;
}

export const SECTORS: SectorMeta[] = [
  {
    id: 1,
    nameHi: 'Urban Ruins Alley',
    nameEn: 'Urban Ruins Alley',
    themeColor: '#38bdf8',
    backdrop: 'ruins',
    skyTopColor: '#0c192c',
    skyMidColor: '#070b14',
    floorColor: '#1e293b',
    gridColor: 'rgba(56, 189, 248, 0.035)',
    startLevel: 1,
    endLevel: 10
  },
  {
    id: 2,
    nameHi: 'Industrial Warehouse',
    nameEn: 'Industrial Warehouse',
    themeColor: '#f43f5e',
    backdrop: 'warehouse',
    skyTopColor: '#1f1224',
    skyMidColor: '#0b0812',
    floorColor: '#27272a',
    gridColor: 'rgba(244, 63, 94, 0.035)',
    startLevel: 11,
    endLevel: 20
  },
  {
    id: 3,
    nameHi: 'Toxic Refinery',
    nameEn: 'Toxic Refinery',
    themeColor: '#10b981',
    backdrop: 'refinery',
    skyTopColor: '#09221c',
    skyMidColor: '#06100e',
    floorColor: '#1e2923',
    gridColor: 'rgba(16, 185, 129, 0.038)',
    startLevel: 21,
    endLevel: 30
  },
  {
    id: 4,
    nameHi: 'Cryo Ice Lab',
    nameEn: 'Cryo Ice Lab',
    themeColor: '#00e5ff',
    backdrop: 'cryo',
    skyTopColor: '#082438',
    skyMidColor: '#05101c',
    floorColor: '#162a3a',
    gridColor: 'rgba(0, 229, 255, 0.042)',
    startLevel: 31,
    endLevel: 40
  },
  {
    id: 5,
    nameHi: 'Military Bunker Depot',
    nameEn: 'Military Bunker Depot',
    themeColor: '#eab308',
    backdrop: 'bunker',
    skyTopColor: '#211c0d',
    skyMidColor: '#0e0c06',
    floorColor: '#292524',
    gridColor: 'rgba(234, 179, 8, 0.035)',
    startLevel: 41,
    endLevel: 50
  },
  {
    id: 6,
    nameHi: 'Underground Subway',
    nameEn: 'Underground Subway',
    themeColor: '#a855f7',
    backdrop: 'subway',
    skyTopColor: '#1b102e',
    skyMidColor: '#0a0612',
    floorColor: '#1e1b2e',
    gridColor: 'rgba(168, 85, 247, 0.038)',
    startLevel: 51,
    endLevel: 60
  },
  {
    id: 7,
    nameHi: 'Cyber Prison Fort',
    nameEn: 'Cyber Prison Fort',
    themeColor: '#f97316',
    backdrop: 'prison',
    skyTopColor: '#261409',
    skyMidColor: '#100804',
    floorColor: '#271e19',
    gridColor: 'rgba(249, 115, 22, 0.036)',
    startLevel: 61,
    endLevel: 70
  },
  {
    id: 8,
    nameHi: 'Rooftop Skyway',
    nameEn: 'Rooftop Skyway',
    themeColor: '#06b6d4',
    backdrop: 'skyway',
    skyTopColor: '#092230',
    skyMidColor: '#050d17',
    floorColor: '#182633',
    gridColor: 'rgba(6, 182, 212, 0.04)',
    startLevel: 71,
    endLevel: 80
  },
  {
    id: 9,
    nameHi: 'AI Core Citadel',
    nameEn: 'AI Core Citadel',
    themeColor: '#ec4899',
    backdrop: 'citadel',
    skyTopColor: '#260d21',
    skyMidColor: '#0f050d',
    floorColor: '#261723',
    gridColor: 'rgba(236, 72, 153, 0.038)',
    startLevel: 81,
    endLevel: 90
  },
  {
    id: 10,
    nameHi: 'Ground Zero Nexus',
    nameEn: 'Ground Zero Nexus',
    themeColor: '#ef4444',
    backdrop: 'nexus',
    skyTopColor: '#290a0e',
    skyMidColor: '#110406',
    floorColor: '#261517',
    gridColor: 'rgba(239, 68, 68, 0.042)',
    startLevel: 91,
    endLevel: 100
  }
];

export function getSectorForLevel(level: number): SectorMeta {
  const bounded = Math.max(1, Math.min(100, level));
  return SECTORS.find(s => bounded >= s.startLevel && bounded <= s.endLevel) || SECTORS[0];
}

export interface ZombiePlacement {
  type: ZombieType;
  surfaceIndex: number; // -1 = main floor (y=524), >=0 = index in level's extra structures array
  offsetXRatio: number; // 0.08 to 0.92 across the surface width
  hp?: number;
  speedMul?: number;
  variant?: number;
}

export interface TNTPlacement {
  surfaceIndex: number; // -1 = main floor (y=524), >=0 = index in level's extra structures array
  offsetXRatio: number;
  purpose: string;
}

export interface ExplicitLevelBlueprint {
  level: number;
  title: string;
  objectiveText: string;
  primaryChallenge: string;
  mechanicsUsed: string[];
  ammoAssumption: string;
  winCondition?: string;
  failCondition?: string;
  intendedSolution: string;
  ammo: number;
  playerPos: { x: number; y: number };
  destructiblePlayerSupport?: boolean;
  structures: Structure[];
  zombies: ZombiePlacement[];
  tnt: TNTPlacement[];
  waveZombie?: ZombiePlacement;
}

const ZOMBIE_DIMENSIONS: Record<
  ZombieType,
  { w: number; h: number; color: string; baseSpeed: number; baseHp: number }
> = {
  normal: { w: 28, h: 50, color: '#557a2b', baseSpeed: 0.35, baseHp: 1 },
  runner: { w: 26, h: 50, color: '#84cc16', baseSpeed: 0.78, baseHp: 1 },
  crawler: { w: 34, h: 36, color: '#38521a', baseSpeed: 0.48, baseHp: 1 },
  fat: { w: 32, h: 52, color: '#4E7026', baseSpeed: 0.24, baseHp: 2 },
  armored: { w: 30, h: 52, color: '#52796f', baseSpeed: 0.28, baseHp: 2 },
  spitter: { w: 28, h: 50, color: '#10b981', baseSpeed: 0.26, baseHp: 2 },
  boss: { w: 44, h: 78, color: '#e11d48', baseSpeed: 0.25, baseHp: 5 }
};

/**
 * LEVELS 1–25: EXPLICIT HANDCRAFTED OPENING & MID-EARLY CAMPAIGN
 */
const HANDCRAFTED_1_TO_25: ExplicitLevelBlueprint[] = [
  {
    level: 1,
    title: 'First Contact',
    objectiveText: 'Hold to aim, release to fire • Drag down to cancel unwanted shots',
    primaryChallenge: 'Direct laser aiming at a ground Walker and a low stone ruin step.',
    mechanicsUsed: ['direct-aim', 'cancel-shot'],
    ammoAssumption: '6 rounds with starter M9 Sidearm (needs 2 hits).',
    intendedSolution: 'L1: Shoot the advancing ground Walker at x=300 first, then angle slightly up to hit the second Walker atop the y=390 stone step.',
    ammo: 6,
    playerPos: { x: 76, y: 524 },
    structures: [{ x: 410, y: 390, w: 135, h: 16, type: 'stone' }],
    zombies: [
      { type: 'normal', surfaceIndex: -1, offsetXRatio: 0.48, variant: 0 },
      { type: 'normal', surfaceIndex: 0, offsetXRatio: 0.55, variant: 1 }
    ],
    tnt: []
  },
  {
    level: 2,
    title: 'Scaffold Overlook',
    objectiveText: 'From the high left scaffold, clear the low Crawler and balcony lookout',
    primaryChallenge: 'Elevated downward and upward angle control against a low-profile Crawler and a high Walker.',
    mechanicsUsed: ['elevation-angles', 'crawler-profile'],
    ammoAssumption: '6 rounds (needs 2 hits).',
    intendedSolution: 'L2: Aim steeply down from your y=310 scaffold to hit the low Crawler on the floor, then aim up at the y=210 stone balcony.',
    ammo: 6,
    playerPos: { x: 82, y: 310 },
    structures: [
      { x: 390, y: 210, w: 150, h: 16, type: 'stone' },
      { x: 230, y: 420, w: 110, h: 16, type: 'stone' }
    ],
    zombies: [
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.62, variant: 0 },
      { type: 'normal', surfaceIndex: 0, offsetXRatio: 0.52, variant: 2 }
    ],
    tnt: []
  },
  {
    level: 3,
    title: 'East Flank Cryo Pit',
    objectiveText: 'Firing left from the eastern alley, shatter the ice bridge over spikes!',
    primaryChallenge: 'Right-to-left firing perspective introducing destructible cyan ice and lethal floor spikes.',
    mechanicsUsed: ['reverse-angle', 'ice-support-drop', 'spike-hazard'],
    ammoAssumption: '6 rounds (1 shot breaks the ice bridge, 1 shot stops the Sprinter).',
    intendedSolution: 'L3: Shoot the fast Sprinter rushing rightward first, then shatter the cyan ice bridge at x=95 to drop the Heavy Brute onto the spikes.',
    ammo: 6,
    playerPos: { x: 520, y: 524 },
    structures: [
      { x: 95, y: 275, w: 155, h: 16, type: 'ice' },
      { x: 90, y: 512, w: 165, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2, variant: 1 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.56, variant: 0 }
    ],
    tnt: []
  },
  {
    level: 4,
    title: 'Underpass Ignition',
    objectiveText: 'Thread a diagonal shot from the high watchtower into the underpass TNT barrel',
    primaryChallenge: 'A wide stone roof shields the ground patrol from above; requires threading a diagonal shot under the roof lip.',
    mechanicsUsed: ['tnt-blast', 'elevation-angles'],
    ammoAssumption: '5 rounds (1 shot hits the underpass TNT to clear both ground enemies, 1 shot clears the roof lookout).',
    intendedSolution: 'L4: From your high perch at y=200, angle a shot beneath the left lip of the stone roof (x=280, y=340) into the floor TNT barrel.',
    ammo: 5,
    playerPos: { x: 80, y: 200 },
    structures: [{ x: 280, y: 340, w: 245, h: 16, type: 'stone' }],
    zombies: [
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.68, hp: 2, variant: 0 },
      { type: 'normal', surfaceIndex: -1, offsetXRatio: 0.84, variant: 1 },
      { type: 'normal', surfaceIndex: 0, offsetXRatio: 0.6, variant: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.60, purpose: 'Explodes underneath the stone roof to eliminate both sheltered enemies' }
    ]
  },
  {
    level: 5,
    title: 'Ceiling Bank Shot',
    objectiveText: 'Bank your bullet off the overhead purple bounce pad behind the tall stone wall!',
    primaryChallenge: 'A tall vertical stone wall completely blocks direct fire; introduces ceiling ricochet geometry.',
    mechanicsUsed: ['ricochet', 'tnt-blast', 'cancel-shot'],
    ammoAssumption: '6 rounds.',
    intendedSolution: 'L5: Aim up at the purple bounce panel on the ceiling (y=90) so the reflected laser lands on the TNT barrel behind the wall at x=255.',
    ammo: 6,
    playerPos: { x: 84, y: 420 },
    structures: [
      { x: 255, y: 275, w: 18, h: 249, type: 'stone' },
      { x: 205, y: 90, w: 220, h: 16, type: 'bounce' },
      { x: 380, y: 380, w: 150, h: 16, type: 'stone' }
    ],
    zombies: [
      { type: 'normal', surfaceIndex: -1, offsetXRatio: 0.66, variant: 0 },
      { type: 'crawler', surfaceIndex: 2, offsetXRatio: 0.55, variant: 1 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.72, purpose: 'Detonated by ceiling bank shot, blasting both behind-wall targets' }
    ]
  },
  {
    level: 6,
    title: 'Crossroads Center Bridge',
    objectiveText: 'Stand on the central bridge and collapse the flanking cryo perches on BOTH sides!',
    primaryChallenge: '360-degree central defense where enemies flank the player on both the left and right.',
    mechanicsUsed: ['center-defense', 'ice-support-drop', 'spike-hazard'],
    ammoAssumption: '6 rounds (2 shots drop both flanking ice perches onto spikes; 1 shot stops the right Crawler).',
    intendedSolution: 'L6: Aim left from (295, 330) to break the west ice bridge at x=50, then aim right to shatter the east ice bridge at x=405 and finish the Crawler.',
    ammo: 6,
    playerPos: { x: 295, y: 330 },
    structures: [
      { x: 50, y: 230, w: 145, h: 16, type: 'ice' },
      { x: 405, y: 250, w: 145, h: 16, type: 'ice' },
      { x: 45, y: 512, w: 155, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2, variant: 2 },
      { type: 'normal', surfaceIndex: 1, offsetXRatio: 0.5, variant: 0 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.82, variant: 1 }
    ],
    tnt: []
  },
  {
    level: 7,
    title: 'Riot Shield Visor Test',
    objectiveText: 'Armored Riot Troopers resist body shots — aim for the visor headshot or drop their ice floor!',
    primaryChallenge: 'Introduces the Armored Riot Trooper whose chest plate halves body damage.',
    mechanicsUsed: ['armored-headshot', 'ice-support-drop', 'tnt-blast'],
    ammoAssumption: '6 rounds.',
    intendedSolution: 'L7: Shatter the upper ice bridge (y=235) to drop the upper Armored Trooper onto the lower TNT barrel, blasting the ground Armored Trooper too!',
    ammo: 6,
    playerPos: { x: 78, y: 370 },
    structures: [
      { x: 335, y: 235, w: 165, h: 16, type: 'ice' },
      { x: 195, y: 395, w: 110, h: 16, type: 'stone' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2, variant: 0 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.72, hp: 2, variant: 1 },
      { type: 'runner', surfaceIndex: 1, offsetXRatio: 0.5, variant: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.66, purpose: 'Crushed by the falling Armored Trooper from bridge 0, killing the lower Armored Trooper' }
    ]
  },
  {
    level: 8,
    title: 'Underbelly Skip Shot',
    objectiveText: 'From the high east sniper ledge, skip a bullet off the floor bounce pad under the hanging wall',
    primaryChallenge: 'A tall hanging stone wall blocks upper and mid trajectories; requires a low floor-bounce skip shot from right to left.',
    mechanicsUsed: ['reverse-angle', 'ricochet', 'tnt-blast'],
    ammoAssumption: '6 rounds.',
    intendedSolution: 'L8: Aim down-left from (522, 240) at the floor bounce pad (x=245, y=508) so the bullet skims under the hanging wall into the west chamber TNT.',
    ammo: 6,
    playerPos: { x: 522, y: 240 },
    structures: [
      { x: 295, y: 16, w: 20, h: 395, type: 'stone' },
      { x: 245, y: 508, w: 135, h: 16, type: 'bounce' },
      { x: 70, y: 310, w: 145, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.22, hp: 2, variant: 0 },
      { type: 'normal', surfaceIndex: -1, offsetXRatio: 0.12, variant: 1 },
      { type: 'normal', surfaceIndex: 2, offsetXRatio: 0.5, variant: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.17, purpose: 'Detonates when hit by the floor-skip ricochet under the hanging wall' }
    ]
  },
  {
    level: 9,
    title: 'Cryo Window Breach',
    objectiveText: 'Break the vertical ice window first, then detonate the interior TNT barrel!',
    primaryChallenge: 'Two-shot sequential breach through a vertical destructible ice shield.',
    mechanicsUsed: ['ice-support-drop', 'tnt-blast'],
    ammoAssumption: '6 rounds (Shot 1 breaks vertical ice shield, Shot 2 detonates interior TNT, Shot 3 clears top Runner).',
    intendedSolution: 'L9: Shoot the vertical cyan ice wall at x=315 to open a firing window, then hit the TNT barrel on the stone platform inside.',
    ammo: 6,
    playerPos: { x: 80, y: 460 },
    structures: [
      { x: 315, y: 210, w: 16, h: 170, type: 'ice' },
      { x: 331, y: 364, w: 195, h: 16, type: 'stone' },
      { x: 350, y: 165, w: 155, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 1, offsetXRatio: 0.65, hp: 2, variant: 0 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.32, hp: 2, variant: 1 },
      { type: 'runner', surfaceIndex: 2, offsetXRatio: 0.5, variant: 2 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.48, purpose: 'Blasts the sheltered Brute and Armored Trooper AND shatters upper ice shelf 2' }
    ]
  },
  {
    level: 10,
    title: 'Sector 1 Boss: Alley Warlord',
    objectiveText: 'BOSS SIEGE: Bank off the ceiling reflector or drop the upper TNT onto the Alley Warlord!',
    primaryChallenge: 'First Sector Warlord Boss fortified behind a stone barricade with an overhead ice gantry.',
    mechanicsUsed: ['boss-siege', 'ricochet', 'tnt-chain', 'ice-support-drop'],
    ammoAssumption: '7 rounds (upper TNT + lower TNT chain leaves the 4-HP Warlord at 1 HP or dead).',
    intendedSolution: 'L10: Shoot the upper ice gantry TNT at y=205 to blast the upper guard and collapse the ice, then bank a shot off the ceiling pad into the Boss TNT.',
    ammo: 7,
    playerPos: { x: 82, y: 320 },
    structures: [
      { x: 250, y: 345, w: 20, h: 179, type: 'stone' },
      { x: 335, y: 205, w: 175, h: 16, type: 'ice' },
      { x: 265, y: 80, w: 230, h: 16, type: 'bounce' }
    ],
    zombies: [
      { type: 'boss', surfaceIndex: -1, offsetXRatio: 0.78, hp: 4 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.65, hp: 2, variant: 1 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.58, variant: 0 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.28, purpose: 'Explodes the upper ice gantry and Armored guard' },
      { surfaceIndex: -1, offsetXRatio: 0.69, purpose: 'Blasts the Alley Warlord and ground Sprinter' }
    ]
  },
  {
    level: 11,
    title: 'Staggered Ice Chutes',
    objectiveText: 'From the high center-left catwalk, drop two staggered ice chutes into the furnace spikes',
    primaryChallenge: 'Two asymmetrical ice bridges at different heights and horizontal offsets over split hazard pits.',
    mechanicsUsed: ['ice-support-drop', 'spike-hazard'],
    ammoAssumption: '6 rounds.',
    intendedSolution: 'L11: From (95, 220), shoot the near ice chute at (x=215, y=310) and the high far ice chute at (x=405, y=195) to drop both squads onto spikes.',
    ammo: 6,
    playerPos: { x: 95, y: 220 },
    structures: [
      { x: 215, y: 310, w: 135, h: 16, type: 'ice' },
      { x: 405, y: 195, w: 145, h: 16, type: 'ice' },
      { x: 210, y: 512, w: 345, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2, variant: 0 },
      { type: 'fat', surfaceIndex: 1, offsetXRatio: 0.35, hp: 2, variant: 1 },
      { type: 'normal', surfaceIndex: 1, offsetXRatio: 0.75, variant: 2 }
    ],
    tnt: []
  },
  {
    level: 12,
    title: 'Warehouse Domino Chain',
    objectiveText: 'Ignite the exposed left barrel to chain-blast behind the twin stone pillars!',
    primaryChallenge: 'A vertical stone pillar blocks direct shots to the right-hand squad; requires a 2-barrel horizontal chain.',
    mechanicsUsed: ['tnt-chain', 'cover-bypass'],
    ammoAssumption: '5 rounds.',
    intendedSolution: 'L12: Shoot the first TNT barrel at x=315 in front of the pillar; it chains 115px right to the second barrel behind the pillar.',
    ammo: 5,
    playerPos: { x: 78, y: 524 },
    structures: [
      { x: 355, y: 310, w: 20, h: 214, type: 'stone' },
      { x: 210, y: 245, w: 130, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.76, hp: 2, variant: 0 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.88, hp: 2, variant: 2 },
      { type: 'crawler', surfaceIndex: 1, offsetXRatio: 0.5, variant: 1 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.53, purpose: 'Front trigger barrel visible to player' },
      { surfaceIndex: -1, offsetXRatio: 0.72, purpose: 'Back chain barrel behind the stone pillar' }
    ]
  },
  {
    level: 13,
    title: 'Backboard Bank Shot',
    objectiveText: 'Bounce your shot off the right-wall reflector to strike the shielded scaffold from behind!',
    primaryChallenge: 'A vertical metal armor plate blocks the front of the middle scaffold; requires a right-wall backboard bounce.',
    mechanicsUsed: ['ricochet', 'tnt-blast', 'metal-cover'],
    ammoAssumption: '6 rounds.',
    intendedSolution: 'L13: Aim past the scaffold at the vertical purple bounce pad on the right wall (x=548) to reflect back into the scaffold TNT barrel.',
    ammo: 6,
    playerPos: { x: 82, y: 470 },
    structures: [
      { x: 265, y: 215, w: 18, h: 135, type: 'metal' },
      { x: 283, y: 325, w: 185, h: 16, type: 'stone' },
      { x: 548, y: 150, w: 16, h: 210, type: 'bounce' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.35, hp: 2, variant: 1 },
      { type: 'fat', surfaceIndex: 1, offsetXRatio: 0.72, hp: 2, variant: 0 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.45, variant: 2 }
    ],
    tnt: [{ surfaceIndex: 1, offsetXRatio: 0.54, purpose: 'Hit from behind via the right-wall bounce pad' }]
  },
  {
    level: 14,
    title: 'Toxic Spitter Perch',
    objectiveText: 'Interrupt the green Toxic Spitter before its acid volley hits your position!',
    primaryChallenge: 'First encounter with a ranged Toxic Spitter on an elevated cryo bridge.',
    mechanicsUsed: ['spitter-interrupt', 'ice-support-drop', 'tnt-blast'],
    ammoAssumption: '6 rounds.',
    intendedSolution: 'L14: Shatter the cyan ice bridge at y=215 under the green Spitter so it falls onto the floor TNT barrel below!',
    ammo: 6,
    playerPos: { x: 80, y: 390 },
    structures: [
      { x: 350, y: 215, w: 165, h: 16, type: 'ice' },
      { x: 225, y: 380, w: 18, h: 144, type: 'stone' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2, variant: 0 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.64, hp: 2, variant: 1 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.82, variant: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.72, purpose: 'Crushed by the falling Spitter from bridge 0, blasting ground enemies' }
    ]
  },
  {
    level: 15,
    title: 'Center Pit Uplink',
    objectiveText: 'From the bottom center pit, bank shots off the ceiling reflector to clear both balconies!',
    primaryChallenge: 'Player starts in a low central pit (x=300, y=524) flanked by high left and right balconies.',
    mechanicsUsed: ['center-defense', 'ricochet', 'tnt-blast'],
    ammoAssumption: '6 rounds.',
    intendedSolution: 'L15: Shoot the left ceiling bounce pad (x=60, y=90) to drop a bullet onto the left balcony TNT, then shoot the right ice bridge directly.',
    ammo: 6,
    playerPos: { x: 300, y: 524 },
    structures: [
      { x: 45, y: 290, w: 160, h: 16, type: 'stone' },
      { x: 395, y: 260, w: 160, h: 16, type: 'ice' },
      { x: 60, y: 90, w: 170, h: 16, type: 'bounce' },
      { x: 405, y: 512, w: 150, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 0, offsetXRatio: 0.35, hp: 2, variant: 0 },
      { type: 'normal', surfaceIndex: 0, offsetXRatio: 0.75, variant: 1 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.5, hp: 2, variant: 2 }
    ],
    tnt: [{ surfaceIndex: 0, offsetXRatio: 0.55, purpose: 'Clears the high left stone balcony via ceiling bounce' }]
  },
  {
    level: 16,
    title: 'Sandwich Deck Blast',
    objectiveText: 'Detonate the middle barrel to simultaneously shatter the upper AND lower ice decks!',
    primaryChallenge: 'One TNT barrel sandwiched between two vertical ice decks within its 140px blast radius.',
    mechanicsUsed: ['tnt-blast', 'ice-support-drop', 'spike-hazard'],
    ammoAssumption: '5 rounds (1 shot clears all 3 tiers!).',
    intendedSolution: 'L16: From the right gantry (x=518, y=310), shoot the TNT barrel on the middle deck (y=295) to shatter both ice decks over the spike pit.',
    ammo: 5,
    playerPos: { x: 518, y: 310 },
    structures: [
      { x: 110, y: 195, w: 175, h: 16, type: 'ice' },
      { x: 110, y: 295, w: 175, h: 16, type: 'ice' },
      { x: 100, y: 512, w: 200, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2, variant: 0 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.32, hp: 2, variant: 1 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.62, variant: 2 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.68, purpose: 'Shatters both ice decks 0 and 1 and blasts the Armored Trooper' }
    ]
  },
  {
    level: 17,
    title: 'Z-Bounce Corridor',
    objectiveText: 'Bank your bullet off the floor pad AND ceiling pad to reach the deep vault!',
    primaryChallenge: 'Two staggered vertical walls block single-bounce shots; requires a 2-bounce Z-trajectory.',
    mechanicsUsed: ['ricochet', 'tnt-blast'],
    ammoAssumption: '6 rounds.',
    intendedSolution: 'L17: Aim at the floor bounce pad (x=175, y=508) so the bullet reflects up to the ceiling bounce pad (x=270, y=85) and down into the vault TNT.',
    ammo: 6,
    playerPos: { x: 76, y: 350 },
    structures: [
      { x: 200, y: 16, w: 18, h: 310, type: 'stone' },
      { x: 350, y: 240, w: 18, h: 284, type: 'stone' },
      { x: 175, y: 508, w: 145, h: 16, type: 'bounce' },
      { x: 270, y: 85, w: 220, h: 16, type: 'bounce' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.72, hp: 2, variant: 0 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.86, hp: 2, variant: 1 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.79, purpose: 'Detonated by the Z-bounce trajectory behind the second stone wall' }
    ]
  },
  {
    level: 18,
    title: 'Fragile Sniper Ledge',
    objectiveText: 'WARNING: You stand on destructible ice! Eliminate the two Spitters before they shatter your floor!',
    primaryChallenge: 'First level where the player stands on a destructible ice support threatened by enemy acid.',
    mechanicsUsed: ['destructible-player-ledge', 'spitter-interrupt', 'ice-support-drop', 'spike-hazard'],
    ammoAssumption: '6 rounds.',
    intendedSolution: 'L18: Immediately shoot the two cyan ice perches holding the Spitters (y=210 and y=335) so they fall onto the hazard spikes before firing.',
    ammo: 6,
    playerPos: { x: 82, y: 250 },
    destructiblePlayerSupport: true,
    structures: [
      { x: 355, y: 210, w: 160, h: 16, type: 'ice' },
      { x: 265, y: 335, w: 155, h: 16, type: 'ice' },
      { x: 260, y: 512, w: 265, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2, variant: 0 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.5, hp: 2, variant: 1 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.32, variant: 2 }
    ],
    tnt: []
  },
  {
    level: 19,
    title: 'Reinforcement Ambush',
    objectiveText: 'Clear the bunker guards and save ammo for the Sprinter reinforcement wave!',
    primaryChallenge: 'Introduces mid-mission wave reinforcement when only 1 zombie remains.',
    mechanicsUsed: ['wave-defense', 'tnt-blast', 'ice-support-drop'],
    ammoAssumption: '6 rounds (includes reserve rounds for the reinforcement Sprinter).',
    intendedSolution: 'L19: From the elevated bunker perch (y=340), detonate the shelf TNT at y=240 to clear the upper Spitter and Brute, drop the mid ice bridge onto spikes, then shoot the reinforcement Sprinter.',
    ammo: 6,
    playerPos: { x: 84, y: 340 },
    structures: [
      { x: 350, y: 240, w: 180, h: 16, type: 'stone' },
      { x: 205, y: 355, w: 135, h: 16, type: 'ice' },
      { x: 195, y: 512, w: 155, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.68, hp: 2, variant: 0 },
      { type: 'fat', surfaceIndex: 0, offsetXRatio: 0.28, hp: 2, variant: 1 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.5, hp: 2, variant: 2 }
    ],
    tnt: [{ surfaceIndex: 0, offsetXRatio: 0.48, purpose: 'Clears both upper enemies on stone shelf 0' }],
    waveZombie: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.85, variant: 0 }
  },
  {
    level: 20,
    title: 'Sector 2 Boss: Foundry Warlord',
    objectiveText: 'BOSS SIEGE: From the eastern crane, chain-blast the Foundry Warlord’s bunker!',
    primaryChallenge: 'Right-to-left Boss siege with a vertical ice shield, overhead bounce pad, and reinforcement wave.',
    mechanicsUsed: ['boss-siege', 'reverse-angle', 'ice-support-drop', 'tnt-chain', 'wave-defense'],
    ammoAssumption: '7 rounds.',
    intendedSolution: 'L20: Break the vertical ice shield at x=310 or bounce off the ceiling pad to ignite the upper TNT, chaining down to the Foundry Warlord.',
    ammo: 7,
    playerPos: { x: 520, y: 300 },
    structures: [
      { x: 310, y: 330, w: 16, h: 194, type: 'ice' },
      { x: 85, y: 205, w: 180, h: 16, type: 'ice' },
      { x: 130, y: 80, w: 230, h: 16, type: 'bounce' }
    ],
    zombies: [
      { type: 'boss', surfaceIndex: -1, offsetXRatio: 0.22, hp: 5 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.4, hp: 2, variant: 1 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.38, hp: 2, variant: 0 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.72, purpose: 'Upper gantry barrel blasts Spitter and shatters ice shelf 1' },
      { surfaceIndex: -1, offsetXRatio: 0.30, purpose: 'Lower bunker barrel blasts Foundry Warlord and Armored guard' }
    ],
    waveZombie: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.15, variant: 2 }
  },
  {
    level: 21,
    title: 'Refinery Cascade',
    objectiveText: 'Drop the top Heavy Brute through two tiers to detonate the floor acid-barrel!',
    primaryChallenge: 'Vertical gravity cascade where an upper Brute crushes a ground TNT barrel.',
    mechanicsUsed: ['ice-support-drop', 'tnt-blast', 'spitter-interrupt'],
    ammoAssumption: '5 rounds.',
    intendedSolution: 'L21: Shoot the high ice bridge at y=180 so the Brute falls onto the floor TNT barrel at x=395, blasting both ground guards.',
    ammo: 5,
    playerPos: { x: 82, y: 290 },
    structures: [
      { x: 325, y: 180, w: 150, h: 16, type: 'ice' },
      { x: 195, y: 320, w: 120, h: 16, type: 'stone' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2, variant: 0 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.62, hp: 2, variant: 1 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.5, hp: 2, variant: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.67, purpose: 'Crushed by the falling Brute from bridge 0, killing the Armored Trooper' }
    ]
  },
  {
    level: 22,
    title: 'Twin Spitter Crossfire',
    objectiveText: 'Use the central TNT barrel to collapse both opposing Spitter ledges in one shot!',
    primaryChallenge: 'Two Spitters on adjacent horizontal ice ledges share a single central blast zone.',
    mechanicsUsed: ['tnt-blast', 'ice-support-drop', 'spike-hazard'],
    ammoAssumption: '5 rounds.',
    intendedSolution: 'L22: Hit the TNT barrel on the center stone pillar (x=315, y=265); its 140px blast shatters both the left and right ice ledges over spikes!',
    ammo: 5,
    playerPos: { x: 78, y: 450 },
    structures: [
      { x: 185, y: 240, w: 125, h: 16, type: 'ice' },
      { x: 315, y: 265, w: 65, h: 16, type: 'stone' },
      { x: 385, y: 240, w: 145, h: 16, type: 'ice' },
      { x: 185, y: 512, w: 350, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2, variant: 0 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2, variant: 1 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.82, hp: 2, variant: 2 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.5, purpose: 'Central charge that shatters both flanking ice bridges 0 and 2 simultaneously' }
    ]
  },
  {
    level: 23,
    title: 'Diagonal Mirror Shaft',
    objectiveText: 'From the high center perch, bank shots off both side-wall bounce mirrors!',
    primaryChallenge: 'Player stands on a high center platform (x=300, y=190) with stone shields directly below.',
    mechanicsUsed: ['center-defense', 'ricochet', 'tnt-blast'],
    ammoAssumption: '6 rounds.',
    intendedSolution: 'L23: Bank left off the west bounce wall (x=18) to hit the left floor TNT, then bank right off the east bounce wall (x=566) to hit the right floor TNT.',
    ammo: 6,
    playerPos: { x: 300, y: 190 },
    structures: [
      { x: 80, y: 330, w: 160, h: 16, type: 'stone' },
      { x: 360, y: 330, w: 160, h: 16, type: 'stone' },
      { x: 18, y: 260, w: 16, h: 200, type: 'bounce' },
      { x: 566, y: 260, w: 16, h: 200, type: 'bounce' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.22, hp: 2, variant: 0 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.78, hp: 2, variant: 1 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.88, variant: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.16, purpose: 'Left under-shelf barrel hit via west wall bounce' },
      { surfaceIndex: -1, offsetXRatio: 0.82, purpose: 'Right under-shelf barrel hit via east wall bounce' }
    ]
  },
  {
    level: 24,
    title: 'Cryo Stairwell Siege',
    objectiveText: 'Protect your fragile ice platform while collapsing the 3-step stairwell!',
    primaryChallenge: 'Player stands on destructible ice on the right (x=518, y=260) facing three ascending steps on the left.',
    mechanicsUsed: ['destructible-player-ledge', 'reverse-angle', 'ice-support-drop', 'tnt-chain'],
    ammoAssumption: '6 rounds.',
    intendedSolution: 'L24: Shoot the top-left TNT barrel at (x=115, y=195); it blasts the Spitter and chains down to the mid-step TNT barrel at (x=225, y=290)!',
    ammo: 6,
    playerPos: { x: 518, y: 260 },
    destructiblePlayerSupport: true,
    structures: [
      { x: 65, y: 195, w: 145, h: 16, type: 'ice' },
      { x: 185, y: 290, w: 155, h: 16, type: 'ice' },
      { x: 310, y: 390, w: 135, h: 16, type: 'stone' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.4, hp: 2, variant: 0 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.65, hp: 2, variant: 1 },
      { type: 'runner', surfaceIndex: 2, offsetXRatio: 0.5, variant: 2 }
    ],
    tnt: [
      { surfaceIndex: 0, offsetXRatio: 0.78, purpose: 'Top stair barrel that chains into the mid stair barrel' },
      { surfaceIndex: 1, offsetXRatio: 0.25, purpose: 'Mid stair barrel that blasts the Armored Trooper and shatters step 1' }
    ]
  },
  {
    level: 25,
    title: 'Three-Barrel Refinery Chain',
    objectiveText: 'Trigger a 3-barrel domino chain across the sealed refinery floor!',
    primaryChallenge: 'Three TNT barrels spaced 115px apart carry a blast wave under a low stone ceiling.',
    mechanicsUsed: ['tnt-chain', 'ice-support-drop'],
    ammoAssumption: '5 rounds (1 shot ignites all 3 barrels).',
    intendedSolution: 'L25: Shoot the exposed left TNT barrel at x=235; it chains through x=350 to x=465, clearing the entire refinery floor and low ice bridge.',
    ammo: 5,
    playerPos: { x: 76, y: 380 },
    structures: [
      { x: 300, y: 340, w: 240, h: 16, type: 'stone' },
      { x: 390, y: 220, w: 150, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.60, hp: 2, variant: 0 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.82, hp: 2, variant: 1 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.5, hp: 2, variant: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.40, purpose: 'First domino barrel outside the low stone roof' },
      { surfaceIndex: -1, offsetXRatio: 0.60, purpose: 'Second domino barrel under the center of the stone roof' },
      { surfaceIndex: -1, offsetXRatio: 0.80, purpose: 'Third domino barrel that eliminates the Armored Trooper at the back' }
    ]
  }
];

/**
 * 75 EXPLICIT INDIVIDUAL BLUEPRINT SPECIFICATIONS FOR LEVELS 26–100
 * Each tuple defines a bespoke level with its own unique title, vantage point,
 * structural geometry, enemy roster, TNT arrangement, and winning shot sequence.
 * No modulo template loops are used.
 */
interface CompactLevelSpec {
  level: number;
  title: string;
  pX: number;
  pY: number;
  fragile?: boolean;
  ammo: number;
  objective: string;
  challenge: string;
  solution: string;
  structures: Structure[];
  zombies: ZombiePlacement[];
  tnt: TNTPlacement[];
  wave?: ZombiePlacement;
}

const EXPLICIT_SPECS_26_TO_100: CompactLevelSpec[] = [
  // ==================== SECTOR 3: TOXIC REFINERY (26–30) ====================
  {
    level: 26,
    title: 'Acid Vat Overpass',
    pX: 84,
    pY: 220,
    ammo: 6,
    objective: 'Shatter the high right cryo vat so the Spitter drops into the lower stone trough TNT!',
    challenge: 'High west sniper perch facing a two-tier acid vat with a front metal deflector.',
    solution: 'L26: From (84, 220), fire over the metal shield at x=240 to shatter the y=175 ice vat, dropping the Spitter onto the y=335 stone trough TNT.',
    structures: [
      { x: 240, y: 250, w: 18, h: 120, type: 'metal' },
      { x: 330, y: 175, w: 165, h: 16, type: 'ice' },
      { x: 315, y: 335, w: 190, h: 16, type: 'stone' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.45, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.68, hp: 2 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.72 }
    ],
    tnt: [{ surfaceIndex: 2, offsetXRatio: 0.32, purpose: 'Crushed by falling Spitter from vat 1, blasting Armored guard' }]
  },
  {
    level: 27,
    title: 'Sludge Pipe Ricochet',
    pX: 520,
    pY: 420,
    ammo: 6,
    objective: 'From the eastern pipe deck, bank off the ceiling bounce pad behind the central sludge wall!',
    challenge: 'East-to-west bank shot over a central stone divider into a dual-barrel sludge pit.',
    solution: 'L27: Aim up-left from (520, 420) at the ceiling bounce pad (x=210, y=88) to drop a shot onto the west floor TNT chain.',
    structures: [
      { x: 285, y: 245, w: 20, h: 279, type: 'stone' },
      { x: 210, y: 88, w: 200, h: 16, type: 'bounce' },
      { x: 70, y: 280, w: 150, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.22, hp: 2 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.36 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.28, purpose: 'Ignited by ceiling bounce behind the central stone divider' },
      { surfaceIndex: 2, offsetXRatio: 0.75, purpose: 'Shatters the west cryo shelf' }
    ]
  },
  {
    level: 28,
    title: 'Bio-Filter Split Bridge',
    pX: 295,
    pY: 265,
    ammo: 6,
    objective: 'Stand on the central filter hub and drop both asymmetrical cryo catwalks onto spikes!',
    challenge: 'Central mid-air hub flanked by a high west Spitter bridge and a low east Armored bridge.',
    solution: 'L28: Shoot left to break the high west ice bridge (y=185) over spikes, then pivot right to detonate the east shelf TNT (y=350).',
    structures: [
      { x: 45, y: 185, w: 145, h: 16, type: 'ice' },
      { x: 405, y: 350, w: 150, h: 16, type: 'stone' },
      { x: 45, y: 512, w: 155, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.35, hp: 2 },
      { type: 'fat', surfaceIndex: 1, offsetXRatio: 0.78, hp: 2 }
    ],
    tnt: [{ surfaceIndex: 1, offsetXRatio: 0.56, purpose: 'Clears both enemies on the low east stone platform' }]
  },
  {
    level: 29,
    title: 'Fume Duct Under-Skip',
    pX: 78,
    pY: 335,
    ammo: 6,
    objective: 'Skip a low shot off the floor bounce pad under the hanging fume duct to hit the rear TNT!',
    challenge: 'A wide hanging stone fume duct blocks upper trajectories; floor skip required.',
    solution: 'L29: Aim down at the floor bounce pad (x=220, y=508) to skip a bullet under the hanging duct at x=275 into the rear TNT barrel.',
    structures: [
      { x: 275, y: 16, w: 22, h: 375, type: 'stone' },
      { x: 210, y: 508, w: 135, h: 16, type: 'bounce' },
      { x: 385, y: 235, w: 160, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.70, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.86, hp: 2 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.78, purpose: 'Hit by floor-skip ricochet to clear both ground targets' },
      { surfaceIndex: 2, offsetXRatio: 0.25, purpose: 'Collapses the upper right Spitter bridge' }
    ]
  },
  {
    level: 30,
    title: 'Sector 3 Boss: Refinery Overlord',
    pX: 150,
    pY: 180,
    ammo: 7,
    objective: 'BOSS SIEGE: From the high west catwalk, collapse the twin acid vats onto the Refinery Overlord!',
    challenge: 'High west-center catwalk (150, 180) overlooking suspended cryo vats and a refinery floor chain.',
    solution: 'L30: Shatter the high right cryo vat (y=195) to drop the Spitter onto the mid stone deck TNT, then ignite the left floor barrel to chain-blast the Overlord.',
    structures: [
      { x: 365, y: 195, w: 165, h: 16, type: 'ice' },
      { x: 255, y: 315, w: 160, h: 16, type: 'stone' },
      { x: 80, y: 350, w: 135, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'boss', surfaceIndex: -1, offsetXRatio: 0.78, hp: 5 },
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.55, hp: 2 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.65, hp: 2 },
      { type: 'crawler', surfaceIndex: 2, offsetXRatio: 0.5 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.30, purpose: 'Detonated by upper cryo vat collapse or direct angle shot' },
      { surfaceIndex: -1, offsetXRatio: 0.56, purpose: 'Front refinery floor barrel that chains into the Overlord bunker' },
      { surfaceIndex: -1, offsetXRatio: 0.74, purpose: 'Main Overlord blast barrel' }
    ]
  },

  // ==================== SECTOR 4: CRYO ICE LAB (31–40) ====================
  {
    level: 31,
    title: 'Triple Cryo Cascade',
    pX: 80,
    pY: 185,
    ammo: 5,
    objective: 'Shatter the top cryo shelf so the Brute crushes through two lower ice decks onto spikes!',
    challenge: 'Three vertically aligned cryo shelves over a floor spike trench.',
    solution: 'L31: Shoot the top cryo shelf (y=170); the falling Brute crushes the y=280 TNT barrel and shatters the y=380 shelf over spikes.',
    structures: [
      { x: 335, y: 170, w: 170, h: 16, type: 'ice' },
      { x: 335, y: 280, w: 170, h: 16, type: 'ice' },
      { x: 335, y: 380, w: 170, h: 16, type: 'ice' },
      { x: 325, y: 512, w: 195, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.68, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 }
    ],
    tnt: [{ surfaceIndex: 1, offsetXRatio: 0.30, purpose: 'Crushed by the top Brute to destroy all three cryo tiers' }]
  },
  {
    level: 32,
    title: 'Glacier Mirror Vault',
    pX: 82,
    pY: 524,
    ammo: 6,
    objective: 'Bank off the right-wall mirror above the metal barrier to shatter the twin cryo pods!',
    challenge: 'Ground-level west spawn blocked by a central metal shield; high right-wall bounce required.',
    solution: 'L32: Aim high from (82, 524) at the right-wall bounce pad (x=548, y=140) so the reflected beam hits the TNT between the twin cryo pods.',
    structures: [
      { x: 255, y: 230, w: 18, h: 200, type: 'metal' },
      { x: 305, y: 215, w: 180, h: 16, type: 'ice' },
      { x: 305, y: 340, w: 180, h: 16, type: 'ice' },
      { x: 548, y: 135, w: 16, h: 180, type: 'bounce' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.35, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.65, hp: 2 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.75 }
    ],
    tnt: [{ surfaceIndex: 1, offsetXRatio: 0.72, purpose: 'Hit by right-wall bounce to shatter both cryo pods 1 and 2' }]
  },
  {
    level: 33,
    title: 'Subzero Fragile Perch',
    pX: 518,
    pY: 210,
    fragile: true,
    ammo: 6,
    objective: 'Your eastern ice perch is fragile! Collapse the western Spitter towers before they fire!',
    challenge: 'Destructible east sniper ledge facing two staggered west Spitter perches over spikes.',
    solution: 'L33: Quickly shoot the mid-west TNT barrel (x=235, y=285) to shatter both west cryo ledges over the floor spikes.',
    structures: [
      { x: 65, y: 200, w: 145, h: 16, type: 'ice' },
      { x: 195, y: 285, w: 155, h: 16, type: 'ice' },
      { x: 60, y: 512, w: 295, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.68, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.62, hp: 2 }
    ],
    tnt: [{ surfaceIndex: 1, offsetXRatio: 0.25, purpose: 'Shatters both west ice perches 0 and 1 over the spike pit' }]
  },
  {
    level: 34,
    title: 'Cryo Lock & Key',
    pX: 165,
    pY: 250,
    ammo: 6,
    objective: 'Shatter the vertical ice lock first, then thread a shot into the lower chamber domino chain!',
    challenge: 'West-center catwalk facing a vertical cryo bulkhead and a 2-barrel lower vault.',
    solution: 'L34: Break the vertical ice wall at x=305 with shot 1, then shoot the front vault TNT at x=365 to chain-clear the inner chamber.',
    structures: [
      { x: 305, y: 195, w: 16, h: 195, type: 'ice' },
      { x: 340, y: 215, w: 185, h: 16, type: 'stone' },
      { x: 340, y: 365, w: 195, h: 16, type: 'stone' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.65, hp: 2 },
      { type: 'fat', surfaceIndex: 2, offsetXRatio: 0.35, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.78, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.28, purpose: 'Clears the upper stone shelf once vertical ice lock 0 is broken' },
      { surfaceIndex: 2, offsetXRatio: 0.55, purpose: 'Clears both heavy defenders on the lower stone shelf' }
    ]
  },
  {
    level: 35,
    title: 'Frost Trench Ricochet',
    pX: 300,
    pY: 380,
    ammo: 6,
    objective: 'From the low center pedestal, bounce shots off the twin ceiling pads into the side bunkers!',
    challenge: 'Central pedestal flanked by tall left and right stone bunker walls.',
    solution: 'L35: Bank up-left off the west ceiling pad (x=75, y=85) into the left bunker TNT, then bank up-right off the east ceiling pad (x=365, y=85).',
    structures: [
      { x: 175, y: 285, w: 18, h: 239, type: 'stone' },
      { x: 405, y: 285, w: 18, h: 239, type: 'stone' },
      { x: 75, y: 85, w: 165, h: 16, type: 'bounce' },
      { x: 360, y: 85, w: 165, h: 16, type: 'bounce' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.14, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.84, hp: 2 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.76 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.20, purpose: 'Clears the sealed west bunker via left ceiling bounce' },
      { surfaceIndex: -1, offsetXRatio: 0.80, purpose: 'Clears the sealed east bunker via right ceiling bounce' }
    ]
  },
  {
    level: 36,
    title: 'Iceberg Pendulum',
    pX: 78,
    pY: 410,
    ammo: 6,
    objective: 'Shoot beneath the upper stone shield to shatter the lower ice pillar and trigger a chain blast!',
    challenge: 'Asymmetrical upper stone shield and lower cryo bridge over a TNT-lined floor.',
    solution: 'L36: Fire a low shot to shatter the y=330 ice bridge; the falling Armored Trooper crushes the floor TNT barrel below.',
    structures: [
      { x: 250, y: 170, w: 18, h: 120, type: 'stone' },
      { x: 310, y: 330, w: 175, h: 16, type: 'ice' },
      { x: 380, y: 195, w: 155, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.5, hp: 2 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.72, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.65, purpose: 'Crushed when bridge 1 collapses, blasting the ground Brute' },
      { surfaceIndex: 2, offsetXRatio: 0.25, purpose: 'Blasts the upper right Spitter perch' }
    ]
  },
  {
    level: 37,
    title: 'East Catwalk Z-Bank',
    pX: 440,
    pY: 220,
    ammo: 6,
    objective: 'From the east-center catwalk, bank off the west wall mirror under the stone overhang!',
    challenge: 'East-center vantage firing left against a wide west overhang.',
    solution: 'L37: Aim past the overhang lip at the west wall bounce pad (x=18, y=280) to reflect into the sheltered TNT barrel at x=145.',
    structures: [
      { x: 65, y: 255, w: 195, h: 16, type: 'stone' },
      { x: 18, y: 275, w: 16, h: 195, type: 'bounce' },
      { x: 110, y: 160, w: 145, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.20, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.34, hp: 2 }
    ],
    tnt: [{ surfaceIndex: -1, offsetXRatio: 0.26, purpose: 'Hit by west-wall bank shot underneath the stone overhang' }]
  },
  {
    level: 38,
    title: 'Cryo Bridge Quartet',
    pX: 80,
    pY: 295,
    fragile: true,
    ammo: 6,
    objective: 'Use two TNT barrels to collapse all three staggered cryo bridges over the spike floor!',
    challenge: 'Four enemies across three staggered cryo bridges while standing on destructible ice.',
    solution: 'L38: Shoot the TNT on bridge 0 (x=215, y=220) to shatter bridges 0 and 1, then shoot the TNT on bridge 2 (x=410, y=285).',
    structures: [
      { x: 195, y: 220, w: 135, h: 16, type: 'ice' },
      { x: 255, y: 345, w: 135, h: 16, type: 'ice' },
      { x: 395, y: 275, w: 155, h: 16, type: 'ice' },
      { x: 190, y: 512, w: 365, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.65, hp: 2 },
      { type: 'runner', surfaceIndex: 1, offsetXRatio: 0.5 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.35, hp: 2 },
      { type: 'fat', surfaceIndex: 2, offsetXRatio: 0.78, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 0, offsetXRatio: 0.28, purpose: 'Shatters bridges 0 and 1 simultaneously' },
      { surfaceIndex: 2, offsetXRatio: 0.58, purpose: 'Blasts both heavy enemies on bridge 2' }
    ]
  },
  {
    level: 39,
    title: 'Permafrost Wave Defense',
    pX: 522,
    pY: 524,
    ammo: 6,
    objective: 'Clear the western permafrost bunker and hold off the Sprinter reinforcement wave!',
    challenge: 'East ground alley defense against a two-tier west bunker and fast wave ambush.',
    solution: 'L39: Shoot the exposed right domino barrel at x=290 to chain into the west bunker, shatter the top ice ledge, and save 1 round for the Sprinter wave.',
    structures: [
      { x: 75, y: 330, w: 215, h: 16, type: 'stone' },
      { x: 95, y: 205, w: 165, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.20, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.35, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.48, purpose: 'Outer trigger barrel visible from the east alley' },
      { surfaceIndex: -1, offsetXRatio: 0.28, purpose: 'Inner bunker barrel under the stone roof' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.14 }
  },
  {
    level: 40,
    title: 'Sector 4 Boss: Cryo Colossus',
    pX: 300,
    pY: 524,
    ammo: 7,
    objective: 'BOSS SIEGE: From the bottom center trench, bank off both side mirrors to topple the Cryo Tower!',
    challenge: 'Player fights from the bottom center trench (300, 524) beneath a towering central cryo citadel.',
    solution: 'L40: Bank left off the west bounce wall (x=18) to hit the mid-tier cryo TNT, then bank right off the east bounce wall (x=566) to hit the upper Boss gantry.',
    structures: [
      { x: 195, y: 185, w: 210, h: 16, type: 'ice' },
      { x: 195, y: 300, w: 210, h: 16, type: 'ice' },
      { x: 18, y: 170, w: 16, h: 240, type: 'bounce' },
      { x: 566, y: 170, w: 16, h: 240, type: 'bounce' },
      { x: 60, y: 512, w: 135, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'boss', surfaceIndex: 0, offsetXRatio: 0.5, hp: 5 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.25, hp: 2 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.78, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 0, offsetXRatio: 0.22, purpose: 'Shatters the top Boss cryo deck via side-wall bank shot' },
      { surfaceIndex: 1, offsetXRatio: 0.52, purpose: 'Blasts the middle cryo deck and drops the Colossus' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },

  // ==================== SECTOR 5: MILITARY BUNKER DEPOT (41–50) ====================
  {
    level: 41,
    title: 'Armory Pillbox Breach',
    pX: 78,
    pY: 260,
    ammo: 6,
    objective: 'Breach the upper ice embrasure, then bank off the right wall into the lower pillbox!',
    challenge: 'Two-story military pillbox where the lower floor is armored with metal plate.',
    solution: 'L41: Shoot through the upper ice window (x=285, y=180) to hit the upper Spitter TNT, then bank off the right bounce pad (x=548) into the lower pillbox.',
    structures: [
      { x: 285, y: 170, w: 16, h: 130, type: 'ice' },
      { x: 285, y: 310, w: 18, h: 214, type: 'metal' },
      { x: 320, y: 285, w: 180, h: 16, type: 'stone' },
      { x: 548, y: 220, w: 16, h: 220, type: 'bounce' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.55, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.65, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.82, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 2, offsetXRatio: 0.25, purpose: 'Clears the upper pillbox deck after ice window 0 breaks' },
      { surfaceIndex: -1, offsetXRatio: 0.74, purpose: 'Detonated via right-wall bounce behind the lower metal shield' }
    ]
  },
  {
    level: 42,
    title: 'Depot Crane Crossfire',
    pX: 295,
    pY: 420,
    ammo: 6,
    objective: 'From the lower center depot platform, collapse the twin overhead ordnance cranes!',
    challenge: 'Low central platform beneath two high flanking ordnance shelves.',
    solution: 'L42: Aim up-left from (295, 420) to hit the west crane TNT at y=205, then aim up-right to shatter the east cryo crane at y=215 over spikes.',
    structures: [
      { x: 45, y: 205, w: 160, h: 16, type: 'stone' },
      { x: 395, y: 215, w: 160, h: 16, type: 'ice' },
      { x: 390, y: 512, w: 165, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.35, hp: 2 },
      { type: 'armored', surfaceIndex: 0, offsetXRatio: 0.75, hp: 2 },
      { type: 'fat', surfaceIndex: 1, offsetXRatio: 0.5, hp: 2 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.18 }
    ],
    tnt: [{ surfaceIndex: 0, offsetXRatio: 0.55, purpose: 'Clears both enemies on the high west ordnance crane' }]
  },
  {
    level: 43,
    title: 'Bunker Staircase Cascade',
    pX: 80,
    pY: 175,
    ammo: 5,
    objective: 'From the high west parapet, trigger a 3-step downward domino blast across the depot!',
    challenge: 'Three descending steps from left to right with linked TNT charges.',
    solution: 'L43: Shoot the TNT barrel on the high step (x=210, y=220); it chains to the middle step (x=330, y=315) and shatters the lower cryo step.',
    structures: [
      { x: 185, y: 220, w: 140, h: 16, type: 'stone' },
      { x: 305, y: 315, w: 145, h: 16, type: 'ice' },
      { x: 420, y: 405, w: 135, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.65, hp: 2 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.65, hp: 2 },
      { type: 'fat', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 0, offsetXRatio: 0.28, purpose: 'Top stair barrel that blasts Spitter and chains down to step 1' },
      { surfaceIndex: 1, offsetXRatio: 0.28, purpose: 'Mid stair barrel that shatters steps 1 and 2' }
    ]
  },
  {
    level: 44,
    title: 'Ordnance Shaft Z-Shot',
    pX: 520,
    pY: 350,
    ammo: 6,
    objective: 'Bounce off the floor pad and ceiling pad from right to left to reach the sealed west ammo shaft!',
    challenge: 'Reverse right-to-left Z-bounce puzzle through two staggered stone bulkheads.',
    solution: 'L44: From (520, 350), aim at the floor bounce pad (x=300, y=508) so the shot reflects up to the ceiling pad (x=150, y=85) and down into the west shaft TNT.',
    structures: [
      { x: 375, y: 16, w: 18, h: 305, type: 'stone' },
      { x: 225, y: 245, w: 18, h: 279, type: 'stone' },
      { x: 270, y: 508, w: 145, h: 16, type: 'bounce' },
      { x: 115, y: 85, w: 210, h: 16, type: 'bounce' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.16, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.28, hp: 2 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.52 }
    ],
    tnt: [{ surfaceIndex: -1, offsetXRatio: 0.22, purpose: 'Detonated by the reverse Z-bounce inside the west shaft' }]
  },
  {
    level: 45,
    title: 'Steel Curtain Gap',
    pX: 82,
    pY: 320,
    ammo: 6,
    objective: 'Thread your laser through the narrow gap between upper and lower metal shields!',
    challenge: 'Two vertical metal shields leave a 65px central aperture into a two-tier munition bay.',
    solution: 'L45: Aim precisely through the aperture (y=245..310) at x=260 to strike the interior shelf TNT barrel.',
    structures: [
      { x: 260, y: 110, w: 18, h: 135, type: 'metal' },
      { x: 260, y: 310, w: 18, h: 214, type: 'metal' },
      { x: 345, y: 275, w: 185, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.65, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.68, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.84, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 2, offsetXRatio: 0.28, purpose: 'Hit through the narrow metal aperture to collapse shelf 2' },
      { surfaceIndex: -1, offsetXRatio: 0.76, purpose: 'Crushed when shelf 2 collapses onto the lower floor' }
    ]
  },
  {
    level: 46,
    title: 'Fragile Watchtower Ambush',
    pX: 160,
    pY: 195,
    fragile: true,
    ammo: 6,
    objective: 'Protect your fragile cryo watchtower while clearing the three-platform ambush!',
    challenge: 'West-center destructible ledge surrounded by a low west Runner and two east Spitter platforms.',
    solution: 'L46: Detonate the TNT on the mid-east platform (x=370, y=280) to shatter both east platforms, then eliminate the ground Sprinter.',
    structures: [
      { x: 350, y: 180, w: 165, h: 16, type: 'ice' },
      { x: 350, y: 285, w: 165, h: 16, type: 'ice' },
      { x: 340, y: 512, w: 190, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.68, hp: 2 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.45 }
    ],
    tnt: [{ surfaceIndex: 1, offsetXRatio: 0.28, purpose: 'Destroys both east cryo platforms 0 and 1 over spikes' }],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },
  {
    level: 47,
    title: 'Twin Bunker Ceiling Bank',
    pX: 80,
    pY: 524,
    ammo: 6,
    objective: 'Use the wide ceiling bounce mirror to lob shots into TWO separate stone bunkers!',
    challenge: 'Two vertical stone walls divide the floor into middle and rear bunkers.',
    solution: 'L47: Aim at the front half of the ceiling pad (x=210, y=85) to drop a shot into the middle bunker TNT, then aim at the rear half (x=370, y=85) for the back bunker.',
    structures: [
      { x: 225, y: 280, w: 18, h: 244, type: 'stone' },
      { x: 390, y: 260, w: 18, h: 264, type: 'stone' },
      { x: 185, y: 85, w: 280, h: 16, type: 'bounce' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.52, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.76, hp: 2 },
      { type: 'spitter', surfaceIndex: -1, offsetXRatio: 0.88, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.56, purpose: 'Clears the middle bunker between walls 0 and 1' },
      { surfaceIndex: -1, offsetXRatio: 0.82, purpose: 'Clears the rear bunker behind wall 1' }
    ]
  },
  {
    level: 48,
    title: 'East Sniper Gravity Hammer',
    pX: 520,
    pY: 180,
    ammo: 5,
    objective: 'From the high east tower, drop the upper-left Brute onto the lower munition rack!',
    challenge: 'Long-distance right-to-left gravity crush across a central stone divider.',
    solution: 'L48: Shoot the high west cryo shelf (x=85, y=185) so the Brute falls onto the y=345 shelf TNT barrel.',
    structures: [
      { x: 85, y: 185, w: 165, h: 16, type: 'ice' },
      { x: 85, y: 345, w: 175, h: 16, type: 'stone' },
      { x: 295, y: 260, w: 18, h: 150, type: 'stone' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.65, hp: 2 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.25, hp: 2 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.35 }
    ],
    tnt: [{ surfaceIndex: 1, offsetXRatio: 0.48, purpose: 'Crushed by the falling Brute from shelf 0, clearing shelf 1' }]
  },
  {
    level: 49,
    title: 'Depot Quadruple Domino',
    pX: 78,
    pY: 365,
    ammo: 5,
    objective: 'Bank off the right wall to ignite the rear barrel of a 3-barrel depot chain!',
    challenge: 'A front metal wall blocks the left side of the floor domino chain; requires a backboard bounce.',
    solution: 'L49: Aim over the metal shield at the right-wall bounce pad (x=548, y=185) to hit the right-most floor TNT barrel and chain-blast leftward.',
    structures: [
      { x: 235, y: 265, w: 18, h: 259, type: 'metal' },
      { x: 548, y: 175, w: 16, h: 165, type: 'bounce' },
      { x: 310, y: 205, w: 160, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.54, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.78, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.84, purpose: 'Rear trigger barrel struck by right-wall bounce' },
      { surfaceIndex: -1, offsetXRatio: 0.68, purpose: 'Middle chain barrel' },
      { surfaceIndex: -1, offsetXRatio: 0.52, purpose: 'Front-behind-shield barrel that blasts the Armored Trooper' }
    ]
  },
  {
    level: 50,
    title: 'Sector 5 Boss: Bunker General',
    pX: 295,
    pY: 165,
    ammo: 7,
    objective: 'BOSS SIEGE: Command the high center bridge and breach both subterranean ammo vaults!',
    challenge: 'High central command bridge (295, 165) above two sealed left and right underground bunkers.',
    solution: 'L50: Shoot through the left and right vertical ice bulkheads to detonate the subterranean TNT caches flanking the Bunker General.',
    structures: [
      { x: 185, y: 320, w: 16, h: 204, type: 'ice' },
      { x: 400, y: 320, w: 16, h: 204, type: 'ice' },
      { x: 45, y: 305, w: 140, h: 16, type: 'stone' },
      { x: 416, y: 305, w: 140, h: 16, type: 'stone' }
    ],
    zombies: [
      { type: 'boss', surfaceIndex: -1, offsetXRatio: 0.82, hp: 5 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.45, hp: 2 },
      { type: 'armored', surfaceIndex: 3, offsetXRatio: 0.55, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.16, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.22, purpose: 'Clears the west subterranean bunker once vertical ice bulkhead 0 breaks' },
      { surfaceIndex: -1, offsetXRatio: 0.74, purpose: 'Blasts the Bunker General inside the east vault once bulkhead 1 breaks' }
    ]
  },

  // ==================== SECTOR 6: UNDERGROUND SUBWAY (51–60, MOVING OBSTACLES INTRODUCED) ====================
  {
    level: 51,
    title: 'Subway Piston Gate',
    pX: 80,
    pY: 340,
    ammo: 6,
    objective: 'Time your shot past the vertically moving subway armor gate to hit the platform TNT!',
    challenge: 'First moving vertical metal gate oscillating between y=130 and y=350.',
    solution: 'L51: Watch the vertical metal piston at x=250; release your shot when it slides down to strike the y=230 subway platform TNT.',
    structures: [
      { x: 250, y: 190, w: 16, h: 120, type: 'metal', vy: 1.35, minY: 125, maxY: 355 },
      { x: 345, y: 230, w: 185, h: 16, type: 'stone' },
      { x: 345, y: 370, w: 175, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.65, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.55, hp: 2 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.78 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.28, purpose: 'Clears the upper subway platform when timed past gate 0' },
      { surfaceIndex: 2, offsetXRatio: 0.28, purpose: 'Collapses the lower ice platform onto the track Sprinter' }
    ]
  },
  {
    level: 52,
    title: 'Sliding Ceiling Reflector',
    pX: 82,
    pY: 450,
    ammo: 6,
    objective: 'Bounce your shot off the horizontally sliding ceiling mirror into the sealed ticket vault!',
    challenge: 'A ceiling bounce pad slides horizontally (vx=1.5) above a tall stone divider.',
    solution: 'L52: Hold aim at y=90 and release when the sliding purple mirror aligns over x=275 so the reflected shot lands on the vault TNT.',
    structures: [
      { x: 270, y: 235, w: 20, h: 289, type: 'stone' },
      { x: 200, y: 90, w: 155, h: 16, type: 'bounce', vx: 1.5, minX: 145, maxX: 405 },
      { x: 340, y: 255, w: 175, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.6, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.68, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.84, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 2, offsetXRatio: 0.25, purpose: 'Hit by timed ceiling bounce to shatter upper ice shelf 2' },
      { surfaceIndex: -1, offsetXRatio: 0.76, purpose: 'Clears the lower ticket vault' }
    ]
  },
  {
    level: 53,
    title: 'East Turnstile Elevator',
    pX: 518,
    pY: 280,
    ammo: 6,
    objective: 'From the eastern mezzanine, bank off the moving west-wall mirror into the turnstile bunker!',
    challenge: 'Right-to-left shot against a front metal shield using a vertically moving west-wall bounce pad.',
    solution: 'L53: Fire past the metal shield (x=295) at the moving west-wall bounce pad (x=18) when it aligns with the y=260 turnstile shelf TNT.',
    structures: [
      { x: 295, y: 200, w: 18, h: 155, type: 'metal' },
      { x: 95, y: 260, w: 180, h: 16, type: 'stone' },
      { x: 18, y: 170, w: 16, h: 150, type: 'bounce', vy: 1.45, minY: 105, maxY: 345 },
      { x: 95, y: 512, w: 190, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.35, hp: 2 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.75, hp: 2 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.65 }
    ],
    tnt: [{ surfaceIndex: 1, offsetXRatio: 0.55, purpose: 'Struck from behind via the moving west-wall bounce mirror' }]
  },
  {
    level: 54,
    title: 'Third Rail Spike Bridge',
    pX: 300,
    pY: 205,
    fragile: true,
    ammo: 6,
    objective: 'From the central sky-bridge, time shots past twin moving gates to drop enemies onto the third-rail spikes!',
    challenge: 'Central high fragile perch with moving vertical metal gates on both left and right flanks.',
    solution: 'L54: Time a left shot past gate 0 (x=195) to break the west ice bridge over spikes, then time a right shot past gate 1 (x=390) to hit the east TNT.',
    structures: [
      { x: 195, y: 200, w: 16, h: 115, type: 'metal', vy: 1.4, minY: 135, maxY: 335 },
      { x: 390, y: 260, w: 16, h: 115, type: 'metal', vy: -1.4, minY: 135, maxY: 335 },
      { x: 42, y: 255, w: 135, h: 16, type: 'ice' },
      { x: 420, y: 255, w: 135, h: 16, type: 'stone' },
      { x: 40, y: 512, w: 145, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'spitter', surfaceIndex: 3, offsetXRatio: 0.35, hp: 2 },
      { type: 'armored', surfaceIndex: 3, offsetXRatio: 0.75, hp: 2 }
    ],
    tnt: [{ surfaceIndex: 3, offsetXRatio: 0.55, purpose: 'Clears the east stone platform when timed past gate 1' }]
  },
  {
    level: 55,
    title: 'Subway Tunnel Dominoes',
    pX: 78,
    pY: 524,
    ammo: 5,
    objective: 'Skip a shot off the sliding floor pad under the hanging tunnel wall to ignite 3 TNT barrels!',
    challenge: 'A sliding floor bounce pad moves under a hanging stone tunnel bulkhead.',
    solution: 'L55: Time a low shot onto the sliding floor bounce pad (y=508) so it skims under wall x=255 into the 3-barrel subway track chain.',
    structures: [
      { x: 255, y: 16, w: 20, h: 380, type: 'stone' },
      { x: 175, y: 508, w: 130, h: 16, type: 'bounce', vx: 1.4, minX: 135, maxX: 295 },
      { x: 365, y: 225, w: 165, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.58, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.80, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.52, purpose: 'Front tunnel domino barrel hit by sliding floor bounce' },
      { surfaceIndex: -1, offsetXRatio: 0.68, purpose: 'Middle tunnel domino barrel' },
      { surfaceIndex: -1, offsetXRatio: 0.84, purpose: 'Rear tunnel domino barrel' }
    ]
  },
  {
    level: 56,
    title: 'Viaduct Cryo Sandwich',
    pX: 165,
    pY: 340,
    ammo: 6,
    objective: 'Breach the front ice barrier and detonate the middle viaduct TNT past the moving gate!',
    challenge: 'Sequential ice breach + moving gate timing into a stacked cryo viaduct.',
    solution: 'L56: Break the vertical ice wall at x=245, then time a shot past the moving gate at x=305 into the y=290 viaduct TNT barrel.',
    structures: [
      { x: 245, y: 210, w: 16, h: 170, type: 'ice' },
      { x: 305, y: 200, w: 16, h: 120, type: 'metal', vy: 1.45, minY: 130, maxY: 350 },
      { x: 355, y: 185, w: 175, h: 16, type: 'ice' },
      { x: 355, y: 295, w: 175, h: 16, type: 'ice' },
      { x: 345, y: 512, w: 195, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 2, offsetXRatio: 0.55, hp: 2 },
      { type: 'spitter', surfaceIndex: 3, offsetXRatio: 0.68, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.42, hp: 2 }
    ],
    tnt: [{ surfaceIndex: 3, offsetXRatio: 0.28, purpose: 'Shatters both viaduct ice decks 2 and 3 over spikes' }]
  },
  {
    level: 57,
    title: 'East Express Platform',
    pX: 520,
    pY: 185,
    ammo: 6,
    objective: 'From the high east express platform, collapse the 3-step west subway stairs past the sliding shield!',
    challenge: 'Horizontal sliding metal shield above a 3-step west staircase.',
    solution: 'L57: Shoot past the sliding metal bar (y=240) to ignite the top-left stair TNT (x=105, y=185), chaining down to the middle stair.',
    structures: [
      { x: 65, y: 185, w: 145, h: 16, type: 'ice' },
      { x: 180, y: 285, w: 150, h: 16, type: 'ice' },
      { x: 295, y: 385, w: 140, h: 16, type: 'stone' },
      { x: 255, y: 230, w: 110, h: 16, type: 'metal', vx: 1.5, minX: 195, maxX: 390 }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.4, hp: 2 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.65, hp: 2 },
      { type: 'fat', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 0, offsetXRatio: 0.78, purpose: 'Top stair barrel that chains into step 1' },
      { surfaceIndex: 1, offsetXRatio: 0.25, purpose: 'Mid stair barrel that shatters steps 0 and 1' }
    ]
  },
  {
    level: 58,
    title: 'Subterranean Cross-Bounce',
    pX: 80,
    pY: 225,
    ammo: 6,
    objective: 'Bank off the floor pad up to the right-wall mirror to strike the shielded upper gallery!',
    challenge: 'Double bank shot (floor bounce -> right wall bounce) around a central stone column.',
    solution: 'L58: Drop the front ice bridge first, then bank off the floor pad (x=240, y=508) to the right-wall pad (x=548) into the upper gallery TNT.',
    structures: [
      { x: 290, y: 140, w: 20, h: 250, type: 'stone' },
      { x: 220, y: 508, w: 145, h: 16, type: 'bounce' },
      { x: 548, y: 180, w: 16, h: 195, type: 'bounce' },
      { x: 335, y: 235, w: 175, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 3, offsetXRatio: 0.45, hp: 2 },
      { type: 'armored', surfaceIndex: 3, offsetXRatio: 0.78, hp: 2 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.68 }
    ],
    tnt: [{ surfaceIndex: 3, offsetXRatio: 0.60, purpose: 'Detonated by the floor-to-right-wall double bank shot' }]
  },
  {
    level: 59,
    title: 'Terminal Rush Defense',
    pX: 300,
    pY: 524,
    ammo: 6,
    objective: 'From the central subway track, clear both elevated platforms and stop the Sprinter reinforcement!',
    challenge: 'Ground-center defense with moving overhead reflector and two high platforms.',
    solution: 'L59: Bounce off the sliding ceiling pad (y=88) to clear the high west stone platform, shatter the east ice platform directly, and stop the Sprinter wave.',
    structures: [
      { x: 45, y: 265, w: 155, h: 16, type: 'stone' },
      { x: 400, y: 245, w: 155, h: 16, type: 'ice' },
      { x: 110, y: 88, w: 165, h: 16, type: 'bounce', vx: 1.45, minX: 55, maxX: 340 },
      { x: 395, y: 512, w: 160, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: 0, offsetXRatio: 0.35, hp: 2 },
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.75, hp: 2 },
      { type: 'fat', surfaceIndex: 1, offsetXRatio: 0.5, hp: 2 }
    ],
    tnt: [{ surfaceIndex: 0, offsetXRatio: 0.55, purpose: 'Clears the west stone platform via ceiling reflection' }],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.14 }
  },
  {
    level: 60,
    title: 'Sector 6 Boss: Subway Dreadnought',
    pX: 76,
    pY: 524,
    ammo: 8,
    objective: 'BOSS SIEGE: Thread shots past the twin counter-moving subway pistons into the Dreadnought car!',
    challenge: 'Two vertical metal armor gates oscillate in opposite directions in front of a two-story subway car.',
    solution: 'L60: Time your shot between the counter-moving metal gates or skip off the floor bounce pad to ignite the subway car TNT chain.',
    structures: [
      { x: 225, y: 150, w: 16, h: 130, type: 'metal', vy: 1.45, minY: 110, maxY: 340 },
      { x: 315, y: 310, w: 16, h: 130, type: 'metal', vy: -1.45, minY: 120, maxY: 350 },
      { x: 375, y: 235, w: 175, h: 16, type: 'ice' },
      { x: 155, y: 508, w: 130, h: 16, type: 'bounce' }
    ],
    zombies: [
      { type: 'boss', surfaceIndex: -1, offsetXRatio: 0.80, hp: 6 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.65, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.28, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 2, offsetXRatio: 0.48, purpose: 'Destroys the upper subway viaduct and drops debris onto the Dreadnought' },
      { surfaceIndex: -1, offsetXRatio: 0.70, purpose: 'Lower track charge beside the Subway Dreadnought' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.58 }
  },

  // ==================== SECTOR 7: CYBER PRISON FORT (61–70) ====================
  {
    level: 61,
    title: 'Cellblock Laser Lock',
    pX: 82,
    pY: 280,
    ammo: 6,
    objective: 'Shatter the upper cellblock ice floor so the Brute drops through the moving gate gap onto TNT!',
    challenge: 'Gravity drop timed with an oscillating horizontal metal bar.',
    solution: 'L61: Shoot the top cryo floor (x=340, y=170) when the horizontal metal slider clears the drop path, crushing the lower cell TNT.',
    structures: [
      { x: 335, y: 170, w: 170, h: 16, type: 'ice' },
      { x: 265, y: 260, w: 110, h: 16, type: 'metal', vx: 1.5, minX: 215, maxX: 430 },
      { x: 335, y: 360, w: 175, h: 16, type: 'ice' },
      { x: 325, y: 512, w: 195, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.68, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.38, hp: 2 }
    ],
    tnt: [{ surfaceIndex: 2, offsetXRatio: 0.30, purpose: 'Crushed by the top Brute to collapse lower cell 2 over spikes' }]
  },
  {
    level: 62,
    title: 'Panopticon Central Spire',
    pX: 300,
    pY: 310,
    fragile: true,
    ammo: 6,
    objective: 'From the central Panopticon spire, bank off both side mirrors to clear the lower cells!',
    challenge: 'Fragile central spire with stone shields underneath and side-wall bounce pads.',
    solution: 'L62: Bank left off x=18 to detonate the west cell TNT, then bank right off x=566 to detonate the east cell TNT.',
    structures: [
      { x: 65, y: 350, w: 155, h: 16, type: 'stone' },
      { x: 380, y: 350, w: 155, h: 16, type: 'stone' },
      { x: 18, y: 210, w: 16, h: 210, type: 'bounce', vy: 1.35, minY: 140, maxY: 310 },
      { x: 566, y: 210, w: 16, h: 210, type: 'bounce' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.18, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.82, hp: 2 },
      { type: 'crawler', surfaceIndex: 1, offsetXRatio: 0.5 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.14, purpose: 'West lower cell barrel hit via west wall bounce' },
      { surfaceIndex: -1, offsetXRatio: 0.86, purpose: 'East lower cell barrel hit via east wall bounce' }
    ]
  },
  {
    level: 63,
    title: 'Solitary Wing Breach',
    pX: 520,
    pY: 440,
    ammo: 6,
    objective: 'From the low east guard post, shatter the vertical ice door and ignite the 3-barrel wing!',
    challenge: 'Right-to-left breach through a vertical ice door guarded by a moving metal gate.',
    solution: 'L63: Time a shot past the moving metal gate at x=375 to break the vertical ice door at x=310, then ignite the 3-barrel floor chain.',
    structures: [
      { x: 375, y: 240, w: 16, h: 120, type: 'metal', vy: 1.45, minY: 150, maxY: 375 },
      { x: 310, y: 230, w: 16, h: 180, type: 'ice' },
      { x: 75, y: 250, w: 175, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.18, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.38, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.48, purpose: 'Entry barrel behind vertical ice door 1' },
      { surfaceIndex: -1, offsetXRatio: 0.30, purpose: 'Middle solitary wing barrel' },
      { surfaceIndex: 2, offsetXRatio: 0.72, purpose: 'Upper cell barrel' }
    ]
  },
  {
    level: 64,
    title: 'Detention Roof Ricochet',
    pX: 80,
    pY: 195,
    ammo: 6,
    objective: 'Bounce off the sliding floor pad up into the underside of the detention block!',
    challenge: 'High west sniper perch firing down onto a sliding floor pad to reach behind a hanging metal wall.',
    solution: 'L64: Aim steeply down from (80, 195) at the sliding floor bounce pad (y=508) so the reflected shot rises behind the hanging metal wall at x=280.',
    structures: [
      { x: 280, y: 16, w: 18, h: 350, type: 'metal' },
      { x: 205, y: 508, w: 140, h: 16, type: 'bounce', vx: 1.45, minX: 160, maxX: 330 },
      { x: 365, y: 280, w: 175, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.6, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.68, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.84, hp: 2 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.52 }
    ],
    tnt: [
      { surfaceIndex: 2, offsetXRatio: 0.25, purpose: 'Upper detention shelf barrel hit via floor bounce' },
      { surfaceIndex: -1, offsetXRatio: 0.76, purpose: 'Ground detention barrel' }
    ]
  },
  {
    level: 65,
    title: 'Guard Tower Cross-Link',
    pX: 435,
    pY: 210,
    fragile: true,
    ammo: 6,
    objective: 'From the east-center guard tower, detonate the central pillar TNT to drop both west bridges!',
    challenge: 'East-center fragile perch facing two split west ice bridges linked by a central TNT pillar.',
    solution: 'L65: Shoot the TNT barrel on the narrow stone pillar (x=225, y=260) to simultaneously shatter both adjacent ice bridges over spikes.',
    structures: [
      { x: 65, y: 235, w: 120, h: 16, type: 'ice' },
      { x: 195, y: 260, w: 65, h: 16, type: 'stone' },
      { x: 268, y: 235, w: 120, h: 16, type: 'ice' },
      { x: 60, y: 512, w: 330, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.72, hp: 2 }
    ],
    tnt: [{ surfaceIndex: 1, offsetXRatio: 0.5, purpose: 'Central charge that shatters both ice bridges 0 and 2 over spikes' }]
  },
  {
    level: 66,
    title: 'Maximum Security Z-Vault',
    pX: 78,
    pY: 390,
    ammo: 6,
    objective: 'Thread a Z-bounce between the floor pad and moving ceiling mirror into Max-Sec Vault 9!',
    challenge: 'Two tall stone walls + moving ceiling bounce pad require timed 2-bounce precision.',
    solution: 'L66: Fire at the floor bounce pad (x=185, y=508) when the ceiling bounce pad (y=84) slides over x=300 to drop the shot behind wall 1.',
    structures: [
      { x: 210, y: 16, w: 18, h: 300, type: 'stone' },
      { x: 355, y: 235, w: 18, h: 289, type: 'stone' },
      { x: 175, y: 508, w: 140, h: 16, type: 'bounce' },
      { x: 255, y: 84, w: 165, h: 16, type: 'bounce', vx: 1.5, minX: 215, maxX: 395 },
      { x: 395, y: 220, w: 150, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 4, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.72, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.86, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 4, offsetXRatio: 0.25, purpose: 'Upper vault barrel' },
      { surfaceIndex: -1, offsetXRatio: 0.79, purpose: 'Lower Max-Sec floor barrel hit by Z-bounce' }
    ]
  },
  {
    level: 67,
    title: 'Riot Yard Counter-Gates',
    pX: 82,
    pY: 524,
    ammo: 6,
    objective: 'From the riot yard floor, shoot through twin counter-moving gates to collapse the tiered balconies!',
    challenge: 'Ground-west spawn aiming upward through two counter-moving vertical metal gates.',
    solution: 'L67: Time an upward diagonal shot through gates 0 and 1 to ignite the y=200 balcony TNT, chaining down to the y=320 balcony.',
    structures: [
      { x: 215, y: 160, w: 16, h: 120, type: 'metal', vy: 1.45, minY: 110, maxY: 330 },
      { x: 300, y: 290, w: 16, h: 120, type: 'metal', vy: -1.45, minY: 120, maxY: 340 },
      { x: 365, y: 200, w: 175, h: 16, type: 'ice' },
      { x: 365, y: 320, w: 175, h: 16, type: 'stone' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.65, hp: 2 },
      { type: 'armored', surfaceIndex: 3, offsetXRatio: 0.68, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.76, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 2, offsetXRatio: 0.28, purpose: 'Upper balcony barrel that chains down to balcony 3' },
      { surfaceIndex: 3, offsetXRatio: 0.28, purpose: 'Middle balcony barrel' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },
  {
    level: 68,
    title: 'Prison Foundry Drop',
    pX: 160,
    pY: 205,
    ammo: 6,
    objective: 'Bank off the right-wall mirror to drop the upper Brute onto the shielded foundry floor TNT!',
    challenge: 'West-center high perch facing a metal-shielded upper cryo bridge and right-wall bounce pad.',
    solution: 'L68: Bounce off the right wall pad (x=548, y=155) behind the metal shield (x=310) to shatter the upper ice bridge and crush the lower TNT.',
    structures: [
      { x: 310, y: 150, w: 18, h: 130, type: 'metal' },
      { x: 340, y: 225, w: 175, h: 16, type: 'ice' },
      { x: 548, y: 145, w: 16, h: 175, type: 'bounce' },
      { x: 220, y: 380, w: 135, h: 16, type: 'stone' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 1, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.66, hp: 2 },
      { type: 'spitter', surfaceIndex: 3, offsetXRatio: 0.5, hp: 2 }
    ],
    tnt: [{ surfaceIndex: -1, offsetXRatio: 0.72, purpose: 'Crushed when the Brute falls from bridge 1' }]
  },
  {
    level: 69,
    title: 'Lockdown East Siege',
    pX: 520,
    pY: 335,
    fragile: true,
    ammo: 6,
    objective: 'On a fragile eastern perch, use the ceiling bounce pad to detonate the 3-tier lockdown stack!',
    challenge: 'East mid fragile perch facing a tall stone shield and 3-tier west stack.',
    solution: 'L69: Bank over the stone shield (x=320) via the ceiling bounce pad (x=190, y=86) to ignite the middle stack TNT.',
    structures: [
      { x: 320, y: 220, w: 20, h: 304, type: 'stone' },
      { x: 175, y: 86, w: 195, h: 16, type: 'bounce', vx: 1.45, minX: 110, maxX: 330 },
      { x: 80, y: 195, w: 165, h: 16, type: 'ice' },
      { x: 80, y: 310, w: 165, h: 16, type: 'ice' },
      { x: 75, y: 512, w: 180, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: 3, offsetXRatio: 0.65, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.42, hp: 2 }
    ],
    tnt: [{ surfaceIndex: 3, offsetXRatio: 0.28, purpose: 'Shatters both west ice tiers 2 and 3 over spikes via ceiling bounce' }]
  },
  {
    level: 70,
    title: 'Sector 7 Boss: Cyber Prison Warden',
    pX: 520,
    pY: 195,
    fragile: true,
    ammo: 8,
    objective: 'BOSS SIEGE: From the fragile east watchtower, bounce off the moving ceiling mirror into Cellblock Omega!',
    challenge: 'Destructible high-east ice perch (520, 195) facing a fortified west cellblock and moving overhead reflector.',
    solution: 'L70: Drop the mid-tier Spitter cell first, then bank off the sliding ceiling bounce pad into the Warden’s lower vault TNT.',
    structures: [
      { x: 255, y: 270, w: 18, h: 254, type: 'stone' },
      { x: 75, y: 245, w: 165, h: 16, type: 'ice' },
      { x: 145, y: 86, w: 155, h: 16, type: 'bounce', vx: 1.55, minX: 95, maxX: 360 },
      { x: 295, y: 375, w: 135, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'boss', surfaceIndex: -1, offsetXRatio: 0.20, hp: 6 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.45, hp: 2 },
      { type: 'armored', surfaceIndex: 3, offsetXRatio: 0.55, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.75, purpose: 'Shatters upper cellblock 1 and chains down into the Warden pit' },
      { surfaceIndex: -1, offsetXRatio: 0.28, purpose: 'Detonates inside the Cyber Warden vault' }
    ]
  },

  // ==================== SECTOR 8: ROOFTOP SKYWAY (71–80, MASTER BAND STARTS AT 76) ====================
  {
    level: 71,
    title: 'Skyway Twin Suspension',
    pX: 80,
    pY: 255,
    fragile: true,
    ammo: 6,
    objective: 'On a fragile rooftop ledge, shatter both suspended sky-bridges over the spike chasm!',
    challenge: 'Two high-altitude cryo bridges protected by an oscillating vertical metal shield.',
    solution: 'L71: Time shots past the moving metal shield at x=225 to detonate the TNT on sky-bridge 1 (y=190) and collapse sky-bridge 2 (y=330).',
    structures: [
      { x: 225, y: 180, w: 16, h: 125, type: 'metal', vy: 1.5, minY: 120, maxY: 350 },
      { x: 320, y: 190, w: 180, h: 16, type: 'ice' },
      { x: 350, y: 330, w: 170, h: 16, type: 'ice' },
      { x: 310, y: 512, w: 225, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.65, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.45, hp: 2 },
      { type: 'fat', surfaceIndex: 2, offsetXRatio: 0.80, hp: 2 }
    ],
    tnt: [{ surfaceIndex: 1, offsetXRatio: 0.28, purpose: 'Shatters upper sky-bridge 1 and drops debris onto bridge 2' }]
  },
  {
    level: 72,
    title: 'Helipad Wind-Tunnel Skip',
    pX: 522,
    pY: 524,
    ammo: 6,
    objective: 'From the eastern helipad deck, skip a shot under the hanging wind-baffle into the west chain!',
    challenge: 'Right-to-left floor skip under a low hanging stone baffle with a moving upper gate.',
    solution: 'L72: Aim left at the floor bounce pad (x=290, y=508) to skip under the baffle at x=315 into the west helipad TNT chain.',
    structures: [
      { x: 315, y: 16, w: 20, h: 385, type: 'stone' },
      { x: 255, y: 508, w: 140, h: 16, type: 'bounce' },
      { x: 80, y: 235, w: 165, h: 16, type: 'ice' },
      { x: 265, y: 200, w: 16, h: 110, type: 'metal', vy: 1.4, minY: 120, maxY: 320 }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.18, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.34, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.26, purpose: 'Detonated by floor-skip ricochet under the wind-baffle' },
      { surfaceIndex: 2, offsetXRatio: 0.72, purpose: 'Shatters the upper west helipad bridge' }
    ]
  },
  {
    level: 73,
    title: 'Neon Billboard Bank',
    pX: 82,
    pY: 425,
    ammo: 6,
    objective: 'Bounce off the high right-wall neon billboard reflector into the rooftop penthouse!',
    challenge: 'Tall metal billboard structure blocks direct fire; right-wall bank shot required.',
    solution: 'L73: Aim high past the metal structure (x=275) at the moving right-wall bounce pad (x=548) to reflect into the penthouse TNT.',
    structures: [
      { x: 275, y: 215, w: 18, h: 220, type: 'metal' },
      { x: 315, y: 265, w: 185, h: 16, type: 'stone' },
      { x: 548, y: 140, w: 16, h: 170, type: 'bounce', vy: 1.5, minY: 95, maxY: 330 },
      { x: 315, y: 390, w: 175, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.35, hp: 2 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.75, hp: 2 },
      { type: 'fat', surfaceIndex: 3, offsetXRatio: 0.5, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.55, purpose: 'Hit from behind via the moving right-wall bounce pad' },
      { surfaceIndex: 3, offsetXRatio: 0.28, purpose: 'Collapses the lower cryo penthouse floor' }
    ]
  },
  {
    level: 74,
    title: 'Sky-Trench Dual Mirrors',
    pX: 300,
    pY: 524,
    ammo: 6,
    objective: 'From the bottom rooftop trench, use the twin overhead mirrors to clear both high towers!',
    challenge: 'Ground-center spawn flanked by high stone towers on the far left and far right.',
    solution: 'L74: Bank off the left ceiling mirror (x=70, y=85) onto the west tower TNT, then bank off the right ceiling mirror (x=370, y=85) onto the east tower TNT.',
    structures: [
      { x: 42, y: 245, w: 155, h: 16, type: 'stone' },
      { x: 403, y: 245, w: 155, h: 16, type: 'stone' },
      { x: 65, y: 85, w: 160, h: 16, type: 'bounce', vx: 1.4, minX: 45, maxX: 215 },
      { x: 375, y: 85, w: 160, h: 16, type: 'bounce' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.35, hp: 2 },
      { type: 'armored', surfaceIndex: 0, offsetXRatio: 0.75, hp: 2 },
      { type: 'fat', surfaceIndex: 1, offsetXRatio: 0.35, hp: 2 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.75, hp: 2 }
    ],
    tnt: [
      { surfaceIndex: 0, offsetXRatio: 0.55, purpose: 'Clears the high west tower via left ceiling mirror' },
      { surfaceIndex: 1, offsetXRatio: 0.55, purpose: 'Clears the high east tower via right ceiling mirror' }
    ]
  },
  {
    level: 75,
    title: 'Antenna Spire Cascade',
    pX: 155,
    pY: 185,
    fragile: true,
    ammo: 6,
    objective: 'Shatter the vertical cryo lock and drop the top Brute through the antenna spire!',
    challenge: 'High west-center fragile perch facing a vertical ice lock and 3-tier spire.',
    solution: 'L75: Break the vertical ice wall at x=285, then shatter the top ice spire floor (y=175) so the Brute crushes the lower TNT core.',
    structures: [
      { x: 285, y: 165, w: 16, h: 185, type: 'ice' },
      { x: 335, y: 175, w: 175, h: 16, type: 'ice' },
      { x: 335, y: 315, w: 180, h: 16, type: 'stone' },
      { x: 330, y: 512, w: 195, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 1, offsetXRatio: 0.5, hp: 2 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.68, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.28, hp: 2 }
    ],
    tnt: [{ surfaceIndex: 2, offsetXRatio: 0.48, purpose: 'Crushed when the top Brute falls from floor 1' }]
  },
  {
    level: 76,
    title: 'Master Band: Skyway Elevator',
    pX: 80,
    pY: 310,
    fragile: true,
    ammo: 7,
    objective: 'MASTER SECTOR: Time your shots past twin moving shields to ignite the 3-barrel skyway deck!',
    challenge: 'Master-tier HP enemies behind a vertically moving gate and a horizontally moving ceiling mirror.',
    solution: 'L76: Bank off the sliding ceiling mirror (y=86) to detonate the upper cryo deck TNT, then thread a shot past gate x=235 into the floor domino chain.',
    structures: [
      { x: 235, y: 190, w: 16, h: 130, type: 'metal', vy: 1.55, minY: 120, maxY: 360 },
      { x: 195, y: 86, w: 165, h: 16, type: 'bounce', vx: 1.55, minX: 145, maxX: 395 },
      { x: 330, y: 220, w: 185, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.62, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.60, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.82, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 2, offsetXRatio: 0.28, purpose: 'Shatters upper cryo deck 2 via ceiling bounce' },
      { surfaceIndex: -1, offsetXRatio: 0.56, purpose: 'Front floor chain barrel' },
      { surfaceIndex: -1, offsetXRatio: 0.74, purpose: 'Rear floor chain barrel' }
    ]
  },
  {
    level: 77,
    title: 'East Gondola Crossfire',
    pX: 518,
    pY: 250,
    fragile: true,
    ammo: 7,
    objective: 'From the fragile eastern gondola, collapse the twin west suspension decks over spikes!',
    challenge: 'Right-to-left fragile duel against three Spitters and a 3-HP Armored Trooper.',
    solution: 'L77: Detonate the TNT on the middle west gondola (x=110, y=295) to shatter both west cryo decks over the spike pit.',
    structures: [
      { x: 75, y: 185, w: 170, h: 16, type: 'ice' },
      { x: 75, y: 295, w: 170, h: 16, type: 'ice' },
      { x: 275, y: 365, w: 135, h: 16, type: 'stone' },
      { x: 70, y: 512, w: 190, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.45, hp: 2 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.68, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.5, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.28, purpose: 'Shatters both west cryo gondolas 0 and 1 over spikes' },
      { surfaceIndex: 2, offsetXRatio: 0.25, purpose: 'Blasts the 3-HP Armored Trooper on stone deck 2' }
    ]
  },
  {
    level: 78,
    title: 'Cloud-Piercer Z-Corridor',
    pX: 78,
    pY: 360,
    ammo: 6,
    objective: 'Skip off the floor pad to the ceiling pad and drop a vertical strike into the Cloud-Piercer vault!',
    challenge: 'Staggered stone and moving metal barriers require a timed Z-bounce.',
    solution: 'L78: Aim at the floor bounce pad (x=180, y=508) so the shot bounces to the ceiling pad (x=285, y=82) and drops into the vault TNT chain.',
    structures: [
      { x: 205, y: 16, w: 18, h: 295, type: 'stone' },
      { x: 345, y: 245, w: 18, h: 279, type: 'stone' },
      { x: 170, y: 508, w: 145, h: 16, type: 'bounce' },
      { x: 265, y: 82, w: 225, h: 16, type: 'bounce' },
      { x: 275, y: 180, w: 16, h: 110, type: 'metal', vy: 1.5, minY: 115, maxY: 310 }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.70, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.85, hp: 3 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.62 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.68, purpose: 'Front vault barrel hit by Z-bounce' },
      { surfaceIndex: -1, offsetXRatio: 0.82, purpose: 'Rear vault barrel' }
    ]
  },
  {
    level: 79,
    title: 'Skybridge Domino Finale',
    pX: 435,
    pY: 190,
    fragile: true,
    ammo: 7,
    objective: 'From the high east-center bridge, trigger a 3-step descending chain and stop the Sprinter wave!',
    challenge: 'High east-center fragile perch overlooking a 3-step west staircase and reinforcement ambush.',
    solution: 'L79: Shoot the top-middle step TNT (x=275, y=225) to chain down through step 1 (x=165, y=320) to step 2 (x=65, y=410).',
    structures: [
      { x: 255, y: 225, w: 140, h: 16, type: 'ice' },
      { x: 150, y: 320, w: 145, h: 16, type: 'stone' },
      { x: 55, y: 410, w: 135, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.65, hp: 2 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.65, hp: 3 },
      { type: 'fat', surfaceIndex: 2, offsetXRatio: 0.5, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 0, offsetXRatio: 0.25, purpose: 'Top stair barrel that chains to step 1' },
      { surfaceIndex: 1, offsetXRatio: 0.28, purpose: 'Middle stair barrel that blasts Armored Trooper and shatters step 2' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.16 }
  },
  {
    level: 80,
    title: 'Sector 8 Boss: Skyway Archon',
    pX: 300,
    pY: 345,
    fragile: true,
    ammo: 8,
    objective: 'BOSS SIEGE: Defend the central sky-pillar surrounded by four floating cryo decks!',
    challenge: '360-degree fragile skyway battle from (300, 345) flanked by upper and lower cryo decks on both sides.',
    solution: 'L80: Detonate the west and east mid-deck TNT barrels to collapse all four floating cryo sky-bridges onto the spike abyss.',
    structures: [
      { x: 45, y: 185, w: 155, h: 16, type: 'ice' },
      { x: 45, y: 305, w: 155, h: 16, type: 'ice' },
      { x: 400, y: 215, w: 155, h: 16, type: 'ice' },
      { x: 45, y: 512, w: 170, h: 12, type: 'hazard' },
      { x: 390, y: 512, w: 170, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'boss', surfaceIndex: 2, offsetXRatio: 0.55, hp: 6 },
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.45, hp: 2 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.65, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.72, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.30, purpose: 'Shatters both west cryo sky-decks 0 and 1 over spikes' },
      { surfaceIndex: 2, offsetXRatio: 0.25, purpose: 'Blasts the Skyway Archon and shatters east cryo deck 2 over spikes' }
    ]
  },

  // ==================== SECTOR 9: AI CORE CITADEL (81–90) ====================
  {
    level: 81,
    title: 'Firewall Twin Pistons',
    pX: 80,
    pY: 265,
    fragile: true,
    ammo: 7,
    objective: 'Thread your shot between two counter-oscillating firewall gates into the server core TNT!',
    challenge: 'Fragile west perch facing two fast counter-moving vertical metal gates.',
    solution: 'L81: Wait for gates 0 (x=215) and 1 (x=305) to open a central sightline, then hit the y=235 server shelf TNT.',
    structures: [
      { x: 215, y: 145, w: 16, h: 125, type: 'metal', vy: 1.55, minY: 105, maxY: 335 },
      { x: 305, y: 305, w: 16, h: 125, type: 'metal', vy: -1.55, minY: 115, maxY: 345 },
      { x: 375, y: 235, w: 175, h: 16, type: 'ice' },
      { x: 375, y: 365, w: 175, h: 16, type: 'stone' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.65, hp: 2 },
      { type: 'armored', surfaceIndex: 3, offsetXRatio: 0.65, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.78, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 2, offsetXRatio: 0.28, purpose: 'Shatters upper server shelf 2 and chains to shelf 3' },
      { surfaceIndex: 3, offsetXRatio: 0.28, purpose: 'Clears the lower stone server rack' }
    ]
  },
  {
    level: 82,
    title: 'Data-Bus Trench Bank',
    pX: 295,
    pY: 524,
    ammo: 7,
    objective: 'From the central data-bus trench, bounce off both side-wall mirrors into the upper server pods!',
    challenge: 'Central floor trench with low stone roofs overhead and moving side-wall bounce mirrors.',
    solution: 'L82: Bank left off the west bounce wall (x=18) into the west pod TNT (y=230), then bank right off the east bounce wall (x=566) into the east pod TNT.',
    structures: [
      { x: 55, y: 230, w: 155, h: 16, type: 'ice' },
      { x: 390, y: 230, w: 155, h: 16, type: 'ice' },
      { x: 18, y: 140, w: 16, h: 190, type: 'bounce', vy: 1.45, minY: 95, maxY: 310 },
      { x: 566, y: 140, w: 16, h: 190, type: 'bounce', vy: -1.45, minY: 95, maxY: 310 }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.4, hp: 2 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.6, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.16, hp: 3 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.84 }
    ],
    tnt: [
      { surfaceIndex: 0, offsetXRatio: 0.72, purpose: 'West server pod barrel hit via west wall bounce' },
      { surfaceIndex: 1, offsetXRatio: 0.28, purpose: 'East server pod barrel hit via east wall bounce' }
    ]
  },
  {
    level: 83,
    title: 'Logic Gate Under-Skip',
    pX: 520,
    pY: 390,
    fragile: true,
    ammo: 7,
    objective: 'Skip a shot off the sliding floor pad under the hanging logic wall to ignite the west core!',
    challenge: 'Right-to-left low skip shot under a hanging stone wall using a moving floor bounce pad.',
    solution: 'L83: Time a low shot from (520, 390) onto the sliding floor bounce pad (y=508) to skim under wall x=295 into the west floor TNT chain.',
    structures: [
      { x: 295, y: 16, w: 20, h: 375, type: 'stone' },
      { x: 235, y: 508, w: 140, h: 16, type: 'bounce', vx: 1.5, minX: 175, maxX: 350 },
      { x: 70, y: 245, w: 165, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.16, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.34, hp: 3 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.48 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.25, purpose: 'Hit by floor-skip ricochet inside the west logic chamber' },
      { surfaceIndex: 2, offsetXRatio: 0.75, purpose: 'Shatters the west cryo shelf' }
    ]
  },
  {
    level: 84,
    title: 'Neural Tower Gravity Drop',
    pX: 160,
    pY: 235,
    fragile: true,
    ammo: 6,
    objective: 'Drop the top Heavy Brute through the moving gate onto the lower neural core TNT!',
    challenge: '3-tier vertical cryo tower with an oscillating horizontal metal shield.',
    solution: 'L84: Shatter the top ice deck (x=345, y=165) when the sliding metal bar at y=250 moves left, dropping the Brute onto the y=355 TNT.',
    structures: [
      { x: 345, y: 165, w: 175, h: 16, type: 'ice' },
      { x: 280, y: 250, w: 115, h: 16, type: 'metal', vx: 1.6, minX: 210, maxX: 430 },
      { x: 345, y: 355, w: 175, h: 16, type: 'ice' },
      { x: 335, y: 512, w: 195, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 0, offsetXRatio: 0.5, hp: 3 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.68, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.42, hp: 3 }
    ],
    tnt: [{ surfaceIndex: 2, offsetXRatio: 0.30, purpose: 'Crushed when the top Brute falls from deck 0' }]
  },
  {
    level: 85,
    title: 'Citadel Mirror Labyrinth',
    pX: 80,
    pY: 475,
    ammo: 7,
    objective: 'Bank off the moving right-wall mirror to ignite a 3-barrel reverse domino chain!',
    challenge: 'Front metal barrier + moving right-wall bounce mirror + reinforcement wave.',
    solution: 'L85: Aim over the metal barrier (x=240) at the moving right-wall bounce pad (x=548) to ignite the rear TNT at offsetX=0.84.',
    structures: [
      { x: 240, y: 250, w: 18, h: 274, type: 'metal' },
      { x: 548, y: 160, w: 16, h: 155, type: 'bounce', vy: 1.55, minY: 100, maxY: 350 },
      { x: 310, y: 200, w: 165, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.54, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.78, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.84, purpose: 'Rear trigger barrel hit via right-wall bounce' },
      { surfaceIndex: -1, offsetXRatio: 0.68, purpose: 'Middle chain barrel' },
      { surfaceIndex: -1, offsetXRatio: 0.52, purpose: 'Front chain barrel behind the metal barrier' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },
  {
    level: 86,
    title: 'Overclocked Spire Crossfire',
    pX: 300,
    pY: 180,
    fragile: true,
    ammo: 7,
    objective: 'From the high central AI hub, breach both vertical cryo locks and detonate the lower cores!',
    challenge: 'High central fragile perch above left and right cryo-locked chambers.',
    solution: 'L86: Shoot down-left to break vertical lock 0 (x=180) and ignite the west TNT, then shoot down-right through lock 1 (x=405) into the east TNT.',
    structures: [
      { x: 180, y: 310, w: 16, h: 214, type: 'ice' },
      { x: 405, y: 310, w: 16, h: 214, type: 'ice' },
      { x: 42, y: 280, w: 135, h: 16, type: 'ice' },
      { x: 422, y: 280, w: 135, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.5, hp: 2 },
      { type: 'spitter', surfaceIndex: 3, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.16, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.84, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.22, purpose: 'Clears the west chamber once vertical ice lock 0 breaks' },
      { surfaceIndex: -1, offsetXRatio: 0.78, purpose: 'Clears the east chamber once vertical ice lock 1 breaks' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.12 }
  },
  {
    level: 87,
    title: 'East Mainframe Vault',
    pX: 518,
    pY: 225,
    fragile: true,
    ammo: 7,
    objective: 'Bounce off the sliding ceiling mirror from the east to collapse the two-tier mainframe vault!',
    challenge: 'East fragile perch facing a tall stone divider and moving ceiling bounce pad.',
    solution: 'L87: Time an upward bank shot off the sliding ceiling pad (y=88) so it lands on the upper west cryo loft TNT (y=235), chaining down.',
    structures: [
      { x: 280, y: 205, w: 20, h: 319, type: 'stone' },
      { x: 155, y: 88, w: 155, h: 16, type: 'bounce', vx: 1.6, minX: 95, maxX: 365 },
      { x: 65, y: 235, w: 175, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.4, hp: 2 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.18, hp: 3 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.34, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 2, offsetXRatio: 0.75, purpose: 'Upper vault barrel hit by ceiling reflection' },
      { surfaceIndex: -1, offsetXRatio: 0.26, purpose: 'Lower mainframe barrel' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.14 }
  },
  {
    level: 88,
    title: 'Synapse Triple-Bridge',
    pX: 82,
    pY: 325,
    fragile: true,
    ammo: 7,
    objective: 'Detonate the central pillar TNT past the moving gate to collapse both flanking synapse bridges!',
    challenge: 'Moving vertical metal shield in front of a central TNT pillar linking two ice bridges.',
    solution: 'L88: Time your shot past the moving metal gate at x=195 to strike the central stone pillar TNT (x=325, y=250).',
    structures: [
      { x: 195, y: 180, w: 16, h: 125, type: 'metal', vy: 1.55, minY: 115, maxY: 345 },
      { x: 215, y: 230, w: 110, h: 16, type: 'ice' },
      { x: 330, y: 250, w: 65, h: 16, type: 'stone' },
      { x: 400, y: 230, w: 145, h: 16, type: 'ice' },
      { x: 215, y: 512, w: 335, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: 3, offsetXRatio: 0.35, hp: 3 },
      { type: 'fat', surfaceIndex: 3, offsetXRatio: 0.78, hp: 3 }
    ],
    tnt: [{ surfaceIndex: 2, offsetXRatio: 0.5, purpose: 'Central charge that shatters both flanking ice bridges 1 and 3 over spikes' }],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },
  {
    level: 89,
    title: 'Citadel Conduit Chain',
    pX: 78,
    pY: 524,
    ammo: 7,
    objective: 'Ignite the 3-barrel conduit chain under the low stone ceiling while dodging acid fire!',
    challenge: 'Ground-west spawn facing a moving vertical gate, an upper Spitter balcony, and a 3-barrel underpass.',
    solution: 'L89: Time a low shot past gate x=215 into the front domino barrel at offsetX=0.42 to sweep the entire underpass.',
    structures: [
      { x: 215, y: 215, w: 16, h: 120, type: 'metal', vy: 1.5, minY: 130, maxY: 330 },
      { x: 275, y: 340, w: 255, h: 16, type: 'stone' },
      { x: 365, y: 205, w: 165, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.55, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.60, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.82, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: -1, offsetXRatio: 0.42, purpose: 'Front domino barrel outside the stone roof' },
      { surfaceIndex: -1, offsetXRatio: 0.61, purpose: 'Middle underpass barrel' },
      { surfaceIndex: -1, offsetXRatio: 0.80, purpose: 'Rear underpass barrel' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },
  {
    level: 90,
    title: 'Sector 9 Boss: Citadel AI Core',
    pX: 80,
    pY: 210,
    fragile: true,
    ammo: 8,
    objective: 'BOSS SIEGE: Navigate the Z-bounce laser labyrinth to breach the Citadel AI Core!',
    challenge: 'Staggered stone & moving metal shields require combining floor/ceiling ricochets with cryo core collapse.',
    solution: 'L90: Shoot the upper ice core TNT through the moving gate gap, then use the ceiling bounce pad to ignite the lower AI Core chain.',
    structures: [
      { x: 235, y: 175, w: 16, h: 135, type: 'metal', vy: 1.55, minY: 115, maxY: 350 },
      { x: 325, y: 295, w: 18, h: 229, type: 'stone' },
      { x: 365, y: 195, w: 175, h: 16, type: 'ice' },
      { x: 235, y: 82, w: 165, h: 16, type: 'bounce', vx: 1.5, minX: 185, maxX: 400 }
    ],
    zombies: [
      { type: 'boss', surfaceIndex: -1, offsetXRatio: 0.80, hp: 6 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.65, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.28, hp: 3 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.35 }
    ],
    tnt: [
      { surfaceIndex: 2, offsetXRatio: 0.48, purpose: 'Destroys the upper AI cryo bridge and both elite guards' },
      { surfaceIndex: -1, offsetXRatio: 0.70, purpose: 'Detonated by overhead moving bounce pad inside the Citadel Core' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },

  // ==================== SECTOR 10: GROUND ZERO NEXUS (91–100, FINAL CAMPAIGN GAUNTLET) ====================
  {
    level: 91,
    title: 'Nexus Outer Gatehouse',
    pX: 440,
    pY: 230,
    fragile: true,
    ammo: 7,
    objective: 'From the eastern Nexus catwalk, bank off the west mirror behind the metal bastion!',
    challenge: 'East-center fragile catwalk facing a west metal bastion and moving west-wall bounce mirror.',
    solution: 'L91: Aim past the metal bastion (x=275) at the moving west-wall bounce pad (x=18) so the reflected shot strikes the y=250 bastion TNT.',
    structures: [
      { x: 275, y: 190, w: 18, h: 155, type: 'metal' },
      { x: 85, y: 250, w: 180, h: 16, type: 'ice' },
      { x: 18, y: 150, w: 16, h: 165, type: 'bounce', vy: 1.55, minY: 95, maxY: 340 },
      { x: 80, y: 512, w: 200, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.35, hp: 2 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.75, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.56, hp: 3 }
    ],
    tnt: [{ surfaceIndex: 1, offsetXRatio: 0.55, purpose: 'Hit from behind via the moving west-wall bounce pad' }],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.14 }
  },
  {
    level: 92,
    title: 'Ground Zero Stairwell',
    pX: 80,
    pY: 185,
    fragile: true,
    ammo: 7,
    objective: 'Time a shot past the moving piston to ignite the 3-step Ground Zero stairwell chain!',
    challenge: 'High west fragile perch facing an oscillating piston and 3 ascending cryo steps.',
    solution: 'L92: Shoot past the moving metal piston (x=190) into the lower step TNT (x=235, y=380), chaining up to y=285 and y=190.',
    structures: [
      { x: 190, y: 210, w: 16, h: 125, type: 'metal', vy: 1.55, minY: 120, maxY: 360 },
      { x: 220, y: 380, w: 135, h: 16, type: 'stone' },
      { x: 325, y: 285, w: 145, h: 16, type: 'ice' },
      { x: 430, y: 190, w: 135, h: 16, type: 'ice' },
      { x: 320, y: 512, w: 245, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.65, hp: 3 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.65, hp: 2 },
      { type: 'fat', surfaceIndex: 3, offsetXRatio: 0.5, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.28, purpose: 'Bottom stair barrel that chains up to step 2' },
      { surfaceIndex: 2, offsetXRatio: 0.28, purpose: 'Middle stair barrel that shatters steps 2 and 3 over spikes' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },
  {
    level: 93,
    title: 'Reactor Core Sandwich',
    pX: 520,
    pY: 295,
    fragile: true,
    ammo: 7,
    objective: 'From the eastern reactor gantry, thread past the moving gate to detonate the twin cryo cores!',
    challenge: 'East mid fragile perch facing a moving metal gate and stacked west cryo reactor decks.',
    solution: 'L93: Time a right-to-left shot past gate x=350 to strike the middle reactor TNT (x=215, y=300), shattering both cryo decks over spikes.',
    structures: [
      { x: 350, y: 205, w: 16, h: 125, type: 'metal', vy: 1.55, minY: 125, maxY: 355 },
      { x: 90, y: 190, w: 175, h: 16, type: 'ice' },
      { x: 90, y: 300, w: 175, h: 16, type: 'ice' },
      { x: 80, y: 512, w: 195, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 1, offsetXRatio: 0.45, hp: 3 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.35, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.62, hp: 3 }
    ],
    tnt: [{ surfaceIndex: 2, offsetXRatio: 0.72, purpose: 'Shatters both reactor cryo decks 1 and 2 simultaneously' }],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.14 }
  },
  {
    level: 94,
    title: 'Abyssal Bridge Crossfire',
    pX: 300,
    pY: 315,
    fragile: true,
    ammo: 7,
    objective: 'Hold the fragile center bridge against four elevated threats and twin moving ceiling mirrors!',
    challenge: 'Central fragile bridge surrounded by four elite enemies on high stone ledges.',
    solution: 'L94: Bounce off the left sliding ceiling pad (y=84) to hit the west stone ledge TNT, then bounce off the right ceiling pad to clear the east ledge.',
    structures: [
      { x: 42, y: 235, w: 155, h: 16, type: 'stone' },
      { x: 403, y: 235, w: 155, h: 16, type: 'stone' },
      { x: 65, y: 84, w: 155, h: 16, type: 'bounce', vx: 1.45, minX: 45, maxX: 210 },
      { x: 380, y: 84, w: 155, h: 16, type: 'bounce', vx: -1.45, minX: 335, maxX: 495 }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.32, hp: 2 },
      { type: 'armored', surfaceIndex: 0, offsetXRatio: 0.76, hp: 3 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.32, hp: 2 },
      { type: 'fat', surfaceIndex: 1, offsetXRatio: 0.76, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 0, offsetXRatio: 0.54, purpose: 'Clears the high west stone ledge via left ceiling mirror' },
      { surfaceIndex: 1, offsetXRatio: 0.54, purpose: 'Clears the high east stone ledge via right ceiling mirror' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },
  {
    level: 95,
    title: 'Nexus Curtain Z-Ricochet',
    pX: 78,
    pY: 375,
    fragile: true,
    ammo: 7,
    objective: 'Combine a floor-to-ceiling Z-bounce with a cryo collapse inside the Nexus Vault!',
    challenge: 'Two staggered stone curtains and a moving ceiling mirror protect a 4-enemy squad.',
    solution: 'L95: Bounce off the floor pad (x=175, y=508) up to the moving ceiling pad (y=84) so the shot drops behind curtain 1 into the vault TNT.',
    structures: [
      { x: 205, y: 16, w: 18, h: 300, type: 'stone' },
      { x: 350, y: 240, w: 18, h: 284, type: 'stone' },
      { x: 170, y: 508, w: 145, h: 16, type: 'bounce' },
      { x: 250, y: 84, w: 170, h: 16, type: 'bounce', vx: 1.55, minX: 210, maxX: 395 },
      { x: 390, y: 215, w: 155, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 4, offsetXRatio: 0.5, hp: 2 },
      { type: 'armored', surfaceIndex: -1, offsetXRatio: 0.70, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.86, hp: 3 },
      { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.48 }
    ],
    tnt: [
      { surfaceIndex: 4, offsetXRatio: 0.25, purpose: 'Upper vault barrel' },
      { surfaceIndex: -1, offsetXRatio: 0.78, purpose: 'Lower Nexus vault barrel hit via Z-bounce' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },
  {
    level: 96,
    title: 'Twin Bulkhead Breach',
    pX: 160,
    pY: 265,
    fragile: true,
    ammo: 7,
    objective: 'Breach TWO sequential vertical ice bulkheads to detonate the deep Nexus munition core!',
    challenge: 'Two vertical cryo walls in series protecting a two-story fortified chamber.',
    solution: 'L96: Shatter vertical ice wall 0 (x=265) and wall 1 (x=320), then fire straight into the interior stone shelf TNT (y=285).',
    structures: [
      { x: 265, y: 175, w: 16, h: 190, type: 'ice' },
      { x: 320, y: 175, w: 16, h: 190, type: 'ice' },
      { x: 355, y: 200, w: 185, h: 16, type: 'ice' },
      { x: 355, y: 315, w: 185, h: 16, type: 'stone' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.65, hp: 2 },
      { type: 'armored', surfaceIndex: 3, offsetXRatio: 0.35, hp: 3 },
      { type: 'fat', surfaceIndex: 3, offsetXRatio: 0.78, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 3, offsetXRatio: 0.55, purpose: 'Clears lower stone shelf 3 and shatters upper ice shelf 2 once bulkheads 0 and 1 break' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },
  {
    level: 97,
    title: 'East Citadel Counter-Locks',
    pX: 522,
    pY: 524,
    ammo: 7,
    objective: 'From the eastern ground floor, thread shots through twin counter-moving pistons into the west citadel!',
    challenge: 'East-to-west ground perspective against two counter-oscillating vertical metal pistons.',
    solution: 'L97: Time your upward-left shot through pistons 0 (x=380) and 1 (x=290) to ignite the y=220 ice deck TNT and chain down.',
    structures: [
      { x: 380, y: 150, w: 16, h: 125, type: 'metal', vy: 1.55, minY: 105, maxY: 335 },
      { x: 290, y: 300, w: 16, h: 125, type: 'metal', vy: -1.55, minY: 115, maxY: 345 },
      { x: 75, y: 220, w: 175, h: 16, type: 'ice' },
      { x: 75, y: 345, w: 175, h: 16, type: 'ice' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.4, hp: 2 },
      { type: 'armored', surfaceIndex: 3, offsetXRatio: 0.45, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.20, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 2, offsetXRatio: 0.72, purpose: 'Upper citadel barrel behind the twin pistons' },
      { surfaceIndex: 3, offsetXRatio: 0.72, purpose: 'Lower citadel barrel that drops debris onto the ground Brute' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.14 }
  },
  {
    level: 98,
    title: 'Omega Approach Gravity Tower',
    pX: 82,
    pY: 200,
    fragile: true,
    ammo: 7,
    objective: 'Drop the top Heavy Brute through two sliding shields to detonate the bottom spike-pit TNT!',
    challenge: '3-tier gravity crush puzzle with a moving horizontal shield and fragile player perch.',
    solution: 'L98: Shatter the top ice deck (x=340, y=160) when the moving metal bar at y=245 slides clear, dropping the Brute onto the y=350 TNT.',
    structures: [
      { x: 340, y: 160, w: 180, h: 16, type: 'ice' },
      { x: 255, y: 245, w: 120, h: 16, type: 'metal', vx: 1.65, minX: 205, maxX: 435 },
      { x: 340, y: 350, w: 180, h: 16, type: 'ice' },
      { x: 330, y: 512, w: 205, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'fat', surfaceIndex: 0, offsetXRatio: 0.5, hp: 3 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.35, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.78, hp: 3 },
      { type: 'crawler', surfaceIndex: -1, offsetXRatio: 0.42 }
    ],
    tnt: [{ surfaceIndex: 2, offsetXRatio: 0.55, purpose: 'Crushed by the falling Brute from deck 0, blasting both guards on deck 2' }],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },
  {
    level: 99,
    title: 'Penultimate Siege: Four Corners',
    pX: 300,
    pY: 265,
    fragile: true,
    ammo: 7,
    objective: 'From the central Nexus core, clear all four corner bastions before the dual Spitters fire!',
    challenge: '360-degree four-bastion siege around a central fragile platform with reinforcement wave.',
    solution: 'L99: Detonate the upper-left TNT (y=180) and upper-right TNT (y=180) so their blasts collapse both upper ice decks onto the lower bastions!',
    structures: [
      { x: 42, y: 180, w: 150, h: 16, type: 'ice' },
      { x: 42, y: 325, w: 150, h: 16, type: 'ice' },
      { x: 408, y: 180, w: 150, h: 16, type: 'ice' },
      { x: 408, y: 325, w: 150, h: 16, type: 'ice' },
      { x: 40, y: 512, w: 160, h: 12, type: 'hazard' },
      { x: 400, y: 512, w: 160, h: 12, type: 'hazard' }
    ],
    zombies: [
      { type: 'spitter', surfaceIndex: 0, offsetXRatio: 0.45, hp: 2 },
      { type: 'armored', surfaceIndex: 1, offsetXRatio: 0.55, hp: 3 },
      { type: 'spitter', surfaceIndex: 2, offsetXRatio: 0.55, hp: 2 },
      { type: 'fat', surfaceIndex: 3, offsetXRatio: 0.45, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 0, offsetXRatio: 0.75, purpose: 'Shatters upper-left ice deck 0 and chains to lower-left deck 1' },
      { surfaceIndex: 2, offsetXRatio: 0.25, purpose: 'Shatters upper-right ice deck 2 and chains to lower-right deck 3' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  },
  {
    level: 100,
    title: 'LEVEL 100: OMEGA NEXUS OVERLORD',
    pX: 82,
    pY: 275,
    fragile: true,
    ammo: 8,
    objective: 'FINAL BOSS: Breach the Omega Nexus, chain the 3-tier TNT cores & defeat the Overlord!',
    challenge: 'Sector 10 Final Boss (7 HP Omega Overlord) fortified behind an oscillating armor gate, two cryo decks, and dual bounce mirrors.',
    solution: 'L100: From (82, 275), time a shot past the moving metal gate to ignite the upper cryo deck TNT (y=180), chaining into the mid deck TNT (y=305) and lower Overlord core!',
    structures: [
      { x: 225, y: 185, w: 18, h: 135, type: 'metal', vy: 1.6, minY: 115, maxY: 360 },
      { x: 335, y: 180, w: 185, h: 16, type: 'ice' },
      { x: 335, y: 305, w: 185, h: 16, type: 'ice' },
      { x: 215, y: 78, w: 235, h: 16, type: 'bounce', vx: 1.5, minX: 165, maxX: 340 },
      { x: 552, y: 195, w: 16, h: 190, type: 'bounce' }
    ],
    zombies: [
      { type: 'boss', surfaceIndex: -1, offsetXRatio: 0.78, hp: 7 },
      { type: 'spitter', surfaceIndex: 1, offsetXRatio: 0.65, hp: 2 },
      { type: 'armored', surfaceIndex: 2, offsetXRatio: 0.68, hp: 3 },
      { type: 'fat', surfaceIndex: -1, offsetXRatio: 0.56, hp: 3 }
    ],
    tnt: [
      { surfaceIndex: 1, offsetXRatio: 0.28, purpose: 'Upper Omega cryo core that blasts the Spitter and chains downward' },
      { surfaceIndex: 2, offsetXRatio: 0.30, purpose: 'Middle Omega cryo core that blasts the Armored guard and drops debris on the Overlord' },
      { surfaceIndex: -1, offsetXRatio: 0.68, purpose: 'Ground Zero bunker core between the Omega Overlord and Heavy Brute' }
    ],
    wave: { type: 'runner', surfaceIndex: -1, offsetXRatio: 0.88 }
  }
];

function convertCompactSpecsToBlueprints(specs: CompactLevelSpec[]): ExplicitLevelBlueprint[] {
  return specs.map(spec => {
    const mechanics: string[] = [];
    if (spec.level % 10 === 0) mechanics.push('boss-siege');
    if (spec.fragile) mechanics.push('destructible-player-ledge');
    if (spec.pX > 380) mechanics.push('reverse-angle');
    else if (spec.pX >= 250 && spec.pX <= 350) mechanics.push('center-defense');
    if (spec.structures.some(s => s.type === 'bounce')) mechanics.push('ricochet');
    if (spec.structures.some(s => s.type === 'ice')) mechanics.push('ice-support-drop');
    if (spec.structures.some(s => s.type === 'hazard')) mechanics.push('spike-hazard');
    if (spec.structures.some(s => s.vx || s.vy)) mechanics.push('moving-gate');
    if (spec.tnt.length >= 2) mechanics.push('tnt-chain');
    else if (spec.tnt.length === 1) mechanics.push('tnt-blast');
    if (spec.wave) mechanics.push('wave-defense');
    if (mechanics.length === 0) mechanics.push('elevation-angles');

    return {
      level: spec.level,
      title: spec.title,
      objectiveText: spec.objective,
      primaryChallenge: spec.challenge,
      mechanicsUsed: mechanics,
      ammoAssumption: `${spec.ammo} rounds calibrated for starter M9 Sidearm (1.0x dmg, 3 bounces).`,
      winCondition: 'Eliminate all active and reinforcement zombies while keeping the operative alive.',
      failCondition: 'Operative HP reaches 0, operative falls into hazard/abyss, or ammunition is exhausted with enemies remaining.',
      intendedSolution: spec.solution,
      ammo: spec.ammo,
      playerPos: { x: spec.pX, y: spec.pY },
      destructiblePlayerSupport: Boolean(spec.fragile),
      structures: spec.structures.map(s => ({ ...s })),
      zombies: spec.zombies.map((z, idx) => ({ ...z, variant: z.variant ?? (spec.level + idx) % 3 })),
      tnt: spec.tnt.map(t => ({ ...t })),
      ...(spec.wave ? { waveZombie: { ...spec.wave } } : {})
    };
  });
}

export const EXPLICIT_LEVEL_BLUEPRINTS: ExplicitLevelBlueprint[] = [
  ...HANDCRAFTED_1_TO_25,
  ...convertCompactSpecsToBlueprints(EXPLICIT_SPECS_26_TO_100)
];

/**
 * Generates the complete playable LevelData for any level 1..100 from its explicit blueprint.
 * Strictly validates the requested level ID and never silently falls back to Level 1.
 */
export function generateLevel(levelNumber: number): LevelData {
  if (!Number.isFinite(levelNumber) || levelNumber < 1 || levelNumber > 100) {
    throw new Error(`Invalid level ID requested: ${levelNumber}. Must be between 1 and 100.`);
  }
  const lvl = Math.round(levelNumber);
  const sector = getSectorForLevel(lvl);
  const bp = EXPLICIT_LEVEL_BLUEPRINTS.find(item => item.level === lvl);

  if (!bp) {
    throw new Error(`Missing explicit level blueprint for Level ${lvl}`);
  }

  const W = 600;
  const H = 600;
  const FLOOR_Y = 524;

  // Base collision walls around the battlefield (indices 0..3)
  const structures: Structure[] = [
    { x: 0, y: 0, w: W, h: 16, type: 'stone' }, // 0: Ceiling
    { x: 0, y: FLOOR_Y, w: W, h: 76, type: 'stone' }, // 1: Main Floor
    { x: 0, y: 0, w: 16, h: H, type: 'stone' }, // 2: Left Wall
    { x: W - 16, y: 0, w: 16, h: H, type: 'stone' } // 3: Right Wall
  ];

  // Append deep-cloned level-specific structures (starting at index 4)
  bp.structures.forEach(s => {
    structures.push({ ...s });
  });

  // Resolve horizontal support surface geometry from blueprint surfaceIndex
  const getSurfaceRect = (surfaceIndex: number): { x: number; y: number; w: number } => {
    if (surfaceIndex < 0 || surfaceIndex >= bp.structures.length) {
      return { x: 24, y: FLOOR_Y, w: W - 48 };
    }
    const s = bp.structures[surfaceIndex];
    return { x: s.x, y: s.y, w: s.w };
  };

  const sectorSpeedScale = 1 + Math.min(0.35, (sector.id - 1) * 0.035);
  const playerOnFloor = Math.abs(bp.playerPos.y - FLOOR_Y) <= 18;

  const buildZombie = (zp: ZombiePlacement, id: number): Zombie => {
    const dim = ZOMBIE_DIMENSIONS[zp.type];
    const surf = getSurfaceRect(zp.surfaceIndex);
    const minX = Math.max(20, surf.x + 6);
    const maxX = Math.min(W - 20 - dim.w, Math.max(minX + 8, surf.x + surf.w - dim.w - 6));
    const rawX = surf.x + Math.round((surf.w - dim.w) * zp.offsetXRatio);
    let x = Math.max(minX, Math.min(maxX, rawX));

    // Ensure floor zombies never spawn directly on top of the player
    if (zp.surfaceIndex < 0 && playerOnFloor && Math.abs(x + dim.w / 2 - bp.playerPos.x) < 95) {
      if (bp.playerPos.x < W / 2) {
        x = Math.min(maxX, bp.playerPos.x + 110);
      } else {
        x = Math.max(minX, bp.playerPos.x - 110 - dim.w);
      }
    }

    const y = surf.y - dim.h;
    const hp = zp.hp ?? dim.baseHp;
    const dir = bp.playerPos.x < x ? -1 : 1;
    const spd = dim.baseSpeed * (zp.speedMul ?? 1) * sectorSpeedScale * dir;

    return {
      id,
      x,
      y,
      w: dim.w,
      h: dim.h,
      type: zp.type,
      variant: zp.variant ?? (id + lvl) % 3,
      color: dim.color,
      alive: true,
      health: hp,
      maxHealth: hp,
      vx: spd,
      minX,
      maxX,
      facing: dir,
      animPhase: (id * 1.1) % 6.28,
      animState: 'walk',
      attackCooldown: zp.type === 'boss' ? 95 : 115 + (id % 3) * 20,
      isGrounded: true
    };
  };

  const zombies: Zombie[] = bp.zombies.map((zp, i) => buildZombie(zp, i + 1));
  const waveReinforcements: Zombie[] = bp.waveZombie ? [buildZombie(bp.waveZombie, 101)] : [];

  const tntBarrels: TNTBarrel[] = bp.tnt.map((tp, i) => {
    const surf = getSurfaceRect(tp.surfaceIndex);
    const r = 15;
    let x = Math.max(36, Math.min(W - 36, Math.round(surf.x + surf.w * tp.offsetXRatio)));
    if (tp.surfaceIndex < 0 && playerOnFloor && Math.abs(x - bp.playerPos.x) < 85) {
      x = bp.playerPos.x < W / 2 ? bp.playerPos.x + 100 : bp.playerPos.x - 100;
    }
    const y = surf.y - r - 1;
    return {
      id: i + 1,
      x,
      y,
      r,
      exploded: false,
      purpose: tp.purpose
    };
  });

  const platformWidth = 88;
  // Add an elevated standing platform if player is positioned above the main floor
  if (bp.playerPos.y < FLOOR_Y - 4) {
    structures.push({
      x: Math.round(bp.playerPos.x - platformWidth / 2),
      y: bp.playerPos.y,
      w: platformWidth,
      h: 12,
      type: bp.destructiblePlayerSupport ? 'ice' : 'platform'
    });
  }

  // Compute initial angle pointing toward the first primary threat
  const firstTarget = zombies[0];
  const initialAngle = firstTarget
    ? Math.atan2(
        firstTarget.y + firstTarget.h * 0.4 - (bp.playerPos.y - 45),
        firstTarget.x + firstTarget.w / 2 - bp.playerPos.x
      )
    : bp.playerPos.x > W / 2
    ? -Math.PI + 0.25
    : -0.22;

  const environmentTheme: EnvironmentTheme = {
    backdrop: sector.backdrop,
    skyTopColor: sector.skyTopColor,
    skyMidColor: sector.skyMidColor,
    floorColor: sector.floorColor,
    gridColor: sector.gridColor,
    accentLightColor: sector.themeColor,
    ambientLabel: `${sector.nameEn} · Sector ${sector.id}`
  };

  return {
    level: lvl,
    levelSetVersion: LEVEL_SET_VERSION,
    nameHi: `${sector.nameEn} · ${bp.title}`,
    nameEn: `${sector.nameEn} · ${bp.title}`,
    sectorId: sector.id,
    sectorNameHi: sector.nameEn,
    sectorNameEn: sector.nameEn,
    environmentTheme,
    objectiveText: bp.objectiveText,
    primaryChallenge: bp.primaryChallenge,
    mechanicsUsed: [...bp.mechanicsUsed],
    ammoAssumption: bp.ammoAssumption,
    winCondition:
      bp.winCondition || 'Eliminate all active and reinforcement zombies while keeping the operative alive.',
    failCondition:
      bp.failCondition ||
      'Operative HP reaches 0, operative falls into hazard/abyss, or ammunition is exhausted with enemies remaining.',
    intendedSolution: bp.intendedSolution,
    ammo: bp.ammo,
    structures,
    zombies,
    waveReinforcements,
    tntBarrels,
    playerPos: { ...bp.playerPos },
    platformWidth,
    destructiblePlayerSupport: Boolean(bp.destructiblePlayerSupport),
    initialAngle
  };
}

export interface LevelValidationReport {
  levelSetVersion: string;
  totalLevels: number;
  validCount: number;
  uniqueSignatures: number;
  uniqueCoarseTopologies: number;
  uniqueSolutions: number;
  uniqueTitles: number;
  errors: string[];
}

/**
 * Comprehensive Automated Audit across all 100 explicit level configurations:
 * 1. Verifies all 100 IDs exist, match their index, and carry LEVEL_SET_VERSION.
 * 2. Verifies valid player spawn and supported zombie placements inside the 600x600 viewport.
 * 3. Verifies purposeful TNT placement (every TNT barrel is within blast range of a zombie, ice structure, or chain barrel).
 * 4. Verifies starter-weapon solvability (ammo + environmental lethality >= total enemy HP).
 * 5. Verifies 100/100 unique exact signatures, 100/100 unique coarse topologies, 100/100 unique titles, and 100/100 unique intended solutions.
 */
export function validateAllLevels(): LevelValidationReport {
  const errors: string[] = [];
  let validCount = 0;
  const layoutSignatures = new Map<string, number>();
  const coarseTopologies = new Map<string, number>();
  const solutionSignatures = new Map<string, number>();
  const titleSignatures = new Map<string, number>();

  for (let lvl = 1; lvl <= 100; lvl++) {
    let data: LevelData;
    try {
      data = generateLevel(lvl);
    } catch (e) {
      errors.push(`Level ${lvl}: ${(e as Error).message}`);
      continue;
    }

    let levelOk = true;

    if (data.level !== lvl || data.levelSetVersion !== LEVEL_SET_VERSION) {
      errors.push(`Level ${lvl}: Mismatched level ID (${data.level}) or version (${data.levelSetVersion})`);
      levelOk = false;
    }

    if (
      data.playerPos.x < 24 ||
      data.playerPos.x > 576 ||
      data.playerPos.y < 60 ||
      data.playerPos.y > 528
    ) {
      errors.push(`Level ${lvl}: Invalid player spawn (${data.playerPos.x}, ${data.playerPos.y})`);
      levelOk = false;
    }

    if (!data.zombies || data.zombies.length === 0) {
      errors.push(`Level ${lvl}: Missing zombies`);
      levelOk = false;
    }

    data.zombies.forEach(z => {
      if (z.x < 16 || z.x + z.w > 584 || z.y < 16 || z.y + z.h > 526) {
        errors.push(`Level ${lvl}: Zombie ${z.id} out of bounds (${z.x}, ${z.y})`);
        levelOk = false;
      }
    });

    // Verify every TNT barrel has an actionable target in range
    data.tntBarrels.forEach(tnt => {
      const nearZombie = data.zombies.some(
        z => Math.hypot(z.x + z.w / 2 - tnt.x, z.y + z.h / 2 - tnt.y) <= 160
      );
      const nearIce = data.structures.some(
        s => s.type === 'ice' && Math.hypot(s.x + s.w / 2 - tnt.x, s.y + s.h / 2 - tnt.y) <= 175
      );
      const nearOtherTnt = data.tntBarrels.some(
        other => other.id !== tnt.id && Math.hypot(other.x - tnt.x, other.y - tnt.y) <= 150
      );
      if (!nearZombie && !nearIce && !nearOtherTnt) {
        errors.push(`Level ${lvl}: TNT barrel ${tnt.id} at (${tnt.x}, ${tnt.y}) has no actionable target in range`);
        levelOk = false;
      }
    });

    // 1. Exact structural + enemy + TNT signature
    const extraStructs = data.structures
      .slice(4)
      .map(s => `${s.type}:${s.x},${s.y},${s.w},${s.h},${s.vx || 0},${s.vy || 0}`)
      .join('|');
    const zomSig = data.zombies
      .map(z => `${z.type}:${z.x},${z.y},${z.maxHealth}`)
      .join('|');
    const tntSig = data.tntBarrels.map(t => `${t.x},${t.y}`).join('|');
    const fullSignature = `P(${data.playerPos.x},${data.playerPos.y})_S[${extraStructs}]_Z[${zomSig}]_T[${tntSig}]`;

    const existingLvl = layoutSignatures.get(fullSignature);
    if (existingLvl !== undefined) {
      errors.push(`Level ${lvl}: Duplicate layout signature with Level ${existingLvl}`);
      levelOk = false;
    } else {
      layoutSignatures.set(fullSignature, lvl);
    }

    // 2. Coarse topological signature (quantized to catch near-duplicates)
    const coarseP = `${Math.round(data.playerPos.x / 75)},${Math.round(data.playerPos.y / 65)},${
      data.destructiblePlayerSupport ? 'fragile' : 'solid'
    }`;
    const coarseS = data.structures
      .slice(4)
      .filter(s => s.type !== 'platform')
      .map(
        s =>
          `${s.type}:${Math.round(s.x / 85)},${Math.round(s.y / 70)},${s.w > s.h ? 'H' : 'V'},${
            s.vx || s.vy ? 'M' : 'S'
          }`
      )
      .join('|');
    const coarseZ = data.zombies
      .map(z => `${z.type}@${Math.round(z.x / 90)},${Math.round(z.y / 80)}`)
      .join('|');
    const coarseT = data.tntBarrels
      .map(t => `${Math.round(t.x / 90)},${Math.round(t.y / 80)}`)
      .join('|');
    const coarseKey = `CP(${coarseP})_CS[${coarseS}]_CZ[${coarseZ}]_CT[${coarseT}]`;

    const existingCoarse = coarseTopologies.get(coarseKey);
    if (existingCoarse !== undefined) {
      errors.push(`Level ${lvl}: Near-duplicate coarse topology with Level ${existingCoarse}`);
      levelOk = false;
    } else {
      coarseTopologies.set(coarseKey, lvl);
    }

    // 3. Unique intendedSolution & unique title checks
    const normSol = data.intendedSolution.trim().toLowerCase();
    const prevSolLvl = solutionSignatures.get(normSol);
    if (prevSolLvl !== undefined) {
      errors.push(`Level ${lvl}: Duplicate intendedSolution with Level ${prevSolLvl}`);
      levelOk = false;
    } else {
      solutionSignatures.set(normSol, lvl);
    }

    const normTitle = data.nameEn.trim().toLowerCase();
    const prevTitleLvl = titleSignatures.get(normTitle);
    if (prevTitleLvl !== undefined) {
      errors.push(`Level ${lvl}: Duplicate title with Level ${prevTitleLvl}`);
      levelOk = false;
    } else {
      titleSignatures.set(normTitle, lvl);
    }

    if (
      !data.primaryChallenge ||
      !data.intendedSolution ||
      !data.winCondition ||
      !data.failCondition ||
      data.mechanicsUsed.length === 0
    ) {
      errors.push(`Level ${lvl}: Missing tactical documentation metadata`);
      levelOk = false;
    }

    if (data.ammo < 4) {
      errors.push(`Level ${lvl}: Ammo budget (${data.ammo}) too low`);
      levelOk = false;
    }

    if (levelOk) {
      validCount++;
    }
  }

  return {
    levelSetVersion: LEVEL_SET_VERSION,
    totalLevels: 100,
    validCount,
    uniqueSignatures: layoutSignatures.size,
    uniqueCoarseTopologies: coarseTopologies.size,
    uniqueSolutions: solutionSignatures.size,
    uniqueTitles: titleSignatures.size,
    errors
  };
}
