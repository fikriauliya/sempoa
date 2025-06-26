import React, { useState, useCallback } from 'react'
import { useGame } from '../context/GameContext'
import { generateQuestion } from '../utils/questionGenerator'

const GameController: React.FC = () => {
  const { gameState, setGameState } = useGame()

  const [difficulty, setDifficulty] = useState<'single' | 'double' | 'triple'>('single')
  const [operation, setOperation] = useState<'addition' | 'subtraction' | 'mixed'>('addition')
  const [useComplements, setUseComplements] = useState({
    smallFriend: false,
    bigFriend: false
  })

  const generateNewQuestion = useCallback(() => {
    const question = generateQuestion({
      difficulty,
      operation,
      useSmallFriend: useComplements.smallFriend,
      useBigFriend: useComplements.bigFriend
    })
    
    setGameState(prev => ({
      ...prev,
      currentQuestion: question
    }))
  }, [difficulty, operation, useComplements])


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Game Control</h2>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Score</h3>
          <div className="text-2xl font-mono text-blue-600">
            {gameState.score}
          </div>
          <div className="text-sm text-blue-600">
            Mistakes: {gameState.mistakes}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'single' | 'double' | 'triple')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="single">Single Digit</option>
              <option value="double">Double Digit</option>
              <option value="triple">Triple Digit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operation
            </label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value as 'addition' | 'subtraction' | 'mixed')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="addition">Addition</option>
              <option value="subtraction">Subtraction</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complements
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useComplements.smallFriend}
                  onChange={(e) => setUseComplements(prev => ({
                    ...prev,
                    smallFriend: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm">Small Friend</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useComplements.bigFriend}
                  onChange={(e) => setUseComplements(prev => ({
                    ...prev,
                    bigFriend: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm">Big Friend</span>
              </label>
            </div>
          </div>
        </div>

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
              Difficulty: {gameState.currentQuestion.difficulty}
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
    </div>
  )
}

export default GameController