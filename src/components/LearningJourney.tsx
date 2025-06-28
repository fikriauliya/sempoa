import React, { useState, useEffect, useCallback } from 'react'
import { useGame } from '../context/GameContext'
import { generateQuestion } from '../utils/questionGenerator'
import { LearningLevel, LearningJourneyState } from '../types'

const createInitialLevels = (): LearningLevel[] => {
  const operations: Array<'addition' | 'subtraction' | 'mixed'> = ['addition', 'subtraction', 'mixed']
  const difficulties: Array<'single' | 'double' | 'triple'> = ['single', 'double', 'triple']
  const complementCombos = [
    { small: false, big: false, name: 'Basic' },
    { small: true, big: false, name: 'Small Friend' },
    { small: false, big: true, name: 'Big Friend' },
    { small: true, big: true, name: 'Both Friends' }
  ]

  const levels: LearningLevel[] = []
  let levelIndex = 0

  operations.forEach(operation => {
    difficulties.forEach(difficulty => {
      complementCombos.forEach(combo => {
        const id = `${operation}-${difficulty}-${combo.small ? 's' : ''}${combo.big ? 'b' : ''}`
        const operationName = operation.charAt(0).toUpperCase() + operation.slice(1)
        const difficultyName = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
        
        levels.push({
          id,
          name: `${operationName} ${difficultyName} ${combo.name}`,
          operation,
          difficulty,
          useSmallFriend: combo.small,
          useBigFriend: combo.big,
          isUnlocked: levelIndex === 0, // Only first level unlocked initially
          isCompleted: false,
          completionPercentage: 0
        })
        levelIndex++
      })
    })
  })

  return levels
}

const LearningJourney: React.FC = () => {
  const { gameState, setGameState, setOnAnswerChecked, lastAnswerCorrect } = useGame()
  
  const [journeyState, setJourneyState] = useState<LearningJourneyState>(() => {
    const saved = localStorage.getItem('learning-journey')
    if (saved) {
      return JSON.parse(saved)
    }
    return {
      levels: createInitialLevels(),
      currentLevelId: null,
      totalScore: 0,
      overallProgress: 0
    }
  })
  
  const [animatingLevelId, setAnimatingLevelId] = useState<string | null>(null)
  const [animationType, setAnimationType] = useState<'correct' | 'wrong' | null>(null)

  // Save to localStorage whenever journeyState changes
  useEffect(() => {
    localStorage.setItem('learning-journey', JSON.stringify(journeyState))
  }, [journeyState])

  // Trigger animation when answer is submitted
  useEffect(() => {
    if (lastAnswerCorrect !== null && journeyState.currentLevelId) {
      setAnimatingLevelId(journeyState.currentLevelId)
      setAnimationType(lastAnswerCorrect ? 'correct' : 'wrong')
      
      // Clear animation after it completes
      const timer = setTimeout(() => {
        setAnimatingLevelId(null)
        setAnimationType(null)
      }, 600)
      
      return () => clearTimeout(timer)
    }
  }, [lastAnswerCorrect, journeyState.currentLevelId])

  // Track correct answers and update level progress
  useEffect(() => {
    if (!journeyState.currentLevelId) return
    
    const currentLevelIndex = journeyState.levels.findIndex(l => l.id === journeyState.currentLevelId)
    if (currentLevelIndex === -1) return

    // Check if we need to update progress (when score changes)
    const questionsCompleted = gameState.score
    const targetQuestions = 5 // Complete 5 questions to finish a level
    const completion = Math.min(100, (questionsCompleted % targetQuestions) * 20)
    
    setJourneyState(prev => {
      const newLevels = [...prev.levels]
      newLevels[currentLevelIndex] = {
        ...newLevels[currentLevelIndex],
        completionPercentage: completion
      }

      // If level is completed, mark it and unlock next level
      if (completion === 100 && !newLevels[currentLevelIndex].isCompleted) {
        newLevels[currentLevelIndex].isCompleted = true
        
        // Unlock next level if it exists
        if (currentLevelIndex + 1 < newLevels.length) {
          newLevels[currentLevelIndex + 1].isUnlocked = true
        }
      }

      return {
        ...prev,
        levels: newLevels,
        totalScore: questionsCompleted,
        overallProgress: (newLevels.filter(l => l.isCompleted).length / newLevels.length) * 100
      }
    })
  }, [gameState.score, journeyState.currentLevelId])

  const selectLevel = useCallback((levelId: string) => {
    const level = journeyState.levels.find(l => l.id === levelId)
    if (!level || !level.isUnlocked) return

    setJourneyState(prev => ({
      ...prev,
      currentLevelId: levelId
    }))

    // Generate question for this level
    const question = generateQuestion({
      difficulty: level.difficulty,
      operation: level.operation,
      useSmallFriend: level.useSmallFriend,
      useBigFriend: level.useBigFriend
    })
    
    setGameState(prev => ({
      ...prev,
      currentQuestion: question
    }))
  }, [journeyState.levels, setGameState])

  const generateNewQuestion = useCallback(() => {
    if (!journeyState.currentLevelId) return
    
    const level = journeyState.levels.find(l => l.id === journeyState.currentLevelId)
    if (!level) return

    const question = generateQuestion({
      difficulty: level.difficulty,
      operation: level.operation,
      useSmallFriend: level.useSmallFriend,
      useBigFriend: level.useBigFriend
    })
    
    setGameState(prev => ({
      ...prev,
      currentQuestion: question
    }))
  }, [journeyState.currentLevelId, journeyState.levels, setGameState])

  // Set up the callback to automatically generate next question after answer
  useEffect(() => {
    setOnAnswerChecked(() => generateNewQuestion)
  }, [generateNewQuestion, setOnAnswerChecked])

  const getLevelIcon = (level: LearningLevel) => {
    if (level.operation === 'addition') return '➕'
    if (level.operation === 'subtraction') return '➖'
    return '🔄'
  }

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'single') return 'bg-green-100 text-green-800'
    if (difficulty === 'double') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const currentLevel = journeyState.levels.find(l => l.id === journeyState.currentLevelId)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Learning Journey</h2>
      
      {/* Score Display */}
      <div className={`bg-blue-50 p-4 rounded-lg mb-6 transition-all ${
        animatingLevelId && animationType === 'correct' ? 'animate-correct-pulse' : ''
      } ${
        animatingLevelId && animationType === 'wrong' ? 'animate-wrong-shake' : ''
      }`}>
        <h3 className="font-semibold text-blue-800 mb-2">Progress</h3>
        <div className={`text-2xl font-mono ${
          animatingLevelId && animationType === 'correct' ? 'text-green-600' : 'text-blue-600'
        } ${
          animatingLevelId && animationType === 'wrong' ? 'text-red-600' : ''
        } transition-colors`}>
          {gameState.score}
        </div>
        <div className={`text-sm ${
          animatingLevelId && animationType === 'wrong' ? 'text-red-600' : 'text-blue-600'
        } transition-colors`}>
          Mistakes: {gameState.mistakes}
        </div>
      </div>

      {/* Level Selection */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-700">Select Level</h3>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {journeyState.levels.map((level) => (
            <button
              key={level.id}
              onClick={() => selectLevel(level.id)}
              disabled={!level.isUnlocked}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                level.id === journeyState.currentLevelId
                  ? 'bg-blue-100 border-2 border-blue-300'
                  : level.isUnlocked
                  ? 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getLevelIcon(level)}</span>
                  <div>
                    <div className="font-medium text-sm">{level.name}</div>
                    <div className={`text-xs px-2 py-1 rounded ${getDifficultyColor(level.difficulty)} inline-block`}>
                      {level.difficulty}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {level.isCompleted && <span className="text-green-500">✓</span>}
                  {!level.isUnlocked && <span className="text-gray-400">🔒</span>}
                  {level.isUnlocked && !level.isCompleted && level.completionPercentage > 0 && (
                    <div className={`flex items-center space-x-1 ${
                      animatingLevelId === level.id && animationType === 'correct' ? 'animate-correct-shake' : ''
                    } ${
                      animatingLevelId === level.id && animationType === 'wrong' ? 'animate-wrong-shake' : ''
                    }`}>
                      <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            animatingLevelId === level.id && animationType === 'correct' 
                              ? 'bg-green-500' 
                              : animatingLevelId === level.id && animationType === 'wrong'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${level.completionPercentage}%` }}
                        />
                      </div>
                      <span className={`text-xs transition-colors ${
                        animatingLevelId === level.id && animationType === 'correct' 
                          ? 'text-green-600' 
                          : animatingLevelId === level.id && animationType === 'wrong'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>{level.completionPercentage}%</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Question */}
      {currentLevel && (
        <div className="space-y-4">
          <button
            onClick={generateNewQuestion}
            className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
          >
            New Question
          </button>

          {gameState.currentQuestion && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Current Question</h3>
              <div className="text-lg font-mono text-green-700 mb-2">
                {gameState.currentQuestion.operation === 'addition' 
                  ? gameState.currentQuestion.operands.join(' + ')
                  : gameState.currentQuestion.operation === 'subtraction'
                  ? gameState.currentQuestion.operands.join(' - ')
                  : gameState.currentQuestion.operands.join(' ? ')
                } = ?
              </div>
              <div className="text-sm text-green-600 mb-2">
                Level: {currentLevel.name}
              </div>
              {gameState.currentQuestion.useSmallFriend && (
                <div className="text-xs text-green-500">Uses Small Friend</div>
              )}
              {gameState.currentQuestion.useBigFriend && (
                <div className="text-xs text-green-500">Uses Big Friend</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LearningJourney