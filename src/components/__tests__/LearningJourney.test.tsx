import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameProvider } from '../../context/GameContext';
import { useUserProgress } from '../../hooks/useUserProgress';
import type { LevelProgress, UserProgress } from '../../types';
import * as questionGenerator from '../../utils/questionGenerator';
import LearningJourney from '../LearningJourney';

// Mock the hooks and utilities
jest.mock('../../hooks/useUserProgress');
jest.mock('../../utils/questionGenerator');
const mockGameState = {
  currentQuestion: {
    operands: [5, 3],
    operation: 'addition' as const,
    answer: 8,
  },
};

jest.mock('../../context/GameContext', () => ({
  useGame: jest.fn(() => ({
    gameState: mockGameState,
    setGameState: jest.fn(),
    checkAnswer: jest.fn(() => true),
    setCurrentValue: jest.fn(),
  })),
  GameProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Test wrapper with GameProvider
const LearningJourneyWithProvider = () => (
  <GameProvider>
    <LearningJourney />
  </GameProvider>
);

// Mock data
const mockLevelProgress: LevelProgress = {
  id: 'addition-simple-single',
  operationType: 'addition',
  complementType: 'simple',
  digitLevel: 'single',
  questionsCompleted: 5,
  correctAnswers: 4,
  isUnlocked: true,
  isCompleted: false,
};

const mockUserProgress: UserProgress = {
  currentLevelId: mockLevelProgress.id,
  allLevels: [
    mockLevelProgress,
    {
      id: 'addition-simple-double',
      operationType: 'addition',
      complementType: 'simple',
      digitLevel: 'double',
      questionsCompleted: 0,
      correctAnswers: 0,
      isUnlocked: false,
      isCompleted: false,
    },
    {
      id: 'subtraction-simple-single',
      operationType: 'subtraction',
      complementType: 'simple',
      digitLevel: 'single',
      questionsCompleted: 10,
      correctAnswers: 10,
      isUnlocked: true,
      isCompleted: true,
    },
  ],
  totalScore: 450,
};

const mockQuestion = {
  operands: [5, 3],
  operation: 'addition' as const,
  answer: 8,
};

// Helper to create consistent mock return value
const createMockUseUserProgressReturn = (
  overrides: Record<string, unknown> = {},
) => {
  const result = {
    userProgress: {
      ...mockUserProgress,
      sectionProgress: jest.fn(() => ({ completed: 1, total: 3 })),
    },
    selectLevel: jest.fn().mockReturnValue(mockUserProgress),
    currentLevel: mockLevelProgress,
    completionPercentage: 25,
    sectionProgress: jest.fn().mockReturnValue({ completed: 1, total: 4 }),
    resetProgress: jest.fn(),
    processAnswer: jest.fn(),
    ...overrides,
  };

  // Ensure userProgress always has sectionProgress method
  if (overrides.userProgress && !overrides.userProgress.sectionProgress) {
    result.userProgress = {
      ...overrides.userProgress,
      sectionProgress: jest.fn(() => ({ completed: 0, total: 0 })),
    };
  }

  return result;
};

describe('LearningJourney', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const mockUseUserProgress = useUserProgress as jest.MockedFunction<
    typeof useUserProgress
  >;

  beforeEach(() => {
    user = userEvent.setup();

    // Reset all mocks
    jest.clearAllMocks();

    // Set up default mock implementation
    mockUseUserProgress.mockReturnValue(createMockUseUserProgressReturn());

    // Mock question generator to return mock question
    (questionGenerator.generateQuestion as jest.Mock).mockReturnValue(
      mockQuestion,
    );
  });

  describe('Rendering and Initial State', () => {
    test('should render learning journey sidebar', () => {
      render(<LearningJourneyWithProvider />);

      expect(
        screen.getByTestId('learning-journey-sidebar'),
      ).toBeInTheDocument();
      expect(screen.getByText('Learning Journey')).toBeInTheDocument();
    });

    test('should display progress information', () => {
      render(<LearningJourneyWithProvider />);

      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText('Score: 450')).toBeInTheDocument();
    });

    test('should load user progress on mount', () => {
      render(<LearningJourneyWithProvider />);

      expect(mockUseUserProgress).toHaveBeenCalled();
    });

    test('should render even with minimal progress data', () => {
      const minimalProgress: UserProgress = {
        currentLevelId: 'test-level',
        allLevels: [],
        totalScore: 0,
      };

      mockUseUserProgress.mockReturnValue(
        createMockUseUserProgressReturn({
          userProgress: minimalProgress,
          currentLevel: null,
          completionPercentage: 0,
          sectionProgress: jest
            .fn()
            .mockReturnValue({ completed: 0, total: 0 }),
        }),
      );

      render(<LearningJourneyWithProvider />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Operation Sections', () => {
    test('should render operation sections', () => {
      render(<LearningJourneyWithProvider />);

      expect(screen.getByTestId('icon-addition')).toBeInTheDocument();
      expect(screen.getByTestId('icon-subtraction')).toBeInTheDocument();
      expect(screen.getByTestId('icon-mixed')).toBeInTheDocument();
    });

    test('should expand operation section on click', async () => {
      render(<LearningJourneyWithProvider />);

      const additionButton = screen.getByRole('button', { name: /addition/i });
      await user.click(additionButton);

      // Should show progress for simple complement
      expect(screen.getByText('Simple Addition')).toBeInTheDocument();
    });

    test('should show section progress', async () => {
      render(<LearningJourneyWithProvider />);

      const additionButton = screen.getByRole('button', { name: /addition/i });
      await user.click(additionButton);

      expect(screen.getByTestId('progress-addition-simple')).toHaveTextContent(
        '1/4',
      );
    });
  });

  describe('Complement Sections', () => {
    test('should expand complement section to show levels', async () => {
      render(<LearningJourneyWithProvider />);

      // First expand operation
      const additionButton = screen.getByRole('button', { name: /addition/i });
      await user.click(additionButton);

      // Then expand complement
      const simpleAdditionButton = screen.getByRole('button', {
        name: /simple addition/i,
      });
      await user.click(simpleAdditionButton);

      // Should show level buttons
      expect(
        screen.getByTestId('level-addition-simple-single'),
      ).toBeInTheDocument();
    });

    test('should show level completion status', async () => {
      // Set up data with a completed level in addition section
      const progressWithCompleted: UserProgress = {
        ...mockUserProgress,
        allLevels: [
          {
            ...mockLevelProgress,
            isCompleted: true,
          },
          {
            id: 'addition-simple-double',
            operationType: 'addition',
            complementType: 'simple',
            digitLevel: 'double',
            questionsCompleted: 0,
            correctAnswers: 0,
            isUnlocked: false,
            isCompleted: false,
          },
        ],
      };

      mockUseUserProgress.mockReturnValue(
        createMockUseUserProgressReturn({
          userProgress: progressWithCompleted,
          currentLevel: progressWithCompleted.allLevels[0],
        }),
      );

      render(<LearningJourneyWithProvider />);

      // Expand to show levels
      const additionButton = screen.getByRole('button', { name: /addition/i });
      await user.click(additionButton);

      const simpleAdditionButton = screen.getByRole('button', {
        name: /simple addition/i,
      });
      await user.click(simpleAdditionButton);

      // Check for checkmark on completed level
      const completedLevel = screen.getByTestId('level-addition-simple-single');
      expect(completedLevel).toHaveTextContent('✓');
    });
  });

  describe('Level Selection', () => {
    test('should select level when clicked', async () => {
      render(<LearningJourneyWithProvider />);

      // Expand to show levels
      const additionButton = screen.getByRole('button', { name: /addition/i });
      await user.click(additionButton);

      const simpleAdditionButton = screen.getByRole('button', {
        name: /simple addition/i,
      });
      await user.click(simpleAdditionButton);

      // Click on an unlocked level
      const levelButton = screen.getByTestId('level-addition-simple-single');
      await user.click(levelButton);

      const { selectLevel } = mockUseUserProgress.mock.results[0].value;
      expect(selectLevel).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'addition-simple-single',
        }),
      );
    });

    test('should highlight current level', async () => {
      render(<LearningJourneyWithProvider />);

      // Expand to show current level
      const additionButton = screen.getByRole('button', { name: /addition/i });
      await user.click(additionButton);

      const simpleAdditionButton = screen.getByRole('button', {
        name: /simple addition/i,
      });
      await user.click(simpleAdditionButton);

      const currentLevelButton = screen.getByTestId(
        'level-addition-simple-single',
      );
      expect(currentLevelButton).toHaveClass('in-progress');
    });

    test('should show locked icon for locked levels', async () => {
      render(<LearningJourneyWithProvider />);

      // Expand to show levels
      const additionButton = screen.getByRole('button', { name: /addition/i });
      await user.click(additionButton);

      const simpleAdditionButton = screen.getByRole('button', {
        name: /simple addition/i,
      });
      await user.click(simpleAdditionButton);

      const lockedLevel = screen.getByTestId('level-addition-simple-double');
      expect(lockedLevel).toHaveTextContent('🔒');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty levels array', () => {
      mockUseUserProgress.mockReturnValue(
        createMockUseUserProgressReturn({
          userProgress: {
            ...mockUserProgress,
            allLevels: [],
          },
          currentLevel: null,
          completionPercentage: 0,
          sectionProgress: jest
            .fn()
            .mockReturnValue({ completed: 0, total: 0 }),
        }),
      );

      render(<LearningJourneyWithProvider />);

      // Should render but with no operation sections
      expect(screen.getByText('Learning Journey')).toBeInTheDocument();
    });

    test('should handle operations with no unlocked levels', () => {
      const noUnlockedLevels = mockUserProgress.allLevels.map((level) => ({
        ...level,
        isUnlocked: false,
      }));

      mockUseUserProgress.mockReturnValue(
        createMockUseUserProgressReturn({
          userProgress: {
            ...mockUserProgress,
            allLevels: noUnlockedLevels,
          },
          currentLevel: null,
          completionPercentage: 0,
          sectionProgress: jest
            .fn()
            .mockReturnValue({ completed: 0, total: 0 }),
        }),
      );

      render(<LearningJourneyWithProvider />);

      // Operation buttons should be disabled
      const additionButton = screen.getByRole('button', { name: /addition/i });
      expect(additionButton).toBeDisabled();
    });
  });
});
