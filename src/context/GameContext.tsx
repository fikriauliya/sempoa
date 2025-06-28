import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { GameState, CompletionTime } from '../types'

interface GameContextType {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  currentValue: number
  setCurrentValue: React.Dispatch<React.SetStateAction<number>>
  feedback: string | null
  setFeedback: React.Dispatch<React.SetStateAction<string | null>>
  checkAnswer: (userAnswer: number) => void
  currentTime: string
  completionTimes: CompletionTime[]
  startTimer: () => void
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
  const [currentTime, setCurrentTime] = useState('00:00')
  const [completionTimes, setCompletionTimes] = useState<CompletionTime[]>([])
  const timerStartTime = useRef<number | null>(null)
  const timerInterval = useRef<NodeJS.Timeout | null>(null)

  // Load completion times from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('questionCompletionTimes')
    if (stored) {
      try {
        setCompletionTimes(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to parse completion times:', error)
      }
    }
  }, [])

  // Save completion times to localStorage whenever they change
  useEffect(() => {
    if (completionTimes.length > 0) {
      localStorage.setItem('questionCompletionTimes', JSON.stringify(completionTimes))
    }
  }, [completionTimes])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    timerStartTime.current = Date.now()
    setCurrentTime('00:00')
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current)
    }
    
    timerInterval.current = setInterval(() => {
      if (timerStartTime.current) {
        const elapsed = Math.floor((Date.now() - timerStartTime.current) / 1000)
        setCurrentTime(formatTime(elapsed))
      }
    }, 1000)
  }

  const stopTimer = (): string => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current)
      timerInterval.current = null
    }
    
    if (timerStartTime.current) {
      const elapsed = Math.floor((Date.now() - timerStartTime.current) / 1000)
      const timeString = formatTime(elapsed)
      timerStartTime.current = null
      return timeString
    }
    
    return '00:00'
  }

  // Start timer when new question is set
  useEffect(() => {
    if (gameState.currentQuestion) {
      startTimer()
    }
  }, [gameState.currentQuestion])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
    }
  }, [])

  const checkAnswer = (userAnswer: number) => {
    if (!gameState.currentQuestion) return

    const isCorrect = userAnswer === gameState.currentQuestion.answer
    
    if (isCorrect) {
      const completionTime = stopTimer()
      
      const newCompletionTime: CompletionTime = {
        time: completionTime,
        question: `${gameState.currentQuestion.operands[0]} ${gameState.currentQuestion.operation === 'addition' ? '+' : '-'} ${gameState.currentQuestion.operands[1]}`,
        timestamp: Date.now(),
        answer: gameState.currentQuestion.answer
      }
      
      setCompletionTimes(prev => [...prev, newCompletionTime])
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
      checkAnswer,
      currentTime,
      completionTimes,
      startTimer
    }}>
      {children}
    </GameContext.Provider>
  )
}