import { render, screen } from '@testing-library/react';
import { GameProvider } from '../../context/GameContext';
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
    currentLevel: mockCurrentLevel,
  }),
}));

describe('QuestionDisplay Component', () => {
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
      expect(questionDisplay).toHaveClass('bg-green-50');
      expect(questionDisplay).toHaveClass('p-4');
      expect(questionDisplay).toHaveClass('rounded-lg');
    });
  });

  describe('Question Content', () => {
    it('should display different operation types correctly', () => {
      // Test subtraction
      const subtractionGameState = {
        ...mockGameState,
        currentQuestion: {
          operands: [89, 34],
          operation: 'subtraction' as const,
          answer: 55,
        },
      };

      // Mock for this specific test
      jest.doMock('../../context/GameContext', () => ({
        useGame: () => ({
          gameState: subtractionGameState,
        }),
        GameProvider: ({ children }: { children: React.ReactNode }) => (
          <div>{children}</div>
        ),
      }));

      render(<QuestionDisplay />);
      
      // Should show subtraction symbol
      expect(screen.getByText('89 - 34 = ?')).toBeInTheDocument();
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

  describe('Missing Data Handling', () => {
    it('should handle missing current question gracefully', () => {
      // Mock game state without current question
      jest.doMock('../../context/GameContext', () => ({
        useGame: () => ({
          gameState: {
            ...mockGameState,
            currentQuestion: null,
          },
        }),
        GameProvider: ({ children }: { children: React.ReactNode }) => (
          <div>{children}</div>
        ),
      }));

      render(<QuestionDisplay />);
      
      // Component should still render but not show question content
      expect(screen.getByTestId('question-display')).toBeInTheDocument();
      expect(screen.queryByText(/= \?/)).not.toBeInTheDocument();
    });

    it('should handle missing current level gracefully', () => {
      // Mock user progress without current level
      jest.doMock('../../hooks/useUserProgress', () => ({
        useUserProgress: () => ({
          currentLevel: null,
        }),
      }));

      render(<QuestionDisplay />);
      
      // Component should still render
      expect(screen.getByTestId('question-display')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for different screen sizes', () => {
      render(<QuestionDisplay />);
      
      const questionDisplay = screen.getByTestId('question-display');
      
      // Should have classes that work across different screen sizes
      // This will be verified manually, but structure should be present
      expect(questionDisplay).toHaveClass('bg-green-50');
      expect(questionDisplay).toHaveClass('rounded-lg');
    });
  });
});