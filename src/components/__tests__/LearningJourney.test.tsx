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
const LearningJourneyWithProvider = () => {
  const {
    userProgress,
    selectLevel,
    currentLevel,
    completionPercentage,
    sectionProgress,
  } = useUserProgress();

  return (
    <GameProvider>
      <LearningJourney
        userProgress={userProgress}
        selectLevel={selectLevel}
        currentLevel={currentLevel}
        completionPercentage={completionPercentage}
        sectionProgress={sectionProgress}
      />
    </GameProvider>
  );
};

// Mock data
const mockLevelProgress: LevelProgress = {
  id: 'addition-none-single',
  operationType: 'addition',
  complementType: 'none',
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
      id: 'addition-none-double',
      operationType: 'addition',
      complementType: 'none',
      digitLevel: 'double',
      questionsCompleted: 0,
      correctAnswers: 0,
      isUnlocked: false,
      isCompleted: false,
    },
    {
      id: 'subtraction-none-single',
      operationType: 'subtraction',
      complementType: 'none',
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
  overrides: Partial<ReturnType<typeof useUserProgress>> = {},
) => {
  const result = {
    userProgress: mockUserProgress,
    selectLevel: jest.fn().mockReturnValue(mockUserProgress),
    currentLevel: mockLevelProgress,
    completionPercentage: 25,
    sectionProgress: jest.fn().mockReturnValue({ completed: 1, total: 4 }),
    resetProgress: jest.fn(),
    processAnswer: jest.fn(),
    ...overrides,
  };

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

    test('should display visual progress bar in ProgressCard', () => {
      render(<LearningJourneyWithProvider />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle('width: 25%');
      expect(progressBar).toHaveAttribute('aria-label', 'Progress: 25%');
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

      expect(screen.getByTestId('progress-addition-none')).toHaveTextContent(
        '1/4',
      );
    });

    test('should display operation-level progress bar', () => {
      render(<LearningJourneyWithProvider />);

      const operationProgressBar = screen.getByTestId(
        'operation-progress-addition',
      );
      expect(operationProgressBar).toBeInTheDocument();
      // With 0 completed levels out of 2 total (from mockUserProgress)
      expect(operationProgressBar).toHaveStyle('width: 0%');
      expect(operationProgressBar).toHaveAttribute(
        'aria-label',
        'addition progress: 0%',
      );
    });

    test('should show operation levels count', () => {
      render(<LearningJourneyWithProvider />);

      // Should show "0/2 levels" for addition operation (0 completed out of 2 total)
      expect(screen.getByText('0/2 levels')).toBeInTheDocument();
    });

    test('should display correct progress for completed operations', () => {
      render(<LearningJourneyWithProvider />);

      // Check subtraction which has 1 completed level
      const subtractionProgressBar = screen.getByTestId(
        'operation-progress-subtraction',
      );
      expect(subtractionProgressBar).toHaveStyle('width: 100%');
      expect(subtractionProgressBar).toHaveAttribute(
        'aria-label',
        'subtraction progress: 100%',
      );
      expect(screen.getByText('1/1 levels')).toBeInTheDocument();
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
        screen.getByTestId('level-addition-none-single'),
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
            id: 'addition-none-double',
            operationType: 'addition',
            complementType: 'none',
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
      const completedLevel = screen.getByTestId('level-addition-none-single');
      expect(completedLevel).toHaveTextContent('✓');
    });

    test('should display complement-level progress bar', async () => {
      render(<LearningJourneyWithProvider />);

      // Expand to show complement section
      const additionButton = screen.getByRole('button', { name: /addition/i });
      await user.click(additionButton);

      // Check for complement progress bar
      const complementProgressBar = screen.getByTestId(
        'complement-progress-addition-none',
      );
      expect(complementProgressBar).toBeInTheDocument();
      // With 1 completed out of 4 total (from sectionProgress mock)
      expect(complementProgressBar).toHaveStyle('width: 25%');
      expect(complementProgressBar).toHaveAttribute(
        'aria-label',
        'Simple Addition progress: 25%',
      );
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
      const levelButton = screen.getByTestId('level-addition-none-single');
      await user.click(levelButton);

      const { selectLevel } = mockUseUserProgress.mock.results[0].value;
      expect(selectLevel).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'addition-none-single',
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
        'level-addition-none-single',
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

      const lockedLevel = screen.getByTestId('level-addition-none-double');
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
            totalScore: 0,
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
            totalScore: 0,
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
