import type {
  BaseOperationType,
  ComplementType,
  OperationType,
  Question,
} from '../types';
import {
  BASE_COMPLEMENTS,
  DIFFICULTY_DIGITS,
  type DigitLevel,
} from './constants';

interface QuestionConfig {
  difficulty: DigitLevel;
  operation: OperationType;
  friendType: ComplementType;
}

type OperationMatrix = ComplementType[][];

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

  pickRandom<T>(array: readonly T[]): T {
    return array[this.nextInt(0, array.length - 1)];
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

    const matrices = {
      addition: QuestionGenerator.buildAdditionMatrix(),
      subtraction: QuestionGenerator.buildSubtractionMatrix(),
    };

    QuestionGenerator.cachedMatrix = matrices;
    return matrices;
  }

  private static buildAdditionMatrix(): OperationMatrix {
    const matrix: OperationMatrix = Array(10)
      .fill(null)
      .map(() => Array(10).fill('none'));

    for (let digitA = 0; digitA < 10; digitA++) {
      for (let digitB = 0; digitB < 10; digitB++) {
        const sum = digitA + digitB;
        let category: ComplementType = 'none';

        if (digitA < 5 && digitB < 5 && sum >= 5) {
          category = 'smallFriend';
        } else if (digitA >= 5 && digitB > 5 && sum < 15) {
          category = 'family';
        } else if (sum >= 10) {
          category = 'bigFriend';
        }

        matrix[digitA][digitB] = category;
      }
    }

    return matrix;
  }

  private static buildSubtractionMatrix(): OperationMatrix {
    const matrix: OperationMatrix = Array(10)
      .fill(null)
      .map(() => Array(10).fill('none'));

    for (let digitA = 0; digitA < 10; digitA++) {
      for (let digitB = 0; digitB < 10; digitB++) {
        const diff = digitA - digitB;
        let category: ComplementType = 'none';

        if (digitA >= 5 && digitB < 5 && diff < 5) {
          category = 'smallFriend';
        } else if (digitA < 5 && digitB > 5 && diff >= -5) {
          category = 'family';
        } else if (diff < 0 && digitA > 0) {
          category = 'bigFriend';
        }

        matrix[digitA][digitB] = category;
      }
    }

    return matrix;
  }

  private resolveComplementType(friendType: ComplementType): ComplementType {
    return friendType === 'mixed'
      ? this.random.pickRandom(BASE_COMPLEMENTS)
      : friendType;
  }

  getFriends(
    number: number,
    operation: BaseOperationType,
    friendType: ComplementType,
  ): number[] {
    const resolvedType = this.resolveComplementType(friendType);
    const matrix = QuestionGenerator.buildMatrix()[operation];

    return matrix[number]
      .map((category, index) => (category === resolvedType ? index : -1))
      .filter((index) => index !== -1);
  }

  getFirstDigits(
    operation: BaseOperationType,
    friendType: ComplementType,
  ): number[] {
    const resolvedType = this.resolveComplementType(friendType);
    const matrix = QuestionGenerator.buildMatrix()[operation];

    return matrix
      .map((row, index) => (row.includes(resolvedType) ? index : -1))
      .filter((index) => index !== -1);
  }

  private generateOperands(
    operation: BaseOperationType,
    friendType: ComplementType,
    difficulty: DigitLevel,
  ): [number, number] {
    const operands: [number, number] = [0, 0];
    const digitCount = DIFFICULTY_DIGITS[difficulty];

    for (let i = 0; i < digitCount; i++) {
      const firstDigits = this.getFirstDigits(operation, friendType);
      const digitA = this.random.pickRandom(firstDigits);

      const secondDigits = this.getFriends(digitA, operation, friendType);
      const digitB = this.random.pickRandom(secondDigits);

      const placeValue = 10 ** i;
      operands[0] += digitA * placeValue;
      operands[1] += digitB * placeValue;
    }

    return operands;
  }

  private generateQuestionForOperation(
    operation: BaseOperationType,
    config: QuestionConfig,
  ): Question {
    const operands = this.generateOperands(
      operation,
      config.friendType,
      config.difficulty,
    );
    const answer =
      operation === 'addition'
        ? operands[0] + operands[1]
        : operands[0] - operands[1];

    return { operands, operation, answer };
  }

  generateQuestion(config: QuestionConfig): Question {
    // Resolve mixed operation type
    const operation =
      config.operation === 'mixed'
        ? this.random.pickRandom(['addition', 'subtraction'] as const)
        : config.operation;

    // Resolve mixed friend type
    const friendType = this.resolveComplementType(config.friendType);

    const resolvedConfig = { ...config, operation, friendType };
    return this.generateQuestionForOperation(operation, resolvedConfig);
  }
}

// Default instance for backward compatibility
const defaultGenerator = new QuestionGenerator();
export const generateQuestion = (config: QuestionConfig): Question =>
  defaultGenerator.generateQuestion(config);

// Export buildMatrix for backward compatibility
export const buildMatrix = () => QuestionGenerator.buildMatrix();
