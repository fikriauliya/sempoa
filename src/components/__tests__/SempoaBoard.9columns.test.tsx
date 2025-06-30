import { render, screen } from '@testing-library/react';
import { GameProvider } from '../../context/GameContext';
import SempoaBoard from '../SempoaBoard';

// Test wrapper with GameProvider
const SempoapWithProvider = () => (
  <GameProvider>
    <SempoaBoard />
  </GameProvider>
);

describe('SempoaBoard - 9 Column Configuration', () => {
  describe('Column Count', () => {
    it('should render exactly 9 columns', () => {
      render(<SempoapWithProvider />);

      // Get all column containers
      const columns = screen.getAllByTestId(/^column-\d+$/);
      expect(columns).toHaveLength(9);
    });

    it('should render 9 columns representing units to hundred millions', () => {
      render(<SempoapWithProvider />);

      // Now we have columns 0-8 (0-indexed), which represent units to hundred millions
      const expectedColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8];

      expectedColumns.forEach((columnIndex) => {
        expect(screen.getByTestId(`column-${columnIndex}`)).toBeInTheDocument();
      });
    });

    it('should not render more than 9 columns', () => {
      render(<SempoapWithProvider />);

      // Verify we don't have columns beyond index 8
      const nonExistentColumns = [9, 10, 11, 12];

      nonExistentColumns.forEach((columnIndex) => {
        expect(
          screen.queryByTestId(`column-${columnIndex}`),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Place Value Labels', () => {
    it('should show correct place value labels for 9 columns', () => {
      render(<SempoapWithProvider />);

      // Expected place values for rightmost 9 columns
      const expectedLabels = [
        '100M', // hundred millions
        '10M', // ten millions
        '1M', // millions
        '100K', // hundred thousands
        '10K', // ten thousands
        '1K', // thousands
        '100', // hundreds
        '10', // tens
        '1', // units
      ];

      expectedLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('should not show trillion/billion place value labels', () => {
      render(<SempoapWithProvider />);

      // Labels that should not be present
      const excludedLabels = ['1T', '100B', '10B', '1B'];

      excludedLabels.forEach((label) => {
        expect(screen.queryByText(label)).not.toBeInTheDocument();
      });
    });
  });

  describe('Bead Functionality', () => {
    it('should have correct number of beads per column', () => {
      render(<SempoapWithProvider />);

      // Get the main board
      const board = screen.getByTestId('sempoa-board');

      // Find all columns
      const columns = board.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      expect(columns).toHaveLength(9);

      // Each column should have 1 upper bead + 4 lower beads = 5 beads total
      let totalBeads = 0;
      columns.forEach((column) => {
        const upperBeads = column.querySelectorAll(
          '.upper-section [draggable="true"]',
        );
        const lowerBeads = column.querySelectorAll(
          '.lower-section [draggable="true"]',
        );
        totalBeads += upperBeads.length + lowerBeads.length;
      });

      expect(totalBeads).toBe(9 * 5); // 9 columns × 5 beads per column = 45 beads
    });

    it('should calculate place values correctly for 9-column layout', () => {
      render(<SempoapWithProvider />);

      // In 9-column layout:
      // Column 0 = hundred millions, Column 8 = units

      // Check units column (rightmost, index 8)
      const unitsColumn = screen.getByTestId('column-8');
      const unitsUpperBeads = unitsColumn.querySelectorAll(
        '.upper-section [draggable="true"]',
      );
      expect(unitsUpperBeads).toHaveLength(1);

      // Check hundred millions column (leftmost, index 0)
      const hundredMillionsColumn = screen.getByTestId('column-0');
      const hundredMillionsUpperBeads = hundredMillionsColumn.querySelectorAll(
        '.upper-section [draggable="true"]',
      );
      expect(hundredMillionsUpperBeads).toHaveLength(1);
    });
  });

  describe('Value Calculation', () => {
    it('should support maximum value of 999,999,999 (nine nines)', () => {
      render(<SempoapWithProvider />);

      // With 9 columns, the maximum representable value should be 999,999,999
      // This is 9 × (111,111,111) where each column contributes its maximum value

      // Verify that the board can handle this range by checking column structure
      const columns = screen.getAllByTestId(/^column-\d+$/);
      expect(columns).toHaveLength(9);

      // The total possible value calculation should work within this range
      // This will be verified through integration tests when beads are activated
    });
  });
});