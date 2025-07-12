import { useCallback } from 'react';
import { useGame } from '../context/GameContext';
import type { UserProgress } from '../types';

export const useAnswerChecking = (
  userProgress: UserProgress,
  processAnswer: (isCorrect: boolean) => void,
  generateNewQuestion: () => void,
) => {
  const { gameState, checkAnswer } = useGame();

  const handleCheckAnswer = useCallback(() => {
    if (!userProgress.currentLevelId || !gameState.currentQuestion) return null;

    const isCorrect = checkAnswer();

    // Process answer and generate new question
    processAnswer(isCorrect);
    generateNewQuestion();

    return isCorrect;
  }, [
    userProgress.currentLevelId,
    gameState.currentQuestion,
    checkAnswer,
    processAnswer,
    generateNewQuestion,
  ]);

  return {
    handleCheckAnswer,
  };
};
