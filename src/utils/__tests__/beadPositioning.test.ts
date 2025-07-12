import { describe, expect, it } from '@jest/globals';
import {
  beadKeysToValue,
  canRepresentValue,
  getBeadKey,
  valueToBeadKeys,
} from '../beadPositioning';

describe('beadPositioning utilities', () => {
  describe('valueToBeadKeys', () => {
    it('should return empty set for zero', () => {
      const result = valueToBeadKeys(0);
      expect(result.size).toBe(0);
    });

    it('should handle single digit numbers correctly', () => {
      // Test 1: should activate lowest row of rightmost column
      const result1 = valueToBeadKeys(1);
      expect(result1).toContain('8-lower-3'); // column 8 (rightmost), lower bead row 3
      expect(result1.size).toBe(1);

      // Test 5: should activate upper bead of rightmost column
      const result5 = valueToBeadKeys(5);
      expect(result5).toContain('8-upper-0'); // column 8, upper bead row 0
      expect(result5.size).toBe(1);

      // Test 7: should activate upper bead + 2 lower beads
      const result7 = valueToBeadKeys(7);
      expect(result7).toContain('8-upper-0'); // 5
      expect(result7).toContain('8-lower-2'); // 1
      expect(result7).toContain('8-lower-3'); // 1
      expect(result7.size).toBe(3);
    });

    it('should handle multi-digit numbers correctly', () => {
      // Test 23: 2 in tens place, 3 in ones place
      const result23 = valueToBeadKeys(23);
      // Tens place (column 7): 2 lower beads
      expect(result23).toContain('7-lower-2');
      expect(result23).toContain('7-lower-3');
      // Ones place (column 8): 3 lower beads
      expect(result23).toContain('8-lower-1');
      expect(result23).toContain('8-lower-2');
      expect(result23).toContain('8-lower-3');
      expect(result23.size).toBe(5);
    });

    it('should handle numbers with 5s correctly', () => {
      // Test 50: 5 in tens place
      const result50 = valueToBeadKeys(50);
      expect(result50).toContain('7-upper-0'); // 5 in tens place
      expect(result50.size).toBe(1);

      // Test 56: 5 in tens place, 6 in ones place (5+1)
      const result56 = valueToBeadKeys(56);
      expect(result56).toContain('7-upper-0'); // 5 in tens place
      expect(result56).toContain('8-upper-0'); // 5 in ones place
      expect(result56).toContain('8-lower-3'); // 1 in ones place
      expect(result56.size).toBe(3);
    });

    it('should handle maximum digit value (9)', () => {
      // Test 9: should activate upper bead + 4 lower beads
      const result9 = valueToBeadKeys(9);
      expect(result9).toContain('8-upper-0'); // 5
      expect(result9).toContain('8-lower-0'); // 1
      expect(result9).toContain('8-lower-1'); // 1
      expect(result9).toContain('8-lower-2'); // 1
      expect(result9).toContain('8-lower-3'); // 1
      expect(result9.size).toBe(5);
    });

    it('should handle large numbers within sempoa range', () => {
      // Test 123456789 (within 9-column range)
      const result = valueToBeadKeys(123456789);
      expect(result.size).toBeGreaterThan(0);

      // Verify the ones place (9)
      expect(result).toContain('8-upper-0'); // 5
      expect(result).toContain('8-lower-0'); // 1
      expect(result).toContain('8-lower-1'); // 1
      expect(result).toContain('8-lower-2'); // 1
      expect(result).toContain('8-lower-3'); // 1
    });

    it('should throw error for negative values', () => {
      expect(() => valueToBeadKeys(-1)).toThrow('Value must be non-negative');
    });
  });

  describe('beadKeysToValue', () => {
    it('should return zero for empty set', () => {
      const result = beadKeysToValue(new Set());
      expect(result).toBe(0);
    });

    it('should calculate value correctly for single beads', () => {
      // Test ones place lower bead
      const result1 = beadKeysToValue(new Set(['8-lower-3']));
      expect(result1).toBe(1);

      // Test ones place upper bead
      const result5 = beadKeysToValue(new Set(['8-upper-0']));
      expect(result5).toBe(5);

      // Test tens place lower bead
      const result10 = beadKeysToValue(new Set(['7-lower-3']));
      expect(result10).toBe(10);

      // Test tens place upper bead
      const result50 = beadKeysToValue(new Set(['7-upper-0']));
      expect(result50).toBe(50);
    });

    it('should calculate value correctly for multiple beads', () => {
      // Test 7 (5 + 2)
      const result7 = beadKeysToValue(
        new Set([
          '8-upper-0', // 5
          '8-lower-2', // 1
          '8-lower-3', // 1
        ]),
      );
      expect(result7).toBe(7);

      // Test 23
      const result23 = beadKeysToValue(
        new Set([
          '7-lower-2', // 10
          '7-lower-3', // 10
          '8-lower-1', // 1
          '8-lower-2', // 1
          '8-lower-3', // 1
        ]),
      );
      expect(result23).toBe(23);
    });

    it('should be inverse of valueToBeadKeys', () => {
      const testValues = [0, 1, 5, 7, 9, 23, 56, 123, 999];

      for (const value of testValues) {
        const beadKeys = valueToBeadKeys(value);
        const reconstructedValue = beadKeysToValue(beadKeys);
        expect(reconstructedValue).toBe(value);
      }
    });
  });

  describe('canRepresentValue', () => {
    it('should return true for zero', () => {
      expect(canRepresentValue(0)).toBe(true);
    });

    it('should return true for small positive numbers', () => {
      expect(canRepresentValue(1)).toBe(true);
      expect(canRepresentValue(5)).toBe(true);
      expect(canRepresentValue(9)).toBe(true);
      expect(canRepresentValue(123)).toBe(true);
    });

    it('should return false for negative numbers', () => {
      expect(canRepresentValue(-1)).toBe(false);
      expect(canRepresentValue(-100)).toBe(false);
    });

    it('should return true for maximum representable value', () => {
      // With 9 columns, max value should be 999,999,999
      expect(canRepresentValue(999999999)).toBe(true);
    });

    it('should return false for values exceeding sempoa capacity', () => {
      // Values larger than what 9 columns can represent
      expect(canRepresentValue(10000000000)).toBe(false);
      expect(canRepresentValue(999999999999)).toBe(false);
    });
  });

  describe('getBeadKey', () => {
    it('should generate correct key for upper bead', () => {
      const bead = { column: 5, row: 0, isUpper: true };
      const result = getBeadKey(bead);
      expect(result).toBe('5-upper-0');
    });

    it('should generate correct key for lower bead', () => {
      const bead = { column: 3, row: 2, isUpper: false };
      const result = getBeadKey(bead);
      expect(result).toBe('3-lower-2');
    });

    it('should handle edge cases', () => {
      // First column, first row, upper
      const bead1 = { column: 0, row: 0, isUpper: true };
      expect(getBeadKey(bead1)).toBe('0-upper-0');

      // Last column, last row, lower
      const bead2 = { column: 8, row: 3, isUpper: false };
      expect(getBeadKey(bead2)).toBe('8-lower-3');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle boundary values correctly', () => {
      // Test values at column boundaries
      expect(valueToBeadKeys(1).size).toBe(1);
      expect(valueToBeadKeys(10).size).toBe(1);
      expect(valueToBeadKeys(100).size).toBe(1);
      expect(valueToBeadKeys(1000).size).toBe(1);
    });

    it('should handle complex multi-digit numbers', () => {
      // Test number with mixed digits
      const result = valueToBeadKeys(567);
      const reconstructed = beadKeysToValue(result);
      expect(reconstructed).toBe(567);
    });

    it('should handle numbers with zeros in middle', () => {
      // Test 101, 1001, etc.
      const result101 = valueToBeadKeys(101);
      const reconstructed101 = beadKeysToValue(result101);
      expect(reconstructed101).toBe(101);

      const result1001 = valueToBeadKeys(1001);
      const reconstructed1001 = beadKeysToValue(result1001);
      expect(reconstructed1001).toBe(1001);
    });
  });
});
