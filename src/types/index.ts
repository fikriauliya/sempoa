export interface BeadPosition {
  column: number;
  row: number;
  isUpper: boolean;
}

export interface SempoaState {
  beads: BeadPosition[];
  currentValue: number;
}

export interface Question {
  operands: number[];
  operation: 'addition' | 'subtraction' | 'mixed';
  answer: number;
}

export type OperationType = 'addition' | 'subtraction' | 'mixed';
export type ComplementType = 'simple' | 'smallFriend' | 'bigFriend' | 'both';
export type DigitLevel = 'single' | 'double' | 'triple' | 'four' | 'five';

export interface LevelProgress {
  id: string;
  operationType: OperationType;
  complementType: ComplementType;
  digitLevel: DigitLevel;
  questionsCompleted: number;
  correctAnswers: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export interface UserProgress {
  currentLevelId: string | null;
  allLevels: LevelProgress[];
  totalScore: number;
}

export interface GameState {
  currentQuestion: Question | null;
  score: number;
  level: number;
  mistakes: number;
}
