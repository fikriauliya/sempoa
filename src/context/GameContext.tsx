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

  const checkAnswer = (userAnswer: number) => {
    if (!gameState.currentQuestion) return

    const isCorrect = userAnswer === gameState.currentQuestion.answer
    
    if (isCorrect) {
      setFeedback('Correct! Well done!')
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
        currentQuestion: null
      }))
    } else {
      setFeedback(`Incorrect. The answer is ${gameState.currentQuestion.answer}`)
      setGameState(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1
      }))
    }

    setTimeout(() => {
      setFeedback(null)
    }, 2000)
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