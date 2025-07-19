import { motion, useAnimate } from 'framer-motion';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { ButtonState, LevelProgress, Question } from '../types';
import {
  COMPLEMENT_LABELS,
  DIGIT_LABELS,
  getOperationSymbol,
} from '../utils/constants';
import CheckAnswerButton from './LearningJourney/CheckAnswerButton';

interface QuestionDisplayProps {
  currentQuestion: Question | null;
  currentLevel: LevelProgress | null;
  onCheckAnswer: () => boolean | null;
}

const BUTTON_FEEDBACK_DURATION = 0.5;

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  currentQuestion,
  currentLevel,
  onCheckAnswer,
}) => {
  const [buttonState, setButtonState] = useState<ButtonState>('normal');
  const [scope, animate] = useAnimate();

  const handleCheckAnswer = async () => {
    const isCorrect = onCheckAnswer();
    if (isCorrect !== null) {
      // Show feedback on button
      setButtonState(isCorrect ? 'correct' : 'wrong');

      // Animate button feedback, then reset state
      await animate(
        scope.current,
        { scale: [1, 1.05, 1] },
        { duration: BUTTON_FEEDBACK_DURATION },
      );
      setButtonState('normal');
    }
  };

  useKeyboardShortcuts({
    onShortcut: handleCheckAnswer,
  });
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

  // Don't render if no current question or level
  if (!currentQuestion || !currentLevel) {
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
      <div className="text-lg font-mono text-green-700 mb-2 flex justify-center">
        <div className="inline-block text-right">
          {currentQuestion.operands.map((operand, index) => (
            <div
              key={`${currentQuestion.operation}-${operand}-${index}`}
              className="flex items-center justify-end"
            >
              {index === 0 && <span className="mr-2 inline-block w-4"></span>}
              {index === 1 && (
                <span className="mr-2 inline-block w-4 text-left">
                  {getOperationSymbol(currentQuestion.operation)}
                </span>
              )}
              <span className="inline-block min-w-[3ch] text-right">
                {operand}
              </span>
            </div>
          ))}
          <div className="border-t-2 border-green-700 mt-1 pt-1 flex items-center justify-end">
            <span className="mr-2 inline-block w-4"></span>
            <span className="inline-block min-w-[3ch] text-right">?</span>
          </div>
        </div>
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
      <div className="hidden" data-answer={currentQuestion.answer} />
    </motion.div>
  );
};

export default QuestionDisplay;
