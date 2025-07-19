import { useDrag } from '@use-gesture/react';
import type React from 'react';
import { useState } from 'react';
import { SEMPOA_CONFIG } from '../config/sempoaConfig';
import type { BeadPosition } from '../types';
import { playLowerBeadClick, playUpperBeadClick } from '../utils/audioFeedback';

// Haptic feedback utility
const triggerHapticFeedback = (
  duration: number = SEMPOA_CONFIG.GESTURES.HAPTIC_FEEDBACK.DURATION,
) => {
  if (SEMPOA_CONFIG.GESTURES.HAPTIC_FEEDBACK.ENABLED && navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

interface DraggableBeadProps {
  bead: BeadPosition;
  isActive: boolean;
  onClick: () => void;
}

const DraggableBead: React.FC<DraggableBeadProps> = ({
  bead,
  isActive,
  onClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Swipe gesture configuration
  const bind = useDrag(
    ({
      movement: [, my], // Only care about y-axis movement
      direction: [, _dy], // Direction of movement
      velocity: [, vy], // Velocity of movement
      tap,
      event,
    }) => {
      // Prevent default browser behavior (scrolling) during gesture
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Skip gesture handling if gestures are disabled (configurable)
      if (!SEMPOA_CONFIG.GESTURES.ENABLED) return;

      // Ignore tap events - let onClick handle those
      if (tap) return;

      // Check if movement meets threshold requirements
      // Either sufficient distance OR sufficient velocity should trigger the gesture
      const hasMinDistance =
        Math.abs(my) >= SEMPOA_CONFIG.GESTURES.SWIPE_THRESHOLD;
      const hasMinVelocity =
        Math.abs(vy) > SEMPOA_CONFIG.GESTURES.VELOCITY_THRESHOLD;

      if (hasMinDistance || hasMinVelocity) {
        // Trigger bead action for both up and down swipes
        // The existing toggleBead logic will handle the specific behavior
        onClick();

        // Trigger haptic feedback
        triggerHapticFeedback();
      }
    },
    {
      axis: 'y', // Only vertical swipes
      filterTaps: true, // Distinguish between taps and swipes
      threshold: 3, // Very low threshold to start detecting gestures quickly
      preventDefault: true, // Prevent default browser behaviors
      pointer: { touch: true }, // Enable touch events
    },
  );

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify(bead));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Play audio feedback for drag interaction
    if (bead.isUpper) {
      playUpperBeadClick();
    } else {
      playLowerBeadClick();
    }
  };

  const baseClasses = `cursor-pointer transition-all duration-300 hover:scale-105 shadow-md`;
  const activeClasses = isActive ? 'shadow-lg' : 'hover:shadow-lg';

  const dragClasses = isDragging ? 'opacity-50' : '';

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
  };

  return (
    <button
      type="button"
      aria-label={`Bead in column ${bead.column + 1}, row ${bead.row + 1}, ${isActive ? 'active' : 'inactive'}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`${baseClasses} ${activeClasses} ${dragClasses} border-none p-0`}
      style={beadStyle}
      onClick={onClick}
      {...bind()}
    />
  );
};

export default DraggableBead;
