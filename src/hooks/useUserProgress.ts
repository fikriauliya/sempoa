import { useCallback } from 'react';
import type {
  ComplementType,
  LevelProgress,
  OperationType,
  UserProgress,
} from '../types';
import { ProgressionManager } from '../utils/progressionManager';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'sempoa_user_progress';
const manager = ProgressionManager.getInstance();

export const useUserProgress = () => {
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>(
    STORAGE_KEY,
    manager.initializeProgress(),
  );

  const selectLevel = useCallback(
    (level: LevelProgress) => {
      if (!level.isUnlocked) return userProgress;
      const updated = manager.selectLevel(userProgress, level);
      setUserProgress(updated);
      return updated;
    },
    [userProgress, setUserProgress],
  );

  const resetProgress = useCallback(() => {
    const fresh = manager.initializeProgress();
    setUserProgress(fresh);
    return fresh;
  }, [setUserProgress]);

  const processAnswer = useCallback(
    (isCorrect: boolean) => {
      const updated = isCorrect
        ? manager.recordCorrectAnswer(userProgress)
        : manager.recordIncorrectAnswer(userProgress);
      setUserProgress(updated);
      return updated;
    },
    [userProgress, setUserProgress],
  );

  return {
    userProgress,
    selectLevel,
    resetProgress,
    processAnswer,
    currentLevel: manager.getCurrentLevel(userProgress),
    completionPercentage: manager.getCompletionPercentage(userProgress),
    sectionProgress: (
      operationType: OperationType,
      complementType: ComplementType,
    ) =>
      manager.getSectionProgress(userProgress, operationType, complementType),
  };
};
