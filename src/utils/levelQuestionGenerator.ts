import type { LevelProgress, Question } from '../types';
import { generateQuestion } from './questionGenerator';

/**
 * Generates a question based on the provided level's configuration
 * @param level - The level to generate a question for
 * @returns A question object or null if no level is provided
 */
export const generateQuestionForLevel = (
  level: LevelProgress | null,
): Question | null => {
  if (!level) return null;

  return generateQuestion({
    difficulty: level.digitLevel,
    operation: level.operationType,
    useSmallFriend:
      level.complementType === 'smallFriend' || level.complementType === 'both',
    useBigFriend:
      level.complementType === 'bigFriend' || level.complementType === 'both',
  });
};
