import { useCallback, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import type { LevelProgress } from '../types';
import { generateQuestion } from '../utils/questionGenerator';

export const useQuestionGeneration = (currentLevel: LevelProgress | null) => {
  const { setGameState, setCurrentValue } = useGame();

  const generateNewQuestion = useCallback(() => {
    if (!currentLevel) return;

    const question = generateQuestion({
      difficulty: currentLevel.digitLevel,
      operation: currentLevel.operationType,
      friendType: currentLevel.complementType,
    });

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
