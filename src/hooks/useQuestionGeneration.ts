import { useCallback, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import type { LevelProgress } from '../types';
import { generateQuestionForLevel } from '../utils/levelQuestionGenerator';

export const useQuestionGeneration = (currentLevel: LevelProgress | null) => {
  const { setGameState, setCurrentValue } = useGame();

  const generateNewQuestion = useCallback(() => {
    const question = generateQuestionForLevel(currentLevel);
    if (question) {
      setCurrentValue(0);
      setGameState((prev) => ({
        ...prev,
        currentQuestion: question,
      }));
    }
  }, [currentLevel, setCurrentValue, setGameState]);

  useEffect(() => {
    // Generate initial question if there's a current level
    generateNewQuestion();
  }, [generateNewQuestion]);

  return { generateNewQuestion };
};
