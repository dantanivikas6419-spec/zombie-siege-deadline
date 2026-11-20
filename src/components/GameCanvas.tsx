import React, { useRef, useEffect } from 'react';
import {
  Structure,
  Zombie,
  TNTBarrel,
  Bullet,
  Particle,
  FloatingText,
  Player,
  Language,
  TrajectoryPoint,
  GunItem,
  EnemyProjectile,
  TapReticle
} from '../types/game';
import { generateLevel } from '../utils/levels';
import { PRO_CHARACTERS, PRO_GUNS } from '../utils/proShopData';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  currentLevel: number;
  activeChar: string;
  activeGun: string;
  lang: Language;
  particlesEnabled?: boolean;
  reloadTrigger?: number;
  onZombiesChange: (remaining: number) => void;
  onAmmoChange: (ammo: number) => void;
  onAmmoStateChange?: (magAmmo: number, totalAmmo: number, isReloading: boolean) => void;
  onAimStateChange?: (isAiming: boolean, isCancelZone: boolean) => void;
  onPlayerHpChange?: (hp: number, maxHp: number) => void;
  onScoreEarned: (score: number) => void;
  onLevelCleared: (remainingAmmo: number, combatCoins: number) => void;
  onGameOver: (reason?: string) => void;
  isPaused: boolean;
}

const SHOULDER_OFFSET_Y = 45;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentLevel,
  activeChar,
  activeGun,
  lang,
  particlesEnabled = true,
  reloadTrigger = 0,
  onZombiesChange,
  onAmmoChange,
  onAmmoStateChange,
  onAimStateChange,
  onPlayerHpChange,
  onScoreEarned,
  onLevelCleared,
  onGameOver,
  isPaused
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const decalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerAngleRef = useRef<number>(-Math.PI / 6);
  const manualReloadRef = useRef<() => void>(() => {});

  const propsRef = useRef({
    currentLevel,
    activeChar,
    activeGun,
    lang,
    isPaused,
    particlesEnabled,
    onZombiesChange,
    onAmmoChange,
    onAmmoStateChange,
    onAimStateChange,
    onPlayerHpChange,
    onScoreEarned,
    onLevelCleared,
    onGameOver
  });

  useEffect(() => {
    propsRef.current = {
      currentLevel,
      activeChar,
      activeGun,
      lang,
      isPaused,
      particlesEnabled,
      onZombiesChange,
      onAmmoChange,
      onAmmoStateChange,
      onAimStateChange,
      onPlayerHpChange,
      onScoreEarned,
      onLevelCleared,
      onGameOver
    };
  }, [
    currentLevel,
    activeChar,
    activeGun,
    lang,
    isPaused,
    particlesEnabled,
    onZombiesChange,
    onAmmoChange,
    onAmmoStateChange,
    onAimStateChange,
    onPlayerHpChange,
    onScoreEarned,
    onLevelCleared,
    onGameOver
  ]);

  useEffect(() => {
    if (reloadTrigger > 0) {
      manualReloadRef.current();
    }
  }, [reloadTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 600;
    const H = 600;

    // Cancel Zone Box geometry at bottom center of battlefield
    const CANCEL_BOX_W = 290;
    const CANCEL_BOX_H = 46;
    const CANCEL_BOX_X = (W - CANCEL_BOX_W) / 2;
    const CANCEL_BOX_Y = H - CANCEL_BOX_H - 10;

    const decalCanvas = document.createElement('canvas');
    decalCanvas.width = W;
    decalCanvas.height = H;
    const decalCtx = decalCanvas.getContext('2d');
    decalCanvasRef.current = decalCanvas;

    const levelData = generateLevel(propsRef.current.currentLevel);

    const charItem = PRO_CHARACTERS.find(c => c.id === propsRef.current.activeChar) || PRO_CHARACTERS[0];
    const gunItem: GunItem = PRO_GUNS.find(g => g.id === propsRef.current.activeGun) || PRO_GUNS[0];

    const structures: Structure[] = JSON.parse(JSON.stringify(levelData.structures));
    const zombies: Zombie[] = JSON.parse(JSON.stringify(levelData.zombies));
    const pendingReinforcements: Zombie[] = levelData.waveReinforcements
      ? JSON.parse(JSON.stringify(levelData.waveReinforcements))
      : [];
    let waveSpawned = pendingReinforcements.length === 0;
    const tntBarrels: TNTBarrel[] = JSON.parse(JSON.stringify(levelData.tntBarrels));
    const rewardedZombieIds = new Set<number>();
    let missionCombatCoins = 0;
    let victoryDispatched = false;

    const bullets: Bullet[] = [];
    const enemyProjectiles: EnemyProjectile[] = [];
    const tapReticles: TapReticle[] = [];
    const particles: Particle[] = [];
    const floatingTexts: FloatingText[] = [];

    // Respect level-calibrated ammo budget while capping reserve bonus at +1 round
    const gunExtraAmmo = Math.min(1, Math.max(0, gunItem.ammo - 6));
    let totalAmmo = levelData.ammo + gunExtraAmmo;
    let magAmmo = Math.min(gunItem.magSize || 3, totalAmmo);
    let isReloading = false;
    let reloadEndTime = 0;
    const reloadDurationMs = Math.max(600, Math.round((gunItem.reloadTime || 1.1) * 1000));

    let lastShotTime = 0;
    const shotCooldownMs = Math.max(90, Math.round(520 / (gunItem.fireRate || 2.5)));

    // Hold-to-Aim & Cancel State
    let isAiming = false;
    let isInCancelZone = false;
    let activePointerId: number | null = null;
    let aimTargetX = W / 2;
    let aimTargetY = H / 2;

    let roundEnded = false;
    let pendingExplosions = 0;
    let animationFrameId: number;
    let frameCount = 0;
    const activeTimeouts: number[] = [];

    const defaultAngle = typeof levelData.initialAngle === 'number'
      ? levelData.initialAngle
      : (levelData.playerPos.x > W / 2 ? -Math.PI + 0.3 : -Math.PI / 6);
    playerAngleRef.current = defaultAngle;

    const player: Player = {
      x: levelData.playerPos.x,
      y: levelData.playerPos.y,
      vy: 0,
      angle: playerAngleRef.current,
      hp: 3,
      maxHp: 3,
      hitTimer: 0,
      isGrounded: true,
      isFalling: false,
      fallStartY: levelData.playerPos.y,
      alive: true,
      deathAngle: 0
    };

    const syncAmmoUI = () => {
      propsRef.current.onAmmoChange(totalAmmo);
      propsRef.current.onAmmoStateChange?.(magAmmo, totalAmmo, isReloading);
    };

    const syncPlayerHpUI = () => {
      propsRef.current.onPlayerHpChange?.(player.hp, player.maxHp);
    };

    const startReload = () => {
      if (isReloading || roundEnded || !player.alive) return;
      if (magAmmo >= (gunItem.magSize || 3) || totalAmmo <= 0 || magAmmo >= totalAmmo) return;
      isReloading = true;
      reloadEndTime = performance.now() + reloadDurationMs;
      sound.playReload();
      addFloatingText('RELOADING...', player.x, player.y - 78, '#38bdf8');
      syncAmmoUI();
    };

    manualReloadRef.current = startReload;

    const getTotalRemainingZombies = () =>
      zombies.filter(z => z.alive).length + (waveSpawned ? 0 : pendingReinforcements.length);

    syncAmmoUI();
    syncPlayerHpUI();
    propsRef.current.onZombiesChange(getTotalRemainingZombies());

    function getMuzzlePosition(angle: number): { x: number; y: number } {
      const shoulderX = player.x;
      const shoulderY = player.y - SHOULDER_OFFSET_Y;
      const barrelLen = gunItem.barrelLength || 36;
      return {
        x: shoulderX + Math.cos(angle) * barrelLen,
        y: shoulderY + Math.sin(angle) * barrelLen
      };
    }

    function spawnParticles(
      x: number,
      y: number,
      color: string,
      count: number = 8,
      speedMul: number = 1,
      isGravity: boolean = true
    ) {
      if (propsRef.current.particlesEnabled === false) return;
      if (particles.length > 110) {
        particles.splice(0, count);
      }
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = (Math.random() * 3 + 1.2) * speedMul;
        particles.push({
          x,
          y,
          dx: Math.cos(angle) * spd,
          dy: Math.sin(angle) * spd,
          size: Math.random() * 2.5 + 1.5,
          color,
          life: 0,
          maxLife: Math.random() * 18 + 14,
          gravity: isGravity ? 0.14 : 0
        });
      }
    }

    function addFloatingText(text: string, x: number, y: number, color: string = '#ffff00') {
      floatingTexts.push({
        id: Math.random(),
        text,
        x: Math.max(55, Math.min(W - 55, x)),
        y: Math.max(35, y),
        color,
        alpha: 1,
        dy: -1.0
      });
    }

    // Line-of-sight check: returns false if a solid stone/metal wall blocks the segment (x1,y1)->(x2,y2)
    function hasClearLineOfSight(x1: number, y1: number, x2: number, y2: number): boolean {
      const dist = Math.hypot(x2 - x1, y2 - y1);
      if (dist < 8) return true;
      const steps = Math.min(40, Math.max(6, Math.ceil(dist / 12)));
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const px = x1 + (x2 - x1) * t;
        const py = y1 + (y2 - y1) * t;
        for (let sIdx = 4; sIdx < structures.length; sIdx++) {
          const s = structures[sIdx];
          if (s.broken || s.type === 'ice' || s.type === 'hazard' || s.type === 'platform') continue;
          if (px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h) {
            return false;
          }
        }
      }
      return true;
    }

    const cancelActiveAimWithoutFiring = (showNoticeText: boolean = false) => {
      if (!isAiming) return;
      isAiming = false;
      isInCancelZone = false;
      activePointerId = null;
      propsRef.current.onAimStateChange?.(false, false);
      if (showNoticeText) {
        addFloatingText('✖ SHOT CANCELLED', player.x, player.y - 78, '#ff3366');
      }
    };

    // Unified Player Damage & Death Handler
    function damagePlayer(dmg: number, reasonText: string) {
      if (!player.alive || roundEnded) return;
      player.hp = Math.max(0, player.hp - dmg);
      player.hitTimer = 18;
      syncPlayerHpUI();
      sound.playPlayerHurt();
      spawnParticles(player.x, player.y - 36, '#ff3366', 14, 1.5);

      if (player.hp <= 0) {
        killPlayer(reasonText);
      } else {
        addFloatingText(`-${dmg} HP (${player.hp}/${player.maxHp})`, player.x, player.y - 76, '#fb7185');
      }
    }

    function killPlayer(reasonText: string) {
      if (!player.alive) return;
      player.alive = false;
      player.hp = 0;
      player.isFalling = false;
      player.deathAngle = (Math.cos(player.angle) >= 0 ? -1 : 1) * (Math.PI / 2.05);
      syncPlayerHpUI();

      // Immediately stop any active aiming/firing and clear enemy targeting
      cancelActiveAimWithoutFiring(false);
      isReloading = false;
      zombies.forEach(z => {
        if (z.alive && z.animState === 'attack') {
          z.animState = 'walk';
          z.attackCharge = 0;
        }
      });

      roundEnded = true;
      addFloatingText(`💀 ${reasonText}`, player.x, player.y - 60, '#ff3366');
      sound.playGameOver();

      const tid = window.setTimeout(() => {
        propsRef.current.onGameOver(reasonText);
      }, 750);
      activeTimeouts.push(tid);
    }

    // Unified single-reward zombie death handler (strictly guarded against duplicate rewards)
    function killZombie(
      z: Zombie,
      reasonText: string,
      coinsReward: number,
      scoreReward: number,
      pushVx: number = 0,
      pushVy: number = -2.5
    ) {
      if (!z.alive && (z.rewarded || rewardedZombieIds.has(z.id))) return;
      z.health = 0;
      z.alive = false;
      z.isFalling = false;
      z.animState = 'dead';
      z.attackCharge = 0;

      if (!z.ragdoll) {
        z.ragdoll = {
          vx: pushVx,
          vy: pushVy,
          angle: 0,
          vAngle: (Math.random() - 0.5) * 0.25
        };
      }

      sound.playZombieDeath(z.type === 'boss');
      spawnParticles(z.x + z.w / 2, z.y + z.h / 2, '#ff0033', 14, 1.6);

      if (!z.rewarded && !rewardedZombieIds.has(z.id)) {
        z.rewarded = true;
        rewardedZombieIds.add(z.id);
        if (z.type === 'boss') {
          addFloatingText('BOSS DESTROYED! 👑', z.x + z.w / 2, z.y - 25, '#ffcc00');
          missionCombatCoins += 50;
          propsRef.current.onScoreEarned(1000);
        } else {
          addFloatingText(reasonText, z.x + z.w / 2, z.y - 12, '#fde047');
          missionCombatCoins += coinsReward;
          propsRef.current.onScoreEarned(scoreReward);
        }
      }

      checkAndSpawnReinforcements();
      propsRef.current.onZombiesChange(getTotalRemainingZombies());
    }

    function checkAndSpawnReinforcements() {
      if (waveSpawned || pendingReinforcements.length === 0) return;
      const aliveCount = zombies.filter(z => z.alive).length;
      if (aliveCount <= 1) {
        waveSpawned = true;
        pendingReinforcements.forEach(rz => {
          zombies.push(rz);
          spawnParticles(rz.x + rz.w / 2, rz.y + rz.h / 2, '#10b981', 14, 1.5);
        });
        sound.playZombieDetect();
        addFloatingText('⚠️ REINFORCEMENT WAVE!', W / 2, 85, '#f59e0b');
        propsRef.current.onZombiesChange(getTotalRemainingZombies());
      }
    }

    function triggerExplosion(tx: number, ty: number, blastRadius: number = 140) {
      sound.playExplosion();

      spawnParticles(tx, ty, '#ff3300', 26, 2.2, false);
      spawnParticles(tx, ty, '#ffcc00', 18, 1.8, false);
      spawnParticles(tx, ty, '#ff9900', 14, 1.5, false);
      spawnParticles(tx, ty, '#ffffff', 8, 2.4, false);

      addFloatingText('BOOM! 💥', tx, ty - 20, '#ff3300');

      if (decalCtx) {
        decalCtx.save();
        decalCtx.beginPath();
        decalCtx.arc(tx, ty, blastRadius * 0.42, 0, Math.PI * 2);
        decalCtx.fillStyle = 'rgba(15, 15, 15, 0.65)';
        decalCtx.fill();
        decalCtx.restore();
      }

      // 1. Chain reaction to nearby TNT barrels (respecting solid stone/metal wall line-of-sight)
      tntBarrels.forEach(barrel => {
        if (!barrel.exploded) {
          const d = Math.hypot(barrel.x - tx, barrel.y - ty);
          if (d <= blastRadius && hasClearLineOfSight(tx, ty, barrel.x, barrel.y)) {
            barrel.exploded = true;
            pendingExplosions++;
            const tid = window.setTimeout(() => {
              pendingExplosions = Math.max(0, pendingExplosions - 1);
              triggerExplosion(barrel.x, barrel.y, blastRadius);
            }, 85);
            activeTimeouts.push(tid);
          }
        }
      });

      // 2. Break destructible ice structures (and destructible player support if within blast)
      structures.forEach((s, idx) => {
        if (idx < 4 || s.broken) return;
        const canBreak =
          s.type === 'ice' || (s.type === 'platform' && levelData.destructiblePlayerSupport);
        if (!canBreak) return;

        // Closest point on structure rectangle to explosion center (tx, ty)
        const closestX = Math.max(s.x, Math.min(tx, s.x + s.w));
        const closestY = Math.max(s.y, Math.min(ty, s.y + s.h));
        const d = Math.hypot(closestX - tx, closestY - ty);

        if (d <= blastRadius + 18) {
          s.broken = true;
          sound.playGlassBreak();
          spawnParticles(s.x + s.w / 2, s.y + s.h / 2, '#7dd3fc', 12, 1.5);
          addFloatingText('SUPPORT BROKEN 💥', s.x + s.w / 2, s.y - 10, '#7dd3fc');
        }
      });

      // 3. Apply blast damage to Zombies within radius (with line-of-sight check)
      let killCount = 0;
      zombies.forEach(z => {
        if (!z.alive) return;
        const zcx = z.x + z.w / 2;
        const zcy = z.y + z.h / 2;
        const d = Math.hypot(zcx - tx, zcy - ty);
        if (d <= blastRadius && hasClearLineOfSight(tx, ty, zcx, zcy)) {
          const pushAngle = Math.atan2(zcy - ty, zcx - tx);
          if (z.type === 'boss' && z.health > 3.5) {
            z.health = Number((z.health - 3.5).toFixed(1));
            z.hitTimer = 14;
            z.animState = 'hit';
            z.attackCharge = 0;
            sound.playZombieHit(true);
            addFloatingText('BLAST -3.5 💥', zcx, z.y - 16, '#fb923c');
          } else {
            killCount++;
            killZombie(
              z,
              'BLAST KILL! 💥',
              20,
              350,
              Math.cos(pushAngle) * 9.5,
              Math.sin(pushAngle) * 9.5 - 3.5
            );
          }
        }
      });

      if (killCount > 1) {
        addFloatingText(`MULTI-KILL x${killCount}! 🔥`, tx, ty - 45, '#ffcc00');
      }

      // 4. Apply consistent blast rule to Player if standing inside blast radius with line-of-sight
      if (player.alive) {
        const pcx = player.x;
        const pcy = player.y - 34;
        const playerDist = Math.hypot(pcx - tx, pcy - ty);
        if (playerDist <= blastRadius && hasClearLineOfSight(tx, ty, pcx, pcy)) {
          damagePlayer(2, 'CAUGHT IN TNT BLAST!');
        }
      }
    }

    const fireAtTarget = (targetX: number, targetY: number) => {
      const now = performance.now();
      if (roundEnded || propsRef.current.isPaused || !player.alive) return;
      if (isReloading) {
        addFloatingText('RELOADING...', player.x, player.y - 75, '#f59e0b');
        return;
      }

      const shoulderX = player.x;
      const shoulderY = player.y - SHOULDER_OFFSET_Y;
      const aimAngle = Math.atan2(targetY - shoulderY, targetX - shoulderX);
      playerAngleRef.current = aimAngle;
      player.angle = aimAngle;

      if (totalAmmo <= 0 || magAmmo <= 0) return;
      if (now - lastShotTime < shotCooldownMs) return;

      lastShotTime = now;
      magAmmo--;
      totalAmmo--;
      syncAmmoUI();

      // Visual tap feedback reticle at target spot
      tapReticles.push({
        id: Math.random(),
        x: targetX,
        y: targetY,
        life: 0,
        maxLife: 18,
        color: gunItem.bulletColor || '#00e5ff'
      });

      sound.playShot();
      sound.playLaserShot();

      const muzzle = getMuzzlePosition(aimAngle);
      const spd = gunItem.speed * 0.85;
      const pelletCount = gunItem.pellets || 1;

      for (let p = 0; p < pelletCount; p++) {
        const spreadOffset = pelletCount > 1 ? (p - (pelletCount - 1) / 2) * 0.065 : 0;
        const shotAngle = aimAngle + spreadOffset;

        bullets.push({
          id: Math.random(),
          x: muzzle.x,
          y: muzzle.y,
          dx: Math.cos(shotAngle) * spd,
          dy: Math.sin(shotAngle) * spd,
          speed: spd,
          radius: gunItem.weaponType === 'cannon' || gunItem.weaponType === 'plasma' ? 5.2 : 4,
          bounces: 0,
          maxBounces: gunItem.bounces,
          damage: gunItem.power,
          penetrationLeft: gunItem.penetration || 1,
          penetrationDecay: gunItem.penetrationDecay || 0.75,
          hitZombieIds: [],
          distanceTraveled: 0,
          maxRange: gunItem.maxRange || 1200,
          color: gunItem.bulletColor,
          trail: []
        });
      }

      spawnParticles(muzzle.x, muzzle.y, gunItem.bulletColor, 9, 1.1, false);

      // Auto-reload if magazine is empty and reserve ammo remains
      if (magAmmo === 0 && totalAmmo > 0) {
        startReload();
      }
    };

    function computeTrajectory(startX: number, startY: number, angle: number): TrajectoryPoint[] {
      const points: TrajectoryPoint[] = [{ x: startX, y: startY }];
      let curX = startX;
      let curY = startY;
      let curDx = Math.cos(angle);
      let curDy = Math.sin(angle);

      const maxBounces = 2;
      const step = 5;
      const maxDist = Math.min(1300, gunItem.maxRange || 1300);
      let totalDist = 0;
      let bounceCount = 0;
      let pierceLeft = gunItem.penetration || 1;
      const piercedIds = new Set<number>();

      while (totalDist < maxDist && bounceCount <= maxBounces) {
        curX += curDx * step;
        curY += curDy * step;
        totalDist += step;

        let hitWall = false;

        for (const s of structures) {
          if (s.broken || s.type === 'hazard') continue;
          if (curX >= s.x && curX <= s.x + s.w && curY >= s.y && curY <= s.y + s.h) {
            points.push({ x: curX, y: curY });
            if (s.type === 'ice') {
              if (pierceLeft > 1) {
                pierceLeft--;
                break;
              } else {
                return points;
              }
            }
            if (s.type === 'metal') {
              return points;
            }
            hitWall = true;
            const overlapLeft = Math.abs(curX - s.x);
            const overlapRight = Math.abs(curX - (s.x + s.w));
            const overlapTop = Math.abs(curY - s.y);
            const overlapBottom = Math.abs(curY - (s.y + s.h));
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
              curDx = -curDx;
            } else {
              curDy = -curDy;
            }
            bounceCount++;
            break;
          }
        }

        for (const tnt of tntBarrels) {
          if (!tnt.exploded && Math.hypot(curX - tnt.x, curY - tnt.y) <= tnt.r) {
            points.push({ x: curX, y: curY });
            return points;
          }
        }

        for (const z of zombies) {
          if (
            z.alive &&
            !piercedIds.has(z.id) &&
            curX >= z.x &&
            curX <= z.x + z.w &&
            curY >= z.y &&
            curY <= z.y + z.h
          ) {
            piercedIds.add(z.id);
            points.push({ x: curX, y: curY });
            pierceLeft--;
            if (pierceLeft <= 0) {
              return points;
            }
          }
        }

        if (hitWall && bounceCount > maxBounces) break;
      }

      points.push({ x: curX, y: curY });
      return points;
    }

    const checkIsInCancelZone = (mx: number, my: number): boolean => {
      if (my >= H - 8) return true;
      if (
        mx >= CANCEL_BOX_X &&
        mx <= CANCEL_BOX_X + CANCEL_BOX_W &&
        my >= CANCEL_BOX_Y &&
        my <= CANCEL_BOX_Y + CANCEL_BOX_H + 10
      ) {
        return true;
      }
      return false;
    };

    const getCanvasCoords = (e: PointerEvent): { mx: number; my: number } => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      return {
        mx: (e.clientX - rect.left) * scaleX,
        my: (e.clientY - rect.top) * scaleY
      };
    };

    // 1. Pointer Down: Start Holding to Aim
    const handleCanvasPointerDown = (e: PointerEvent) => {
      if (roundEnded || propsRef.current.isPaused || !player.alive) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      sound.init();

      if (activePointerId !== null && e.pointerId !== activePointerId) {
        cancelActiveAimWithoutFiring(true);
        return;
      }

      const { mx, my } = getCanvasCoords(e);
      activePointerId = e.pointerId;
      isAiming = true;
      aimTargetX = mx;
      aimTargetY = my;
      isInCancelZone = checkIsInCancelZone(mx, my);

      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      if (!isInCancelZone) {
        const shoulderX = player.x;
        const shoulderY = player.y - SHOULDER_OFFSET_Y;
        playerAngleRef.current = Math.atan2(my - shoulderY, mx - shoulderX);
        player.angle = playerAngleRef.current;
      }

      propsRef.current.onAimStateChange?.(true, isInCancelZone);
    };

    // 2. Pointer Move: Update Aim Direction & Cancel Zone Status
    const handleCanvasPointerMove = (e: PointerEvent) => {
      if (roundEnded || propsRef.current.isPaused || !player.alive) return;

      const { mx, my } = getCanvasCoords(e);

      if (isAiming && e.pointerId === activePointerId) {
        aimTargetX = mx;
        aimTargetY = my;
        const nextCancel = checkIsInCancelZone(mx, my);
        if (nextCancel !== isInCancelZone) {
          isInCancelZone = nextCancel;
          propsRef.current.onAimStateChange?.(true, isInCancelZone);
        }
        if (!isInCancelZone) {
          const shoulderX = player.x;
          const shoulderY = player.y - SHOULDER_OFFSET_Y;
          playerAngleRef.current = Math.atan2(my - shoulderY, mx - shoulderX);
          player.angle = playerAngleRef.current;
        }
      } else if (!isAiming && e.pointerType === 'mouse') {
        const shoulderX = player.x;
        const shoulderY = player.y - SHOULDER_OFFSET_Y;
        playerAngleRef.current = Math.atan2(my - shoulderY, mx - shoulderX);
      }
    };

    // 3. Pointer Up: Fire if in valid aiming area, or Cancel if in Cancel Zone
    const handleCanvasPointerUp = (e: PointerEvent) => {
      if (!isAiming || e.pointerId !== activePointerId) return;

      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }

      const { mx, my } = getCanvasCoords(e);
      const releasedInCancel = isInCancelZone || checkIsInCancelZone(mx, my);

      isAiming = false;
      isInCancelZone = false;
      activePointerId = null;
      propsRef.current.onAimStateChange?.(false, false);

      if (roundEnded || propsRef.current.isPaused || !player.alive) return;

      if (releasedInCancel) {
        addFloatingText('✖ SHOT CANCELLED', player.x, player.y - 78, '#ff3366');
        return;
      }

      fireAtTarget(mx, my);
    };

    const handleCanvasPointerCancel = (e: PointerEvent) => {
      if (activePointerId !== null && e.pointerId === activePointerId) {
        cancelActiveAimWithoutFiring(false);
      }
    };

    canvas.addEventListener('pointerdown', handleCanvasPointerDown);
    canvas.addEventListener('pointermove', handleCanvasPointerMove);
    canvas.addEventListener('pointerup', handleCanvasPointerUp);
    canvas.addEventListener('pointercancel', handleCanvasPointerCancel);

    function drawEquippedWeapon(ctx: CanvasRenderingContext2D, gun: GunItem) {
      const bodyCol = gun.bodyColor || '#1e293b';
      const accCol = gun.accentColor || gun.bulletColor || '#00e5ff';
      const bLen = gun.barrelLength || 36;

      switch (gun.weaponType) {
        case 'pistol': {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(6, -1, 6, 9);
          ctx.fillStyle = bodyCol;
          ctx.fillRect(5, -6, bLen - 9, 6);
          ctx.fillStyle = accCol;
          ctx.fillRect(8, -5, bLen - 16, 2);
          ctx.shadowColor = accCol;
          ctx.shadowBlur = 8;
          ctx.fillRect(bLen - 4, -6, 4, 6);
          ctx.shadowBlur = 0;
          break;
        }
        case 'smg': {
          ctx.fillStyle = '#334155';
          ctx.fillRect(-4, -4, 8, 4);
          ctx.fillStyle = bodyCol;
          ctx.fillRect(4, -6, 22, 7);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(16, 1, 4, 10);
          ctx.fillStyle = accCol;
          ctx.fillRect(7, -4, 15, 2);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(26, -5, bLen - 26, 4);
          ctx.fillStyle = accCol;
          ctx.shadowColor = accCol;
          ctx.shadowBlur = 8;
          ctx.fillRect(bLen - 4, -5, 4, 4);
          ctx.shadowBlur = 0;
          break;
        }
        case 'shotgun': {
          ctx.fillStyle = '#475569';
          ctx.fillRect(-6, -3, 10, 5);
          ctx.fillStyle = bodyCol;
          ctx.fillRect(4, -6, bLen - 8, 6);
          ctx.fillStyle = accCol;
          ctx.fillRect(14, 0, 14, 3);
          ctx.shadowColor = accCol;
          ctx.shadowBlur = 9;
          ctx.fillRect(bLen - 5, -7, 5, 8);
          ctx.shadowBlur = 0;
          break;
        }
        case 'assault': {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-6, -4, 10, 5);
          ctx.fillStyle = bodyCol;
          ctx.fillRect(4, -6, 24, 7);
          ctx.fillStyle = accCol;
          ctx.fillRect(10, -9, 10, 2.5);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(17, 1, 5, 9);
          ctx.fillStyle = '#334155';
          ctx.fillRect(28, -5, bLen - 28, 4);
          ctx.fillStyle = accCol;
          ctx.shadowColor = accCol;
          ctx.shadowBlur = 8;
          ctx.fillRect(bLen - 4, -6, 4, 6);
          ctx.shadowBlur = 0;
          break;
        }
        case 'sniper': {
          ctx.fillStyle = '#18181b';
          ctx.fillRect(-7, -4, 11, 5);
          ctx.fillStyle = bodyCol;
          ctx.fillRect(4, -6, 22, 6);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(7, -10, 16, 3);
          ctx.fillStyle = accCol;
          ctx.fillRect(22, -10, 2, 3);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(26, -4.5, bLen - 26, 3);
          ctx.fillStyle = accCol;
          ctx.shadowColor = accCol;
          ctx.shadowBlur = 10;
          ctx.fillRect(bLen - 5, -6, 5, 6);
          ctx.shadowBlur = 0;
          break;
        }
        case 'plasma': {
          ctx.fillStyle = bodyCol;
          ctx.fillRect(0, -7, bLen - 6, 9);
          ctx.fillStyle = accCol;
          ctx.shadowColor = accCol;
          ctx.shadowBlur = 8;
          for (let c = 6; c < bLen - 10; c += 7) {
            ctx.fillRect(c, -5, 4, 5);
          }
          ctx.fillRect(bLen - 6, -8, 6, 11);
          ctx.shadowBlur = 0;
          break;
        }
        case 'railgun': {
          ctx.fillStyle = bodyCol;
          ctx.fillRect(-4, -6, 18, 8);
          ctx.fillStyle = '#334155';
          ctx.fillRect(14, -7, bLen - 14, 3);
          ctx.fillRect(14, -1, bLen - 14, 3);
          ctx.fillStyle = accCol;
          ctx.shadowColor = accCol;
          ctx.shadowBlur = 10;
          ctx.fillRect(14, -3.5, bLen - 12, 2);
          ctx.shadowBlur = 0;
          break;
        }
        case 'cannon':
        case 'scifi':
        default: {
          ctx.fillStyle = bodyCol;
          ctx.fillRect(-4, -8, bLen - 4, 11);
          ctx.fillStyle = accCol;
          ctx.shadowColor = accCol;
          ctx.shadowBlur = 11;
          ctx.fillRect(6, -5, bLen - 12, 5);
          ctx.fillRect(bLen - 6, -9, 6, 13);
          ctx.shadowBlur = 0;
          break;
        }
      }
    }

    function drawPlayerPlatform(ctx: CanvasRenderingContext2D, s: Structure, accentColor: string) {
      if (s.broken) return;
      const left = Math.round(s.x);
      const top = Math.round(s.y);
      const width = Math.round(s.w);
      const height = Math.round(s.h);

      ctx.save();

      const shadowGrad = ctx.createLinearGradient(0, top + height, 0, top + height + 16);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(left + 4, top + height, width - 8, 16);

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(left + 8, top + height);
      ctx.lineTo(left + 22, top + height + 10);
      ctx.lineTo(left + 28, top + height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(left + width - 8, top + height);
      ctx.lineTo(left + width - 22, top + height + 10);
      ctx.lineTo(left + width - 28, top + height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const bodyGrad = ctx.createLinearGradient(0, top, 0, top + height);
      bodyGrad.addColorStop(0, '#273549');
      bodyGrad.addColorStop(0.55, '#162030');
      bodyGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(left, top, width, height);

      ctx.strokeStyle = '#3b4d66';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(left, top, width, height);

      ctx.fillStyle = accentColor || '#38bdf8';
      ctx.fillRect(left, top, width, 2);

      ctx.restore();
    }

    function drawHumanoidZombie(ctx: CanvasRenderingContext2D, z: Zombie) {
      ctx.save();
      ctx.translate(z.x + z.w / 2, z.y + z.h / 2);

      if (!z.alive && z.ragdoll) {
        ctx.rotate(z.ragdoll.angle);
      }

      const isBoss = z.type === 'boss';
      const isSpitter = z.type === 'spitter';
      const isFat = z.type === 'fat';
      const isArmored = z.type === 'armored';
      const isRunner = z.type === 'runner';
      const isCrawler = z.type === 'crawler';
      const variant = (z.variant ?? z.id) % 3;

      const facing = z.facing || (z.x > player.x ? -1 : 1);
      ctx.scale(facing, 1);

      const hw = z.w / 2;
      const hh = z.h / 2;
      const phase = z.animPhase || 0;
      const isHit = (z.hitTimer || 0) > 0;
      const isAttacking = z.animState === 'attack';
      const isFalling = Boolean(z.isFalling);

      const postureLean = !z.alive
        ? 0
        : isFalling
        ? -0.15
        : isHit
        ? -0.22
        : isAttacking
        ? 0.24
        : isRunner
        ? 0.24
        : isArmored
        ? 0.03
        : isSpitter
        ? 0.14
        : 0.08;
      ctx.rotate(postureLean);

      const skinCol = !z.alive
        ? '#4b5563'
        : isHit
        ? '#fda4af'
        : isBoss
        ? '#be123c'
        : isSpitter
        ? '#10b981'
        : isArmored
        ? '#52796f'
        : isRunner
        ? '#84cc16'
        : isFat
        ? '#4d7c0f'
        : variant === 1
        ? '#5f8d37'
        : '#65a30d';

      const clothesCol = !z.alive
        ? '#1f2937'
        : isBoss
        ? '#31102f'
        : isSpitter
        ? '#064e3b'
        : isArmored
        ? '#1e293b'
        : isFat
        ? '#27272a'
        : isRunner
        ? '#3f1d2e'
        : variant === 1
        ? '#1e3a5f'
        : variant === 2
        ? '#3b2f2f'
        : '#27272a';

      if (z.alive && !isFalling) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, hh - 1, hw * 0.85, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const legStride = z.alive && !isFalling ? Math.sin(phase) * (isRunner ? 6.5 : isArmored ? 3.2 : 4) : 0;
      const legLift = z.alive && !isFalling ? Math.max(0, Math.cos(phase)) * (isRunner ? 3.2 : 2.2) : isFalling ? 4 : 0;

      if (!isCrawler) {
        const legW = isFat || isBoss ? 8 : isArmored ? 7 : 6;
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-4 - legStride * 0.6, hh * 0.25 - (isFalling ? 3 : 0), legW, hh * 0.72);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(-4 - legStride * 0.6, hh - 4 - (isFalling ? 3 : 0), legW + 2, 4);

        ctx.fillStyle = clothesCol;
        ctx.fillRect(1 + legStride * 0.6, hh * 0.25 - legLift, legW, hh * 0.72);
        if (isArmored) {
          // Tactical knee pad
          ctx.fillStyle = '#64748b';
          ctx.fillRect(1 + legStride * 0.6, hh * 0.48 - legLift, legW, 5);
        } else {
          ctx.fillStyle = skinCol;
          ctx.fillRect(2 + legStride * 0.6, hh * 0.52 - legLift, 4, 4);
        }
        ctx.fillStyle = '#090d16';
        ctx.fillRect(1 + legStride * 0.6, hh - 4 - legLift, legW + 2, 4);
      } else {
        // Crawler dragging lower body + trailing legs
        ctx.fillStyle = clothesCol;
        ctx.fillRect(-hw * 0.85, hh * 0.28, hw * 1.05, 7);
        ctx.fillStyle = skinCol;
        ctx.fillRect(-hw * 0.95 - Math.sin(phase) * 3, hh * 0.34, 6, 4);
      }

      const torsoTop = -hh * 0.36 + (z.alive && !isFalling ? Math.abs(Math.sin(phase)) * 1.5 : 0);
      const torsoH = isCrawler ? hh * 0.75 : hh * 0.66;
      const torsoW = isFat || isBoss ? z.w * 0.8 : isArmored ? z.w * 0.74 : isRunner ? z.w * 0.58 : z.w * 0.64;

      ctx.fillStyle = clothesCol;
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 1.2;
      ctx.fillRect(-torsoW / 2, torsoTop, torsoW, torsoH);
      ctx.strokeRect(-torsoW / 2, torsoTop, torsoW, torsoH);

      if (isArmored) {
        // Heavy Riot Chest Armor Plate + Metallic Rivets + Front Riot Shield Edge
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.fillRect(-torsoW * 0.52, torsoTop + 1, torsoW * 1.04, torsoH * 0.82);
        ctx.strokeRect(-torsoW * 0.52, torsoTop + 1, torsoW * 1.04, torsoH * 0.82);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-torsoW * 0.25, torsoTop + 5, torsoW * 0.5, 2.5);
        // Front vertical chest guard strip
        ctx.fillStyle = '#64748b';
        ctx.fillRect(torsoW * 0.35, torsoTop - 1, 4, torsoH * 0.92);
      } else {
        ctx.fillStyle = skinCol;
        ctx.fillRect(-torsoW * 0.25, torsoTop + 4, torsoW * 0.5, torsoH * 0.5);
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-torsoW * 0.2, torsoTop + 7, torsoW * 0.4, 2);
        ctx.fillRect(-torsoW * 0.2, torsoTop + 12, torsoW * 0.4, 2);
      }

      if (isFat || isBoss) {
        ctx.fillStyle = isBoss ? '#eab308' : '#475569';
        ctx.fillRect(-torsoW * 0.58, torsoTop - 2, torsoW * 1.16, 7);
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(-torsoW * 0.58, torsoTop - 2, torsoW * 1.16, 7);
      } else if (isSpitter && z.alive) {
        // Glowing dorsal bio-acid sacs
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(-torsoW * 0.42, torsoTop + 6, 5, 0, Math.PI * 2);
        ctx.arc(-torsoW * 0.35, torsoTop + 14, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (isRunner) {
        // Runner diagonal sprint harness
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-torsoW * 0.4, torsoTop + 2);
        ctx.lineTo(torsoW * 0.4, torsoTop + torsoH - 2);
        ctx.stroke();
      }

      const headRadius = isBoss ? 12.5 : isFat ? 10 : isArmored ? 9.5 : 8.5;
      const headCenterX = isRunner || isSpitter ? 3 : 2;
      const headCenterY = torsoTop - headRadius * 0.85;

      ctx.fillStyle = skinCol;
      ctx.fillRect(-2, torsoTop - 5, 6, 6);

      ctx.fillStyle = skinCol;
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (isArmored) {
        // Riot Helmet Dome + Glowing Tactical Visor
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(headCenterX, headCenterY - 1, headRadius + 1.2, Math.PI * 0.85, Math.PI * 2.15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (z.alive) {
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.fillRect(headCenterX + 1, headCenterY - 4, headRadius * 0.85, 3.2);
          ctx.shadowBlur = 0;
        }
      } else {
        const jawOpen = isAttacking || isFalling ? 5 : 3;
        ctx.fillStyle = '#090d16';
        ctx.fillRect(headCenterX + 1, headCenterY + 1, headRadius * 0.82, jawOpen);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(headCenterX + 2, headCenterY + 1, 2, 2);
        ctx.fillRect(headCenterX + 5, headCenterY + 1, 2, 2);

        ctx.fillStyle = '#090d16';
        ctx.fillRect(headCenterX + 1, headCenterY - 5, headRadius * 0.65, 4.5);

        if (z.alive) {
          const eyeCol = isBoss
            ? '#fde08a'
            : isSpitter
            ? '#34d399'
            : isRunner
            ? '#f97316'
            : '#ff0033';
          ctx.fillStyle = eyeCol;
          ctx.shadowColor = eyeCol;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(headCenterX + headRadius * 0.42, headCenterY - 2.8, isBoss ? 2.8 : 2.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Distinct headgear on normal/fat variants (e.g. construction helmet or bandana)
        if (!isBoss && !isSpitter && !isCrawler && variant === 2) {
          ctx.fillStyle = isFat ? '#ca8a04' : '#dc2626';
          ctx.beginPath();
          ctx.arc(headCenterX, headCenterY - 2, headRadius + 0.5, Math.PI, Math.PI * 2);
          ctx.fill();
        }
      }

      if (isBoss) {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(headCenterX - 8, headCenterY - headRadius + 2);
        ctx.lineTo(headCenterX - 5, headCenterY - headRadius - 7);
        ctx.lineTo(headCenterX, headCenterY - headRadius - 2);
        ctx.lineTo(headCenterX + 5, headCenterY - headRadius - 8);
        ctx.lineTo(headCenterX + 9, headCenterY - headRadius + 2);
        ctx.closePath();
        ctx.fill();
      }

      const armReachAngle = !z.alive
        ? 0.4
        : isFalling
        ? -0.85
        : isAttacking
        ? -0.45 + Math.sin(phase * 3.5) * 0.3
        : isRunner
        ? -0.3 + Math.sin(phase * 1.5) * 0.22
        : Math.sin(phase) * 0.14 - 0.12;

      ctx.save();
      ctx.translate(2, torsoTop + 5);
      ctx.rotate(armReachAngle);

      const armLen = isBoss ? 20 : isFat ? 16 : 14;
      ctx.fillStyle = isArmored ? '#475569' : clothesCol;
      ctx.fillRect(0, -3, armLen * 0.55, 5);
      ctx.fillStyle = skinCol;
      ctx.fillRect(armLen * 0.5, -2.5, armLen * 0.55, 4.5);
      ctx.fillStyle = skinCol;
      ctx.fillRect(armLen, -3.5, 4, 6);

      if (z.alive && isAttacking && !isFalling && (z.attackCharge || 0) > 0) {
        const chargeR = 3 + (z.attackCharge || 0) * 5;
        ctx.fillStyle = isBoss || !isSpitter ? '#f43f5e' : '#10b981';
        ctx.shadowColor = isBoss || !isSpitter ? '#f43f5e' : '#34d399';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(armLen + 5, 0, chargeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
      ctx.restore();

      // Readable Attack Telegraph Indicator (Ranged Spit or Melee Lunge)
      if (z.alive && isAttacking && !isFalling && (z.attackCharge || 0) > 0) {
        const cx = z.x + z.w / 2;
        const cy = z.y - 18;
        ctx.save();
        ctx.fillStyle = isSpitter || isBoss ? '#fef08a' : '#fda4af';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isSpitter || isBoss ? '⚠️ ACID SPIT!' : '⚠️ ATTACK!', cx, cy);
        ctx.restore();
      }

      // Multi-HP & Boss Health Bar
      if (z.alive && (z.maxHealth > 1 || isBoss || isArmored)) {
        const barW = isBoss ? 60 : 34;
        const barH = isBoss ? 6 : 4;
        const barX = z.x + z.w / 2 - barW / 2;
        const barY = z.y - (isBoss ? 14 : 8);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = isBoss ? '#ff0055' : isArmored ? '#38bdf8' : '#22c55e';
        ctx.fillRect(barX, barY, barW * Math.max(0, z.health / z.maxHealth), barH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(barX, barY, barW, barH);
      }
    }

    function findSupportingStructure(leftX: number, rightX: number, footY: number, vy: number): Structure | null {
      const toleranceDown = Math.max(10, Math.abs(vy) + 5);
      let bestSupport: Structure | null = null;

      for (const s of structures) {
        if (s.broken || s.type === 'hazard') continue;
        if (rightX > s.x && leftX < s.x + s.w) {
          if (footY >= s.y - 3 && footY <= s.y + toleranceDown) {
            if (!bestSupport || s.y < bestSupport.y) {
              bestSupport = s;
            }
          }
        }
      }
      return bestSupport;
    }

    function checkTouchingHazard(leftX: number, rightX: number, topY: number, bottomY: number): boolean {
      for (const s of structures) {
        if (s.broken || s.type !== 'hazard') continue;
        if (rightX > s.x && leftX < s.x + s.w && bottomY >= s.y - 2 && topY <= s.y + s.h) {
          return true;
        }
      }
      return false;
    }

    const loop = () => {
      frameCount++;

      if (!propsRef.current.isPaused) {
        if (player.alive) {
          player.angle = playerAngleRef.current;
          if (player.hitTimer > 0) player.hitTimer--;
        }

        // Initial audible zombie presence groan shortly after mission starts
        if (frameCount === 18 && !roundEnded && zombies.some(z => z.alive)) {
          sound.playZombieGroan();
        }

        // Check if active reload completed
        if (isReloading && performance.now() >= reloadEndTime) {
          isReloading = false;
          magAmmo = Math.min(gunItem.magSize || 3, totalAmmo);
          addFloatingText('RELOADED! 🔋', player.x, player.y - 78, '#4ade80');
          syncAmmoUI();
        }

        // 0A. Update Moving Structures (Gates, Sliding Bounce Pads, Elevators)
        for (let sIdx = 4; sIdx < structures.length; sIdx++) {
          const s = structures[sIdx];
          if (s.broken) continue;
          if (typeof s.vx === 'number' && s.vx !== 0) {
            s.x += s.vx;
            const minX = typeof s.minX === 'number' ? s.minX : 24;
            const maxX = typeof s.maxX === 'number' ? s.maxX : W - 24 - s.w;
            if (s.x <= minX) {
              s.x = minX;
              s.vx = Math.abs(s.vx);
            } else if (s.x >= maxX) {
              s.x = maxX;
              s.vx = -Math.abs(s.vx);
            }
          }
          if (typeof s.vy === 'number' && s.vy !== 0) {
            s.y += s.vy;
            const minY = typeof s.minY === 'number' ? s.minY : 30;
            const maxY = typeof s.maxY === 'number' ? s.maxY : 500 - s.h;
            if (s.y <= minY) {
              s.y = minY;
              s.vy = Math.abs(s.vy);
            } else if (s.y >= maxY) {
              s.y = maxY;
              s.vy = -Math.abs(s.vy);
            }
          }
        }

        // 0B. Update Player Grounded & Gravity Check
        if (player.alive) {
          const pSupport = findSupportingStructure(player.x - 14, player.x + 14, player.y, player.vy);
          if (checkTouchingHazard(player.x - 12, player.x + 12, player.y - 60, player.y + 4)) {
            killPlayer('FELL ONTO SPIKE HAZARD!');
          } else if (pSupport) {
            if (player.isFalling) {
              const fallDist = pSupport.y - player.fallStartY;
              player.y = pSupport.y;
              player.vy = 0;
              player.isFalling = false;
              player.isGrounded = true;

              if (fallDist >= 150) {
                killPlayer('FATAL HIGH FALL!');
              }
            } else {
              player.y = pSupport.y;
              player.vy = 0;
              player.isGrounded = true;
            }
          } else {
            if (!player.isFalling) {
              player.isFalling = true;
              player.isGrounded = false;
              player.fallStartY = player.y;
              player.vy = 0.5;
            }
            player.vy = Math.min(12, player.vy + 0.42);
            player.y += player.vy;

            if (player.y >= H - 12) {
              killPlayer('FELL INTO ABYSS!');
            }
          }
        }

        // 1. Update Living Zombies (Gravity/Support, Detection, Melee & Ranged Attacks, Patrol, Audio)
        let anyWalking = false;
        zombies.forEach(z => {
          if (!z.alive) return;

          if (z.hitTimer && z.hitTimer > 0) {
            z.hitTimer--;
            if (z.hitTimer === 0 && z.animState === 'hit') {
              z.animState = z.isFalling ? 'fall' : 'walk';
            }
          }

          // Check Hazard Contact
          if (checkTouchingHazard(z.x + 3, z.x + z.w - 3, z.y, z.y + z.h)) {
            killZombie(z, 'SPIKE HAZARD! 💀', 25, 320, 0, -3);
            return;
          }

          // Check Physical Platform / Ground Support under Zombie's Feet
          const footY = z.y + z.h;
          const support = findSupportingStructure(z.x + 5, z.x + z.w - 5, footY, z.vy || 0);

          if (support) {
            if (z.isFalling) {
              const fallDist = support.y - (z.fallStartY ?? support.y);
              z.y = support.y - z.h;
              z.vy = 0;
              z.isFalling = false;
              z.isGrounded = true;
              z.animState = 'walk';

              z.minX = Math.max(20, support.x + 4);
              z.maxX = Math.min(W - 20 - z.w, support.x + support.w - z.w - 4);

              // Check if falling zombie crushed onto an unexploded TNT barrel
              for (const tnt of tntBarrels) {
                if (!tnt.exploded && Math.hypot(z.x + z.w / 2 - tnt.x, z.y + z.h - tnt.y) <= tnt.r + 24) {
                  tnt.exploded = true;
                  triggerExplosion(tnt.x, tnt.y, 140);
                  return;
                }
              }

              // Lethal fall height check (>= 135px drop kills normal/spitter/runner/fat)
              if (fallDist >= 135) {
                killZombie(z, 'FALL CRUSH! 💀', 25, 300, 0, -2.5);
                return;
              } else if (fallDist >= 55) {
                z.health -= 1;
                sound.playZombieHit(false);
                spawnParticles(z.x + z.w / 2, z.y + z.h, '#94a3b8', 8, 1.2);
                if (z.health <= 0) {
                  killZombie(z, 'FALL IMPACT! 💀', 20, 250, 0, -2);
                  return;
                } else {
                  addFloatingText('FALL -1', z.x + z.w / 2, z.y - 10, '#fb923c');
                  z.hitTimer = 12;
                  z.animState = 'hit';
                }
              }
            } else {
              z.y = support.y - z.h;
              z.vy = 0;
              z.isGrounded = true;
            }
          } else {
            if (!z.isFalling) {
              z.isFalling = true;
              z.isGrounded = false;
              z.fallStartY = z.y + z.h;
              z.vy = 0.6;
              z.animState = 'fall';
              z.attackCharge = 0;
            }

            z.vy = Math.min(12, (z.vy || 0) + 0.42);
            z.y += z.vy;

            for (const tnt of tntBarrels) {
              if (!tnt.exploded && Math.hypot(z.x + z.w / 2 - tnt.x, z.y + z.h / 2 - tnt.y) <= tnt.r + 20) {
                tnt.exploded = true;
                triggerExplosion(tnt.x, tnt.y, 140);
                return;
              }
            }

            if (z.y + z.h >= H - 8) {
              killZombie(z, 'ABYSS FALL! 💀', 25, 300, 0, -2);
              return;
            }

            return;
          }

          // Advance walking animation phase ONLY when grounded
          const speedMag = Math.abs(z.vx || 0.3);
          z.animPhase = (z.animPhase || 0) + Math.max(0.06, speedMag * 0.18);

          // Check Same-Floor Player Detection & Melee Lunge for non-ranged zombies
          const sameElevation = player.alive && Math.abs((z.y + z.h) - player.y) <= 18;
          const horizDistToPlayer = Math.abs(z.x + z.w / 2 - player.x);
          const canSeePlayerOnFloor =
            sameElevation && hasClearLineOfSight(z.x + z.w / 2, z.y + z.h * 0.5, player.x, player.y - 34);

          if (canSeePlayerOnFloor && !z.alerted) {
            z.alerted = true;
            sound.playZombieDetect();
            addFloatingText('!', z.x + z.w / 2, z.y - 12, '#f97316');
          }

          // A. Ranged Spitter & Boss Attack Telegraph Logic (when grounded & player alive)
          if ((z.type === 'spitter' || z.type === 'boss') && !roundEnded && player.alive) {
            if (typeof z.attackCooldown !== 'number') {
              z.attackCooldown = 115;
            }
            if (z.animState === 'attack') {
              z.attackCharge = Math.min(1, (z.attackCharge || 0) + 0.014);
              z.facing = player.x < z.x ? -1 : 1;
              if (z.attackCharge >= 1) {
                const startX = z.x + z.w / 2 + (z.facing || -1) * 14;
                const startY = z.y + z.h * 0.32;
                const ang = Math.atan2(player.y - 38 - startY, player.x - startX);
                const globSpd = z.type === 'boss' ? 3.5 : 2.9;

                enemyProjectiles.push({
                  id: Math.random(),
                  x: startX,
                  y: startY,
                  dx: Math.cos(ang) * globSpd,
                  dy: Math.sin(ang) * globSpd,
                  radius: z.type === 'boss' ? 7 : 5.5,
                  color: z.type === 'boss' ? '#f43f5e' : '#10b981'
                });

                sound.playZombieAttack();
                z.attackCharge = 0;
                z.animState = 'walk';
                z.attackCooldown = z.type === 'boss' ? 130 : 155;
              }
            } else {
              z.attackCooldown--;
              if (z.attackCooldown <= 0) {
                z.animState = 'attack';
                z.attackCharge = 0.05;
                sound.playZombieGroan();
              }
            }
          }
          // B. Melee Zombie Attack Telegraph & Strike when reaching Player on the same floor
          else if (canSeePlayerOnFloor && horizDistToPlayer <= 38 && !roundEnded && player.alive) {
            z.facing = player.x < z.x + z.w / 2 ? -1 : 1;
            if (z.animState !== 'attack') {
              z.animState = 'attack';
              z.attackCharge = 0.04;
              sound.playZombieDetect();
            } else {
              z.attackCharge = Math.min(1, (z.attackCharge || 0) + 0.022);
              if (z.attackCharge >= 1) {
                sound.playZombieAttack();
                damagePlayer(1, 'KILLED BY ZOMBIE ATTACK!');
                z.attackCharge = 0;
                z.animState = 'walk';
              }
            }
          } else if (z.animState === 'attack' && z.type !== 'spitter' && z.type !== 'boss') {
            z.animState = 'walk';
            z.attackCharge = 0;
          }

          // Horizontal Patrol / Chase Movement when grounded and in 'walk' state
          if (z.animState !== 'attack' && !(z.hitTimer && z.hitTimer > 0) && z.vx) {
            if (canSeePlayerOnFloor && horizDistToPlayer > 34) {
              // Steer toward player if on the same unobstructed floor
              const chaseDir = player.x < z.x + z.w / 2 ? -1 : 1;
              z.vx = Math.abs(z.vx) * chaseDir;
              // Allow pursuing up to player's position on the shared floor
              if (chaseDir < 0) {
                z.minX = Math.min(z.minX ?? 24, Math.max(24, player.x + 22));
              } else {
                z.maxX = Math.max(z.maxX ?? W - 50, Math.min(W - 24 - z.w, player.x - z.w - 22));
              }
            }

            z.x += z.vx;
            anyWalking = true;
            const minBound = typeof z.minX === 'number' ? z.minX : 30;
            const maxBound = typeof z.maxX === 'number' ? z.maxX : W - 60;
            if (z.x <= minBound) {
              z.x = minBound;
              z.vx = Math.abs(z.vx);
            } else if (z.x >= maxBound) {
              z.x = maxBound;
              z.vx = -Math.abs(z.vx);
            }
            z.facing = z.vx >= 0 ? 1 : -1;
          }
        });

        if (anyWalking && !roundEnded) {
          if (frameCount % 60 === 0) {
            sound.playZombieStep();
          }
          if (frameCount % 165 === 45) {
            sound.playZombieGroan();
          }
        }

        // 2. Update Enemy Acid Projectiles
        for (let epIdx = enemyProjectiles.length - 1; epIdx >= 0; epIdx--) {
          const ep = enemyProjectiles[epIdx];
          ep.x += ep.dx;
          ep.y += ep.dy;

          if (frameCount % 2 === 0) {
            spawnParticles(ep.x, ep.y, ep.color, 1, 0.4, false);
          }

          let removed = false;
          if (ep.x < 16 || ep.x > W - 16 || ep.y < 16 || ep.y > H - 16) {
            enemyProjectiles.splice(epIdx, 1);
            continue;
          }

          for (const s of structures) {
            if (s.broken || s.type === 'hazard') continue;
            if (ep.x >= s.x && ep.x <= s.x + s.w && ep.y >= s.y && ep.y <= s.y + s.h) {
              if (s.type === 'ice') {
                s.broken = true;
                sound.playGlassBreak();
                spawnParticles(s.x + s.w / 2, s.y + s.h / 2, '#7dd3fc', 12, 1.4);
              } else {
                spawnParticles(ep.x, ep.y, ep.color, 6, 1.0);
              }
              enemyProjectiles.splice(epIdx, 1);
              removed = true;
              break;
            }
          }
          if (removed) continue;

          if (player.alive && Math.hypot(ep.x - player.x, ep.y - (player.y - 36)) <= 22) {
            enemyProjectiles.splice(epIdx, 1);
            damagePlayer(1, 'KILLED BY ACID SPIT!');
          }
        }

        // 3. Update Player Bullets (with Sub-Stepping & Weapon-Based Penetration!)
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          const subSteps = 2;
          const stepDx = b.dx / subSteps;
          const stepDy = b.dy / subSteps;
          const stepDist = Math.hypot(stepDx, stepDy);
          let removeBullet = false;

          for (let step = 0; step < subSteps; step++) {
            b.x += stepDx;
            b.y += stepDy;
            b.distanceTraveled += stepDist;

            if (b.distanceTraveled >= b.maxRange) {
              removeBullet = true;
              break;
            }

            // Intercept incoming enemy acid glob
            for (let epIdx = enemyProjectiles.length - 1; epIdx >= 0; epIdx--) {
              const ep = enemyProjectiles[epIdx];
              if (Math.hypot(b.x - ep.x, b.y - ep.y) <= b.radius + ep.radius + 5) {
                spawnParticles(ep.x, ep.y, ep.color, 10, 1.5);
                addFloatingText('INTERCEPTED! +50', ep.x, ep.y - 10, '#34d399');
                propsRef.current.onScoreEarned(50);
                enemyProjectiles.splice(epIdx, 1);
                break;
              }
            }

            // Structure collision
            let bouncedThisStep = false;
            for (let sIdx = structures.length - 1; sIdx >= 0; sIdx--) {
              const s = structures[sIdx];
              if (s.broken || s.type === 'hazard') continue;

              if (
                b.x >= s.x - b.radius &&
                b.x <= s.x + s.w + b.radius &&
                b.y >= s.y - b.radius &&
                b.y <= s.y + s.h + b.radius
              ) {
                if (s.type === 'ice') {
                  s.broken = true;
                  sound.playGlassBreak();
                  spawnParticles(s.x + s.w / 2, s.y + s.h / 2, '#7dd3fc', 14, 1.4);
                  addFloatingText('ICE SHATTERED! ❄️', s.x + s.w / 2, s.y - 6, '#38bdf8');
                  if (b.penetrationLeft > 1) {
                    b.penetrationLeft--;
                    b.damage = Math.max(0.5, Number((b.damage * b.penetrationDecay).toFixed(2)));
                  } else {
                    b.dx *= 0.85;
                    b.dy *= 0.85;
                  }
                  continue;
                }

                if (s.type === 'metal') {
                  sound.playBounce(0);
                  spawnParticles(b.x, b.y, '#94a3b8', 6, 1.0, false);
                  removeBullet = true;
                  break;
                }

                const overlapLeft = Math.abs(b.x - s.x);
                const overlapRight = Math.abs(b.x - (s.x + s.w));
                const overlapTop = Math.abs(b.y - s.y);
                const overlapBottom = Math.abs(b.y - (s.y + s.h));
                const min = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (min === overlapLeft || min === overlapRight) {
                  b.dx = -b.dx;
                } else {
                  b.dy = -b.dy;
                }

                b.bounces++;
                bouncedThisStep = true;
                sound.playBounce(b.bounces);
                spawnParticles(b.x, b.y, b.color, 5, 1.1, false);

                if (b.bounces >= b.maxBounces) {
                  removeBullet = true;
                }
                break;
              }
            }

            if (removeBullet || bouncedThisStep) break;

            // TNT Barrel collision
            for (const tnt of tntBarrels) {
              if (!tnt.exploded && Math.hypot(b.x - tnt.x, b.y - tnt.y) <= tnt.r + b.radius) {
                tnt.exploded = true;
                triggerExplosion(tnt.x, tnt.y, 140);
                removeBullet = true;
                break;
              }
            }

            if (removeBullet) break;

            // Zombie collision with Weapon-Based Penetration
            for (const z of zombies) {
              if (
                z.alive &&
                !b.hitZombieIds.includes(z.id) &&
                b.x >= z.x &&
                b.x <= z.x + z.w &&
                b.y >= z.y &&
                b.y <= z.y + z.h
              ) {
                b.hitZombieIds.push(z.id);

                const isHeadshot = b.y <= z.y + z.h * 0.35;
                const isArmorDeflected = z.type === 'armored' && !isHeadshot;
                const rawDmg = isHeadshot
                  ? b.damage * 2
                  : isArmorDeflected
                  ? Math.max(0.5, b.damage * 0.5)
                  : b.damage;
                const dmg = Number(rawDmg.toFixed(1));

                z.health = Number((z.health - dmg).toFixed(2));
                z.hitTimer = 10;
                z.animState = 'hit';
                z.attackCharge = 0;
                sound.playZombieHit(isHeadshot);

                spawnParticles(
                  b.x,
                  b.y,
                  isArmorDeflected ? '#94a3b8' : '#ff0033',
                  isHeadshot ? 14 : 8,
                  1.5
                );

                if (z.health <= 0) {
                  killZombie(
                    z,
                    isHeadshot ? `HEADSHOT! -${dmg} 🎯` : `ELIMINATED! -${dmg}`,
                    isHeadshot ? 20 : 12,
                    isHeadshot ? 300 : 150,
                    b.dx * 0.45,
                    b.dy * 0.45 - 2.5
                  );
                } else {
                  if (isHeadshot) {
                    addFloatingText(`HEADSHOT! -${dmg} 🎯`, b.x, b.y - 15, '#ff0055');
                    propsRef.current.onScoreEarned(150);
                  } else if (isArmorDeflected) {
                    addFloatingText(`ARMOR! -${dmg} 🛡️`, b.x, b.y - 12, '#38bdf8');
                    propsRef.current.onScoreEarned(60);
                  } else {
                    addFloatingText(`HIT -${dmg}`, b.x, b.y - 10, '#ffff00');
                    propsRef.current.onScoreEarned(75);
                  }
                }

                b.penetrationLeft--;
                if (b.penetrationLeft <= 0) {
                  removeBullet = true;
                  break;
                } else {
                  b.damage = Math.max(0.5, Number((b.damage * b.penetrationDecay).toFixed(2)));
                  spawnParticles(b.x, b.y, b.color, 6, 1.3, false);
                  addFloatingText('PIERCE! ⚡', b.x, b.y - 26, '#38bdf8');
                }
              }
            }

            if (removeBullet) break;
          }

          b.trail.unshift({ x: b.x, y: b.y, alpha: 1.0 });
          if (b.trail.length > 9) b.trail.pop();

          if (removeBullet) {
            bullets.splice(i, 1);
          }
        }

        // 4. Ragdoll Physics for Defeated Zombies
        zombies.forEach(z => {
          if (!z.alive && z.ragdoll) {
            z.ragdoll.vx *= 0.94;
            z.ragdoll.vy += 0.35;
            z.x += z.ragdoll.vx;
            z.y += z.ragdoll.vy;
            z.ragdoll.angle += z.ragdoll.vAngle;

            for (const s of structures) {
              if (s.broken || s.type === 'hazard' || s.h > s.w) continue;
              if (
                z.x + z.w > s.x &&
                z.x < s.x + s.w &&
                z.y + z.h >= s.y &&
                z.y + z.h <= s.y + 20 &&
                z.ragdoll.vy > 0
              ) {
                z.y = s.y - z.h;
                z.ragdoll.vx *= 0.6;
                z.ragdoll.vy = -z.ragdoll.vy * 0.3;
                if (Math.abs(z.ragdoll.vy) < 0.8) {
                  z.ragdoll = undefined;
                }
                break;
              }
            }

            if (z.ragdoll && z.y + z.h > 524) {
              z.y = 524 - z.h;
              z.ragdoll.vx *= 0.6;
              z.ragdoll.vy = -z.ragdoll.vy * 0.3;
              if (Math.abs(z.ragdoll.vy) < 0.8) {
                z.ragdoll = undefined;
              }
            }
          }
        });

        // 5. Update Tap Target Reticles, Particles & Floating Texts
        for (let i = tapReticles.length - 1; i >= 0; i--) {
          tapReticles[i].life++;
          if (tapReticles[i].life >= tapReticles[i].maxLife) {
            tapReticles.splice(i, 1);
          }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.dx;
          p.y += p.dy;
          if (p.gravity) p.dy += p.gravity;
          p.life++;
          if (p.life >= p.maxLife) {
            particles.splice(i, 1);
          }
        }

        for (let i = floatingTexts.length - 1; i >= 0; i--) {
          const ft = floatingTexts[i];
          ft.y += ft.dy;
          ft.alpha -= 0.02;
          if (ft.alpha <= 0) {
            floatingTexts.splice(i, 1);
          }
        }

        // 6. Check Mission Win / Loss Conditions (Wait until no bullets, falling zombies, or chain blasts remain!)
        const anyZombieFalling = zombies.some(z => z.alive && z.isFalling);
        if (!roundEnded && bullets.length === 0 && !anyZombieFalling && pendingExplosions === 0) {
          const remaining = getTotalRemainingZombies();
          if (remaining === 0 && player.alive && !victoryDispatched) {
            victoryDispatched = true;
            roundEnded = true;
            cancelActiveAimWithoutFiring(false);
            sound.playLevelClear();
            const earnedCombat = missionCombatCoins;
            const finalAmmo = totalAmmo;
            const tid = window.setTimeout(() => {
              propsRef.current.onLevelCleared(finalAmmo, earnedCombat);
            }, 600);
            activeTimeouts.push(tid);
          } else if (totalAmmo === 0 && player.alive) {
            roundEnded = true;
            cancelActiveAimWithoutFiring(false);
            addFloatingText('OUT OF AMMO! MISSION FAILED', W / 2, H / 2 - 40, '#ff3366');
            sound.playGameOver();
            const tid = window.setTimeout(() => {
              propsRef.current.onGameOver('Out of Ammunition — Use headshots, TNT barrels, or ice drops!');
            }, 800);
            activeTimeouts.push(tid);
          }
        }
      }

      // ========== RENDER SCENE (WITH SECTOR & LEVEL ENVIRONMENT STYLING) ==========
      ctx.clearRect(0, 0, W, H);

      const envTheme = levelData.environmentTheme || {
        backdrop: 'ruins',
        skyTopColor: '#0f172a',
        skyMidColor: '#080a14',
        floorColor: '#1e293b',
        gridColor: 'rgba(56, 189, 248, 0.035)',
        accentLightColor: '#38bdf8',
        ambientLabel: 'Urban Sector'
      };

      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, envTheme.skyTopColor);
      bgGrad.addColorStop(0.65, envTheme.skyMidColor);
      bgGrad.addColorStop(1, '#020308');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Subtle Distant Sector Architectural Silhouette
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
      const seedShift = (propsRef.current.currentLevel * 37) % 60;
      for (let bx = 16; bx < W - 40; bx += 76) {
        const bh = 95 + ((bx + seedShift) % 115);
        ctx.fillRect(bx, 524 - bh, 54, bh);
      }
      ctx.strokeStyle = envTheme.gridColor;
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();

      ctx.drawImage(decalCanvas, 0, 0);

      // Laser Sight Trajectory from Gun Muzzle
      if (!roundEnded && totalAmmo > 0 && player.alive) {
        const muzzle = getMuzzlePosition(player.angle);
        const trajectory = computeTrajectory(muzzle.x, muzzle.y, player.angle);
        const lineColor = isAiming && isInCancelZone ? '#ff3366' : gunItem.bulletColor;

        ctx.save();
        ctx.setLineDash(isAiming && isInCancelZone ? [3, 7] : [5, 5]);
        ctx.strokeStyle = lineColor;
        ctx.globalAlpha = isAiming ? 0.92 : 0.45;
        ctx.lineWidth = isAiming ? 2.4 : 1.5;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = isAiming ? 8 : 4;
        ctx.beginPath();
        ctx.moveTo(trajectory[0].x, trajectory[0].y);
        for (let i = 1; i < trajectory.length; i++) {
          ctx.lineTo(trajectory[i].x, trajectory[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        for (let i = 1; i < trajectory.length; i++) {
          ctx.beginPath();
          ctx.arc(trajectory[i].x, trajectory[i].y, isAiming ? 3.2 : 2.2, 0, Math.PI * 2);
          ctx.fillStyle = lineColor;
          ctx.fill();
        }

        if (isAiming && !isInCancelZone) {
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(aimTargetX, aimTargetY, 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(aimTargetX - 20, aimTargetY);
          ctx.lineTo(aimTargetX - 8, aimTargetY);
          ctx.moveTo(aimTargetX + 8, aimTargetY);
          ctx.lineTo(aimTargetX + 20, aimTargetY);
          ctx.moveTo(aimTargetX, aimTargetY - 20);
          ctx.lineTo(aimTargetX, aimTargetY - 8);
          ctx.moveTo(aimTargetX, aimTargetY + 8);
          ctx.lineTo(aimTargetX, aimTargetY + 20);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Structures & Platforms (with Moving Track Guides for moving obstacles)
      structures.forEach((s, idx) => {
        if (s.broken) return;

        // Draw subtle guide track if structure is a moving obstacle
        if (idx >= 4 && ((s.vx && s.vx !== 0) || (s.vy && s.vy !== 0))) {
          ctx.save();
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          if (s.vx && typeof s.minX === 'number' && typeof s.maxX === 'number') {
            ctx.moveTo(s.minX, s.y + s.h / 2);
            ctx.lineTo(s.maxX + s.w, s.y + s.h / 2);
          } else if (s.vy && typeof s.minY === 'number' && typeof s.maxY === 'number') {
            ctx.moveTo(s.x + s.w / 2, s.minY);
            ctx.lineTo(s.x + s.w / 2, s.maxY + s.h);
          }
          ctx.stroke();
          ctx.restore();
        }

        if (s.type === 'platform') {
          drawPlayerPlatform(ctx, s, charItem.color || '#00e5ff');
          return;
        }

        if (s.type === 'hazard') {
          ctx.save();
          ctx.fillStyle = '#450a0a';
          ctx.fillRect(s.x, s.y + 4, s.w, s.h - 4);
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 6;
          for (let sx = s.x + 4; sx < s.x + s.w - 6; sx += 12) {
            ctx.beginPath();
            ctx.moveTo(sx, s.y + s.h);
            ctx.lineTo(sx + 5, s.y);
            ctx.lineTo(sx + 10, s.y + s.h);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
          return;
        }

        if (s.type === 'ice') {
          ctx.save();
          ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.6;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 5;
          ctx.fillRect(s.x, s.y, s.w, s.h);
          ctx.strokeRect(s.x, s.y, s.w, s.h);

          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.lineWidth = 1;
          ctx.moveTo(s.x + 4, s.y + 4);
          ctx.lineTo(s.x + s.w - 4, s.y + s.h - 4);
          ctx.stroke();
          ctx.restore();
        } else if (s.type === 'bounce') {
          ctx.save();
          ctx.fillStyle = '#a855f7';
          ctx.strokeStyle = '#d8b4fe';
          ctx.lineWidth = 2;
          ctx.fillRect(s.x, s.y, s.w, s.h);
          ctx.strokeRect(s.x, s.y, s.w, s.h);
          ctx.restore();
        } else if (s.type === 'metal') {
          ctx.save();
          ctx.fillStyle = '#334155';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.8;
          ctx.fillRect(s.x, s.y, s.w, s.h);
          ctx.strokeRect(s.x, s.y, s.w, s.h);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(s.x + 2, s.y + 2, s.w - 4, 3);
          ctx.restore();
        } else {
          ctx.save();
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.fillRect(s.x, s.y, s.w, s.h);
          ctx.strokeRect(s.x, s.y, s.w, s.h);

          ctx.strokeStyle = '#475569';
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + s.w, s.y);
          ctx.stroke();
          ctx.restore();
        }
      });

      // TNT Barrels (with subtle blast radius ring while aiming)
      tntBarrels.forEach(tnt => {
        if (tnt.exploded) return;
        ctx.save();

        if (isAiming && !isInCancelZone) {
          ctx.beginPath();
          ctx.arc(tnt.x, tnt.y, 140, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.18)';
          ctx.setLineDash([4, 6]);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.arc(tnt.x, tnt.y, tnt.r, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fef08a';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TNT', tnt.x, tnt.y);
        ctx.restore();
      });

      // Render Humanoid Zombies
      zombies.forEach(z => {
        drawHumanoidZombie(ctx, z);
      });

      // Render Main Survivor Player (Dark, Rugged, Battle-Worn Archetype Styling)
      ctx.save();
      ctx.translate(player.x, player.y);

      if (!player.alive) {
        ctx.rotate(player.deathAngle || -Math.PI / 2.1);
      }

      const facing = Math.cos(player.angle) >= 0 ? 1 : -1;
      const suitColor = !player.alive
        ? '#64748b'
        : player.hitTimer > 0
        ? '#f43f5e'
        : charItem.color || '#38bdf8';
      const armorPrimary = !player.alive
        ? '#1e293b'
        : charItem.armorPrimary || '#243040';
      const armorSecondary = !player.alive
        ? '#0f172a'
        : charItem.armorSecondary || '#131b26';
      const fabricColor = !player.alive
        ? '#18202c'
        : charItem.fabricColor || '#1a2332';
      const rimColor = !player.alive
        ? '#475569'
        : charItem.rimColor || '#64748b';
      const armorStyle = charItem.armorStyle || 'soldier';

      if (player.alive && !player.isFalling) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 3.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.scale(facing, 1);

      // Heavy Combat Boots planted on y = 0 with steel toe-cap, sole tread & rim highlight
      ctx.fillStyle = '#090c14';
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1.2;
      ctx.fillRect(-11, -6.5, 9, 6.5);
      ctx.strokeRect(-11, -6.5, 9, 6.5);
      ctx.fillRect(2, -6.5, 10, 6.5);
      ctx.strokeRect(2, -6.5, 10, 6.5);
      ctx.fillStyle = '#182234';
      ctx.fillRect(-10.5, -4.5, 8, 2);
      ctx.fillRect(2.5, -4.5, 9, 2);
      ctx.fillStyle = suitColor;
      ctx.fillRect(-10.5, -1.8, 8, 1.5);
      ctx.fillRect(2.5, -1.8, 9, 1.5);

      // Cargo Pants, Cloth Creases, Drop-Leg Holster & Beveled Knee Pads
      ctx.fillStyle = fabricColor;
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1.1;
      ctx.fillRect(-10, -31, 8, 24.5);
      ctx.strokeRect(-10, -31, 8, 24.5);
      ctx.fillRect(2, -31, 8, 24.5);
      ctx.strokeRect(2, -31, 8, 24.5);

      // Cloth Crease / Shin Guard Ridge
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-6, -29);
      ctx.lineTo(-6, -21);
      ctx.moveTo(6, -13);
      ctx.lineTo(6, -7);
      ctx.stroke();

      // Thigh Holster Strap & Pouch
      ctx.fillStyle = '#070a10';
      ctx.fillRect(1.8, -26, 8.4, 2);
      ctx.fillStyle = '#0b101b';
      ctx.fillRect(3, -29, 7, 6.5);
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(3, -29, 7, 6.5);

      // Rugged Knee Pads
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1.1;
      ctx.fillRect(-9.5, -19.5, 7.5, 5.5);
      ctx.strokeRect(-9.5, -19.5, 7.5, 5.5);
      ctx.fillRect(2.5, -19.5, 7.5, 5.5);
      ctx.strokeRect(2.5, -19.5, 7.5, 5.5);
      ctx.fillStyle = suitColor;
      ctx.fillRect(-8, -17.5, 4.5, 1.4);
      ctx.fillRect(4, -17.5, 4.5, 1.4);

      // Utility Belt & Mag Pouches
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1.1;
      ctx.fillRect(-12, -35.5, 24, 4.5);
      ctx.strokeRect(-12, -35.5, 24, 4.5);
      ctx.fillStyle = armorPrimary;
      ctx.fillRect(-11, -36.5, 5.2, 5.5);
      ctx.strokeRect(-11, -36.5, 5.2, 5.5);
      ctx.fillRect(5.8, -36.5, 5.2, 5.5);
      ctx.strokeRect(5.8, -36.5, 5.2, 5.5);
      ctx.fillStyle = suitColor;
      ctx.fillRect(-2.5, -35, 5, 3.5);

      // Rugged Armored Torso & Plate Carrier
      ctx.fillStyle = armorPrimary;
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1.3;
      ctx.fillRect(-12.5, -58.5, 25, 23);
      ctx.strokeRect(-12.5, -58.5, 25, 23);

      // Top Specular Rim Highlight on Chest Armor
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.38)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-11.5, -57.5);
      ctx.lineTo(11.5, -57.5);
      ctx.stroke();

      // Inner Ballistic Plate & MOLLE Webbing
      ctx.fillStyle = armorSecondary;
      ctx.fillRect(-9.5, -55.5, 19, 17);
      ctx.strokeStyle = '#3b4f6b';
      ctx.lineWidth = 1;
      ctx.strokeRect(-9.5, -55.5, 19, 17);

      // Battle Scuff / Scratch line + Core Emblem
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
      ctx.beginPath();
      ctx.moveTo(-7, -46);
      ctx.lineTo(-2, -42);
      ctx.stroke();

      ctx.fillStyle = suitColor;
      ctx.fillRect(-4, -52.5, 8, 3.2);
      ctx.fillStyle = '#26354d';
      ctx.fillRect(-7, -47, 14, 2);
      ctx.fillRect(-7, -43.5, 14, 2);

      // Shoulder Pauldron Rim + Accent Strip
      ctx.fillStyle = armorPrimary;
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1.25;
      ctx.fillRect(-14.5, -58, 5.5, 9.5);
      ctx.strokeRect(-14.5, -58, 5.5, 9.5);
      ctx.fillStyle = suitColor;
      ctx.fillRect(-13.5, -55, 3.5, 1.4);

      // Neck, Gorget & Archetype Helmet
      ctx.fillStyle = charItem.skinColor || '#d9a97c';
      ctx.fillRect(-4, -62.5, 8, 4);
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1;
      ctx.fillRect(-7.5, -60, 15, 2.8);
      ctx.strokeRect(-7.5, -60, 15, 2.8);

      // Helmet Shell
      ctx.fillStyle = armorPrimary;
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1.45;
      ctx.beginPath();
      if (armorStyle === 'juggernaut') {
        ctx.roundRect(-11.5, -79, 23, 18.5, 4);
      } else if (armorStyle === 'reaper') {
        ctx.moveTo(-10.5, -75);
        ctx.lineTo(0, -80);
        ctx.lineTo(10.5, -75);
        ctx.lineTo(9.5, -60.5);
        ctx.lineTo(-9.5, -60.5);
        ctx.closePath();
      } else {
        ctx.roundRect(-10.5, -78.5, 21, 18, 6);
      }
      ctx.fill();
      ctx.stroke();

      // Faceplate / Mask & Archetype Visor
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-6, -68, 15, 7.5);
      ctx.fillStyle = suitColor;
      if (armorStyle === 'phantom') {
        // Quad NVG green nodes
        ctx.beginPath();
        ctx.arc(2.5, -71, 1.8, 0, Math.PI * 2);
        ctx.arc(7, -71, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (armorStyle === 'cyber') {
        // Dual crimson optics
        ctx.beginPath();
        ctx.arc(3, -71, 2, 0, Math.PI * 2);
        ctx.arc(7.5, -71, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Tactical Ballistic Visor
        ctx.fillRect(0.5, -72.5, 9, 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.fillRect(1.5, -72, 5, 1.3);
      }

      if (armorStyle === 'ranger') {
        // Side respirator filter canister
        ctx.fillStyle = '#0c120e';
        ctx.strokeStyle = suitColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(7.5, -63.5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();

      // Rotating Arms, Tactical Gloves & Equipped Weapon (Fixed at rest if dead)
      ctx.save();
      ctx.translate(0, -SHOULDER_OFFSET_Y);
      const armAngle = player.alive ? player.angle : 0.35;
      ctx.rotate(armAngle);
      if (Math.cos(armAngle) < 0) {
        ctx.scale(1, -1);
      }

      // Upper Arm Sleeve + Shoulder Pad
      ctx.fillStyle = fabricColor;
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1.15;
      ctx.fillRect(-5.5, -4.5, 11.5, 6.5);
      ctx.strokeRect(-5.5, -4.5, 11.5, 6.5);

      drawEquippedWeapon(ctx, gunItem);

      // Right Trigger Hand Hard-Knuckle Glove
      ctx.fillStyle = '#0b101b';
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1.1;
      ctx.fillRect(3.5, -2.5, 5.5, 5.5);
      ctx.strokeRect(3.5, -2.5, 5.5, 5.5);
      ctx.fillStyle = suitColor;
      ctx.fillRect(4.2, -2.2, 4, 1);
      ctx.fillStyle = charItem.skinColor || '#d9a97c';
      ctx.fillRect(5, -0.8, 3, 2);

      // Left Support Forearm & Hard-Knuckle Glove
      ctx.fillStyle = fabricColor;
      ctx.strokeStyle = rimColor;
      ctx.fillRect(6, 1, 12, 4.2);
      ctx.strokeRect(6, 1, 12, 4.2);
      ctx.fillStyle = '#0b101b';
      ctx.fillRect(15.5, -2.5, 5.5, 5.5);
      ctx.strokeRect(15.5, -2.5, 5.5, 5.5);
      ctx.fillStyle = suitColor;
      ctx.fillRect(16.2, -2.2, 4, 1);
      ctx.fillStyle = charItem.skinColor || '#d9a97c';
      ctx.fillRect(16.5, -0.8, 3.5, 2);

      ctx.restore();
      ctx.restore();

      // Player Health Bar & Reload Bar above Player
      if (player.alive) {
        if (player.hp < player.maxHp || player.hitTimer > 0) {
          const hpW = 40;
          const hpH = 4;
          const hx = player.x - hpW / 2;
          const hy = player.y - 84;
          ctx.save();
          ctx.fillStyle = 'rgba(0,0,0,0.8)';
          ctx.fillRect(hx, hy, hpW, hpH);
          ctx.fillStyle = player.hp > 1 ? '#10b981' : '#f43f5e';
          ctx.fillRect(hx, hy, hpW * (player.hp / player.maxHp), hpH);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(hx, hy, hpW, hpH);
          ctx.restore();
        }

        if (isReloading) {
          const remainingMs = Math.max(0, reloadEndTime - performance.now());
          const progress = Math.min(1, Math.max(0, 1 - remainingMs / reloadDurationMs));
          const barW = 46;
          const barH = 5;
          const bx = player.x - barW / 2;
          const by = player.y - 92;
          ctx.save();
          ctx.fillStyle = 'rgba(0,0,0,0.8)';
          ctx.fillRect(bx, by, barW, barH);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(bx, by, barW * progress, barH);
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, by, barW, barH);
          ctx.restore();
        }
      }

      // Enemy Bio-Acid Projectiles
      enemyProjectiles.forEach(ep => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
        ctx.fillStyle = ep.color;
        ctx.shadowColor = ep.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });

      // Player Bullets
      bullets.forEach(b => {
        for (let t = 0; t < b.trail.length; t++) {
          const pt = b.trail[t];
          const alpha = (1 - t / b.trail.length) * 0.7;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, b.radius * (1 - (t / b.trail.length) * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      });

      // Tap Target Aim Feedback Reticles
      tapReticles.forEach(tr => {
        const progress = tr.life / tr.maxLife;
        const alpha = 1 - progress;
        const radius = 6 + progress * 16;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = tr.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(tr.x - radius - 4, tr.y);
        ctx.lineTo(tr.x - radius + 2, tr.y);
        ctx.moveTo(tr.x + radius - 2, tr.y);
        ctx.lineTo(tr.x + radius + 4, tr.y);
        ctx.moveTo(tr.x, tr.y - radius - 4);
        ctx.lineTo(tr.x, tr.y - radius + 2);
        ctx.moveTo(tr.x, tr.y + radius - 2);
        ctx.lineTo(tr.x, tr.y + radius + 4);
        ctx.stroke();
        ctx.restore();
      });

      // Particles
      particles.forEach(p => {
        ctx.save();
        const alpha = 1 - p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Floating Texts
      floatingTexts.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(String(ft.text), ft.x, ft.y);
        ctx.restore();
      });

      // ========== DEDICATED CANCEL SHOT ZONE (VISIBLE ONLY WHILE HOLDING TO AIM) ==========
      if (isAiming && !roundEnded && player.alive) {
        ctx.save();
        ctx.fillStyle = isInCancelZone
          ? 'rgba(136, 19, 55, 0.95)'
          : 'rgba(26, 14, 22, 0.94)';
        ctx.strokeStyle = isInCancelZone ? '#fb7185' : '#9f1239';
        ctx.lineWidth = isInCancelZone ? 2.2 : 1.6;

        ctx.beginPath();
        ctx.roundRect(CANCEL_BOX_X, CANCEL_BOX_Y, CANCEL_BOX_W, CANCEL_BOX_H, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isInCancelZone ? '#fff1f2' : '#fda4af';
        ctx.font = 'bold 12.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          isInCancelZone
            ? '✖ छोड़ें: गोली रद्द (NO AMMO LOST)'
            : '⬇ नीचे खींचें: Cancel Shot',
          W / 2,
          CANCEL_BOX_Y + CANCEL_BOX_H / 2
        );
        ctx.restore();
      } else {
        // Unified Dark Charcoal Objective Strip when not actively holding aim
        ctx.save();
        ctx.fillStyle = 'rgba(11, 16, 27, 0.92)';
        ctx.strokeStyle = '#2b394e';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(20, H - 35, W - 40, 23, 7);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#bae6fd';
        ctx.font = 'bold 10.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🎯 ${levelData.objectiveText}`, W / 2, H - 23.5);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      activeTimeouts.forEach(tid => clearTimeout(tid));
      canvas.removeEventListener('pointerdown', handleCanvasPointerDown);
      canvas.removeEventListener('pointermove', handleCanvasPointerMove);
      canvas.removeEventListener('pointerup', handleCanvasPointerUp);
      canvas.removeEventListener('pointercancel', handleCanvasPointerCancel);
    };
  }, [currentLevel, activeChar, activeGun]);

  return (
    <canvas
      id="gameCanvas"
      ref={canvasRef}
      width={600}
      height={600}
      className="block w-full h-full cursor-crosshair select-none touch-none aspect-square"
    />
  );
};
