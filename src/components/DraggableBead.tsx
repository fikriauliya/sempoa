import { motion, type PanInfo } from 'framer-motion';
import type React from 'react';
import { useState } from 'react';
import { SEMPOA_CONFIG } from '../config/sempoaConfig';
import type { BeadPosition } from '../types';

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

  // Handle pan gesture end (swipe detection)
  const handlePanEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    // Reset dragging state
    setIsDragging(false);

    // Skip gesture handling if gestures are disabled (configurable)
    if (!SEMPOA_CONFIG.GESTURES.ENABLED) return;

    // Get the vertical movement and velocity
    const verticalOffset = Math.abs(info.offset.y);
    const verticalVelocity = Math.abs(info.velocity.y);

    // Check if movement meets threshold requirements
    // Either sufficient distance OR sufficient velocity should trigger the gesture
    const hasMinDistance =
      verticalOffset >= SEMPOA_CONFIG.GESTURES.SWIPE_THRESHOLD;
    const hasMinVelocity =
      verticalVelocity > SEMPOA_CONFIG.GESTURES.VELOCITY_THRESHOLD;

    // With extremely low thresholds, almost any movement will trigger
    if (hasMinDistance || hasMinVelocity) {
      // Trigger bead action for both up and down swipes
      // The existing toggleBead logic will handle the specific behavior
      onClick();

      // Trigger haptic feedback
      triggerHapticFeedback();
    }
  };

  const handlePanStart = () => {
    setIsDragging(true);
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
    <motion.button
      type="button"
      aria-label={`Bead in column ${bead.column + 1}, row ${bead.row + 1}, ${isActive ? 'active' : 'inactive'}`}
      className={`${baseClasses} ${activeClasses} ${dragClasses} border-none p-0`}
      style={{
        ...beadStyle,
        touchAction: 'none', // Prevent default touch behaviors
      }}
      onClick={onClick}
      onPanStart={handlePanStart}
      onPanEnd={handlePanEnd}
      drag // Enable drag for pan gesture detection
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Constrain to prevent actual movement
      dragElastic={0} // No elastic movement
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    />
  );
};

export default DraggableBead;
