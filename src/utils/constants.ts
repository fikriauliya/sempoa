// Shared constants for the Sempoa application
import type { ComplementType, OperationType } from '../types';

export const OPERATIONS = ['addition', 'subtraction', 'mixed'] as const;

export const BASE_COMPLEMENTS = [
  'none',
  'smallFriend',
  'bigFriend',
  'family',
] as const;

export const COMPLEMENTS = [...BASE_COMPLEMENTS, 'mixed'] as const;

export const DIGIT_LEVELS = [
  'single',
  'double',
  'triple',
  'four',
  'five',
] as const;
export type DigitLevel = (typeof DIGIT_LEVELS)[number];

export const OPERATION_ICONS: Record<OperationType, string> = {
  addition: '➕',
  subtraction: '➖',
  mixed: '🔄',
};

export const COMPLEMENT_LABELS: Record<ComplementType, string> = {
  none: 'Simple',
  smallFriend: 'Small Friend',
  bigFriend: 'Big Friend',
  family: 'Family',
  mixed: 'Mixed Friends',
};

export const DIGIT_LABELS: Record<DigitLevel, string> = {
  single: 'Single Digit',
  double: 'Double Digit',
  triple: 'Triple Digit',
  four: 'Four Digit',
  five: 'Five Digit',
};

export const DIFFICULTY_RANGES: Record<DigitLevel, [number, number]> = {
  single: [1, 9],
  double: [10, 99],
  triple: [100, 999],
  four: [1000, 9999],
  five: [10000, 99999],
};

export const DIFFICULTY_DIGITS: Record<DigitLevel, number> = {
  single: 1,
  double: 2,
  triple: 3,
  four: 4,
  five: 5,
};

export const getComplementSectionLabel = (
  complement: ComplementType,
  operation: OperationType,
): string => {
  if (complement === 'none') {
    switch (operation) {
      case 'addition':
        return 'Simple Addition';
      case 'subtraction':
        return 'Simple Subtraction';
      case 'mixed':
        return 'Simple Mixed';
    }
  }
  return COMPLEMENT_LABELS[complement];
};

export const getOperationSymbol = (operation: OperationType): string => {
  switch (operation) {
    case 'addition':
      return '+';
    case 'subtraction':
      return '-';
    case 'mixed':
      return '?';
    default:
      return '?';
  }
};
