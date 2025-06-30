import type { LevelProgress, UserProgress } from '../types';

export const getLevelButtonClassName = (
  level: LevelProgress,
  userProgress: UserProgress,
): string => {
  const isCurrentLevel = userProgress.currentLevelId === level.id;

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

export const getButtonStateClassName = (
  buttonState: 'normal' | 'correct' | 'wrong',
): string => {
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
