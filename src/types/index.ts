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

export interface CompletionTime {
  time: string
  question: string
  timestamp: number
  answer: number
}