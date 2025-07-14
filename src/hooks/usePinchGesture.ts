import { useCallback, useRef } from 'react';

interface PinchPoint {
  x: number;
  y: number;
}

interface PinchGestureConfig {
  onPinch?: (scale: number, centerY: number) => void;
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
  preventDefaultOnPinch?: boolean;
}

export const usePinchGesture = (config: PinchGestureConfig = {}) => {
  const {
    onPinch,
    onPinchStart,
    onPinchEnd,
    preventDefaultOnPinch = true,
  } = config;

  const initialDistanceRef = useRef<number | null>(null);
  const isPinchingRef = useRef(false);
  const touchPointsRef = useRef<PinchPoint[]>([]);

  const getDistance = useCallback((touches: React.TouchList): number => {
    if (touches.length < 2) return 0;

    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getCenterY = useCallback((touches: React.TouchList): number => {
    if (touches.length < 2) return touches[0]?.clientY || 0;
    return (touches[0].clientY + touches[1].clientY) / 2;
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        if (preventDefaultOnPinch) {
          e.preventDefault();
        }

        initialDistanceRef.current = getDistance(e.touches);
        isPinchingRef.current = true;

        touchPointsRef.current = [
          { x: e.touches[0].clientX, y: e.touches[0].clientY },
          { x: e.touches[1].clientX, y: e.touches[1].clientY },
        ];

        onPinchStart?.();
      } else {
        // Reset if not two fingers
        initialDistanceRef.current = null;
        isPinchingRef.current = false;
      }
    },
    [getDistance, preventDefaultOnPinch, onPinchStart],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (
        e.touches.length === 2 &&
        initialDistanceRef.current &&
        isPinchingRef.current
      ) {
        if (preventDefaultOnPinch) {
          e.preventDefault();
        }

        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / initialDistanceRef.current;
        const centerY = getCenterY(e.touches);

        onPinch?.(scale, centerY);
      }
    },
    [getDistance, getCenterY, preventDefaultOnPinch, onPinch],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isPinchingRef.current) {
        if (preventDefaultOnPinch) {
          e.preventDefault();
        }

        isPinchingRef.current = false;
        initialDistanceRef.current = null;
        onPinchEnd?.();
      }
    },
    [preventDefaultOnPinch, onPinchEnd],
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};
