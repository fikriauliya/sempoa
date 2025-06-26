import React, { useState, useCallback } from 'react'
import { BeadPosition, SempoaState } from '../types'
import { useGame } from '../context/GameContext'
import DraggableBead from './DraggableBead'

const COLUMNS = 7
const UPPER_BEADS_PER_COLUMN = 1
const LOWER_BEADS_PER_COLUMN = 4

const SempoaBoard: React.FC = () => {
  const { currentValue, setCurrentValue, feedback, checkAnswer, gameState } = useGame()
  
  const [, setSempoaState] = useState<SempoaState>(() => {
    const initialBeads: BeadPosition[] = []
    
    for (let col = 0; col < COLUMNS; col++) {
      for (let row = 0; row < UPPER_BEADS_PER_COLUMN; row++) {
        initialBeads.push({
          column: col,
          row: row,
          value: 5 * Math.pow(10, COLUMNS - 1 - col),
          isUpper: true
        })
      }
      
      for (let row = 0; row < LOWER_BEADS_PER_COLUMN; row++) {
        initialBeads.push({
          column: col,
          row: row,
          value: Math.pow(10, COLUMNS - 1 - col),
          isUpper: false
        })
      }
    }
    
    return {
      beads: initialBeads,
      currentValue: 0
    }
  })

  const [activeBeads, setActiveBeads] = useState<Set<string>>(new Set())

  const getBeadKey = (bead: BeadPosition): string => 
    `${bead.column}-${bead.isUpper ? 'upper' : 'lower'}-${bead.row}`

  const isBeadActive = (bead: BeadPosition): boolean => 
    activeBeads.has(getBeadKey(bead))

  const toggleBead = useCallback((bead: BeadPosition) => {
    const key = getBeadKey(bead)
    const newActiveBeads = new Set(activeBeads)
    
    if (newActiveBeads.has(key)) {
      newActiveBeads.delete(key)
    } else {
      newActiveBeads.add(key)
    }
    
    setActiveBeads(newActiveBeads)
    
    const newValue = Array.from(newActiveBeads).reduce((sum, beadKey) => {
      const [col, type] = beadKey.split('-')
      const column = parseInt(col)
      const isUpper = type === 'upper'
      const beadValue = isUpper 
        ? 5 * Math.pow(10, COLUMNS - 1 - column)
        : Math.pow(10, COLUMNS - 1 - column)
      return sum + beadValue
    }, 0)
    
    setSempoaState(prev => ({ ...prev, currentValue: newValue }))
    setCurrentValue(newValue)
  }, [activeBeads])

  const reset = useCallback(() => {
    setActiveBeads(new Set())
    setSempoaState(prev => ({ ...prev, currentValue: 0 }))
    setCurrentValue(0)
  }, [setCurrentValue])

  const submitAnswer = useCallback(() => {
    if (gameState.currentQuestion) {
      checkAnswer(currentValue)
    }
  }, [currentValue, checkAnswer, gameState.currentQuestion])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Sempoa Board</h2>
        <div className="flex gap-4 items-center">
          <div className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
            Value: {currentValue}
          </div>
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Reset
          </button>
          {gameState.currentQuestion && (
            <button
              onClick={submitAnswer}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Submit Answer
            </button>
          )}
        </div>
      </div>
      
      {feedback && (
        <div className={`mb-4 p-3 rounded-lg text-center font-medium ${
          feedback.includes('Correct') 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {feedback}
        </div>
      )}
      
      <div className="sempoa-frame bg-black p-6 rounded-lg shadow-2xl">
        <div className="bg-amber-50 p-4 rounded relative">
          {/* Column labels */}
          <div className="flex justify-between mb-4">
            {Array.from({ length: COLUMNS }, (_, col) => (
              <div key={col} className="text-xs text-gray-600 font-mono text-center w-12">
                {Math.pow(10, COLUMNS - 1 - col).toLocaleString()}
              </div>
            ))}
          </div>
          
          {/* Sempoa board with vertical rods */}
          <div className="relative bg-amber-100 p-4 rounded border-2 border-amber-800">
            {/* Column structure - using flex for even distribution */}
            <div className="flex justify-between" style={{ height: '180px' }}>
              {Array.from({ length: COLUMNS }, (_, col) => (
                <div key={col} className="relative flex flex-col items-center" style={{ width: '48px' }}>
                  {/* Vertical rod for this column */}
                  <div
                    className="absolute bg-amber-900 rounded-full shadow-sm"
                    style={{ 
                      height: '200px', 
                      width: '4px',
                      left: '50%',
                      top: '-10px',
                      transform: 'translateX(-50%)',
                      zIndex: 1
                    }}
                  />
                  
                  {/* Horizontal crossbar segment */}
                  {col === Math.floor(COLUMNS / 2) && (
                    <div className="absolute h-2 bg-amber-900 rounded-full shadow-md" 
                         style={{ 
                           width: '900%', 
                           left: '-400%',
                           top: '50%',
                           transform: 'translateY(-50%)',
                           zIndex: 0
                         }}
                    />
                  )}
                  {/* Upper section beads */}
                  <div className="upper-section relative flex flex-col items-center" style={{ height: '90px' }}>
                    {Array.from({ length: UPPER_BEADS_PER_COLUMN }, (_, row) => {
                      const bead: BeadPosition = {
                        column: col,
                        row: row,
                        value: 5 * Math.pow(10, COLUMNS - 1 - col),
                        isUpper: true
                      }
                      const active = isBeadActive(bead)
                      
                      return (
                        <div
                          key={`upper-${row}`}
                          className="absolute"
                          style={{
                            top: active ? '60px' : '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            transition: 'top 0.3s ease',
                            zIndex: 20
                          }}
                        >
                          <DraggableBead
                            bead={bead}
                            isActive={active}
                            onClick={() => toggleBead(bead)}
                          />
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Lower section beads */}
                  <div className="lower-section relative flex flex-col items-center" style={{ height: '90px' }}>
                    {Array.from({ length: LOWER_BEADS_PER_COLUMN }, (_, row) => {
                      const bead: BeadPosition = {
                        column: col,
                        row: row,
                        value: Math.pow(10, COLUMNS - 1 - col),
                        isUpper: false
                      }
                      const active = isBeadActive(bead)
                      
                      return (
                        <div
                          key={`lower-${row}`}
                          className="absolute"
                          style={{
                            top: active ? `${10 + (row * 22)}px` : `${60 + (row * 22)}px`,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            transition: 'top 0.3s ease',
                            zIndex: 20
                          }}
                        >
                          <DraggableBead
                            bead={bead}
                            isActive={active}
                            onClick={() => toggleBead(bead)}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SempoaBoard