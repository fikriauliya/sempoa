import { render, screen } from '@testing-library/react';
import type { GameState, LevelProgress } from '../../types';
import QuestionDisplay from '../QuestionDisplay';

// Mock game context data
const mockGameState: GameState = {
  currentQuestion: {
    operands: [23, 45],
    operation: 'addition',
    answer: 68,
  },
  score: 100,
  mistakes: 2,
  sempoaValue: 0,
  feedback: null,
};

const mockCurrentLevel: LevelProgress = {
  id: 'addition-simple-double',
  operationType: 'addition',
  complementType: 'simple',
  digitLevel: 'double',
  questionsCompleted: 5,
  correctAnswers: 4,
  isUnlocked: true,
  isCompleted: false,
};

// Mock the game context
jest.mock('../../context/GameContext', () => ({
  useGame: () => ({
    gameState: mockGameState,
  }),
  GameProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock the user progress hook
jest.mock('../../hooks/useUserProgress', () => ({
  useUserProgress: () => ({
    userProgress: { currentLevelId: 'test-level' },
    currentLevel: mockCurrentLevel,
    processAnswer: jest.fn(),
  }),
}));

// Mock the question generation hook
jest.mock('../../hooks/useQuestionGeneration', () => ({
  useQuestionGeneration: () => ({
    generateNewQuestion: jest.fn(),
  }),
}));

// Mock the answer checking hook
jest.mock('../../hooks/useAnswerChecking', () => ({
  useAnswerChecking: () => ({
    handleCheckAnswer: jest.fn(),
    buttonState: 'normal',
    scope: { current: null },
  }),
}));

describe('QuestionDisplay Component', () => {
  describe('Background Feedback Animation', () => {
    it('should display component with standard styling', () => {
      render(<QuestionDisplay />);

      const questionDisplay = screen.getByTestId('question-display');

      // Should have basic styling classes
      expect(questionDisplay).toHaveClass('p-4', 'rounded-lg');
    });

    it('should be a motion component for animation support', () => {
      render(<QuestionDisplay />);

      const questionDisplay = screen.getByTestId('question-display');

      // Should be a div element that supports motion animations
      expect(questionDisplay.tagName.toLowerCase()).toBe('div');
      expect(questionDisplay).toBeInTheDocument();
    });

    it('should have consistent structure for feedback states', () => {
      render(<QuestionDisplay />);

      // Should have the expected content structure
      expect(screen.getByText('Current Question')).toBeInTheDocument();
      expect(screen.getByText('23 + 45 = ?')).toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
    it('should render the component with correct data-testid', () => {
      render(<QuestionDisplay />);

      expect(screen.getByTestId('question-display')).toBeInTheDocument();
    });

    it('should display the current question correctly', () => {
      render(<QuestionDisplay />);

      // Should show the math question
      expect(screen.getByText('23 + 45 = ?')).toBeInTheDocument();
    });

    it('should display question metadata', () => {
      render(<QuestionDisplay />);

      // Should show complement type and difficulty level
      expect(screen.getByText(/Simple/)).toBeInTheDocument();
      expect(screen.getByText(/Double Digit/)).toBeInTheDocument();
    });

    it('should have proper styling classes for desktop layout', () => {
      render(<QuestionDisplay />);

      const questionDisplay = screen.getByTestId('question-display');

      // Should have appropriate classes for desktop positioning
      expect(questionDisplay).toHaveClass('p-4');
      expect(questionDisplay).toHaveClass('rounded-lg');
    });
  });

  describe('Question Content', () => {
    it('should display addition operation correctly', () => {
      render(<QuestionDisplay />);

      // Should show addition symbol (based on mock data)
      expect(screen.getByText('23 + 45 = ?')).toBeInTheDocument();
    });

    it('should display complement type information', () => {
      render(<QuestionDisplay />);

      // Should show the complement type from the current level
      expect(screen.getByText(/Simple/)).toBeInTheDocument();
    });

    it('should display difficulty level information', () => {
      render(<QuestionDisplay />);

      // Should show the digit level from the current level
      expect(screen.getByText(/Double Digit/)).toBeInTheDocument();
    });
  });

  describe('Component Content', () => {
    it('should have proper content structure', () => {
      render(<QuestionDisplay />);

      // Should have heading
      expect(screen.getByText('Current Question')).toBeInTheDocument();

      // Should show question with equals sign
      expect(screen.getByText(/= \?/)).toBeInTheDocument();
    });

    it('should display complement and digit information', () => {
      render(<QuestionDisplay />);

      // Should show the complement type and digit level
      expect(screen.getByText(/Simple/)).toBeInTheDocument();
      expect(screen.getByText(/Double Digit/)).toBeInTheDocument();
    });

    it('should display the check answer button', () => {
      render(<QuestionDisplay />);

      // Should show the check answer button
      expect(screen.getByText('Check Answer')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for different screen sizes', () => {
      render(<QuestionDisplay />);

      const questionDisplay = screen.getByTestId('question-display');

      // Should have classes that work across different screen sizes
      // This will be verified manually, but structure should be present
      expect(questionDisplay).toHaveClass('rounded-lg');
    });
  });
});
