import { useAnimate } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useGame } from '../context/GameContext';
import type { ButtonState, UserProgress } from '../types';

const BUTTON_FEEDBACK_DURATION = 0.3;

export const useAnswerChecking = (
  userProgress: UserProgress,
  processAnswer: (isCorrect: boolean) => void,
  generateNewQuestion: () => void,
) => {
  const { gameState, checkAnswer } = useGame();
  const [buttonState, setButtonState] = useState<ButtonState>('normal');
  const [scope, animate] = useAnimate();

  const handleCheckAnswer = useCallback(async () => {
    if (!userProgress.currentLevelId || !gameState.currentQuestion) return;

    const isCorrect = checkAnswer();

    // Show feedback on button
    setButtonState(isCorrect ? 'correct' : 'wrong');

    // Animate button feedback, then reset state and move to next question
    await animate(
      scope.current,
      { scale: [1, 1.05, 1] },
      { duration: BUTTON_FEEDBACK_DURATION },
    );
    setButtonState('normal');

    // Process answer and generate new question
    processAnswer(isCorrect);
    generateNewQuestion();
  }, [
    userProgress.currentLevelId,
    gameState.currentQuestion,
    checkAnswer,
    animate,
    scope,
    processAnswer,
    generateNewQuestion,
  ]);

  return {
    handleCheckAnswer,
    buttonState,
    scope,
  };
};
