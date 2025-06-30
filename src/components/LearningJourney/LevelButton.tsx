import type React from 'react';
import type { LevelProgress, UserProgress } from '../../types';
import { DIGIT_LABELS } from '../../utils/constants';

interface LevelButtonProps {
  level: LevelProgress;
  userProgress: UserProgress;
  onSelect: (level: LevelProgress) => void;
}

const LevelButton: React.FC<LevelButtonProps> = ({
  level,
  userProgress,
  onSelect,
}) => {
  const isCurrentLevel = userProgress.currentLevelId === level.id;

  const getClassName = () => {
    const baseClasses =
      'p-2 rounded cursor-pointer text-sm flex items-center justify-between border-none bg-transparent text-left w-full';

    if (!level.isUnlocked) {
      return `${baseClasses} bg-gray-100 text-gray-400 locked`;
    }

    if (level.isCompleted) {
      return `${baseClasses} bg-green-100 text-green-700`;
    }

    if (isCurrentLevel) {
      return `${baseClasses} bg-blue-100 text-blue-700 in-progress`;
    }

    return `${baseClasses} bg-white hover:bg-gray-50`;
  };

  return (
    <button
      type="button"
      data-testid={`level-${level.operationType}-${level.complementType}-${level.digitLevel}`}
      className={getClassName()}
      onClick={() => onSelect(level)}
    >
      <span>{DIGIT_LABELS[level.digitLevel]}</span>
      {level.isCompleted && (
        <span data-testid="checkmark-icon" className="text-green-600">
          ✓
        </span>
      )}
      {!level.isUnlocked && <span className="text-gray-400">🔒</span>}
    </button>
  );
};

export default LevelButton;
