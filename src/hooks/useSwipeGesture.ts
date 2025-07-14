import { useCallback, useRef } from 'react';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right' | null;

interface SwipeGestureConfig {
  minSwipeDistance?: number;
  preventDefaultOnSwipe?: boolean;
  onSwipe?: (direction: SwipeDirection) => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export const useSwipeGesture = (config: SwipeGestureConfig = {}) => {
  const {
    minSwipeDistance = 30,
    preventDefaultOnSwipe = true,
    onSwipe,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
  } = config;

  const touchStartRef = useRef<TouchPoint | null>(null);
  const isSwipingRef = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const point = 'touches' in e ? e.touches[0] : e;
      touchStartRef.current = {
        x: point.clientX,
        y: point.clientY,
        time: Date.now(),
      };
      isSwipingRef.current = false;
    },
    [],
  );

  const detectSwipeDirection = useCallback(
    (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
    ): SwipeDirection => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX < minSwipeDistance && absY < minSwipeDistance) {
        return null;
      }

      if (absX > absY) {
        return deltaX > 0 ? 'right' : 'left';
      } else {
        return deltaY > 0 ? 'down' : 'up';
      }
    },
    [minSwipeDistance],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!touchStartRef.current) return;

      const point = 'touches' in e ? e.touches[0] : e;
      const direction = detectSwipeDirection(
        touchStartRef.current.x,
        touchStartRef.current.y,
        point.clientX,
        point.clientY,
      );

      if (direction && !isSwipingRef.current) {
        isSwipingRef.current = true;
        if (preventDefaultOnSwipe) {
          e.preventDefault();
        }
      }
    },
    [detectSwipeDirection, preventDefaultOnSwipe],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!touchStartRef.current) return;

      const point = 'changedTouches' in e ? e.changedTouches[0] : e;
      const direction = detectSwipeDirection(
        touchStartRef.current.x,
        touchStartRef.current.y,
        point.clientX,
        point.clientY,
      );

      if (direction) {
        if (preventDefaultOnSwipe) {
          e.preventDefault();
        }

        // Call the appropriate callback
        if (onSwipe) onSwipe(direction);

        switch (direction) {
          case 'up':
            onSwipeUp?.();
            break;
          case 'down':
            onSwipeDown?.();
            break;
          case 'left':
            onSwipeLeft?.();
            break;
          case 'right':
            onSwipeRight?.();
            break;
        }
      }

      touchStartRef.current = null;
      isSwipingRef.current = false;
    },
    [
      detectSwipeDirection,
      preventDefaultOnSwipe,
      onSwipe,
      onSwipeUp,
      onSwipeDown,
      onSwipeLeft,
      onSwipeRight,
    ],
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleTouchStart,
    onMouseMove: handleTouchMove,
    onMouseUp: handleTouchEnd,
  };
};
