import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Language } from '../types/game';

interface ControlPadProps {
  lang: Language;
  onAimAngle: (angleRad: number) => void;
  onFire: () => void;
  disabled: boolean;
}

export const ControlPad: React.FC<ControlPadProps> = ({
  lang,
  onAimAngle,
  onFire,
  disabled
}) => {
  const padRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [sliderPosPercent, setSliderPosPercent] = useState<number>(50); // 50% = center
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  const updateAim = useCallback((clientX: number) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const halfWidth = rect.width / 2;
    const midOffset = clientX - (rect.left + halfWidth);

    // Empty Plane Horizontal Friction Drag Calculation
    const normalized = Math.max(-1, Math.min(1, midOffset / (halfWidth * 0.85)));
    const sliderPercent = 50 + normalized * 42;
    setSliderPosPercent(sliderPercent);

    // Aim Angle: -PI/2 is straight up, tilting left/right
    const angle = -Math.PI / 2 + (midOffset / halfWidth) * (Math.PI / 3.5);
    onAimAngle(angle);
  }, [onAimAngle]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || disabled) return;
      e.preventDefault();
      updateAim(e.clientX);
    };

    const handlePointerUp = () => {
      if (isDraggingRef.current) {
        setIsDragging(false);
        isDraggingRef.current = false;
        if (!disabled) {
          onFire();
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [disabled, onFire, updateAim]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    isDraggingRef.current = true;
    updateAim(e.clientX);
  };

  return (
    <div
      id="emptyAimPlane"
      ref={padRef}
      onPointerDown={handlePointerDown}
      className={`select-none transition-colors duration-150 ${
        isDragging ? 'bg-cyan-950/15' : 'bg-transparent'
      }`}
    >
      {/* Horizontal Friction Drag Matrix Track */}
      <div className="friction-drag-track">
        <div
          className="friction-drag-slider"
          style={{
            left: `${sliderPosPercent}%`,
            opacity: isDragging ? 1 : 0.6
          }}
        />
      </div>

      <div id="padInfo">
        {isDragging
          ? '🎯 RELEASE TO FIRE!'
          : 'SWIPE HORIZONTALLY TO AIM · RELEASE TO FIRE'}
      </div>
    </div>
  );
};

