import React, { useEffect, useRef, useState } from 'react';
import { CharacterItem, EmoteId, GunItem } from '../types/game';

export type IdlePoseName =
  | 'ready_stance'
  | 'weight_shift'
  | 'weapon_check'
  | 'perimeter_scan'
  | 'low_rest';

interface HomeSurvivorCharacterProps {
  character: CharacterItem;
  gun: GunItem;
  compact?: boolean;
  showcaseMode?: boolean;
  inspectPose?: IdlePoseName | 'auto';
  inspectTurn?: number;
  paused?: boolean;
  activeEmote?: EmoteId | null;
  emoteTriggerKey?: number;
  onEmoteComplete?: () => void;
  showPoseIndicator?: boolean;
}

interface IdlePoseTargets {
  hipDx: number;
  hipDy: number;
  torsoDx: number;
  torsoDy: number;
  torsoTiltDeg: number;
  headYawPx: number;
  headTiltDeg: number;
  headDy: number;
  gunDx: number;
  gunDy: number;
  gunAngleDeg: number;
  label: string;
}

const IDLE_POSE_SEQUENCE: IdlePoseName[] = [
  'ready_stance',
  'weight_shift',
  'weapon_check',
  'perimeter_scan',
  'low_rest'
];

const IDLE_POSE_DURATION_MS = 3400;
const IDLE_TRANSITION_MS = 1050;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function rotatePoint(
  px: number,
  py: number,
  cx: number,
  cy: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos
  };
}

function getIdlePoseTargets(
  pose: IdlePoseName,
  subTimeSec: number,
  isHeavyWeapon: boolean
): IdlePoseTargets {
  const breathe = Math.sin(subTimeSec * 2.1);
  const slowWave = Math.sin(subTimeSec * 1.65);

  switch (pose) {
    case 'weight_shift':
      return {
        hipDx: 4.2,
        hipDy: 1.5,
        torsoDx: 3.5,
        torsoDy: 1.2 + breathe * 1.1,
        torsoTiltDeg: -2.2,
        headYawPx: -2.2,
        headTiltDeg: -1.5,
        headDy: breathe * 0.9,
        gunDx: 2.5,
        gunDy: 3.2 + breathe * 1.2,
        gunAngleDeg: isHeavyWeapon ? 5.5 : 4.2,
        label: 'Weight Shift'
      };

    case 'weapon_check':
      return {
        hipDx: -1.5,
        hipDy: 0.8,
        torsoDx: -1.0,
        torsoDy: 0.5 + breathe * 0.8,
        torsoTiltDeg: 1.6,
        headYawPx: 3.6,
        headTiltDeg: 6.2,
        headDy: 2.2,
        gunDx: 3.0,
        gunDy: -6.5 + slowWave * 1.2,
        gunAngleDeg: isHeavyWeapon ? -8.5 : -11.5,
        label: 'Weapon Check'
      };

    case 'perimeter_scan': {
      // Smoothly looks left then right during the scan window
      const scanSweep = Math.sin(subTimeSec * 2.35);
      return {
        hipDx: scanSweep * 1.4,
        hipDy: 0.6,
        torsoDx: scanSweep * 1.8,
        torsoDy: breathe * 1.0,
        torsoTiltDeg: scanSweep * 1.5,
        headYawPx: scanSweep * 6.8,
        headTiltDeg: scanSweep * 2.0,
        headDy: 0.4,
        gunDx: scanSweep * 2.2,
        gunDy: 2.0 + breathe * 1.0,
        gunAngleDeg: 3.2 + scanSweep * 1.8,
        label: 'Sector Scan'
      };
    }

    case 'low_rest':
      return {
        hipDx: -2.8,
        hipDy: 1.8,
        torsoDx: -2.2,
        torsoDy: 1.8 + breathe * 1.3,
        torsoTiltDeg: 1.8,
        headYawPx: 1.2,
        headTiltDeg: 2.2,
        headDy: 1.2 + breathe * 1.0,
        gunDx: 1.5,
        gunDy: 6.2 + breathe * 1.2,
        gunAngleDeg: isHeavyWeapon ? 10.5 : 13.0,
        label: 'Patrol Rest'
      };

    case 'ready_stance':
    default:
      return {
        hipDx: 0,
        hipDy: 0.4,
        torsoDx: 0,
        torsoDy: breathe * 1.3,
        torsoTiltDeg: 0,
        headYawPx: Math.sin(subTimeSec * 1.1) * 1.4,
        headTiltDeg: 0,
        headDy: breathe * 0.9,
        gunDx: 0,
        gunDy: breathe * 1.4,
        gunAngleDeg: 0.5,
        label: 'Combat Ready'
      };
  }
}

interface EmoteKinematics {
  hipDx: number;
  hipDy: number;
  torsoDx: number;
  torsoDy: number;
  torsoTiltDeg: number;
  torsoScaleX: number;
  facingBack: boolean;
  headYawPx: number;
  headTiltDeg: number;
  headDy: number;
  leftFootDx: number;
  leftFootDy: number;
  rightFootDx: number;
  rightFootDy: number;
  leftKneeDx: number;
  rightKneeDx: number;
  // Arm joints when weapon is slung on back
  leftElbow: { x: number; y: number };
  leftWrist: { x: number; y: number };
  rightElbow: { x: number; y: number };
  rightWrist: { x: number; y: number };
  shockwaveAlpha: number;
  shockwaveRadius: number;
}

function computeEmoteKinematics(emoteId: EmoteId, danceTimeSec: number): EmoteKinematics {
  const t = danceTimeSec;
  // Base neutral joints
  let hipDx = 0;
  let hipDy = 0;
  let torsoDx = 0;
  let torsoDy = 0;
  let torsoTiltDeg = 0;
  let torsoScaleX = 1;
  let facingBack = false;
  let headYawPx = 0;
  let headTiltDeg = 0;
  let headDy = 0;
  let leftFootDx = 0;
  let leftFootDy = 0;
  let rightFootDx = 0;
  let rightFootDy = 0;
  let leftKneeDx = 0;
  let rightKneeDx = 0;
  let leftElbow = { x: 150, y: 112 };
  let leftWrist = { x: 156, y: 92 };
  let rightElbow = { x: 70, y: 112 };
  let rightWrist = { x: 64, y: 92 };
  let shockwaveAlpha = 0;
  let shockwaveRadius = 36;

  switch (emoteId) {
    case 'victory_groove': {
      // Rhythmic two-step knee bounce, shoulder groove & overhead right fist pump
      const beat = t * 7.6;
      const bounce = Math.abs(Math.sin(beat));
      const side = Math.sin(beat * 0.5);
      hipDx = side * 6.5;
      hipDy = bounce * 5.5;
      torsoDx = side * 8.0;
      torsoDy = bounce * 6.0;
      torsoTiltDeg = side * 5.5;
      headYawPx = side * 4.5;
      headTiltDeg = -side * 4.0;
      headDy = bounce * 3.5;

      leftKneeDx = side * 5.0;
      rightKneeDx = side * 5.0;
      leftFootDy = side > 0 ? -clamp( side * 4.5, 0, 5) : 0;
      rightFootDy = side < 0 ? -clamp(-side * 4.5, 0, 5) : 0;

      // Left arm grooves near waist/chest; Right arm pumps high overhead inside frame
      const pump = Math.sin(beat);
      rightElbow = { x: 64 + side * 4, y: 82 - pump * 7 };
      rightWrist = { x: 68 + side * 5, y: 50 - pump * 9 };
      leftElbow = { x: 150 + side * 5, y: 110 + pump * 5 };
      leftWrist = { x: 136 + side * 6, y: 120 - pump * 6 };
      break;
    }

    case 'survivor_shuffle': {
      // Rapid heel-toe lateral deck shuffle with alternating arm swings
      const beat = t * 8.4;
      const step = Math.sin(beat);
      const doubleBounce = Math.abs(Math.cos(beat));
      hipDx = step * 8.5;
      hipDy = doubleBounce * 4.5;
      torsoDx = step * 6.5;
      torsoDy = doubleBounce * 4.5;
      torsoTiltDeg = -step * 4.5;
      headYawPx = step * 5.2;
      headTiltDeg = step * 3.0;

      // Feet shuffle horizontally along deck, lifting max 5px during glide
      leftFootDx = step * 10 - 3;
      rightFootDx = -step * 10 + 3;
      leftFootDy = step > 0 ? -step * 4.5 : 0;
      rightFootDy = step < 0 ? step * 4.5 : 0;
      leftKneeDx = leftFootDx * 0.65;
      rightKneeDx = rightFootDx * 0.65;

      // Alternating crisp horizontal/diagonal arm swings
      rightElbow = { x: 66 - step * 6, y: 108 - step * 6 };
      rightWrist = { x: 82 - step * 18, y: 98 + step * 10 };
      leftElbow = { x: 152 - step * 6, y: 108 + step * 6 };
      leftWrist = { x: 138 - step * 18, y: 98 - step * 10 };
      break;
    }

    case 'battle_bounce': {
      // Power-stance squat bounce with double-arm combat hype curls
      const beat = t * 7.8;
      const squat = (Math.sin(beat) + 1) * 0.5; // 0..1 deep squat
      const sway = Math.sin(beat * 0.5);
      hipDx = sway * 4.0;
      hipDy = squat * 9.5;
      torsoDx = sway * 4.5;
      torsoDy = squat * 10.0;
      torsoTiltDeg = sway * 3.5;
      headDy = squat * 6.5;
      headTiltDeg = (squat - 0.5) * 8;

      // Wide knees bend outward on squat while boots stay planted wide
      leftFootDx = 5;
      rightFootDx = -5;
      leftKneeDx = 7 + squat * 5;
      rightKneeDx = -7 - squat * 5;

      // Twin combat hype arm pumps
      const curl = Math.sin(beat);
      rightElbow = { x: 62, y: 102 + squat * 8 };
      rightWrist = { x: 66, y: 74 - curl * 13 };
      leftElbow = { x: 156, y: 102 + squat * 8 };
      leftWrist = { x: 152, y: 74 - curl * 13 };
      break;
    }

    case 'neon_footwork': {
      // Crisp cyber-step cross kicks & counter-balanced torso wave
      const beat = t * 8.8;
      const s = Math.sin(beat);
      const c = Math.cos(beat);
      hipDx = s * 7.0;
      hipDy = Math.abs(c) * 4.2;
      torsoDx = -s * 5.5; // Counter-balanced upper body wave
      torsoDy = Math.abs(c) * 4.5;
      torsoTiltDeg = -s * 6.0;
      headYawPx = s * 5.0;

      // Cross-step footwork clamped cleanly above platform
      leftFootDx = -s * 11;
      rightFootDx = s * 11;
      leftFootDy = s > 0.2 ? -5.0 * s : 0;
      rightFootDy = s < -0.2 ? 5.0 * s : 0;
      leftKneeDx = leftFootDx * 0.7;
      rightKneeDx = rightFootDx * 0.7;

      // Diagonal cyber slashes
      rightElbow = { x: 64 - s * 5, y: 96 + c * 8 };
      rightWrist = { x: 54 - s * 12, y: 68 + s * 16 };
      leftElbow = { x: 154 - s * 5, y: 96 - c * 8 };
      leftWrist = { x: 164 - s * 12, y: 68 - s * 16 };
      break;
    }

    case 'robot_pulse': {
      // Quantized mechanical isolation locks — 90-degree arm angles & optic scan ticks
      const qTime = Math.floor(t * 5.5) / 5.5;
      const stepIdx = Math.floor(t * 3.5) % 4;
      const pop = (Math.sin(t * 14) > 0.65 ? 1 : 0) * 2.2;

      hipDx = (stepIdx === 1 ? 4 : stepIdx === 3 ? -4 : 0);
      hipDy = stepIdx % 2 === 0 ? 0 : 3.5;
      torsoDx = hipDx;
      torsoDy = hipDy - pop;
      torsoTiltDeg = stepIdx === 1 ? 3.5 : stepIdx === 3 ? -3.5 : 0;

      // Quantized robotic head ticks
      headYawPx = stepIdx === 0 ? -6.5 : stepIdx === 1 ? 6.5 : stepIdx === 2 ? -3.5 : 4.5;
      headTiltDeg = stepIdx % 2 === 0 ? 2.5 : -2.5;

      // 90-degree mechanical elbow/wrist locks
      const armState = Math.floor(qTime * 3.5) % 4;
      if (armState === 0) {
        rightElbow = { x: 60, y: 96 };
        rightWrist = { x: 60, y: 66 };
        leftElbow = { x: 158, y: 96 };
        leftWrist = { x: 158, y: 124 };
      } else if (armState === 1) {
        rightElbow = { x: 60, y: 96 };
        rightWrist = { x: 86, y: 96 };
        leftElbow = { x: 158, y: 96 };
        leftWrist = { x: 158, y: 66 };
      } else if (armState === 2) {
        rightElbow = { x: 60, y: 114 };
        rightWrist = { x: 60, y: 134 };
        leftElbow = { x: 158, y: 96 };
        leftWrist = { x: 132, y: 96 };
      } else {
        rightElbow = { x: 60, y: 92 };
        rightWrist = { x: 60, y: 62 };
        leftElbow = { x: 158, y: 92 };
        leftWrist = { x: 158, y: 62 };
      }
      break;
    }

    case 'midnight_step': {
      // Smooth glide weight transfers, lean-back shoulder roll & sharp point salute
      const glide = Math.sin(t * 4.2);
      const groove = Math.sin(t * 8.4);
      hipDx = glide * 9.5;
      hipDy = Math.abs(groove) * 3.8;
      torsoDx = glide * 6.0;
      torsoDy = Math.abs(groove) * 4.2;
      torsoTiltDeg = -glide * 6.5;
      headYawPx = glide * 5.5;
      headTiltDeg = -glide * 3.5;

      // Moon-glide heel slides
      leftFootDx = glide * 9.0;
      rightFootDx = glide * 9.0;
      leftFootDy = glide > 0 ? -3.5 * glide : 0;
      rightFootDy = glide < 0 ? 3.5 * glide : 0;
      leftKneeDx = leftFootDx * 0.8 + (glide > 0 ? 4 : 0);
      rightKneeDx = rightFootDx * 0.8 + (glide < 0 ? -4 : 0);

      // Right arm performs smooth wave into skyward/forward point; Left hand rests on belt
      rightElbow = { x: 62 + glide * 4, y: 92 - groove * 6 };
      rightWrist = { x: 48 + glide * 6, y: 62 - Math.abs(glide) * 10 };
      leftElbow = { x: 148 + glide * 4, y: 116 };
      leftWrist = { x: 132 + glide * 4, y: 134 };
      break;
    }

    case 'champion_spin': {
      // Dynamic 360-degree simulated body turn + twin skyward V-salute
      if (t < 1.85) {
        const spinPhase = (t / 1.85) * Math.PI * 2;
        const cosSpin = Math.cos(spinPhase);
        const sinSpin = Math.sin(spinPhase);
        torsoScaleX = clamp(Math.abs(cosSpin), 0.38, 1);
        facingBack = cosSpin < 0;
        hipDx = sinSpin * 5.5;
        hipDy = Math.abs(sinSpin) * 4.0;
        torsoDx = sinSpin * 6.0;
        torsoDy = Math.abs(sinSpin) * 4.5;
        headYawPx = sinSpin * 7.0;

        leftFootDx = sinSpin * 7.0;
        rightFootDx = -sinSpin * 7.0;
        leftFootDy = sinSpin > 0 ? -4.0 * sinSpin : 0;
        rightFootDy = sinSpin < 0 ? 4.0 * sinSpin : 0;

        rightElbow = { x: 74 - sinSpin * 16, y: 96 };
        rightWrist = { x: 62 - sinSpin * 22, y: 74 };
        leftElbow = { x: 144 + sinSpin * 16, y: 96 };
        leftWrist = { x: 156 + sinSpin * 22, y: 74 };
      } else {
        const beat = (t - 1.85) * 8.2;
        const bounce = Math.abs(Math.sin(beat));
        const sway = Math.sin(beat * 0.5);
        hipDx = sway * 4.0;
        hipDy = bounce * 5.0;
        torsoDx = sway * 4.5;
        torsoDy = bounce * 5.5;
        torsoTiltDeg = sway * 3.5;
        headYawPx = sway * 3.5;
        headDy = bounce * 2.5;

        // Twin V-salute raised cleanly inside frame
        rightElbow = { x: 62, y: 82 - bounce * 4 };
        rightWrist = { x: 54 - sway * 4, y: 50 - bounce * 6 };
        leftElbow = { x: 156, y: 82 - bounce * 4 };
        leftWrist = { x: 164 - sway * 4, y: 50 - bounce * 6 };
      }
      break;
    }

    case 'siege_celebration':
    default: {
      // Apex commander stomp combo -> chest-thump salute -> shockwave & double-arm triumph
      if (t < 1.15) {
        const stompProgress = t / 1.15;
        const lift = stompProgress < 0.55
          ? Math.sin((stompProgress / 0.55) * Math.PI)
          : 0;
        const impact = stompProgress >= 0.55 ? (stompProgress - 0.55) / 0.45 : 0;

        rightFootDy = -lift * 12;
        rightKneeDx = -lift * 6;
        hipDy = impact > 0 ? Math.sin(impact * Math.PI) * 7.5 : -lift * 2;
        torsoDy = hipDy;
        headTiltDeg = impact > 0 ? 5.0 : -3.0;

        if (impact > 0) {
          shockwaveAlpha = Math.max(0, 0.85 * (1 - impact));
          shockwaveRadius = 32 + impact * 38;
        }

        // Chest-thump salute with right fist over heart plate
        rightElbow = { x: 64, y: 108 };
        rightWrist = { x: 104, y: 102 };
        leftElbow = { x: 154, y: 106 };
        leftWrist = { x: 162, y: 86 };
      } else {
        // Phase B: Triumphant commander roar & double skyward pulse inside frame
        const beat = (t - 1.15) * 8.4;
        const pulse = Math.abs(Math.sin(beat));
        const sway = Math.sin(beat * 0.5);
        hipDx = sway * 5.0;
        hipDy = pulse * 5.5;
        torsoDx = sway * 5.5;
        torsoDy = pulse * 6.0;
        torsoTiltDeg = sway * 4.0;
        headYawPx = sway * 4.5;
        headTiltDeg = -3.0;

        leftFootDx = 4;
        rightFootDx = -4;
        leftKneeDx = 5 + pulse * 3;
        rightKneeDx = -5 - pulse * 3;

        rightElbow = { x: 60 + sway * 3, y: 80 - pulse * 5 };
        rightWrist = { x: 54 + sway * 5, y: 49 - pulse * 7 };
        leftElbow = { x: 158 + sway * 3, y: 80 - pulse * 5 };
        leftWrist = { x: 164 + sway * 5, y: 49 - pulse * 7 };

        if (Math.sin(beat) > 0.75) {
          shockwaveAlpha = 0.35;
          shockwaveRadius = 48 + pulse * 14;
        }
      }
      break;
    }
  }

  // Strictly clamp foot Y offsets so boots NEVER go below y=212 or float unnaturally
  leftFootDy = clamp(leftFootDy, -12, 0);
  rightFootDy = clamp(rightFootDy, -12, 0);
  leftFootDx = clamp(leftFootDx, -14, 14);
  rightFootDx = clamp(rightFootDx, -14, 14);

  return {
    hipDx,
    hipDy,
    torsoDx,
    torsoDy,
    torsoTiltDeg,
    torsoScaleX,
    facingBack,
    headYawPx,
    headTiltDeg,
    headDy,
    leftFootDx,
    leftFootDy,
    rightFootDx,
    rightFootDy,
    leftKneeDx,
    rightKneeDx,
    leftElbow,
    leftWrist,
    rightElbow,
    rightWrist,
    shockwaveAlpha,
    shockwaveRadius
  };
}

export const HomeSurvivorCharacter: React.FC<HomeSurvivorCharacterProps> = ({
  character,
  gun,
  compact = false,
  showcaseMode = false,
  inspectPose = 'auto',
  inspectTurn = 0,
  paused = false,
  activeEmote = null,
  emoteTriggerKey = 0,
  onEmoteComplete,
  showPoseIndicator = false
}) => {
  const uid = character.id || 'soldier';
  const suitColor = character.color || '#38bdf8';
  const skinColor = character.skinColor || '#d9a97c';
  const armorStyle = character.armorStyle || 'soldier';
  const armorPrimary = character.armorPrimary || '#243040';
  const armorSecondary = character.armorSecondary || '#131b26';
  const fabricColor = character.fabricColor || '#1a2332';
  const rimColor = character.rimColor || '#64748b';
  const gunBody = gun.bodyColor || '#1e293b';
  const gunAccent = gun.accentColor || gun.bulletColor || '#38bdf8';

  const isHeavyWeapon =
    gun.weaponType === 'sniper' ||
    gun.weaponType === 'railgun' ||
    gun.weaponType === 'cannon' ||
    gun.weaponType === 'scifi';

  // Calibrated forward support-hand X coordinate so the left hand wraps the exact foregrip/handguard of each weapon
  const getSupportHandX = (): number => {
    switch (gun.weaponType) {
      case 'pistol':
        return 122; // Under-frame tactical rail support grip
      case 'smg':
        return 134; // Vertical foregrip
      case 'shotgun':
        return 144; // Ribbed pump-action forend
      case 'assault':
      case 'plasma':
        return 145; // Angled foregrip / plasma shroud
      case 'sniper':
      case 'railgun':
      case 'cannon':
      case 'scifi':
      default:
        return 148; // Forward heavy barrel handguard
    }
  };

  const supportX = getSupportHandX();

  // Animation clock state (driven by requestAnimationFrame when visible & active)
  const [animNowMs, setAnimNowMs] = useState<number>(0);
  const startPerfRef = useRef<number>(performance.now());
  const emoteStartMsRef = useRef<number>(0);
  const completedTriggerRef = useRef<number>(-1);
  const onEmoteCompleteRef = useRef(onEmoteComplete);

  useEffect(() => {
    onEmoteCompleteRef.current = onEmoteComplete;
  }, [onEmoteComplete]);

  // Reset emote start timestamp whenever activeEmote or emoteTriggerKey changes
  useEffect(() => {
    if (activeEmote) {
      const now = performance.now() - startPerfRef.current;
      emoteStartMsRef.current = now;
      completedTriggerRef.current = -1;
    }
  }, [activeEmote, emoteTriggerKey]);

  const shouldAnimate = !paused && (!compact || Boolean(activeEmote));

  useEffect(() => {
    if (!shouldAnimate) return;

    let rafId = 0;
    const tick = (now: number) => {
      const elapsed = now - startPerfRef.current;
      setAnimNowMs(elapsed);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [shouldAnimate]);

  // Compute current Idle Pose interpolation or Active Emote state
  const totalCycleMs = IDLE_POSE_SEQUENCE.length * IDLE_POSE_DURATION_MS;
  const cyclePosMs = animNowMs % totalCycleMs;
  const currentPoseIndex = Math.floor(cyclePosMs / IDLE_POSE_DURATION_MS);
  const nextPoseIndex = (currentPoseIndex + 1) % IDLE_POSE_SEQUENCE.length;
  const poseElapsedMs = cyclePosMs - currentPoseIndex * IDLE_POSE_DURATION_MS;

  const subTimeSec = animNowMs * 0.001;
  const activePoseAName = inspectPose && inspectPose !== 'auto' ? inspectPose : IDLE_POSE_SEQUENCE[currentPoseIndex];
  const activePoseBName = inspectPose && inspectPose !== 'auto' ? inspectPose : IDLE_POSE_SEQUENCE[nextPoseIndex];
  const poseA = getIdlePoseTargets(activePoseAName, subTimeSec, isHeavyWeapon);
  const poseB = getIdlePoseTargets(activePoseBName, subTimeSec, isHeavyWeapon);

  const blendStartMs = IDLE_POSE_DURATION_MS - IDLE_TRANSITION_MS;
  const idleBlend =
    inspectPose && inspectPose !== 'auto'
      ? 0
      : poseElapsedMs > blendStartMs
      ? smoothstep(blendStartMs, IDLE_POSE_DURATION_MS, poseElapsedMs)
      : 0;

  const turnNorm = clamp(inspectTurn / 100, -1, 1);

  const idleRig: IdlePoseTargets = {
    hipDx: lerp(poseA.hipDx, poseB.hipDx, idleBlend) + turnNorm * 3.2,
    hipDy: lerp(poseA.hipDy, poseB.hipDy, idleBlend),
    torsoDx: lerp(poseA.torsoDx, poseB.torsoDx, idleBlend) + turnNorm * 4.5,
    torsoDy: lerp(poseA.torsoDy, poseB.torsoDy, idleBlend),
    torsoTiltDeg: lerp(poseA.torsoTiltDeg, poseB.torsoTiltDeg, idleBlend) + turnNorm * 2.5,
    headYawPx: clamp(lerp(poseA.headYawPx, poseB.headYawPx, idleBlend) + turnNorm * 6.5, -7, 7),
    headTiltDeg: lerp(poseA.headTiltDeg, poseB.headTiltDeg, idleBlend) + turnNorm * 1.8,
    headDy: lerp(poseA.headDy, poseB.headDy, idleBlend),
    gunDx: lerp(poseA.gunDx, poseB.gunDx, idleBlend) + turnNorm * 3.5,
    gunDy: lerp(poseA.gunDy, poseB.gunDy, idleBlend),
    gunAngleDeg: lerp(poseA.gunAngleDeg, poseB.gunAngleDeg, idleBlend) + turnNorm * 2.5,
    label: idleBlend > 0.5 ? poseB.label : poseA.label
  };

  // Emote lifecycle timing:
  // [0 .. 420ms]: Smoothly sling weapon to back holster
  // [420ms .. durationMs - 420ms]: Full-body choreographed dance with weapon slung on back
  // [durationMs - 420ms .. durationMs]: Smoothly un-sling weapon back to two-handed chest grip
  const EMOTE_DURATION_MS = 4400;
  const SLING_TRANSITION_MS = 420;
  let isPlayingEmote = false;
  let slingProgress = 0; // 0 = in hands, 1 = slung on back
  let emoteKinematics: EmoteKinematics | null = null;

  if (activeEmote) {
    const emoteElapsed = Math.max(0, animNowMs - emoteStartMsRef.current);
    if (emoteElapsed < EMOTE_DURATION_MS) {
      isPlayingEmote = true;
      if (emoteElapsed < SLING_TRANSITION_MS) {
        slingProgress = smoothstep(0, SLING_TRANSITION_MS, emoteElapsed);
      } else if (emoteElapsed > EMOTE_DURATION_MS - SLING_TRANSITION_MS) {
        slingProgress = 1 - smoothstep(EMOTE_DURATION_MS - SLING_TRANSITION_MS, EMOTE_DURATION_MS, emoteElapsed);
      } else {
        slingProgress = 1;
      }
      const danceSec = Math.max(0, (emoteElapsed - SLING_TRANSITION_MS * 0.5) * 0.001);
      emoteKinematics = computeEmoteKinematics(activeEmote, danceSec);
    } else if (completedTriggerRef.current !== emoteTriggerKey) {
      completedTriggerRef.current = emoteTriggerKey;
      window.setTimeout(() => {
        onEmoteCompleteRef.current?.();
      }, 0);
    }
  }

  // Blend between Idle Rig and Emote Rig using slingProgress so start/end transitions are 100% seamless
  const hipDx = isPlayingEmote && emoteKinematics ? lerp(idleRig.hipDx, emoteKinematics.hipDx, slingProgress) : idleRig.hipDx;
  const hipDy = isPlayingEmote && emoteKinematics ? lerp(idleRig.hipDy, emoteKinematics.hipDy, slingProgress) : idleRig.hipDy;
  const torsoDx = isPlayingEmote && emoteKinematics ? lerp(idleRig.torsoDx, emoteKinematics.torsoDx, slingProgress) : idleRig.torsoDx;
  const torsoDy = isPlayingEmote && emoteKinematics ? lerp(idleRig.torsoDy, emoteKinematics.torsoDy, slingProgress) : idleRig.torsoDy;
  const torsoTiltDeg = isPlayingEmote && emoteKinematics ? lerp(idleRig.torsoTiltDeg, emoteKinematics.torsoTiltDeg, slingProgress) : idleRig.torsoTiltDeg;
  const torsoScaleX = isPlayingEmote && emoteKinematics ? lerp(1, emoteKinematics.torsoScaleX, slingProgress) : 1;
  const facingBack = isPlayingEmote && emoteKinematics && slingProgress > 0.7 ? emoteKinematics.facingBack : false;

  const headYawPx = isPlayingEmote && emoteKinematics ? lerp(idleRig.headYawPx, emoteKinematics.headYawPx, slingProgress) : idleRig.headYawPx;
  const headTiltDeg = isPlayingEmote && emoteKinematics ? lerp(idleRig.headTiltDeg, emoteKinematics.headTiltDeg, slingProgress) : idleRig.headTiltDeg;
  const headDy = isPlayingEmote && emoteKinematics ? lerp(idleRig.headDy, emoteKinematics.headDy, slingProgress) : idleRig.headDy;

  const leftFootDx = isPlayingEmote && emoteKinematics ? emoteKinematics.leftFootDx * slingProgress : 0;
  const leftFootDy = isPlayingEmote && emoteKinematics ? emoteKinematics.leftFootDy * slingProgress : 0;
  const rightFootDx = isPlayingEmote && emoteKinematics ? emoteKinematics.rightFootDx * slingProgress : 0;
  const rightFootDy = isPlayingEmote && emoteKinematics ? emoteKinematics.rightFootDy * slingProgress : 0;
  const leftKneeDx = isPlayingEmote && emoteKinematics ? emoteKinematics.leftKneeDx * slingProgress : hipDx * 0.45;
  const rightKneeDx = isPlayingEmote && emoteKinematics ? emoteKinematics.rightKneeDx * slingProgress : hipDx * 0.45;

  // During weapon sling (0..0.65), the gun rotates up-back toward the shoulder sling before latching on the back layer
  const gunDx = lerp(idleRig.gunDx, -10, slingProgress);
  const gunDy = lerp(idleRig.gunDy, -18, slingProgress);
  const gunAngleDeg = lerp(idleRig.gunAngleDeg, -38, slingProgress);
  const isWeaponOnBackSling = isPlayingEmote && slingProgress >= 0.62;

  // Compute world-space coordinates of the Right Pistol Grip and Left Foregrip so arms stay 100% locked to the gun when held
  const gunPivotX = 106;
  const gunPivotY = 122;
  const rightGripWorld = rotatePoint(103 + gunDx, 129 + gunDy, gunPivotX + gunDx, gunPivotY + gunDy, gunAngleDeg);
  const leftForegripWorld = rotatePoint(supportX + gunDx, 125 + gunDy, gunPivotX + gunDx, gunPivotY + gunDy, gunAngleDeg);

  // Detailed Weapon SVG aligned with Right Shoulder Stock, Right Trigger Hand Grip, and Left Support Hand Foregrip
  const renderEquippedGun = () => {
    switch (gun.weaponType) {
      case 'pistol':
        return (
          <g>
            <path d="M84 119 L100 118 L100 125 L84 125 Z" fill="#18202c" stroke="#475569" strokeWidth="1.1" />
            <path d="M100 124 L111 124 L107 145 L96 145 Z" fill="#0d131f" stroke="#475569" strokeWidth="1.2" />
            <path d="M111 124 L121 124 L121 133 L109 133" fill="none" stroke="#64748b" strokeWidth="1.3" />
            <path d="M114 125 Q116 129 113 131" fill="none" stroke="#cbd5e1" strokeWidth="1.4" />
            <rect x="95" y="144" width="13" height="3.5" rx="1" fill={gunAccent} />
            <rect x="96" y="112" width="56" height="12" rx="2.5" fill={`url(#gunMetalGrad-${uid})`} stroke="#64748b" strokeWidth="1.3" />
            <line x1="102" y1="114" x2="108" y2="119" stroke="#94a3b8" strokeWidth="0.9" opacity="0.55" />
            <rect x="116" y="123" width="30" height="4.5" rx="1" fill="#0d131f" stroke="#475569" strokeWidth="1" />
            <rect x="118" y="125" width="14" height="6" rx="1.5" fill="#18202c" stroke={gunAccent} strokeWidth="1.1" />
            <rect x="104" y="116.5" width="36" height="2.8" rx="1" fill={gunAccent} opacity="0.9" />
            <rect x="99" y="109.5" width="5" height="2.5" fill={gunAccent} />
            <rect x="145" y="109.5" width="4" height="2.5" fill={gunAccent} />
            <rect x="152" y="113" width="10" height="10" rx="1.5" fill="#0d131f" stroke={gunAccent} strokeWidth="1.2" />
            <rect x="160" y="115.5" width="4" height="5" fill={gunAccent} />
          </g>
        );

      case 'smg':
        return (
          <g>
            <path d="M72 115 L96 116 L96 123 L78 124 L72 130 Z" fill="#18202c" stroke="#475569" strokeWidth="1.2" />
            <rect x="69" y="114" width="5" height="17" rx="1.5" fill="#090d16" stroke="#64748b" strokeWidth="1.1" />
            <path d="M106 104 L121 104 L123 112 L104 112 Z" fill="#090d16" stroke="#64748b" strokeWidth="1.2" />
            <circle cx="114" cy="108" r="1.6" fill={gunAccent} />
            <path d="M100 124 L110 124 L106 144 L96 144 Z" fill="#090d16" stroke="#475569" strokeWidth="1.1" />
            <path d="M110 124 L118 124 L118 132 L109 132" fill="none" stroke="#64748b" strokeWidth="1.2" />
            <path d="M121 125 L129 125 L135 150 L126 150 Z" fill="#0d131f" stroke={gunAccent} strokeWidth="1.2" />
            <rect x="95" y="112" width="52" height="13.5" rx="2.5" fill={gunBody} stroke="#64748b" strokeWidth="1.3" />
            <line x1="101" y1="114" x2="108" y2="121" stroke="#94a3b8" strokeWidth="0.9" opacity="0.5" />
            <rect x="102" y="116.5" width="34" height="2.8" rx="1" fill={gunAccent} opacity="0.9" />
            <rect x="130" y="124" width="8" height="14" rx="2" fill="#0d131f" stroke="#64748b" strokeWidth="1.2" />
            <rect x="147" y="115" width="28" height="8" rx="2" fill="#090d16" stroke={gunAccent} strokeWidth="1.2" />
            <line x1="153" y1="116" x2="153" y2="122" stroke={gunAccent} strokeWidth="1" />
            <line x1="159" y1="116" x2="159" y2="122" stroke={gunAccent} strokeWidth="1" />
            <line x1="165" y1="116" x2="165" y2="122" stroke={gunAccent} strokeWidth="1" />
          </g>
        );

      case 'shotgun':
        return (
          <g>
            <path d="M68 122 L96 114 L96 126 L72 133 Z" fill="#1c1917" stroke="#57534e" strokeWidth="1.3" />
            <rect x="65" y="120" width="5" height="14" rx="1.5" fill="#090d16" stroke={gunAccent} strokeWidth="1" />
            <path d="M100 124 L110 124 L106 143 L96 143 Z" fill="#090d16" stroke="#475569" strokeWidth="1.1" />
            <path d="M110 124 L118 124 L118 132 L109 132" fill="none" stroke="#64748b" strokeWidth="1.2" />
            <rect x="95" y="112" width="45" height="13" rx="2" fill={gunBody} stroke="#64748b" strokeWidth="1.4" />
            <rect x="102" y="115" width="4" height="7" rx="1" fill="#dc2626" />
            <rect x="108" y="115" width="4" height="7" rx="1" fill="#dc2626" />
            <rect x="114" y="115" width="4" height="7" rx="1" fill="#dc2626" />
            <rect x="120" y="115" width="4" height="7" rx="1" fill="#dc2626" />
            <rect x="140" y="112" width="42" height="6.5" fill="#18202c" stroke="#64748b" strokeWidth="1.2" />
            <rect x="140" y="118.5" width="39" height="5" fill="#273244" />
            <rect x="132" y="121" width="26" height="7.5" rx="2" fill={gunAccent} stroke="#090d16" strokeWidth="1.2" />
            <path d="M182 110.5 L191 110.5 L189 123.5 L182 123.5 Z" fill={gunAccent} />
          </g>
        );

      case 'assault':
        return (
          <g>
            <path d="M68 114 L96 114 L96 126 L72 131 L68 127 Z" fill="#18202c" stroke="#475569" strokeWidth="1.3" />
            <rect x="65" y="113" width="4" height="16" rx="1" fill={gunAccent} />
            <path d="M105 103 L127 103 L125 111 L107 111 Z" fill="#090d16" stroke="#64748b" strokeWidth="1.3" />
            <line x1="110" y1="107" x2="121" y2="107" stroke={gunAccent} strokeWidth="1.5" />
            <path d="M100 124 L110 124 L106 144 L96 144 Z" fill="#090d16" stroke="#475569" strokeWidth="1.2" />
            <path d="M110 124 L119 124 L119 132 L109 132" fill="none" stroke="#64748b" strokeWidth="1.2" />
            <path d="M121 125 L131 125 L137 150 L125 150 Z" fill="#090d16" stroke={gunAccent} strokeWidth="1.3" />
            <rect x="95" y="111" width="67" height="14" rx="2.5" fill={gunBody} stroke="#64748b" strokeWidth="1.4" />
            <line x1="101" y1="118" x2="156" y2="118" stroke={gunAccent} strokeWidth="2.2" />
            <polygon points="136,125 153,125 149,132 139,132" fill="#0d131f" stroke={gunAccent} strokeWidth="1.2" />
            <rect x="162" y="115" width="23" height="6" fill="#273244" stroke="#475569" strokeWidth="1" />
            <rect x="184" y="113" width="9" height="10" rx="1.5" fill={gunAccent} />
          </g>
        );

      case 'sniper':
        return (
          <g>
            <path d="M64 114 L95 114 L95 125 L68 130 L64 125 Z" fill="#18181b" stroke="#475569" strokeWidth="1.3" />
            <path d="M101 100 L141 99 L139 108 L103 108 Z" fill="#090d16" stroke={gunAccent} strokeWidth="1.3" />
            <rect x="109" y="108" width="4" height="4" fill="#475569" />
            <rect x="127" y="108" width="4" height="4" fill="#475569" />
            <path d="M100 124 L109 124 L105 143 L96 143 Z" fill="#090d16" stroke="#475569" strokeWidth="1.1" />
            <rect x="119" y="124" width="14" height="16" rx="1.5" fill="#090d16" stroke={gunAccent} strokeWidth="1.2" />
            <rect x="95" y="112" width="65" height="12" rx="2" fill={gunBody} stroke="#64748b" strokeWidth="1.4" />
            <line x1="101" y1="118" x2="156" y2="118" stroke={gunAccent} strokeWidth="2" />
            <rect x="140" y="124" width="16" height="5" rx="1.5" fill="#18202c" stroke={gunAccent} strokeWidth="1" />
            <rect x="160" y="115" width="34" height="5" fill="#94a3b8" />
            <polygon points="192,111 203,112 203,123 192,124" fill={gunAccent} />
          </g>
        );

      case 'plasma':
        return (
          <g>
            <path d="M69 114 L95 114 L95 127 L71 130 Z" fill="#1e1b4b" stroke="#475569" strokeWidth="1.3" />
            <rect x="105" y="104" width="18" height="6" rx="2" fill="#090d16" stroke={gunAccent} strokeWidth="1.2" />
            <path d="M100 124 L110 124 L106 144 L96 144 Z" fill="#090d16" stroke="#475569" strokeWidth="1.1" />
            <rect x="121" y="125" width="14" height="15" rx="3" fill="#0d131f" stroke={gunAccent} strokeWidth="1.2" />
            <rect x="95" y="110" width="68" height="16" rx="5" fill={gunBody} stroke="#64748b" strokeWidth="1.5" />
            <circle cx="111" cy="118" r="4" fill={gunAccent} />
            <circle cx="125" cy="118" r="4" fill={gunAccent} />
            <circle cx="139" cy="118" r="4" fill={gunAccent} />
            <circle cx="153" cy="118" r="4" fill={gunAccent} />
            <rect x="138" y="125" width="15" height="5" rx="1.5" fill="#0d131f" stroke={gunAccent} strokeWidth="1" />
            <path d="M163 108 L180 112 L180 124 L163 128 Z" fill={gunAccent} />
          </g>
        );

      case 'railgun':
        return (
          <g>
            <rect x="68" y="113" width="31" height="15" rx="2.5" fill={gunBody} stroke="#475569" strokeWidth="1.4" />
            <rect x="103" y="102" width="24" height="7" rx="1.5" fill="#090d16" stroke={gunAccent} strokeWidth="1.2" />
            <path d="M100 125 L109 125 L105 144 L96 144 Z" fill="#090d16" stroke="#475569" strokeWidth="1.1" />
            <rect x="119" y="125" width="16" height="14" rx="2" fill="#0d131f" stroke={gunAccent} strokeWidth="1.2" />
            <rect x="99" y="110" width="88" height="6" rx="1.5" fill="#18202c" stroke="#64748b" strokeWidth="1.3" />
            <rect x="99" y="121" width="88" height="6" rx="1.5" fill="#18202c" stroke="#64748b" strokeWidth="1.3" />
            <line x1="101" y1="118.5" x2="190" y2="118.5" stroke={gunAccent} strokeWidth="3" strokeDasharray="6 2" />
            <rect x="140" y="126" width="16" height="5" rx="1.5" fill="#090d16" stroke={gunAccent} strokeWidth="1" />
          </g>
        );

      case 'cannon':
        return (
          <g>
            <path d="M66 114 L95 112 L95 127 L68 130 Z" fill="#18202c" stroke="#475569" strokeWidth="1.3" />
            <rect x="94" y="108" width="68" height="19" rx="4" fill={gunBody} stroke="#64748b" strokeWidth="1.5" />
            <rect x="104" y="113.5" width="46" height="8" rx="2" fill={gunAccent} opacity="0.92" />
            <path d="M162 106 L186 104 L186 130 L162 128 Z" fill="#090d16" stroke={gunAccent} strokeWidth="1.4" />
            <path d="M100 125 L110 125 L106 144 L96 144 Z" fill="#090d16" stroke="#475569" strokeWidth="1.2" />
            <rect x="118" y="126" width="16" height="14" rx="2" fill="#0d131f" stroke={gunAccent} strokeWidth="1.2" />
            <rect x={supportX - 7} y="124" width="15" height="6" rx="1.5" fill="#090d16" stroke={gunAccent} strokeWidth="1.2" />
          </g>
        );

      case 'scifi':
      default:
        return (
          <g>
            <polygon points="66,117 95,110 95,128 68,131" fill="#090d16" stroke="#475569" strokeWidth="1.3" />
            <polygon points="94,108 168,110 192,118 168,127 94,128" fill={gunBody} stroke="#64748b" strokeWidth="1.5" />
            <polygon points="102,115 164,116 182,118 164,121 102,122" fill={gunAccent} />
            <path d="M100 125 L110 125 L106 144 L96 144 Z" fill="#090d16" stroke="#475569" strokeWidth="1.2" />
            <rect x={supportX - 6} y="125" width="14" height="6" rx="1.5" fill="#090d16" stroke={gunAccent} strokeWidth="1.2" />
          </g>
        );
    }
  };

  // Upgraded Rugged Battle-Worn Helmet, Visor, Ear-Comms & Faceplate per Character Archetype
  const renderHeadgear = (yawPx: number) => {
    const yx = clamp(yawPx, -7, 7);
    if (facingBack) {
      return (
        <g>
          <rect x="90" y="38" width="38" height="39" rx="13" fill={`url(#helmetGrad-${uid})`} stroke={rimColor} strokeWidth="1.8" />
          <rect x="102" y="48" width="14" height="18" rx="3" fill="#090d16" stroke={suitColor} strokeWidth="1.2" />
          <line x1="105" y1="53" x2="113" y2="53" stroke={suitColor} strokeWidth="1.4" />
          <line x1="105" y1="58" x2="113" y2="58" stroke={suitColor} strokeWidth="1.4" />
        </g>
      );
    }

    switch (armorStyle) {
      case 'cyber':
        return (
          <g>
            {/* Armored Carbon Stealth Cowl + Rim Edge + Scuff Mark */}
            <path d="M88 41 Q110 29 132 41 L130 77 L90 77 Z" fill={`url(#helmetGrad-${uid})`} stroke={rimColor} strokeWidth="1.8" />
            <path d="M93 38 Q110 32 127 38" fill="none" stroke="#94a3b8" strokeWidth="1.1" opacity="0.45" />
            <line x1="94" y1="43" x2="100" y2="47" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
            <g transform={`translate(${yx}, 0)`}>
              {/* Armored Rebreather Mask */}
              <path d="M93 61 L127 61 L124 76 L96 76 Z" fill="#090d16" stroke={rimColor} strokeWidth="1.2" />
              <line x1="101" y1="66" x2="119" y2="66" stroke="#475569" strokeWidth="1.2" />
              <line x1="103" y1="70" x2="117" y2="70" stroke="#475569" strokeWidth="1.2" />
              {/* Dual Tactical Crimson Optics */}
              <rect x="95" y="49" width="30" height="9" rx="4" fill="#090d16" stroke={suitColor} strokeWidth="1.2" />
              <circle cx="103" cy="53.5" r="3.4" fill={suitColor} />
              <circle cx="117" cy="53.5" r="3.4" fill={suitColor} />
              <circle cx="102" cy="52.5" r="1.1" fill="#ffffff" opacity="0.9" />
              <circle cx="116" cy="52.5" r="1.1" fill="#ffffff" opacity="0.9" />
            </g>
          </g>
        );

      case 'ranger':
        return (
          <g>
            {/* Olive-Drab Hazmat Field Helmet + Brow Plate + Scuff */}
            <rect x="90" y="38" width="39" height="39" rx="13" fill={`url(#helmetGrad-${uid})`} stroke={rimColor} strokeWidth="1.8" />
            <path d="M95 41 L124 41" stroke="#a3b19b" strokeWidth="1.2" opacity="0.45" />
            <line x1="118" y1="42" x2="124" y2="46" stroke="#a3b19b" strokeWidth="1" opacity="0.55" />
            <g transform={`translate(${yx}, 0)`}>
              {/* Amber Ballistic Visor */}
              <rect x="95" y="47" width="29" height="11.5" rx="4" fill="#18130a" stroke={suitColor} strokeWidth="1.4" />
              <rect x="96.5" y="48.5" width="26" height="8.5" rx="3" fill={suitColor} opacity="0.88" />
              <path d="M98 49.5 L114 49.5 L111 52 L98 52 Z" fill="#ffffff" opacity="0.65" />
              {/* Twin Cheekbone Bio-Filter Canisters */}
              <circle cx="91" cy="69" r="5.5" fill="#0c120e" stroke={rimColor} strokeWidth="1.4" />
              <circle cx="91" cy="69" r="2.2" fill={suitColor} opacity="0.85" />
              <circle cx="128" cy="69" r="5.5" fill="#0c120e" stroke={rimColor} strokeWidth="1.4" />
              <circle cx="128" cy="69" r="2.2" fill={suitColor} opacity="0.85" />
              <rect x="102" y="62.5" width="15" height="13" rx="3" fill="#0c120e" stroke={rimColor} strokeWidth="1.2" />
              <line x1="105" y1="66" x2="114" y2="66" stroke={suitColor} strokeWidth="1.1" opacity="0.8" />
              <line x1="105" y1="70" x2="114" y2="70" stroke="#475569" strokeWidth="1.1" />
            </g>
          </g>
        );

      case 'phantom':
        return (
          <g>
            {/* Deep Navy Spec-Ops Ballistic FAST Helmet + Rim Contour */}
            <path d="M89 53 Q89 35 110 35 Q131 35 131 53 L128 76 L92 76 Z" fill={`url(#helmetGrad-${uid})`} stroke={rimColor} strokeWidth="1.8" />
            <rect x="103" y="36" width="14" height="8" rx="1.5" fill="#090d16" stroke={rimColor} strokeWidth="1.1" />
            <g transform={`translate(${yx}, 0)`}>
              {/* Stealth Balaclava & Armored Jaw Mesh */}
              <rect x="94" y="59" width="32" height="17" rx="4" fill="#090e17" stroke={rimColor} strokeWidth="1.2" />
              <line x1="100" y1="65" x2="120" y2="65" stroke="#334155" strokeWidth="1.2" />
              <line x1="102" y1="70" x2="118" y2="70" stroke="#334155" strokeWidth="1.2" />
              {/* Quad NVG Panoramic Nodes */}
              <rect x="92" y="48" width="36" height="8" rx="3" fill="#090d16" stroke="#334155" strokeWidth="1.1" />
              <circle cx="97" cy="52" r="3.1" fill={suitColor} />
              <circle cx="106" cy="52" r="3.1" fill={suitColor} />
              <circle cx="114" cy="52" r="3.1" fill={suitColor} />
              <circle cx="123" cy="52" r="3.1" fill={suitColor} />
              <circle cx="96.3" cy="51.2" r="1" fill="#ffffff" opacity="0.85" />
              <circle cx="113.3" cy="51.2" r="1" fill="#ffffff" opacity="0.85" />
            </g>
          </g>
        );

      case 'juggernaut':
        return (
          <g>
            {/* Heavy Forged Iron EOD Siege Helmet + Rivets + Battle Scars */}
            <rect x="86" y="35" width="47" height="42" rx="9" fill={`url(#helmetGrad-${uid})`} stroke={rimColor} strokeWidth="2" />
            <circle cx="91" cy="40" r="1.3" fill="#94a3b8" />
            <circle cx="128" cy="40" r="1.3" fill="#94a3b8" />
            <line x1="92" y1="44" x2="99" y2="48" stroke="#a8a29e" strokeWidth="1.1" opacity="0.6" />
            <g transform={`translate(${yx}, 0)`}>
              <rect x="93" y="39" width="33" height="4.5" rx="1.5" fill={suitColor} opacity="0.85" />
              {/* Narrow Armored Blast Slit Visor */}
              <rect x="93" y="49.5" width="34" height="7" rx="2" fill="#090d16" stroke={rimColor} strokeWidth="1.3" />
              <rect x="95" y="51" width="30" height="4" rx="1" fill={suitColor} />
              {/* Heavy Blast Chin Guard */}
              <polygon points="89,61 130,61 126,78 93,78" fill="#14110f" stroke={rimColor} strokeWidth="1.5" />
              <line x1="97" y1="67" x2="122" y2="67" stroke="#57534e" strokeWidth="1.4" />
              <line x1="99" y1="72" x2="120" y2="72" stroke="#57534e" strokeWidth="1.4" />
            </g>
          </g>
        );

      case 'reaper':
        return (
          <g>
            {/* Obsidian Wraith Commander Helm + Angular Crown */}
            <path d="M87 43 L110 32 L133 43 L129 77 L91 77 Z" fill={`url(#helmetGrad-${uid})`} stroke={rimColor} strokeWidth="1.8" />
            <path d="M94 42 L110 35 L126 42" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.4" />
            <g transform={`translate(${yx}, 0)`}>
              {/* Angular Wraith Visor */}
              <polygon points="94,49 110,54 126,49 123,58 110,61 97,58" fill="#090d16" stroke={suitColor} strokeWidth="1.2" />
              <polygon points="96,50.5 110,55 124,50.5 121.5,57 110,59.5 98.5,57" fill={suitColor} opacity="0.9" />
              {/* Skeletal Conduit Respirator Grille */}
              <rect x="98" y="63" width="24" height="12" rx="2.5" fill="#0d0a14" stroke={rimColor} strokeWidth="1.3" />
              <line x1="103" y1="65" x2="103" y2="73" stroke={suitColor} strokeWidth="1.5" />
              <line x1="108" y1="65" x2="108" y2="73" stroke={suitColor} strokeWidth="1.5" />
              <line x1="112" y1="65" x2="112" y2="73" stroke={suitColor} strokeWidth="1.5" />
              <line x1="117" y1="65" x2="117" y2="73" stroke={suitColor} strokeWidth="1.5" />
            </g>
          </g>
        );

      case 'soldier':
      default:
        return (
          <g>
            {/* Weathered Gunmetal Vanguard Helmet + Ear Comms + Rim Highlight */}
            <rect x="90" y="38" width="38" height="39" rx="13" fill={`url(#helmetGrad-${uid})`} stroke={rimColor} strokeWidth="1.8" />
            <rect x="87" y="51" width="4" height="11" rx="1.5" fill="#131b26" stroke={rimColor} strokeWidth="1.1" />
            <rect x="127" y="51" width="4" height="11" rx="1.5" fill="#131b26" stroke={rimColor} strokeWidth="1.1" />
            <path d="M98 38 L120 38 L117 44.5 L101 44.5 Z" fill={suitColor} opacity="0.78" />
            <line x1="93" y1="44" x2="99" y2="47" stroke="#94a3b8" strokeWidth="1" opacity="0.55" />
            <g transform={`translate(${yx}, 0)`}>
              {/* Gunmetal Faceplate & Vents */}
              <path d="M94 62 L124 62 L120 76 L98 76 Z" fill="#0d131d" stroke={rimColor} strokeWidth="1.3" />
              <line x1="103" y1="66.5" x2="115" y2="66.5" stroke={suitColor} strokeWidth="1.2" opacity="0.85" />
              <line x1="104" y1="70.5" x2="114" y2="70.5" stroke="#64748b" strokeWidth="1.2" />
              {/* Tactical Ballistic Visor */}
              <rect x="94.5" y="48" width="29" height="10" rx="3.5" fill="#090d16" stroke={rimColor} strokeWidth="1.2" />
              <rect x="96" y="49.2" width="26" height="7.6" rx="2.5" fill={suitColor} opacity="0.9" />
              <path d="M98 50.2 L113 50.2 L110 52.4 L98 52.4 Z" fill="#ffffff" opacity="0.75" />
            </g>
          </g>
        );
    }
  };

  // Multi-joint leg polygons connecting moving pelvis hip-sockets to knees and down to grounded boots
  const lHipX = 95 + hipDx;
  const lHipY = 145 + hipDy;
  const rHipX = 123 + hipDx;
  const rHipY = 145 + hipDy;

  const lAnkleX = 91 + leftFootDx;
  const lAnkleY = 195 + leftFootDy;
  const rAnkleX = 127 + rightFootDx;
  const rAnkleY = 195 + rightFootDy;

  const lKneeX = (lHipX + lAnkleX) * 0.5 + leftKneeDx;
  const lKneeY = (lHipY + lAnkleY) * 0.5;
  const rKneeX = (rHipX + rAnkleX) * 0.5 + rightKneeDx;
  const rKneeY = (rHipY + rAnkleY) * 0.5;

  // Tight, animation-safe SVG viewBox so the character body fills the frame without wasted margin
  const svgViewBox = compact
    ? '28 18 176 210'
    : isPlayingEmote
    ? '26 12 182 216'
    : '34 20 174 208';

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Controlled Rim Backlight behind character so dark silhouette separates from dark background */}
      {!compact && (
        <div
          className={`absolute rounded-full pointer-events-none blur-2xl transition-colors duration-300 ${
            showcaseMode ? 'w-60 h-60 sm:w-72 sm:h-72 opacity-25' : 'w-48 h-48 sm:w-52 sm:h-52 opacity-18'
          }`}
          style={{ background: `radial-gradient(circle, ${suitColor} 0%, transparent 72%)` }}
        />
      )}

      <svg
        viewBox={svgViewBox}
        preserveAspectRatio="xMidYMid meet"
        className={
          compact
            ? 'w-20 h-20 overflow-visible'
            : showcaseMode
            ? 'w-[min(78vw,300px)] h-[min(42dvh,320px)] sm:w-[320px] sm:h-[min(46dvh,350px)] md:w-[350px] md:h-[min(50dvh,380px)] overflow-visible drop-shadow-[0_18px_32px_rgba(0,0,0,0.94)]'
            : 'w-[214px] h-[256px] sm:w-[228px] sm:h-[272px] max-h-[44dvh] overflow-visible drop-shadow-[0_14px_26px_rgba(0,0,0,0.92)]'
        }
      >
        <defs>
          <linearGradient id={`platformGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#080c14" />
            <stop offset="50%" stopColor="#1e2b3f" />
            <stop offset="100%" stopColor="#080c14" />
          </linearGradient>
          <linearGradient id={`helmetGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={armorPrimary} />
            <stop offset="55%" stopColor={armorSecondary} />
            <stop offset="100%" stopColor="#070a10" />
          </linearGradient>
          <linearGradient id={`armorBodyGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={armorPrimary} />
            <stop offset="52%" stopColor={armorSecondary} />
            <stop offset="100%" stopColor="#070a11" />
          </linearGradient>
          <linearGradient id={`limbFabricGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={fabricColor} />
            <stop offset="65%" stopColor={armorSecondary} />
            <stop offset="100%" stopColor="#080c14" />
          </linearGradient>
          <linearGradient id={`bootArmorGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1b2434" />
            <stop offset="55%" stopColor="#0c111b" />
            <stop offset="100%" stopColor="#06080e" />
          </linearGradient>
          <linearGradient id={`gunMetalGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#47566e" />
            <stop offset="55%" stopColor="#1c2536" />
            <stop offset="100%" stopColor="#0b101b" />
          </linearGradient>
        </defs>

        {/* ========== 1. DARK METALLIC TACTICAL STANDING BASE ========== */}
        <ellipse
          cx="110"
          cy="214"
          rx="64"
          ry="10.5"
          fill={`url(#platformGrad-${uid})`}
          stroke="#334763"
          strokeWidth="1.6"
        />
        <ellipse
          cx="110"
          cy="214"
          rx="48"
          ry="5.5"
          fill="none"
          stroke={suitColor}
          strokeWidth="1"
          strokeDasharray="6 4"
          opacity="0.48"
        />
        <ellipse cx={110 + hipDx * 0.4} cy="212" rx="36" ry="4.5" fill="rgba(0,0,0,0.82)" />

        {/* Emote Shockwave Ring on Platform (e.g. Siege Celebration stomp) */}
        {isPlayingEmote && emoteKinematics && emoteKinematics.shockwaveAlpha > 0.02 && (
          <ellipse
            cx="110"
            cy="213"
            rx={emoteKinematics.shockwaveRadius}
            ry={emoteKinematics.shockwaveRadius * 0.22}
            fill="none"
            stroke={suitColor}
            strokeWidth="2.2"
            opacity={emoteKinematics.shockwaveAlpha}
          />
        )}

        {/* ========== 2. SLUNG WEAPON BEHIND TORSO (DURING TWO-HANDED EMOTE DANCES) ========== */}
        {isWeaponOnBackSling && (
          <g
            transform={`translate(${torsoDx - 12}, ${torsoDy - 22}) rotate(-44 110 118) scale(0.9)`}
            opacity="0.95"
          >
            <line x1="86" y1="95" x2="136" y2="138" stroke="#334155" strokeWidth="3" />
            {renderEquippedGun()}
          </g>
        )}

        {/* ========== 3. MULTI-JOINT ARTICULATED LEGS, KNEES & PLANTED BOOTS ========== */}
        {/* Left Thigh & Shin with Multi-Stop Fabric Gradient, Cloth Folds & Cargo Pocket */}
        <polygon
          points={`${lHipX - 8.5},${lHipY} ${lHipX + 8.5},${lHipY} ${lKneeX + 7.5},${lKneeY} ${lKneeX - 7.5},${lKneeY}`}
          fill={`url(#limbFabricGrad-${uid})`}
          stroke={rimColor}
          strokeWidth="1.4"
        />
        {/* Left Thigh Cargo Pocket & Cloth Crease */}
        <rect
          x={lHipX - 7.5}
          y={lHipY + 6}
          width="6"
          height="11"
          rx="1.2"
          fill="#0c121e"
          stroke="#3b4f6b"
          strokeWidth="0.9"
        />
        <line
          x1={lHipX - 2}
          y1={lHipY + 6}
          x2={lKneeX - 1}
          y2={lKneeY - 5}
          stroke="#475569"
          strokeWidth="1"
          opacity="0.55"
        />
        <polygon
          points={`${lKneeX - 7.5},${lKneeY - 1} ${lKneeX + 7.5},${lKneeY - 1} ${lAnkleX + 8},${lAnkleY} ${lAnkleX - 8},${lAnkleY}`}
          fill={`url(#helmetGrad-${uid})`}
          stroke={rimColor}
          strokeWidth="1.4"
        />
        {/* Left Shin Guard Ridge */}
        <line
          x1={lKneeX}
          y1={lKneeY + 5}
          x2={lAnkleX}
          y2={lAnkleY - 3}
          stroke="#64748b"
          strokeWidth="1.1"
          opacity="0.5"
        />

        {/* Right Thigh & Shin with Tactical Drop-Leg Holster Rig */}
        <polygon
          points={`${rHipX - 8.5},${rHipY} ${rHipX + 8.5},${rHipY} ${rKneeX + 7.5},${rKneeY} ${rKneeX - 7.5},${rKneeY}`}
          fill={`url(#limbFabricGrad-${uid})`}
          stroke={rimColor}
          strokeWidth="1.4"
        />
        <polygon
          points={`${rKneeX - 7.5},${rKneeY - 1} ${rKneeX + 7.5},${rKneeY - 1} ${lAnkleX ? rAnkleX + 8 : 135},${rAnkleY} ${rAnkleX - 8},${rAnkleY}`}
          fill={`url(#helmetGrad-${uid})`}
          stroke={rimColor}
          strokeWidth="1.4"
        />
        {/* Right Shin Guard Ridge */}
        <line
          x1={rKneeX}
          y1={rKneeY + 5}
          x2={rAnkleX}
          y2={rAnkleY - 3}
          stroke="#64748b"
          strokeWidth="1.1"
          opacity="0.5"
        />
        {/* Thigh Holster Strap & Sidearm Pouch */}
        <line x1={rHipX - 8} y1={rHipY + 11} x2={rHipX + 8.5} y2={rHipY + 11} stroke="#070a10" strokeWidth="2.4" />
        <rect
          x={rHipX - 5}
          y={rHipY + 5.5}
          width="14.5"
          height="11"
          rx="2"
          fill="#0b101b"
          stroke={rimColor}
          strokeWidth="1.2"
        />
        <line x1={rHipX - 2.5} y1={rHipY + 8.5} x2={rHipX + 6.5} y2={rHipY + 8.5} stroke={suitColor} strokeWidth="1" opacity="0.7" />

        {/* Beveled Rugged Knee Pads + Rivets */}
        <polygon
          points={`${lKneeX - 8},${lKneeY - 5.5} ${lKneeX + 8},${lKneeY - 5.5} ${lKneeX + 6.5},${lKneeY + 6} ${lKneeX - 6.5},${lKneeY + 6}`}
          fill="#0b101b"
          stroke={rimColor}
          strokeWidth="1.4"
        />
        <line x1={lKneeX - 5} y1={lKneeY - 2} x2={lKneeX + 5} y2={lKneeY - 2} stroke={suitColor} strokeWidth="1.3" opacity="0.88" />
        <line x1={lKneeX - 3.5} y1={lKneeY + 2} x2={lKneeX + 3.5} y2={lKneeY + 2} stroke="#64748b" strokeWidth="1" />

        <polygon
          points={`${rKneeX - 8},${rKneeY - 5.5} ${rKneeX + 8},${rKneeY - 5.5} ${rKneeX + 6.5},${rKneeY + 6} ${rKneeX - 6.5},${rKneeY + 6}`}
          fill="#0b101b"
          stroke={rimColor}
          strokeWidth="1.4"
        />
        <line x1={rKneeX - 5} y1={rKneeY - 2} x2={rKneeX + 5} y2={rKneeY - 2} stroke={suitColor} strokeWidth="1.3" opacity="0.88" />
        <line x1={rKneeX - 3.5} y1={rKneeY + 2} x2={rKneeX + 3.5} y2={rKneeY + 2} stroke="#64748b" strokeWidth="1" />

        {/* Heavy Reinforced Combat Boots (Grounded on Deck y <= 212) */}
        <g transform={`translate(${leftFootDx}, ${leftFootDy})`}>
          <path d="M80 194 L103 194 L105 212 L77 212 Z" fill={`url(#bootArmorGrad-${uid})`} stroke={rimColor} strokeWidth="1.5" />
          <path d="M78 204 L104 204 L105 211 L77 211 Z" fill="#162032" />
          <line x1="82" y1="198.5" x2="100" y2="198.5" stroke="#64748b" strokeWidth="1.3" />
          <line x1="83" y1="201.5" x2="99" y2="201.5" stroke="#475569" strokeWidth="1.1" />
          <rect x="77.5" y="209.2" width="27.5" height="2.4" rx="1" fill={suitColor} opacity="0.82" />
        </g>
        <g transform={`translate(${rightFootDx}, ${rightFootDy})`}>
          <path d="M116 194 L139 194 L144 212 L115 212 Z" fill={`url(#bootArmorGrad-${uid})`} stroke={rimColor} strokeWidth="1.5" />
          <path d="M116 204 L143 204 L144 211 L115 211 Z" fill="#162032" />
          <line x1="119" y1="198.5" x2="137" y2="198.5" stroke="#64748b" strokeWidth="1.3" />
          <line x1="120" y1="201.5" x2="136" y2="201.5" stroke="#475569" strokeWidth="1.1" />
          <rect x="115" y="209.2" width="29" height="2.4" rx="1" fill={suitColor} opacity="0.82" />
        </g>

        {/* ========== 4. ARTICULATED UPPER BODY, TORSO, HEAD & ARMS ========== */}
        <g
          transform={`translate(${torsoDx}, ${torsoDy}) translate(110, 140) rotate(${torsoTiltDeg}) scale(${torsoScaleX}, 1) translate(-110, -140)`}
        >
          {/* Utility Belt & Tactical Ammo Mag Pouches */}
          <rect x="83" y="139" width="52" height="10" rx="2.5" fill="#090d15" stroke={rimColor} strokeWidth="1.4" />
          <rect x="85.5" y="137" width="11.5" height="13" rx="1.5" fill={armorPrimary} stroke={rimColor} strokeWidth="1.2" />
          <line x1="87" y1="141" x2="95.5" y2="141" stroke="#090d15" strokeWidth="1.3" />
          <rect x="103" y="139.5" width="12" height="8.5" rx="1.5" fill="#141c2b" stroke={suitColor} strokeWidth="1.3" />
          <circle cx="109" cy="143.7" r="1.4" fill={suitColor} />
          <rect x="121" y="137" width="11.5" height="13" rx="1.5" fill={armorPrimary} stroke={rimColor} strokeWidth="1.2" />
          <line x1="122.5" y1="141" x2="131" y2="141" stroke="#090d15" strokeWidth="1.3" />

          {/* Armored Torso & Battle-Worn Plate Carrier */}
          <path
            d="M78 84 L140 84 L134 140 L84 140 Z"
            fill={`url(#armorBodyGrad-${uid})`}
            stroke={rimColor}
            strokeWidth="1.8"
          />
          {/* Subtle Top Rim Highlight on Chest Armor */}
          <line x1="81" y1="85.5" x2="137" y2="85.5" stroke="#e2e8f0" strokeWidth="1.1" opacity="0.42" />
          {/* Side Rib Armor Segments */}
          <line x1="82" y1="108" x2="88" y2="110" stroke={rimColor} strokeWidth="1.2" opacity="0.7" />
          <line x1="83" y1="116" x2="89" y2="118" stroke={rimColor} strokeWidth="1.2" opacity="0.7" />
          <line x1="136" y1="108" x2="130" y2="110" stroke={rimColor} strokeWidth="1.2" opacity="0.7" />
          <line x1="135" y1="116" x2="129" y2="118" stroke={rimColor} strokeWidth="1.2" opacity="0.7" />

          {/* Diagonal Tactical Sling Strap across chest */}
          <line x1="88" y1="86" x2="128" y2="136" stroke="#080b12" strokeWidth="4" />
          {/* Shoulder Harness Straps & Comm Radio Pack */}
          <path d="M86 84 L92 118 L86 118 L81 84 Z" fill="#0b101b" stroke="#475569" strokeWidth="0.9" />
          <path d="M132 84 L126 118 L132 118 L137 84 Z" fill="#0b101b" stroke="#475559" strokeWidth="0.9" />
          <rect x="84.5" y="92" width="5.5" height="9" rx="1" fill="#141e30" stroke={suitColor} strokeWidth="0.9" />

          {/* Center Ballistic Plate + MOLLE Webbing + Battle Scuffs + Rivets */}
          <polygon
            points="88,91 130,91 126,126 92,126"
            fill="#0b101b"
            stroke={rimColor}
            strokeWidth="1.4"
          />
          <circle cx="91.5" cy="94.5" r="1.2" fill="#94a3b8" />
          <circle cx="126.5" cy="94.5" r="1.2" fill="#94a3b8" />
          <circle cx="94.5" cy="122.5" r="1.1" fill="#64748b" />
          <circle cx="123.5" cy="122.5" r="1.1" fill="#64748b" />
          {/* Battle Scuff / Scratch marks on chest plate */}
          <line x1="93" y1="111" x2="101" y2="116" stroke="#cbd5e1" strokeWidth="1.1" opacity="0.55" />
          <line x1="95" y1="114.5" x2="100" y2="118" stroke="#94a3b8" strokeWidth="0.9" opacity="0.45" />
          {/* MOLLE Webbing Strips */}
          <line x1="95" y1="114" x2="123" y2="114" stroke="#26354d" strokeWidth="2" strokeDasharray="5 3" />
          <line x1="96" y1="120" x2="122" y2="120" stroke="#26354d" strokeWidth="2" strokeDasharray="5 3" />
          {/* Core Tactical Emblem */}
          <polygon
            points="102,97.5 116,97.5 113,108.5 105,108.5"
            fill={suitColor}
            stroke="#090d16"
            strokeWidth="0.8"
            opacity="0.92"
          />

          {/* Left & Right Rugged Shoulder Pauldrons with Scuff Marks & Rim Lighting */}
          <path
            d={
              armorStyle === 'juggernaut'
                ? 'M62 82 Q74 70 92 82 L88 109 L64 105 Z'
                : 'M67 85 Q75 75 90 83 L86 106 L68 102 Z'
            }
            fill={`url(#helmetGrad-${uid})`}
            stroke={rimColor}
            strokeWidth="1.7"
          />
          <line x1="71" y1="90" x2="83" y2="92" stroke={suitColor} strokeWidth="1.5" opacity="0.88" />
          <line x1="72" y1="95" x2="79" y2="99" stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />

          <path
            d={
              armorStyle === 'juggernaut'
                ? 'M126 82 Q144 70 156 82 L154 105 L130 109 Z'
                : 'M128 83 Q143 75 151 85 L150 102 L132 106 Z'
            }
            fill={`url(#helmetGrad-${uid})`}
            stroke={rimColor}
            strokeWidth="1.7"
          />
          <line x1="135" y1="92" x2="147" y2="90" stroke={suitColor} strokeWidth="1.5" opacity="0.88" />
          <line x1="139" y1="95" x2="146" y2="99" stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />

          {/* Neck & Armored Gorget Collar */}
          <rect x="101" y="73" width="16" height="12" rx="2" fill={skinColor} />
          <path d="M90 80 L128 80 L131 89 L87 89 Z" fill="#090d16" stroke={rimColor} strokeWidth="1.4" />
          <line x1="96" y1="84.5" x2="122" y2="84.5" stroke={suitColor} strokeWidth="1.3" opacity="0.88" />

          {/* ========== 5. ARTICULATED HEAD & HELMET ========== */}
          <g transform={`translate(0, ${headDy}) rotate(${headTiltDeg} 110 74)`}>
            {renderHeadgear(headYawPx)}
          </g>

          {/* ========== 6. ARMS & WEAPON CARRIAGE (IDLE TWO-HANDED GRIP vs EMOTE FREE-ARM RIG) ========== */}
          {!isWeaponOnBackSling ? (
            <>
              {/* A. Left Support Arm dynamically linked to the transformed weapon foregrip */}
              <polygon
                points={`136,96 149,112 ${leftForegripWorld.x + 5},${leftForegripWorld.y + 4} ${leftForegripWorld.x - 6},${leftForegripWorld.y} 139,110 131,96`}
                fill={`url(#limbFabricGrad-${uid})`}
                stroke={rimColor}
                strokeWidth="1.5"
              />
              <line
                x1="143"
                y1="112"
                x2={leftForegripWorld.x - 1}
                y2={leftForegripWorld.y - 1}
                stroke={suitColor}
                strokeWidth="1.3"
                opacity="0.8"
              />

              {/* B. Right Trigger Arm dynamically linked to the transformed weapon pistol grip */}
              <polygon
                points={`71,96 84,96 91,${119 + gunDy * 0.6} ${rightGripWorld.x + 2},${rightGripWorld.y - 3} ${rightGripWorld.x - 1},${rightGripWorld.y + 6} 78,${129 + gunDy * 0.6}`}
                fill={`url(#limbFabricGrad-${uid})`}
                stroke={rimColor}
                strokeWidth="1.5"
              />
              {/* Right Elbow Pad */}
              <circle
                cx="80"
                cy={124 + gunDy * 0.5}
                r="4.6"
                fill="#0b101b"
                stroke={rimColor}
                strokeWidth="1.4"
              />

              {/* C. Unified Weapon + Two-Handed Articulated Gloves Group (Hands 100% locked to gun!) */}
              <g
                transform={`translate(${gunDx}, ${gunDy}) rotate(${gunAngleDeg} ${gunPivotX} ${gunPivotY})`}
              >
                {renderEquippedGun()}

                {/* Right Trigger Hand Wrapped Around Pistol Grip + Hard-Knuckle Plate & Trigger Finger */}
                <g>
                  <rect
                    x="98"
                    y="124"
                    width="12"
                    height="12"
                    rx="3"
                    fill="#0b101b"
                    stroke={rimColor}
                    strokeWidth="1.4"
                  />
                  <line x1="100" y1="127" x2="108" y2="127" stroke={suitColor} strokeWidth="1.1" opacity="0.85" />
                  <path d="M100 124 L108 122 L109 125.5 L101 127 Z" fill={skinColor} />
                  <rect x="109" y="126.5" width="6.5" height="3" rx="1.2" fill={skinColor} />
                  <rect x="106" y="130" width="4.5" height="2.5" rx="1" fill="#475569" />
                  <rect x="105.5" y="133" width="4.5" height="2.5" rx="1" fill="#475569" />
                </g>

                {/* Left Support Hand Cupping & Wrapping the Foregrip / Handguard */}
                <g>
                  <rect
                    x={supportX - 7}
                    y="120"
                    width="14"
                    height="11"
                    rx="3"
                    fill="#0b101b"
                    stroke={rimColor}
                    strokeWidth="1.4"
                  />
                  <line
                    x1={supportX - 5}
                    y1="129"
                    x2={supportX + 5}
                    y2="129"
                    stroke={suitColor}
                    strokeWidth="1.1"
                    opacity="0.85"
                  />
                  <rect
                    x={supportX - 5}
                    y="118.5"
                    width="8"
                    height="3"
                    rx="1.2"
                    fill={skinColor}
                  />
                  <rect x={supportX - 4} y="122.5" width="2.5" height="6.5" rx="1" fill={skinColor} />
                  <rect x={supportX - 0.5} y="122.5" width="2.5" height="6.5" rx="1" fill={skinColor} />
                  <rect x={supportX + 3} y="122.5" width="2.5" height="6.5" rx="1" fill={skinColor} />
                </g>
              </g>
            </>
          ) : (
            /* Free-Arm Choreographed Dance Rig (When Weapon is Slung on Back) */
            emoteKinematics && (
              <g>
                {/* Right Arm (Upper Arm + Forearm + Articulated Tactical Fist) */}
                <line
                  x1="77"
                  y1="95"
                  x2={emoteKinematics.rightElbow.x}
                  y2={emoteKinematics.rightElbow.y}
                  stroke={fabricColor}
                  strokeWidth="11.5"
                  strokeLinecap="round"
                />
                <line
                  x1="77"
                  y1="95"
                  x2={emoteKinematics.rightElbow.x}
                  y2={emoteKinematics.rightElbow.y}
                  stroke={rimColor}
                  strokeWidth="1.4"
                />
                <line
                  x1={emoteKinematics.rightElbow.x}
                  y1={emoteKinematics.rightElbow.y}
                  x2={emoteKinematics.rightWrist.x}
                  y2={emoteKinematics.rightWrist.y}
                  stroke={armorSecondary}
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <circle
                  cx={emoteKinematics.rightElbow.x}
                  cy={emoteKinematics.rightElbow.y}
                  r="4.5"
                  fill="#0b101b"
                  stroke={rimColor}
                  strokeWidth="1.4"
                />
                <rect
                  x={emoteKinematics.rightWrist.x - 6.5}
                  y={emoteKinematics.rightWrist.y - 6.5}
                  width="13"
                  height="13"
                  rx="3.5"
                  fill="#0b101b"
                  stroke={suitColor}
                  strokeWidth="1.4"
                />
                <rect
                  x={emoteKinematics.rightWrist.x - 3.5}
                  y={emoteKinematics.rightWrist.y - 3.5}
                  width="7"
                  height="4"
                  rx="1.2"
                  fill={skinColor}
                />

                {/* Left Arm (Upper Arm + Forearm + Articulated Tactical Fist) */}
                <line
                  x1="141"
                  y1="95"
                  x2={emoteKinematics.leftElbow.x}
                  y2={emoteKinematics.leftElbow.y}
                  stroke={fabricColor}
                  strokeWidth="11.5"
                  strokeLinecap="round"
                />
                <line
                  x1="141"
                  y1="95"
                  x2={emoteKinematics.leftElbow.x}
                  y2={emoteKinematics.leftElbow.y}
                  stroke={rimColor}
                  strokeWidth="1.4"
                />
                <line
                  x1={emoteKinematics.leftElbow.x}
                  y1={emoteKinematics.leftElbow.y}
                  x2={emoteKinematics.leftWrist.x}
                  y2={emoteKinematics.leftWrist.y}
                  stroke={armorSecondary}
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <circle
                  cx={emoteKinematics.leftElbow.x}
                  cy={emoteKinematics.leftElbow.y}
                  r="4.5"
                  fill="#0b101b"
                  stroke={rimColor}
                  strokeWidth="1.4"
                />
                <rect
                  x={emoteKinematics.leftWrist.x - 6.5}
                  y={emoteKinematics.leftWrist.y - 6.5}
                  width="13"
                  height="13"
                  rx="3.5"
                  fill="#0b101b"
                  stroke={suitColor}
                  strokeWidth="1.4"
                />
                <rect
                  x={emoteKinematics.leftWrist.x - 3.5}
                  y={emoteKinematics.leftWrist.y - 3.5}
                  width="7"
                  height="4"
                  rx="1.2"
                  fill={skinColor}
                />
              </g>
            )
          )}
        </g>
      </svg>

      {/* Optional subtle pose/emote status pill when requested */}
      {showPoseIndicator && !compact && (
        <div className="mt-0.5 text-[10px] font-mono tracking-wider uppercase text-slate-400">
          {isPlayingEmote ? `★ EMOTE ACTIVE` : idleRig.label}
        </div>
      )}
    </div>
  );
};
