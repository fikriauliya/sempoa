import { SEMPOA_CONFIG } from '../config/sempoaConfig';
import type { BeadPosition } from '../types';

const { COLUMNS, UPPER_BEADS_PER_COLUMN, LOWER_BEADS_PER_COLUMN } =
  SEMPOA_CONFIG;

/**
 * Converts a numeric value to the set of active bead keys that represent that value on the sempoa
 * @param value - The numeric value to represent (must be non-negative)
 * @returns Set of bead keys in format "{column}-{upper|lower}-{row}"
 */
export const valueToBeadKeys = (value: number): Set<string> => {
  if (value < 0) {
    throw new Error('Value must be non-negative');
  }

  if (value === 0) {
    return new Set<string>();
  }

  const activeBeads = new Set<string>();
  let remainingValue = value;

  // Process each column from left to right (highest to lowest place value)
  for (let column = 0; column < COLUMNS; column++) {
    const placeValue = 10 ** (COLUMNS - 1 - column);
    const digitValue = Math.floor(remainingValue / placeValue);
    remainingValue = remainingValue % placeValue;

    if (digitValue > 0) {
      // Determine how many 5s and 1s we need
      const fives = Math.floor(digitValue / 5);
      const ones = digitValue % 5;

      // Activate upper beads (5s)
      if (fives > 0) {
        // For upper beads, we activate from the top (row 0) down
        for (
          let row = 0;
          row < Math.min(fives, UPPER_BEADS_PER_COLUMN);
          row++
        ) {
          activeBeads.add(`${column}-upper-${row}`);
        }
      }

      // Activate lower beads (1s)
      if (ones > 0) {
        // For lower beads, we activate from the top down (lowest row numbers first)
        // This matches the abacus behavior where beads are pushed up against the crossbar
        // For 1: activate row 0 (top bead)
        // For 2: activate rows 0,1 (top two beads)
        // For 3: activate rows 0,1,2 (top three beads)
        // For 4: activate rows 0,1,2,3 (all four beads)
        for (let row = 0; row < ones; row++) {
          activeBeads.add(`${column}-lower-${row}`);
        }
      }
    }
  }

  return activeBeads;
};

/**
 * Converts a set of active bead keys back to their numeric value
 * @param activeBeads - Set of bead keys in format "{column}-{upper|lower}-{row}"
 * @returns The numeric value represented by the active beads
 */
export const beadKeysToValue = (activeBeads: Set<string>): number => {
  return Array.from(activeBeads).reduce((sum, beadKey) => {
    const [col, type] = beadKey.split('-');
    const column = parseInt(col);
    const isUpper = type === 'upper';
    const beadValue = isUpper
      ? 5 * 10 ** (COLUMNS - 1 - column)
      : 10 ** (COLUMNS - 1 - column);
    return sum + beadValue;
  }, 0);
};

/**
 * Validates that a value can be represented on the current sempoa configuration
 * @param value - The numeric value to validate
 * @returns True if the value can be represented, false otherwise
 */
export const canRepresentValue = (value: number): boolean => {
  if (value < 0) return false;

  // Maximum value is when all beads are active
  const maxValue = Array.from({ length: COLUMNS }, (_, col) => {
    const placeValue = 10 ** (COLUMNS - 1 - col);
    return (UPPER_BEADS_PER_COLUMN * 5 + LOWER_BEADS_PER_COLUMN) * placeValue;
  }).reduce((sum, val) => sum + val, 0);

  return value <= maxValue;
};

/**
 * Helper function to get bead key from BeadPosition
 * @param bead - The bead position object
 * @returns Bead key string
 */
export const getBeadKey = (bead: BeadPosition): string =>
  `${bead.column}-${bead.isUpper ? 'upper' : 'lower'}-${bead.row}`;
