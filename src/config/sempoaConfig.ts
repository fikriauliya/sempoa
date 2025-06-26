/**
 * Sempoa (Abacus) Configuration
 * Centralized configuration for all dimensions, positions, and layout constants
 */

export const SEMPOA_CONFIG = {
  // Board structure
  COLUMNS: 7,
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

  // Section heights
  SECTIONS: {
    UPPER_HEIGHT: 40, // px
    LOWER_HEIGHT: 80, // px
    MAIN_CONTAINER_HEIGHT: 150, // px
  },

  // Rod dimensions
  ROD: {
    WIDTH: 4, // px
    HEIGHT: 170, // px
  },

  // Horizontal separator
  SEPARATOR: {
    HEIGHT: 2, // px
    WIDTH_PERCENTAGE: 900, // % (relative to column width)
    LEFT_OFFSET_PERCENTAGE: -400, // % (relative to column width)
    CENTER_POSITION: 40, // px from top of main container
  },

  // Bead positioning
  POSITIONING: {
    // Upper beads
    UPPER_INACTIVE_TOP: 0, // px from top of upper section
    UPPER_ACTIVE_TOP: 19, // px from top of upper section (touching separator top at 39px)

    // Lower beads
    LOWER_INACTIVE_TOP: 20, // px from top of lower section
    LOWER_ACTIVE_TOP: 1, // px from top of lower section (touching separator bottom at 41px)
    LOWER_BEAD_SPACING: 18, // px between consecutive lower beads
  },

  // Animation
  ANIMATION: {
    TRANSITION_DURATION: "0.3s",
    TRANSITION_EASING: "ease",
  },

  // Z-index layers
  Z_INDEX: {
    SEPARATOR: 0,
    ROD: 1,
    BEAD: 20,
  },

  // Board styling
  BOARD: {
    PADDING: 4, // px
    BORDER_WIDTH: 2, // px
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

  // Total board height (for container sizing)
  TOTAL_BOARD_HEIGHT:
    SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT,
} as const;
