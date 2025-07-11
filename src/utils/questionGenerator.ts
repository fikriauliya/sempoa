import type { Question } from '../types';
import { DIFFICULTY_DIGITS, type DigitLevel } from './constants';

interface QuestionConfig {
  difficulty: DigitLevel;
  operation: 'addition' | 'subtraction' | 'mixed';
  friendType: FriendType;
}

type FriendType = 'none' | 'smallFriend' | 'family' | 'bigFriend' | 'mixed';
type OperationMatrix = FriendType[][];

interface FriendMatrices {
  addition: OperationMatrix;
  subtraction: OperationMatrix;
}
// Seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
  }

  private next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextBoolean(): boolean {
    return this.next() < 0.5;
  }
}

// Question Generator Class
export class QuestionGenerator {
  private random: SeededRandom;
  private static cachedMatrix: FriendMatrices | null = null;

  constructor(seed?: number) {
    this.random = new SeededRandom(seed);
  }

  static buildMatrix(): FriendMatrices {
    if (QuestionGenerator.cachedMatrix) return QuestionGenerator.cachedMatrix;

    const additionMatrix: OperationMatrix = Array(10)
      .fill(null)
      .map(() => Array(10).fill('none'));
    const subtractionMatrix: OperationMatrix = Array(10)
      .fill(null)
      .map(() => Array(10).fill('none'));

    for (let digitA = 0; digitA < 10; digitA++) {
      for (let digitB = 0; digitB < 10; digitB++) {
        let category: FriendType = 'none';
        if (digitA < 5 && digitB < 5 && digitA + digitB >= 5) {
          category = 'smallFriend';
        } else if (digitA >= 5 && digitB > 5 && digitA + digitB < 15) {
          category = 'family';
        } else if (digitA + digitB >= 10) {
          category = 'bigFriend';
        }
        additionMatrix[digitA][digitB] = category;
      }
    }

    for (let digitA = 0; digitA < 10; digitA++) {
      for (let digitB = 0; digitB < 10; digitB++) {
        let category: FriendType = 'none';
        if (digitA >= 5 && digitB < 5 && digitA - digitB < 5) {
          category = 'smallFriend';
        } else if (digitA < 5 && digitB > 5 && digitA - digitB >= -5) {
          category = 'family';
        } else if (digitA - digitB < 0 && digitA > 0) {
          category = 'bigFriend';
        }
        subtractionMatrix[digitA][digitB] = category;
      }
    }

    QuestionGenerator.cachedMatrix = {
      addition: additionMatrix,
      subtraction: subtractionMatrix,
    };

    return QuestionGenerator.cachedMatrix;
  }

  getFriends(
    number: number,
    operation: 'addition' | 'subtraction',
    friendType: FriendType,
  ): number[] {
    // Handle mixed friendType by randomly selecting a concrete type
    if (friendType === 'mixed') {
      const friendTypes = [
        'none',
        'smallFriend',
        'bigFriend',
        'family',
      ] as const;
      friendType = friendTypes[this.random.nextInt(0, friendTypes.length - 1)];
    }

    const pairs: number[] = [];
    const rows = QuestionGenerator.buildMatrix()[operation];

    for (let i = 0; i < 10; i++) {
      if (rows[number][i] === friendType) {
        pairs.push(i);
      }
    }

    return pairs;
  }

  getFirstDigits(
    operation: 'addition' | 'subtraction',
    friendType: FriendType,
  ): number[] {
    // Handle mixed friendType by randomly selecting a concrete type
    if (friendType === 'mixed') {
      const friendTypes = [
        'none',
        'smallFriend',
        'bigFriend',
        'family',
      ] as const;
      friendType = friendTypes[this.random.nextInt(0, friendTypes.length - 1)];
    }

    const results: number[] = [];
    const rows = QuestionGenerator.buildMatrix()[operation];

    for (let i = 0; i < 10; i++) {
      if (rows[i].filter((x) => x === friendType).length > 0) {
        results.push(i);
      }
    }

    return results;
  }

  generateAdditionQuestion(config: QuestionConfig): Question {
    config.difficulty;

    const operands: [number, number] = [0, 0];

    for (let i = 0; i < DIFFICULTY_DIGITS[config.difficulty]; i++) {
      // Generate numbers for each digit place
      const firstDigits = this.getFirstDigits('addition', config.friendType);
      //take randomly from firstDigits
      const digitA =
        firstDigits[this.random.nextInt(0, firstDigits.length - 1)];

      const secondDigits = this.getFriends(
        digitA,
        'addition',
        config.friendType,
      );
      //take randomly from secondDigits
      const digitB =
        secondDigits[this.random.nextInt(0, secondDigits.length - 1)];

      operands[0] += digitA * 10 ** i;
      operands[1] += digitB * 10 ** i;
    }

    return {
      operands,
      operation: 'addition',
      answer: operands[0] + operands[1],
    };
  }

  generateSubtractionQuestion(config: QuestionConfig): Question {
    const operands: [number, number] = [0, 0];

    for (let i = 0; i < DIFFICULTY_DIGITS[config.difficulty]; i++) {
      const firstDigits = this.getFirstDigits('subtraction', config.friendType);
      const digitA =
        firstDigits[this.random.nextInt(0, firstDigits.length - 1)];

      const secondDigits = this.getFriends(
        digitA,
        'subtraction',
        config.friendType,
      );
      const digitB =
        secondDigits[this.random.nextInt(0, secondDigits.length - 1)];

      operands[0] += digitA * 10 ** i;
      operands[1] += digitB * 10 ** i;
    }

    return {
      operands,
      operation: 'subtraction',
      answer: operands[0] - operands[1],
    };
  }

  generateQuestion(config: QuestionConfig): Question {
    if (config.operation === 'mixed') {
      const operations = ['addition', 'subtraction'] as const;
      const randomOperation = this.random.nextBoolean()
        ? operations[0]
        : operations[1];
      const mixedConfig = { ...config, operation: randomOperation };

      return randomOperation === 'addition'
        ? this.generateAdditionQuestion(mixedConfig)
        : this.generateSubtractionQuestion(mixedConfig);
    }

    if (config.friendType === 'mixed') {
      // For mixed friend type, randomly choose from all friend types
      const friendTypes = [
        'none',
        'smallFriend',
        'bigFriend',
        'family',
      ] as const;
      const randomFriendType =
        friendTypes[this.random.nextInt(0, friendTypes.length - 1)];
      const mixedConfig = { ...config, friendType: randomFriendType };

      return config.operation === 'addition'
        ? this.generateAdditionQuestion(mixedConfig)
        : this.generateSubtractionQuestion(mixedConfig);
    }

    return config.operation === 'addition'
      ? this.generateAdditionQuestion(config)
      : this.generateSubtractionQuestion(config);
  }
}

// Default instance for backward compatibility
const defaultGenerator = new QuestionGenerator();
export const generateQuestion = (config: QuestionConfig): Question =>
  defaultGenerator.generateQuestion(config);

// Export buildMatrix for backward compatibility
export const buildMatrix = () => QuestionGenerator.buildMatrix();
