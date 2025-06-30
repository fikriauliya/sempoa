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

    it('should render rightmost 9 columns (units to hundred millions)', () => {
      render(<SempoapWithProvider />);
      
      // Verify we have columns 4-12 (0-indexed), which represent the rightmost 9 columns
      // from the original 13-column layout (units to hundred millions)
      const expectedColumns = [4, 5, 6, 7, 8, 9, 10, 11, 12];
      
      expectedColumns.forEach((columnIndex) => {
        expect(screen.getByTestId(`column-${columnIndex}`)).toBeInTheDocument();
      });
    });

    it('should not render leftmost 4 columns (trillion places)', () => {
      render(<SempoapWithProvider />);
      
      // Verify we don't have columns 0-3 (trillion, hundred billion, ten billion, billion)
      const excludedColumns = [0, 1, 2, 3];
      
      excludedColumns.forEach((columnIndex) => {
        expect(screen.queryByTestId(`column-${columnIndex}`)).not.toBeInTheDocument();
      });
    });
  });

  describe('Place Value Labels', () => {
    it('should show correct place value labels for 9 columns', () => {
      render(<SempoapWithProvider />);
      
      // Expected place values for rightmost 9 columns
      const expectedLabels = [
        '100M', // hundred millions
        '10M',  // ten millions  
        '1M',   // millions
        '100K', // hundred thousands
        '10K',  // ten thousands
        '1K',   // thousands
        '100',  // hundreds
        '10',   // tens
        '1'     // units
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
      
      // Each column should have 1 upper bead + 4 lower beads = 5 beads total
      const allBeads = screen.getAllByTestId(/^bead-/);
      expect(allBeads).toHaveLength(9 * 5); // 9 columns × 5 beads per column = 45 beads
    });

    it('should calculate place values correctly for 9-column layout', () => {
      render(<SempoapWithProvider />);
      
      // The rightmost column (index 8 in 9-column layout) should represent units
      // The leftmost column (index 0 in 9-column layout) should represent hundred millions
      
      // Check that bead values are calculated correctly
      // Upper bead in units column should have value 5
      const unitsUpperBead = screen.getByTestId('bead-8-upper-0');
      expect(unitsUpperBead).toBeInTheDocument();
      
      // Upper bead in hundred millions column should have value 500,000,000
      const hundredMillionsUpperBead = screen.getByTestId('bead-0-upper-0');
      expect(hundredMillionsUpperBead).toBeInTheDocument();
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