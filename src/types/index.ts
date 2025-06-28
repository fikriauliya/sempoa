export interface BeadPosition {
  column: number
  row: number
  value: number
  isUpper: boolean
}

export interface SempoaState {
  beads: BeadPosition[]
  currentValue: number
}

export interface Question {
  operands: number[]
  operation: 'addition' | 'subtraction' | 'mixed'
  answer: number
  difficulty: 'single' | 'double' | 'triple' | 'four' | 'five'
  useSmallFriend: boolean
  useBigFriend: boolean
}

export interface LevelProgress {
  operationType: 'addition' | 'subtraction' | 'mixed'
  complementType: 'simple' | 'smallFriend' | 'bigFriend' | 'both'
  digitLevel: 'single' | 'double' | 'triple' | 'four' | 'five'
  questionsCompleted: number
  correctAnswers: number
  isUnlocked: boolean
  isCompleted: boolean
}

export interface UserProgress {
  currentLevel: LevelProgress | null
  allLevels: LevelProgress[]
  totalScore: number
}

export interface GameState {
  currentQuestion: Question | null
  score: number
  level: number
  mistakes: number
}