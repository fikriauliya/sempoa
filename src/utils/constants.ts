// Shared constants for the Sempoa application

export const OPERATIONS = ['addition', 'subtraction', 'mixed'] as const;
export type Operation = (typeof OPERATIONS)[number];

export const COMPLEMENTS = [
  'simple',
  'smallFriend',
  'bigFriend',
  'both',
] as const;
export type Complement = (typeof COMPLEMENTS)[number];

export const DIGIT_LEVELS = [
  'single',
  'double',
  'triple',
  'four',
  'five',
] as const;
export type DigitLevel = (typeof DIGIT_LEVELS)[number];

export const OPERATION_ICONS: Record<Operation, string> = {
  addition: '➕',
  subtraction: '➖',
  mixed: '🔄',
};

export const COMPLEMENT_LABELS: Record<Complement, string> = {
  simple: 'Simple',
  smallFriend: 'Small Friend',
  bigFriend: 'Big Friend',
  both: 'Both Friends',
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

export const getComplementSectionLabel = (
  complement: Complement,
  operation: Operation,
): string => {
  if (complement === 'simple') {
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
