import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useGame } from '../context/GameContext'
import { UserProgress, LevelProgress, GameState } from '../types'
import { ProgressionManager } from '../utils/progressionManager'
import { generateQuestion } from '../utils/questionGenerator'

const LearningJourney: React.FC = () => {
  const { gameState, setGameState, checkAnswer, setCurrentValue } = useGame()
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [buttonState, setButtonState] = useState<'normal' | 'correct' | 'wrong'>('normal')
  const progressionManager = useMemo(() => ProgressionManager.getInstance(), [])

  const generateNewQuestion = useCallback((level: LevelProgress) => {
    // Reset the sempoa board
    setCurrentValue(0)
    
    const question = generateQuestion({
      difficulty: level.digitLevel,
      operation: level.operationType,
      useSmallFriend: level.complementType === 'smallFriend' || level.complementType === 'both',
      useBigFriend: level.complementType === 'bigFriend' || level.complementType === 'both'
    })
    
    setGameState((prev: GameState) => ({
      ...prev,
      currentQuestion: question
    }))
  }, [setCurrentValue, setGameState])

  useEffect(() => {
    const progress = progressionManager.loadProgress()
    setUserProgress(progress)
    
    // Generate initial question if there's a current level
    if (progress.currentLevel) {
      generateNewQuestion(progress.currentLevel)
    }
  }, [generateNewQuestion]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckAnswer = useCallback(() => {
    if (!userProgress?.currentLevel || !gameState.currentQuestion) return
    
    const isCorrect = checkAnswer()
    
    // Show feedback on button
    setButtonState(isCorrect ? 'correct' : 'wrong')
    
    // Reset button state and move to next question quickly
    setTimeout(() => {
      setButtonState('normal')
    }, 300)
    
    if (isCorrect) {
      const updatedProgress = progressionManager.recordCorrectAnswer(userProgress)
      setUserProgress(updatedProgress)
      
      // Generate new question quickly
      setTimeout(() => {
        if (updatedProgress.currentLevel) {
          generateNewQuestion(updatedProgress.currentLevel)
        }
      }, 300)
    } else {
      const updatedProgress = progressionManager.recordIncorrectAnswer(userProgress)
      setUserProgress(updatedProgress)
      
      // Also generate new question when wrong
      setTimeout(() => {
        if (updatedProgress.currentLevel) {
          generateNewQuestion(updatedProgress.currentLevel)
        }
      }, 300)
    }
  }, [userProgress, gameState.currentQuestion, checkAnswer]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleCheckAnswer()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleCheckAnswer])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const selectLevel = (level: LevelProgress) => {
    if (!userProgress || !level.isUnlocked) return
    
    const updatedProgress = progressionManager.selectLevel(userProgress, level)
    setUserProgress(updatedProgress)
    generateNewQuestion(level)
  }

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'addition':
        return '➕'
      case 'subtraction':
        return '➖'
      case 'mixed':
        return '🔄'
      default:
        return '📚'
    }
  }

  const getComplementLabel = (complement: string) => {
    switch (complement) {
      case 'simple':
        return 'Simple'
      case 'smallFriend':
        return 'Small Friend'
      case 'bigFriend':
        return 'Big Friend'
      case 'both':
        return 'Both Friends'
      default:
        return complement
    }
  }

  const getDigitLabel = (digit: string) => {
    switch (digit) {
      case 'single':
        return 'Single Digit'
      case 'double':
        return 'Double Digit'
      case 'triple':
        return 'Triple Digit'
      case 'four':
        return 'Four Digit'
      case 'five':
        return 'Five Digit'
      default:
        return digit
    }
  }

  if (!userProgress) return null

  const operations: Array<'addition' | 'subtraction' | 'mixed'> = ['addition', 'subtraction', 'mixed']
  const complements: Array<'simple' | 'smallFriend' | 'bigFriend' | 'both'> = ['simple', 'smallFriend', 'bigFriend', 'both']

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" data-testid="learning-journey-sidebar">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Learning Journey</h2>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Progress</h3>
          <div className="text-2xl font-mono text-blue-600">
            {progressionManager.getCompletionPercentage(userProgress)}%
          </div>
          <div className="text-sm text-blue-600">
            Score: {userProgress.totalScore}
          </div>
        </div>

        {operations.map(operation => {
          const operationLevels = userProgress.allLevels.filter(
            level => level.operationType === operation
          )
          const isOperationUnlocked = operationLevels.some(level => level.isUnlocked)
          
          return (
            <div key={operation} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(operation)}
                className={`w-full p-3 flex items-center justify-between ${
                  isOperationUnlocked ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-200 cursor-not-allowed'
                }`}
                disabled={!isOperationUnlocked}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="text-3xl"
                    data-testid={`icon-${operation}`}
                    style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {getOperationIcon(operation)}
                  </span>
                  <span className="font-medium">{operation === 'mixed' ? 'Mixed Operations' : operation.charAt(0).toUpperCase() + operation.slice(1)}</span>
                </div>
                <span className="text-gray-500">
                  {expandedSections[operation] ? '▼' : '▶'}
                </span>
              </button>
              
              {expandedSections[operation] && (
                <div className="p-3 bg-gray-50 space-y-2">
                  {complements.map(complement => {
                    const complementLevels = operationLevels.filter(
                      level => level.complementType === complement
                    )
                    const progress = progressionManager.getSectionProgress(
                      userProgress,
                      operation,
                      complement
                    )
                    
                    return (
                      <div key={complement} className="space-y-1">
                        <div 
                          className="font-medium text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                          onClick={() => toggleSection(`${operation}-${complement}`)}
                        >
                          {complement === 'simple' && operation === 'addition' ? 'Simple Addition' : 
                           complement === 'simple' && operation === 'subtraction' ? 'Simple Subtraction' :
                           complement === 'simple' && operation === 'mixed' ? 'Simple Mixed' :
                           getComplementLabel(complement)}
                          <span 
                            className="ml-2 text-xs text-gray-500"
                            data-testid={`progress-${operation}-${complement}`}
                          >
                            {progress.completed}/{progress.total}
                          </span>
                        </div>
                        
                        {expandedSections[`${operation}-${complement}`] && (
                          <div className="ml-4 space-y-1">
                            {complementLevels.map(level => {
                              const isCurrentLevel = userProgress.currentLevel && 
                                level.operationType === userProgress.currentLevel.operationType &&
                                level.complementType === userProgress.currentLevel.complementType &&
                                level.digitLevel === userProgress.currentLevel.digitLevel
                              
                              return (
                                <div
                                  key={`${level.operationType}-${level.complementType}-${level.digitLevel}`}
                                  data-testid={`level-${level.operationType}-${level.complementType}-${level.digitLevel}`}
                                  className={`
                                    p-2 rounded cursor-pointer text-sm flex items-center justify-between
                                    ${!level.isUnlocked ? 'bg-gray-100 text-gray-400 locked' : ''}
                                    ${level.isCompleted ? 'bg-green-100 text-green-700' : ''}
                                    ${isCurrentLevel ? 'bg-blue-100 text-blue-700 in-progress' : ''}
                                    ${level.isUnlocked && !level.isCompleted && !isCurrentLevel ? 'bg-white hover:bg-gray-50' : ''}
                                  `}
                                  onClick={() => selectLevel(level)}
                                >
                                  <span>{getDigitLabel(level.digitLevel)}</span>
                                  {level.isCompleted && (
                                    <span data-testid="checkmark-icon" className="text-green-600">✓</span>
                                  )}
                                  {!level.isUnlocked && (
                                    <span className="text-gray-400">🔒</span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        
        {userProgress.currentLevel && gameState.currentQuestion && (
          <div className="bg-green-50 p-4 rounded-lg" data-testid="current-question">
            <h3 className="font-semibold text-green-800 mb-2">Current Question</h3>
            <div className="text-lg font-mono text-green-700 mb-2">
              {gameState.currentQuestion.operation === 'addition' 
                ? gameState.currentQuestion.operands.join(' + ')
                : gameState.currentQuestion.operation === 'subtraction'
                ? gameState.currentQuestion.operands.join(' - ')
                : gameState.currentQuestion.operands.join(' ? ')
              } = ?
            </div>
            <div className="text-sm text-green-600">
              {getComplementLabel(userProgress.currentLevel.complementType)} - {getDigitLabel(userProgress.currentLevel.digitLevel)}
            </div>
            <div 
              className="hidden" 
              data-answer={gameState.currentQuestion.answer}
            />
          </div>
        )}
        
        <button
          onClick={handleCheckAnswer}
          className={`w-full py-2 px-4 rounded-md transition-all duration-200 font-medium flex items-center justify-center gap-2 ${
            buttonState === 'correct' 
              ? 'bg-green-500 text-white' 
              : buttonState === 'wrong'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {buttonState === 'correct' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {buttonState === 'wrong' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>Check Answer</span>
        </button>
      </div>
    </div>
  )
}

export default LearningJourney