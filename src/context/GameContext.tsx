import React, { createContext, useContext, useState, ReactNode } from 'react'
import { GameState } from '../types'

interface GameContextType {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  currentValue: number
  setCurrentValue: React.Dispatch<React.SetStateAction<number>>
  feedback: string | null
  setFeedback: React.Dispatch<React.SetStateAction<string | null>>
  checkAnswer: () => boolean
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

interface GameProviderProps {
  children: ReactNode
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {

  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: null,
    score: 0,
    level: 1,
    mistakes: 0
  })
  
  const [currentValue, setCurrentValue] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)

  const checkAnswer = () => {
    if (!gameState.currentQuestion) return false

    const isCorrect = currentValue === gameState.currentQuestion.answer
    
    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1
      }))
    } else {
      setGameState(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1
      }))
    }
    
    return isCorrect
  }

  return (
    <GameContext.Provider value={{
      gameState,
      setGameState,
      currentValue,
      setCurrentValue,
      feedback,
      setFeedback,
      checkAnswer
    }}>
      {children}
    </GameContext.Provider>
  )
}