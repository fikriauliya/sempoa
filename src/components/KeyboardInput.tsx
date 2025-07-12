import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { canRepresentValue, valueToBeadKeys } from '../utils/beadPositioning';

interface KeyboardInputProps {
  currentValue: number;
  onValueChange: (value: number, activeBeads: Set<string>) => void;
}

const KeyboardInput: React.FC<KeyboardInputProps> = ({
  currentValue,
  onValueChange,
}) => {
  const [inputValue, setInputValue] = useState(currentValue.toString());
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);

      // Clear previous error
      setError(null);

      // Allow empty input
      if (value === '') {
        onValueChange(0, new Set());
        return;
      }

      // Validate numeric input
      const numericValue = parseInt(value, 10);
      if (Number.isNaN(numericValue)) {
        setError('Please enter a valid number');
        return;
      }

      if (numericValue < 0) {
        setError('Please enter a non-negative number');
        return;
      }

      // Check if value can be represented on the sempoa
      if (!canRepresentValue(numericValue)) {
        setError('Number is too large for the current sempoa configuration');
        return;
      }

      // Convert to bead positions and update
      try {
        const activeBeads = valueToBeadKeys(numericValue);
        onValueChange(numericValue, activeBeads);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid input');
      }
    },
    [onValueChange],
  );

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Allow: backspace, delete, tab, escape, enter, home, end, left, right, up, down
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'Home',
      'End',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
    ];

    // Allow numeric keys (0-9)
    if (
      allowedKeys.includes(event.key) ||
      (event.key >= '0' && event.key <= '9')
    ) {
      return;
    }

    // Prevent all other keys
    event.preventDefault();
  }, []);

  // Sync input value with current value when it changes externally (e.g., from bead clicks)
  const displayValue =
    inputValue === '' && currentValue === 0 ? '' : currentValue.toString();
  if (displayValue !== inputValue && !error) {
    setInputValue(displayValue);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <label
          htmlFor="keyboard-input"
          className="text-sm font-medium text-gray-600 whitespace-nowrap"
        >
          Value:
        </label>
        <input
          ref={inputRef}
          id="keyboard-input"
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="0"
          className={`px-2 py-1 border rounded text-center font-mono w-24 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            error
              ? 'border-red-500 bg-red-50 text-red-900'
              : 'border-gray-300 bg-white text-gray-900'
          }`}
          data-testid="keyboard-input-field"
        />
      </div>
      {error && (
        <div
          className="text-xs text-red-600 max-w-40"
          data-testid="keyboard-input-error"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default KeyboardInput;
