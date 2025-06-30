/**
 * Sempoa (Abacus) Configuration
 * Centralized configuration for all dimensions, positions, and layout constants
 */

export const SEMPOA_CONFIG = {
  // Board structure
  COLUMNS: 13,
  UPPER_BEADS_PER_COLUMN: 1,
  LOWER_BEADS_PER_COLUMN: 4,

  // Bead dimensions
  BEAD: {
    WIDTH: 28, // px
    HEIGHT: 20, // px
    HOLE_SIZE: 4, // px
  },

  // Column dimensions
  COLUMN: {
    WIDTH: 48, // px
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
    WIDTH: 4, // px
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
} as const;

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
} as const;
