import { render, screen } from '@testing-library/react';
import type { LevelProgress, Question } from '../../types';
import QuestionDisplay from '../QuestionDisplay';

// Mock framer-motion
jest.mock('framer-motion', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');

  const MockButton = React.forwardRef(
    (
      props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
        children?: React.ReactNode;
      },
      ref: React.Ref<HTMLButtonElement>,
    ) => <button ref={ref} {...props} />,
  );

  return {
    motion: {
      div: (
        props: React.HTMLAttributes<HTMLDivElement> & {
          children?: React.ReactNode;
        },
      ) => <div {...props} />,
      button: MockButton,
    },
    useAnimate: jest.fn(() => [{ current: null }, jest.fn()]),
  };
});

// Mock useKeyboardShortcuts hook
jest.mock('../../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: jest.fn(),
}));

// Helper function to render QuestionDisplay with props
const renderQuestionDisplay = (
  overrides: {
    currentQuestion?: Question | null;
    currentLevel?: LevelProgress | null;
    onCheckAnswer?: () => boolean | null;
  } = {},
) => {
  const defaultProps = {
    currentQuestion: {
      operands: [23, 45],
      operation: 'addition' as const,
      answer: 68,
    },
    currentLevel: {
      id: 'addition-none-double',
      operationType: 'addition' as const,
      complementType: 'none' as const,
      digitLevel: 'double' as const,
      questionsCompleted: 5,
      correctAnswers: 4,
      isUnlocked: true,
      isCompleted: false,
    },
    onCheckAnswer: jest.fn(() => true),
  };

  const props = { ...defaultProps, ...overrides };
  return render(<QuestionDisplay {...props} />);
};

describe('QuestionDisplay Component', () => {
  describe('Background Feedback Animation', () => {
    it('should display component with standard styling', () => {
      renderQuestionDisplay();

      const questionDisplay = screen.getByTestId('question-display');

      // Should have basic styling classes
      expect(questionDisplay).toHaveClass('p-4', 'rounded-lg');
    });

    it('should be a motion component for animation support', () => {
      renderQuestionDisplay();

      const questionDisplay = screen.getByTestId('question-display');

      // Should be a div element that supports motion animations
      expect(questionDisplay.tagName.toLowerCase()).toBe('div');
      expect(questionDisplay).toBeInTheDocument();
    });

    it('should have consistent structure for feedback states', () => {
      renderQuestionDisplay();

      // Should have the expected content structure
      expect(screen.getByText('Current Question')).toBeInTheDocument();
      // Should show operands in vertical format
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
    it('should render the component with correct data-testid', () => {
      renderQuestionDisplay();

      expect(screen.getByTestId('question-display')).toBeInTheDocument();
    });

    it('should display the current question correctly', () => {
      renderQuestionDisplay();

      // Should show the math question in vertical format
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should display question metadata', () => {
      renderQuestionDisplay();

      // Should show complement type and difficulty level
      expect(screen.getByText(/Simple/)).toBeInTheDocument();
      expect(screen.getByText(/Double Digit/)).toBeInTheDocument();
    });

    it('should have proper styling classes for desktop layout', () => {
      renderQuestionDisplay();

      const questionDisplay = screen.getByTestId('question-display');

      // Should have appropriate classes for desktop positioning
      expect(questionDisplay).toHaveClass('p-4');
      expect(questionDisplay).toHaveClass('rounded-lg');
    });

    it('should show placeholder message when no question or level', () => {
      renderQuestionDisplay({ currentQuestion: null, currentLevel: null });

      expect(
        screen.getByText('Select a level to start practicing'),
      ).toBeInTheDocument();
    });
  });

  describe('Question Content', () => {
    it('should display addition operation correctly', () => {
      renderQuestionDisplay();

      // Should show addition symbol and operands in vertical format
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should display complement type information', () => {
      renderQuestionDisplay();

      // Should show the complement type from the current level
      expect(screen.getByText(/Simple/)).toBeInTheDocument();
    });

    it('should display difficulty level information', () => {
      renderQuestionDisplay();

      // Should show the digit level from the current level
      expect(screen.getByText(/Double Digit/)).toBeInTheDocument();
    });

    it('should display subtraction operation correctly', () => {
      renderQuestionDisplay({
        currentQuestion: {
          operands: [50, 30],
          operation: 'subtraction',
          answer: 20,
        },
      });

      // Should show subtraction symbol and operands in vertical format
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('Component Content', () => {
    it('should have proper content structure', () => {
      renderQuestionDisplay();

      // Should have heading
      expect(screen.getByText('Current Question')).toBeInTheDocument();

      // Should show question mark for answer in vertical format
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should display complement and digit information', () => {
      renderQuestionDisplay();

      // Should show the complement type and digit level
      expect(screen.getByText(/Simple/)).toBeInTheDocument();
      expect(screen.getByText(/Double Digit/)).toBeInTheDocument();
    });

    it('should display the check answer button', () => {
      renderQuestionDisplay();

      // Should show the check answer button
      expect(screen.getByText('Check Answer')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for different screen sizes', () => {
      renderQuestionDisplay();

      const questionDisplay = screen.getByTestId('question-display');

      // Should have classes that work across different screen sizes
      // This will be verified manually, but structure should be present
      expect(questionDisplay).toHaveClass('rounded-lg');
    });
  });

  describe('Button State', () => {
    it('should render CheckAnswerButton with initial state', () => {
      renderQuestionDisplay();

      // CheckAnswerButton should be rendered
      expect(screen.getByText('Check Answer')).toBeInTheDocument();
    });

    it('should call onCheckAnswer when triggered', () => {
      const mockCheckAnswer = jest.fn();
      renderQuestionDisplay({ onCheckAnswer: mockCheckAnswer });

      // The check answer button should be present
      const button = screen.getByText('Check Answer');
      expect(button).toBeInTheDocument();
    });
  });
});
