import type { Question } from '../types';
import { DIFFICULTY_RANGES, type DigitLevel } from './constants';

interface QuestionConfig {
  difficulty: DigitLevel;
  operation: 'addition' | 'subtraction' | 'mixed';
  useSmallFriend: boolean;
  useBigFriend: boolean;
}

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateNumber = (difficulty: DigitLevel): number => {
  const [min, max] = DIFFICULTY_RANGES[difficulty];
  return getRandomInt(min, max);
};

const needsSmallFriend = (a: number, b: number): boolean => {
  const aLastDigit = a % 10;
  const bLastDigit = b % 10;
  return aLastDigit + bLastDigit > 9;
};

const needsBigFriend = (a: number, b: number): boolean => {
  return a + b >= 10 && (a % 10) + (b % 10) <= 9;
};

const generateAdditionQuestion = (config: QuestionConfig): Question => {
  let num1 = generateNumber(config.difficulty);
  let num2 = generateNumber(config.difficulty);

  if (config.useSmallFriend && !needsSmallFriend(num1, num2)) {
    const maxForDigits = DIFFICULTY_RANGES[config.difficulty][1];

    while (!needsSmallFriend(num1, num2) && num1 + num2 <= maxForDigits) {
      num2 = generateNumber(config.difficulty);
    }
  }

  if (config.useBigFriend && !needsBigFriend(num1, num2)) {
    while (!needsBigFriend(num1, num2)) {
      num1 = generateNumber(config.difficulty);
      num2 = generateNumber(config.difficulty);
    }
  }

  return {
    operands: [num1, num2],
    operation: 'addition',
    answer: num1 + num2,
  };
};

const generateSubtractionQuestion = (config: QuestionConfig): Question => {
  let num1 = generateNumber(config.difficulty);
  let num2 = generateNumber(config.difficulty);

  if (num2 > num1) {
    [num1, num2] = [num2, num1];
  }

  if (config.useSmallFriend) {
    while (num1 % 10 >= num2 % 10) {
      num2 = generateNumber(config.difficulty);
      if (num2 > num1) {
        [num1, num2] = [num2, num1];
      }
    }
  }

  return {
    operands: [num1, num2],
    operation: 'subtraction',
    answer: num1 - num2,
  };
};

export const generateQuestion = (config: QuestionConfig): Question => {
  if (config.operation === 'mixed') {
    const operations = ['addition', 'subtraction'] as const;
    const randomOperation =
      operations[Math.floor(Math.random() * operations.length)];
    const mixedConfig = { ...config, operation: randomOperation };

    return randomOperation === 'addition'
      ? generateAdditionQuestion(mixedConfig)
      : generateSubtractionQuestion(mixedConfig);
  }

  return config.operation === 'addition'
    ? generateAdditionQuestion(config)
    : generateSubtractionQuestion(config);
};
