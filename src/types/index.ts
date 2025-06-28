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
  difficulty: 'single' | 'double' | 'triple'
  useSmallFriend: boolean
  useBigFriend: boolean
}

export interface GameState {
  currentQuestion: Question | null
  score: number
  level: number
  mistakes: number
}

export interface LearningLevel {
  id: string
  name: string
  operation: 'addition' | 'subtraction' | 'mixed'
  difficulty: 'single' | 'double' | 'triple'
  useSmallFriend: boolean
  useBigFriend: boolean
  isUnlocked: boolean
  isCompleted: boolean
  completionPercentage: number
}

export interface LearningJourneyState {
  levels: LearningLevel[]
  currentLevelId: string | null
  totalScore: number
  overallProgress: number
}