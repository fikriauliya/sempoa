import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the child components to focus on layout testing
jest.mock('../SempoaBoard', () => {
  return function MockSempoaBoard() {
    return <div data-testid="sempoa-board">Mock Sempoa Board</div>;
  };
});

jest.mock('../QuestionDisplay', () => {
  return function MockQuestionDisplay() {
    return <div data-testid="question-display">Mock Question Display</div>;
  };
});

jest.mock('../LearningJourney', () => {
  return function MockLearningJourney() {
    return <div data-testid="learning-journey">Mock Learning Journey</div>;
  };
});

describe('App Layout - SP-011 Changes', () => {
  describe('Component Presence', () => {
    it('should render all main components', () => {
      render(<App />);
      
      expect(screen.getByTestId('sempoa-board')).toBeInTheDocument();
      expect(screen.getByTestId('question-display')).toBeInTheDocument();
      expect(screen.getByTestId('learning-journey')).toBeInTheDocument();
    });

    it('should render the main title', () => {
      render(<App />);
      
      expect(screen.getByText('Sempoa Learning App')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have proper grid layout structure', () => {
      render(<App />);
      
      // Should have main container with proper classes
      const mainContainer = screen.getByTestId('app-main-container');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('max-w-6xl'); // Updated for wider layout
      expect(mainContainer).toHaveClass('mx-auto');
    });

    it('should have proper desktop grid layout', () => {
      render(<App />);
      
      // Should have grid container for desktop layout
      const gridContainer = screen.getByTestId('app-grid-container');
      expect(gridContainer).toBeInTheDocument();
      
      // Desktop: 3-column grid (sempoa + questions, learning journey)
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
      expect(gridContainer).toHaveClass('grid');
      expect(gridContainer).toHaveClass('gap-6');
    });

    it('should have sempoa and questions in left section', () => {
      render(<App />);
      
      const leftSection = screen.getByTestId('app-left-section');
      expect(leftSection).toBeInTheDocument();
      expect(leftSection).toHaveClass('lg:col-span-2');
      
      // Should contain both sempoa board and questions
      expect(leftSection).toContainElement(screen.getByTestId('sempoa-board'));
      expect(leftSection).toContainElement(screen.getByTestId('question-display'));
    });

    it('should have learning journey in right section', () => {
      render(<App />);
      
      const rightSection = screen.getByTestId('app-right-section');
      expect(rightSection).toBeInTheDocument();
      expect(rightSection).toHaveClass('lg:col-span-1');
      
      // Should contain learning journey
      expect(rightSection).toContainElement(screen.getByTestId('learning-journey'));
    });
  });

  describe('Responsive Layout Classes', () => {
    it('should have mobile-first responsive classes', () => {
      render(<App />);
      
      const gridContainer = screen.getByTestId('app-grid-container');
      
      // Mobile: single column
      expect(gridContainer).toHaveClass('grid-cols-1');
      
      // Desktop: 3 columns  
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });

    it('should have proper responsive section classes', () => {
      render(<App />);
      
      const leftSection = screen.getByTestId('app-left-section');
      const rightSection = screen.getByTestId('app-right-section');
      
      // Left section: spans 2 columns on desktop
      expect(leftSection).toHaveClass('lg:col-span-2');
      
      // Right section: spans 1 column on desktop
      expect(rightSection).toHaveClass('lg:col-span-1');
    });
  });

  describe('Question Positioning', () => {
    it('should position questions correctly within left section', () => {
      render(<App />);
      
      const questionsContainer = screen.getByTestId('questions-container');
      expect(questionsContainer).toBeInTheDocument();
      
      // Questions should be in top-right position (desktop) / top position (mobile)
      expect(questionsContainer).toHaveClass('lg:col-start-2');
      expect(questionsContainer).toHaveClass('lg:row-start-1');
    });

    it('should have proper question layout within left section', () => {
      render(<App />);
      
      const leftSection = screen.getByTestId('app-left-section');
      
      // Left section should have its own grid for sempoa + questions
      expect(leftSection).toHaveClass('grid');
      expect(leftSection).toHaveClass('gap-4');
      
      // Mobile: stacked vertically
      expect(leftSection).toHaveClass('grid-rows-2');
      expect(leftSection).toHaveClass('lg:grid-cols-2');
      expect(leftSection).toHaveClass('lg:grid-rows-1');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA landmarks', () => {
      render(<App />);
      
      // Main content should be identifiable
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<App />);
      
      // Main title should be h1
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Sempoa Learning App');
    });
  });
});