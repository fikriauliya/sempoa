import React, { useState, ReactNode } from 'react'
import { GameState } from '../types'
import { GameContext } from './context'

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
      setGameState((prev: GameState) => ({
        ...prev,
        score: prev.score + 1
      }))
    } else {
      setGameState((prev: GameState) => ({
        ...prev,
        mistakes: prev.mistakes + 1
      }))
    }
    
    return isCorrect
  }

  const handleSetCurrentValue = (value: number) => {
    setCurrentValue(value)
  }

  return (
    <GameContext.Provider value={{
      gameState,
      setGameState,
      currentValue,
      setCurrentValue: handleSetCurrentValue,
      feedback,
      setFeedback,
      checkAnswer
    }}>
      {children}
    </GameContext.Provider>
  )
}