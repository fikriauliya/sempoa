import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { GameContextType } from '../../context/GameContext';
import { GameContext } from '../../context/GameContext';
import SempoaBoard from '../SempoaBoard';

const mockGameContext = (
  currentValue = 0,
  setCurrentValue = () => {},
): GameContextType => ({
  gameState: {
    currentQuestion: null,
    score: 0,
    level: 1,
    mistakes: 0,
  },
  setGameState: () => {},
  currentValue,
  setCurrentValue,
  feedback: null,
  setFeedback: () => {},
  checkAnswer: () => false,
});

const renderSempoaBoard = (currentValue = 0, setCurrentValue = () => {}) => {
  const context = mockGameContext(currentValue, setCurrentValue);
  return render(
    <GameContext.Provider value={context}>
      <SempoaBoard />
    </GameContext.Provider>,
  );
};

describe('SempoaBoard Keyboard Input', () => {
  describe('Input Field Rendering', () => {
    it('should render keyboard input field', () => {
      renderSempoaBoard();

      const inputField = screen.getByTestId('keyboard-input-field');
      expect(inputField).toBeInTheDocument();
      expect(inputField).toHaveAttribute('type', 'text');
      expect(inputField).toHaveAttribute('inputMode', 'numeric');
    });

    it('should have placeholder text', () => {
      renderSempoaBoard();

      const inputField = screen.getByTestId('keyboard-input-field');
      expect(inputField).toHaveAttribute('placeholder', 'Enter a number');
    });

    it('should display current value in input field', () => {
      renderSempoaBoard(123);

      const inputField = screen.getByTestId('keyboard-input-field');
      expect(inputField).toHaveValue('123');
    });

    it('should auto-focus the input field on mount', () => {
      renderSempoaBoard();

      const inputField = screen.getByTestId('keyboard-input-field');
      expect(inputField).toHaveFocus();
    });
  });

  describe('Input Validation', () => {
    it('should allow numeric input', async () => {
      const user = userEvent.setup();
      const setCurrentValue = jest.fn();
      renderSempoaBoard(0, setCurrentValue);

      const inputField = screen.getByTestId('keyboard-input-field');
      await user.clear(inputField);
      await user.paste('42');

      // Should call setCurrentValue with the final value
      expect(setCurrentValue).toHaveBeenCalledWith(42);
    });

    it('should handle empty input as zero', async () => {
      const user = userEvent.setup();
      const setCurrentValue = jest.fn();
      renderSempoaBoard(42, setCurrentValue);

      const inputField = screen.getByTestId('keyboard-input-field');
      await user.clear(inputField);

      expect(setCurrentValue).toHaveBeenLastCalledWith(0);
    });

    it('should show error for non-numeric input via paste', async () => {
      const user = userEvent.setup();
      renderSempoaBoard();

      const inputField = screen.getByTestId('keyboard-input-field');
      await user.clear(inputField);

      // Simulate pasting non-numeric content
      await user.click(inputField);
      await user.paste('abc');

      const errorMessage = screen.getByTestId('keyboard-input-error');
      expect(errorMessage).toHaveTextContent('Please enter a valid number');
    });

    it('should show error for negative numbers via paste', async () => {
      const user = userEvent.setup();
      renderSempoaBoard();

      const inputField = screen.getByTestId('keyboard-input-field');
      await user.clear(inputField);
      await user.paste('-5');

      const errorMessage = screen.getByTestId('keyboard-input-error');
      expect(errorMessage).toHaveTextContent(
        'Please enter a non-negative number',
      );
    });

    it('should show error for numbers too large for sempoa', async () => {
      const user = userEvent.setup();
      renderSempoaBoard();

      const inputField = screen.getByTestId('keyboard-input-field');
      await user.clear(inputField);
      // Enter a very large number that exceeds sempoa capacity
      await user.paste('999999999999999');

      const errorMessage = screen.getByTestId('keyboard-input-error');
      expect(errorMessage).toHaveTextContent(
        'Number is too large for the current sempoa configuration',
      );
    });
  });

  describe('Keyboard Events', () => {
    it('should allow numeric keys (0-9)', async () => {
      const user = userEvent.setup();
      const setCurrentValue = jest.fn();
      renderSempoaBoard(0, setCurrentValue);

      const inputField = screen.getByTestId('keyboard-input-field');

      // Test each numeric key
      for (let i = 0; i <= 9; i++) {
        await user.clear(inputField);
        await user.type(inputField, i.toString());
        expect(setCurrentValue).toHaveBeenCalledWith(i);
      }
    });

    it('should allow navigation keys', async () => {
      const user = userEvent.setup();
      renderSempoaBoard();

      const inputField = screen.getByTestId('keyboard-input-field');
      await user.type(inputField, '123');

      // Test navigation keys don't cause errors
      await user.keyboard('{ArrowLeft}');
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Home}');
      await user.keyboard('{End}');

      // Should not show any error
      expect(
        screen.queryByTestId('keyboard-input-error'),
      ).not.toBeInTheDocument();
    });

    it('should prevent non-numeric character input', async () => {
      const user = userEvent.setup();
      renderSempoaBoard();

      const inputField = screen.getByTestId('keyboard-input-field');

      // Try to type letters directly - they should be prevented
      await user.keyboard('a');
      await user.keyboard('z');
      await user.keyboard('!');
      await user.keyboard('@');

      // Input should remain empty
      expect(inputField).toHaveValue('0');
    });
  });

  describe('Bead Position Integration', () => {
    it('should position beads correctly for single digit', async () => {
      const user = userEvent.setup();
      const setCurrentValue = jest.fn();
      renderSempoaBoard(0, setCurrentValue);

      const inputField = screen.getByTestId('keyboard-input-field');
      await user.clear(inputField);
      await user.type(inputField, '7');

      // Should call setCurrentValue with 7
      expect(setCurrentValue).toHaveBeenLastCalledWith(7);
    });

    it('should position beads correctly for multi-digit numbers', async () => {
      const user = userEvent.setup();
      const setCurrentValue = jest.fn();
      renderSempoaBoard(0, setCurrentValue);

      const inputField = screen.getByTestId('keyboard-input-field');
      await user.clear(inputField);
      await user.paste('123');

      // Should call setCurrentValue with the final value
      expect(setCurrentValue).toHaveBeenCalledWith(123);
    });

    it('should handle zero correctly', async () => {
      const user = userEvent.setup();
      const setCurrentValue = jest.fn();
      renderSempoaBoard(42, setCurrentValue);

      const inputField = screen.getByTestId('keyboard-input-field');
      await user.clear(inputField);

      // Clear should set to 0, then typing '0' should also call with 0
      expect(setCurrentValue).toHaveBeenCalledWith(0);

      await user.type(inputField, '0');
      expect(setCurrentValue).toHaveBeenCalledWith(0);
    });
  });

  describe('Input Synchronization', () => {
    it('should sync input field with external value changes', () => {
      const { rerender } = renderSempoaBoard(0);

      let inputField = screen.getByTestId('keyboard-input-field');
      expect(inputField).toHaveValue('0');

      // Rerender with new value (simulating bead click)
      rerender(
        <GameContext.Provider value={mockGameContext(123)}>
          <SempoaBoard />
        </GameContext.Provider>,
      );

      inputField = screen.getByTestId('keyboard-input-field');
      expect(inputField).toHaveValue('123');
    });

    it('should not sync when user has error state', async () => {
      const user = userEvent.setup();
      renderSempoaBoard(0);

      const inputField = screen.getByTestId('keyboard-input-field');
      await user.clear(inputField);
      await user.paste('abc');

      // Input should retain invalid value when error is present
      expect(inputField).toHaveValue('abc');
      // Verify error is showing
      expect(screen.getByTestId('keyboard-input-error')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should work alongside existing bead functionality', async () => {
      const user = userEvent.setup();
      const setCurrentValue = jest.fn();
      renderSempoaBoard(0, setCurrentValue);

      // Test keyboard input
      const inputField = screen.getByTestId('keyboard-input-field');
      await user.clear(inputField);
      await user.type(inputField, '5');

      expect(setCurrentValue).toHaveBeenLastCalledWith(5);

      // Reset button should still work
      const resetButton = screen.getByRole('button', { name: /reset/i });
      expect(resetButton).toBeInTheDocument();
    });

    it('should display current value in header', () => {
      renderSempoaBoard(42);

      const valueDisplay = screen.getByText('Value: 42');
      expect(valueDisplay).toBeInTheDocument();
    });
  });
});
