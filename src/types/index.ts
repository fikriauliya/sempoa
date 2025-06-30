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

export interface LevelProgress {
  id: string;
  operationType: 'addition' | 'subtraction' | 'mixed';
  complementType: 'simple' | 'smallFriend' | 'bigFriend' | 'both';
  digitLevel: 'single' | 'double' | 'triple' | 'four' | 'five';
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
