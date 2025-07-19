export interface BeadPosition {
  column: number;
  row: number;
  isUpper: boolean;
}

export interface BeadHandlers {
  getBeadKey: (bead: BeadPosition) => string;
  isBeadActive: (bead: BeadPosition) => boolean;
  toggleBead: (bead: BeadPosition) => void;
}

export interface SempoaState {
  beads: BeadPosition[];
  currentValue: number;
}

export interface Question {
  operands: number[];
  operation: BaseOperationType; // only 'addition' | 'subtraction'
  answer: number;
}

export type BaseOperationType = 'addition' | 'subtraction';
export type OperationType = BaseOperationType | 'mixed';
export type ComplementType =
  | 'none'
  | 'smallFriend'
  | 'bigFriend'
  | 'family'
  | 'mixed';
export type DigitLevel = 'single' | 'double' | 'triple' | 'four' | 'five';
export type ButtonState = 'normal' | 'correct' | 'wrong';

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
