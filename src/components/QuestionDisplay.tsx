import { motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useAnswerChecking } from '../hooks/useAnswerChecking';
import { useQuestionGeneration } from '../hooks/useQuestionGeneration';
import { useUserProgress } from '../hooks/useUserProgress';
import {
  COMPLEMENT_LABELS,
  DIGIT_LABELS,
  getOperationSymbol,
} from '../utils/constants';
import CheckAnswerButton from './LearningJourney/CheckAnswerButton';
import { KEYBOARD_SHORTCUTS } from './LearningJourney/constants';

const QuestionDisplay: React.FC = () => {
  const { gameState } = useGame();
  const { userProgress, currentLevel, processAnswer } = useUserProgress();
  const { generateNewQuestion } = useQuestionGeneration(currentLevel);
  const { handleCheckAnswer, buttonState, scope } = useAnswerChecking(
    userProgress,
    processAnswer,
    generateNewQuestion,
  );

  // Get hex color values for Framer Motion animation
  const getBackgroundColor = useMemo(() => {
    switch (buttonState) {
      case 'correct':
        return '#dcfce7'; // green-100
      case 'wrong':
        return '#fecaca'; // red-100
      default:
        return '#f0fdf4'; // green-50
    }
  }, [buttonState]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        KEYBOARD_SHORTCUTS.includes(
          event.key as (typeof KEYBOARD_SHORTCUTS)[number],
        )
      ) {
        event.preventDefault();
        handleCheckAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleCheckAnswer]);

  // Don't render if no current question or level
  if (!gameState.currentQuestion || !currentLevel) {
    return (
      <motion.div
        className="p-4 rounded-lg"
        data-testid="question-display"
        animate={{ backgroundColor: getBackgroundColor }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <h3 className="font-semibold text-green-800 mb-2">Current Question</h3>
        <div className="text-gray-500 text-center">
          Select a level to start practicing
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-4 rounded-lg"
      data-testid="question-display"
      animate={{ backgroundColor: getBackgroundColor }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <h3 className="font-semibold text-green-800 mb-2">Current Question</h3>
      <div className="text-lg font-mono text-green-700 mb-2">
        {gameState.currentQuestion.operands.join(
          ` ${getOperationSymbol(gameState.currentQuestion.operation)} `,
        )}{' '}
        = ?
      </div>
      <div className="text-sm text-green-600 mb-4">
        {COMPLEMENT_LABELS[currentLevel.complementType]} -{' '}
        {DIGIT_LABELS[currentLevel.digitLevel]}
      </div>
      <CheckAnswerButton
        buttonState={buttonState}
        onCheckAnswer={handleCheckAnswer}
        scope={scope}
      />
      <div className="hidden" data-answer={gameState.currentQuestion.answer} />
    </motion.div>
  );
};

export default QuestionDisplay;
