import type React from 'react';
import { useState } from 'react';
import { SEMPOA_CONFIG } from '../config/sempoaConfig';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import type { BeadPosition } from '../types';
import { playLowerBeadClick, playUpperBeadClick } from '../utils/audioFeedback';

interface DraggableBeadProps {
  bead: BeadPosition;
  isActive: boolean;
  onClick: () => void;
  onSwipeActivate?: () => void;
  onSwipeDeactivate?: () => void;
}

const DraggableBead: React.FC<DraggableBeadProps> = ({
  bead,
  isActive,
  onClick,
  onSwipeActivate,
  onSwipeDeactivate,
}) => {
  const [isSwiping, setIsSwiping] = useState(false);

  const handleSwipe = (direction: 'up' | 'down') => {
    // For upper beads: swipe down to activate, swipe up to deactivate
    // For lower beads: swipe up to activate, swipe down to deactivate
    if (bead.isUpper) {
      if (direction === 'down' && !isActive) {
        onSwipeActivate?.();
      } else if (direction === 'up' && isActive) {
        onSwipeDeactivate?.();
      }
    } else {
      if (direction === 'up' && !isActive) {
        onSwipeActivate?.();
      } else if (direction === 'down' && isActive) {
        onSwipeDeactivate?.();
      }
    }
  };

  const swipeHandlers = useSwipeGesture({
    minSwipeDistance: 20,
    onSwipeUp: () => {
      setIsSwiping(true);
      handleSwipe('up');
    },
    onSwipeDown: () => {
      setIsSwiping(true);
      handleSwipe('down');
    },
  });

  const handleClick = () => {
    // Only trigger click if not swiping
    if (!isSwiping) {
      onClick();
    }
    setIsSwiping(false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    swipeHandlers.onTouchEnd(e);
    // Reset swiping state after a short delay
    setTimeout(() => setIsSwiping(false), 100);
  };

  const baseClasses = `cursor-pointer transition-all duration-300 hover:scale-105 shadow-md`;
  const activeClasses = isActive ? 'shadow-lg' : 'hover:shadow-lg';
  const swipeClasses = isSwiping ? 'scale-110' : '';

  const beadStyle = {
    width: `${SEMPOA_CONFIG.BEAD.WIDTH}px`,
    height: `${SEMPOA_CONFIG.BEAD.HEIGHT}px`,
    borderRadius: '50%',
    background:
      'linear-gradient(135deg, #2C1810 0%, #8B4513 20%, #D2691E 40%, #CD853F 60%, #8B4513 80%, #2C1810 100%)',
    border: '1px solid #1A0F0A',
    boxShadow: isActive
      ? '0 3px 10px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(0,0,0,0.3), inset 3px 3px 6px rgba(255,255,255,0.1)'
      : '0 2px 6px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.1)',
    position: 'relative' as const,
    touchAction: 'none', // Prevent default touch behaviors
  };

  return (
    <button
      type="button"
      aria-label={`Bead in column ${bead.column + 1}, row ${bead.row + 1}, ${isActive ? 'active' : 'inactive'}`}
      className={`${baseClasses} ${activeClasses} ${swipeClasses} border-none p-0`}
      style={beadStyle}
      onClick={handleClick}
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={swipeHandlers.onMouseDown}
      onMouseMove={swipeHandlers.onMouseMove}
      onMouseUp={swipeHandlers.onMouseUp}
    />
  );
};

export default DraggableBead;
