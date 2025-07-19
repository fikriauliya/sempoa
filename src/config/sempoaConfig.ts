/**
 * Sempoa (Abacus) Configuration
 * Centralized configuration for all dimensions, positions, and layout constants
 */

export const SEMPOA_CONFIG = {
  // Board structure
  COLUMNS: 9,
  UPPER_BEADS_PER_COLUMN: 1,
  LOWER_BEADS_PER_COLUMN: 4,

  // Bead dimensions
  BEAD: {
    WIDTH: 45, // px
    HEIGHT: 20, // px
    HOLE_SIZE: 4, // px
  },

  // Column dimensions
  COLUMN: {
    WIDTH: 55, // px
  },

  // Section heights (dynamically calculated based on bead count)
  // Each section needs space for all beads plus one empty space
  get SECTIONS() {
    return {
      UPPER_HEIGHT: (this.UPPER_BEADS_PER_COLUMN + 1) * this.BEAD.HEIGHT, // px
      LOWER_HEIGHT: (this.LOWER_BEADS_PER_COLUMN + 1) * this.BEAD.HEIGHT, // px
    };
  },

  // Rod dimensions
  ROD: {
    WIDTH: 10, // px
  },

  // Horizontal separator
  get SEPARATOR() {
    return {
      HEIGHT: 10, // px
      WIDTH_PERCENTAGE: 900, // % (relative to column width)
      LEFT_OFFSET_PERCENTAGE: -400, // % (relative to column width)
      CENTER_POSITION: this.SECTIONS.UPPER_HEIGHT, // px from top of main container (at boundary between sections)
    };
  },

  // Bead positioning (base values)
  POSITIONING: {
    // Upper beads
    UPPER_INACTIVE_TOP: 0, // px from top of upper section
  },

  // Animation
  ANIMATION: {
    TRANSITION_DURATION: '0.3s',
    TRANSITION_EASING: 'ease',
  },

  // Z-index layers
  Z_INDEX: {
    SEPARATOR: 0,
    ROD: 1,
    BEAD: 20,
  },

  // Audio feedback settings
  AUDIO: {
    ENABLED: true,
    VOLUME: 0.3, // 0.0 to 1.0
    UPPER_BEAD_FREQUENCY: 800, // Hz - Higher pitch for upper beads
    LOWER_BEAD_FREQUENCY: 600, // Hz - Lower pitch for lower beads
    CLICK_DURATION: 80, // milliseconds
  },

  // Gesture settings
  GESTURES: {
    ENABLED: true,
    SWIPE_THRESHOLD: 2, // Extremely low - just a tiny movement triggers
    VELOCITY_THRESHOLD: 0.001, // Almost any movement velocity triggers
    HAPTIC_FEEDBACK: {
      ENABLED: true,
      DURATION: 50, // milliseconds
    },
  },

  // Drag settings for smooth bead movement
  DRAG: {
    ENABLED: true,
    SNAP_THRESHOLD: 0.5, // Fraction of travel distance to trigger state change (0.5 = halfway)
    SPRING_CONFIG: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
    VISUAL_FEEDBACK: {
      DRAG_OPACITY: 1,
      DRAG_SCALE: 1.05,
    },
  },
};

// Derived values (computed from base config)
export const DERIVED_CONFIG = {
  // Separator boundaries
  SEPARATOR_TOP:
    SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION -
    SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2,
  SEPARATOR_BOTTOM:
    SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION +
    SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2,

  // Calculated bead positions (to avoid intersection with separator)
  UPPER_ACTIVE_TOP:
    SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION -
    SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2 -
    SEMPOA_CONFIG.BEAD.HEIGHT, // Position so bead bottom touches separator top

  LOWER_ACTIVE_TOP:
    SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION +
    SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2 -
    SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT, // Position so bead top touches separator bottom

  // Lower bead positioning (calculated for proper spacing)
  LOWER_INACTIVE_TOP: SEMPOA_CONFIG.BEAD.HEIGHT, // Provide spacing equal to one bead height from separator

  LOWER_BEAD_SPACING: SEMPOA_CONFIG.BEAD.HEIGHT, // Space beads equal to bead height (no intersection)

  // Main container height (calculated from section heights)
  MAIN_CONTAINER_HEIGHT:
    SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT,

  // Rod height (calculated to match board container height)
  ROD_HEIGHT:
    SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT,

  // Total board dimensions (for container sizing)
  TOTAL_BOARD_HEIGHT:
    SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT,

  TOTAL_BOARD_WIDTH: SEMPOA_CONFIG.COLUMNS * SEMPOA_CONFIG.COLUMN.WIDTH,

  // Dynamic drag boundary calculations
  getDragConstraints: (isUpper: boolean, row: number, _isActive: boolean) => {
    if (isUpper) {
      // Upper beads drag range: from inactive position to active position
      const inactiveTop =
        SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP +
        row * SEMPOA_CONFIG.BEAD.HEIGHT;
      const activeTop =
        SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION -
        SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2 -
        SEMPOA_CONFIG.BEAD.HEIGHT;

      return {
        top: Math.min(inactiveTop, activeTop),
        bottom: Math.max(inactiveTop, activeTop),
        left: 0,
        right: 0,
      };
    } else {
      // Lower beads drag range: from active position to inactive position
      const activeTop =
        SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION +
        SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2 -
        SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT +
        row * SEMPOA_CONFIG.BEAD.HEIGHT;
      const inactiveTop =
        SEMPOA_CONFIG.BEAD.HEIGHT + row * SEMPOA_CONFIG.BEAD.HEIGHT;

      return {
        top: Math.min(activeTop, inactiveTop),
        bottom: Math.max(activeTop, inactiveTop),
        left: 0,
        right: 0,
      };
    }
  },

  // Calculate target positions for snapping
  getTargetPositions: (isUpper: boolean, row: number) => {
    if (isUpper) {
      const inactiveTop =
        SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP +
        row * SEMPOA_CONFIG.BEAD.HEIGHT;
      const activeTop =
        SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION -
        SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2 -
        SEMPOA_CONFIG.BEAD.HEIGHT;

      return {
        inactive: inactiveTop,
        active: activeTop,
      };
    } else {
      const activeTop =
        SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION +
        SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2 -
        SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT +
        row * SEMPOA_CONFIG.BEAD.HEIGHT;
      const inactiveTop =
        SEMPOA_CONFIG.BEAD.HEIGHT + row * SEMPOA_CONFIG.BEAD.HEIGHT;

      return {
        active: activeTop,
        inactive: inactiveTop,
      };
    }
  },
} as const;
