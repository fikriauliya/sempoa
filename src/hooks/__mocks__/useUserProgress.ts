import type { UserProgress } from '../../types';

const mockUserProgress: UserProgress = {
  currentLevelId: 'addition-simple-single',
  allLevels: [],
  totalScore: 450,
};

export const useUserProgress = jest.fn(() => ({
  userProgress: mockUserProgress,
  recordCorrectAnswer: jest.fn(),
  recordIncorrectAnswer: jest.fn(),
  selectLevel: jest.fn(),
  currentLevel: jest.fn(),
  completionPercentage: jest.fn(() => 25),
  sectionProgress: jest.fn(() => ({ completed: 2, total: 5 })),
  resetProgress: jest.fn(),
  processAnswerAndContinue: jest.fn(),
  generateQuestionForCurrentLevel: jest.fn(),
}));
