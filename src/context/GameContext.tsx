import React, { createContext, useContext, useState, ReactNode } from 'react'
import { GameState } from '../types'

interface GameContextType {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  currentValue: number
  setCurrentValue: React.Dispatch<React.SetStateAction<number>>
  feedback: string | null
  setFeedback: React.Dispatch<React.SetStateAction<string | null>>
  checkAnswer: (userAnswer: number) => void
  setOnAnswerChecked: React.Dispatch<React.SetStateAction<(() => void) | undefined>>
  onReset?: () => void
  setOnReset: React.Dispatch<React.SetStateAction<(() => void) | undefined>>
  lastAnswerResult: { isCorrect: boolean; timestamp: number } | null
  clearLastAnswer: () => void
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
  const [onAnswerChecked, setOnAnswerChecked] = useState<(() => void) | undefined>(undefined)
  const [onReset, setOnReset] = useState<(() => void) | undefined>(undefined)
  const [lastAnswerResult, setLastAnswerResult] = useState<{ isCorrect: boolean; timestamp: number } | null>(null)

  const checkAnswer = (userAnswer: number) => {
    if (!gameState.currentQuestion) return

    const isCorrect = userAnswer === gameState.currentQuestion.answer
    setLastAnswerResult({ isCorrect, timestamp: Date.now() })
    
    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
        currentQuestion: null
      }))
    } else {
      setGameState(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1,
        currentQuestion: null
      }))
    }

    // Reset the board
    if (onReset) {
      onReset()
    }

    // Generate next question immediately
    if (onAnswerChecked) {
      onAnswerChecked()
    }
  }

  const clearLastAnswer = () => {
    setLastAnswerResult(null)
  }

  return (
    <GameContext.Provider value={{
      gameState,
      setGameState,
      currentValue,
      setCurrentValue,
      feedback,
      setFeedback,
      checkAnswer,
      setOnAnswerChecked,
      onReset,
      setOnReset,
      lastAnswerResult,
      clearLastAnswer
    }}>
      {children}
    </GameContext.Provider>
  )
}