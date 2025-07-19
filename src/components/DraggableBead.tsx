import { motion, type PanInfo } from 'framer-motion';
import type React from 'react';
import { useState } from 'react';
import { DERIVED_CONFIG, SEMPOA_CONFIG } from '../config/sempoaConfig';
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

  // Calculate drag constraints and target positions for this bead
  const dragConstraints = DERIVED_CONFIG.getDragConstraints(
    bead.isUpper,
    bead.row,
    isActive,
  );
  const targetPositions = DERIVED_CONFIG.getTargetPositions(
    bead.isUpper,
    bead.row,
  );

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handle real-time drag movement
  const handleDrag = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    _info: PanInfo,
  ) => {
    // Real-time position updates happen automatically via framer-motion
    // The drag constraints ensure the bead stays within valid bounds
  };

  // Handle drag completion with smart snapping
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    setIsDragging(false);

    // Calculate drag progress based on offset distance and direction
    const dragDistanceY = Math.abs(info.offset.y);
    const travelDistance = Math.abs(
      targetPositions.active - targetPositions.inactive,
    );
    const travelProgress = dragDistanceY / travelDistance;

    // For beads, any significant drag (past snap threshold) should toggle the state
    // This simulates the physical behavior where dragging a bead moves it to the opposite position
    const shouldChangeState =
      travelProgress >= SEMPOA_CONFIG.DRAG.SNAP_THRESHOLD;

    // Trigger state change if drag distance is significant enough
    if (shouldChangeState) {
      onClick();
      triggerHapticFeedback();
    }
  };

  const baseClasses = `cursor-pointer transition-all duration-300 hover:scale-105 shadow-md`;
  const activeClasses = isActive ? 'shadow-lg' : 'hover:shadow-lg';

  // Enhanced drag visual feedback
  const dragClasses = isDragging ? 'opacity-80 scale-105' : '';

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
      // Drag configuration for smooth movement
      drag="y" // Only vertical dragging
      dragConstraints={dragConstraints}
      dragElastic={0} // No elastic movement beyond constraints
      dragMomentum={false} // Immediate stop when released
      // Drag event handlers
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      // Visual feedback
      whileDrag={{
        scale: SEMPOA_CONFIG.DRAG.VISUAL_FEEDBACK.DRAG_SCALE,
        opacity: SEMPOA_CONFIG.DRAG.VISUAL_FEEDBACK.DRAG_OPACITY,
      }}
      whileTap={{ scale: 0.95 }}
      // Animation configuration
      transition={SEMPOA_CONFIG.DRAG.SPRING_CONFIG}
    />
  );
};

export default DraggableBead;
