import { createContext } from 'react'
import { GameState } from '../types'

export interface GameContextType {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  currentValue: number
  setCurrentValue: (value: number) => void
  feedback: string | null
  setFeedback: React.Dispatch<React.SetStateAction<string | null>>
  checkAnswer: () => boolean
}

export const GameContext = createContext<GameContextType | undefined>(undefined)