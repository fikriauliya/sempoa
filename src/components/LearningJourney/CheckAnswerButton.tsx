import { motion } from 'framer-motion';
import type React from 'react';
import type { ButtonState } from '../../types';
import { CheckmarkIcon, CrossIcon } from '../icons/SVGIcons';

interface CheckAnswerButtonProps {
  buttonState: ButtonState;
  onCheckAnswer: () => void;
  scope: React.RefObject<HTMLButtonElement>;
}

const CheckAnswerButton: React.FC<CheckAnswerButtonProps> = ({
  buttonState,
  onCheckAnswer,
  scope,
}) => {
  const getClassName = () => {
    const baseClasses =
      'w-full py-2 px-4 rounded-md transition-all duration-200 font-medium flex items-center justify-center gap-2';

    switch (buttonState) {
      case 'correct':
        return `${baseClasses} bg-green-500 text-white`;
      case 'wrong':
        return `${baseClasses} bg-red-500 text-white`;
      default:
        return `${baseClasses} bg-blue-500 text-white hover:bg-blue-600`;
    }
  };

  return (
    <motion.button
      ref={scope}
      onClick={onCheckAnswer}
      className={getClassName()}
    >
      {buttonState === 'correct' && <CheckmarkIcon />}
      {buttonState === 'wrong' && <CrossIcon />}
      <span>Check Answer</span>
    </motion.button>
  );
};

export default CheckAnswerButton;
