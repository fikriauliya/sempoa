import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DERIVED_CONFIG, SEMPOA_CONFIG } from '../../config/sempoaConfig';
import { GameProvider } from '../../context/GameContext';
import SempoaBoard from '../SempoaBoard';

// Test wrapper with GameProvider
const SempoaBoardWithProvider = () => (
  <GameProvider>
    <SempoaBoard />
  </GameProvider>
);

describe('SempoaBoard - Abacus Behavior', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    // Reset any state if needed
  });

  describe('Lower Beads Behavior', () => {
    test('should move together when activating - clicking a bead activates all beads above it', async () => {
      render(<SempoaBoardWithProvider />);

      // Reset the board to ensure initial state
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Find the actual bead columns (not headers)
      const sempoaBoard = screen.getByTestId('sempoa-board');
      const lowerSections = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      expect(lowerSections).toHaveLength(SEMPOA_CONFIG.COLUMNS);

      // Get all draggable beads in the first column
      const firstColumn = lowerSections[0];
      const lowerBeads = firstColumn.querySelectorAll(
        '.lower-section [draggable="true"]',
      );
      expect(lowerBeads).toHaveLength(SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN);

      // Click on the 3rd lower bead (index 2, should activate beads 0, 1, 2)
      const thirdBead = lowerBeads[2] as HTMLElement;
      await user.click(thirdBead);

      // Check that the input field shows 300000000 (3 beads × 100,000,000)
      await waitFor(() => {
        const inputField = screen.getByTestId('keyboard-input-field');
        expect(inputField).toHaveValue('300000000');
      });

      // Verify that beads 0, 1, and 2 are in active positions by checking their computed styles
      const firstBead = lowerBeads[0] as HTMLElement;
      const secondBead = lowerBeads[1] as HTMLElement;
      const fourthBead = lowerBeads[3] as HTMLElement;

      // Active beads should be at calculated positions
      expect(firstBead.parentElement).toHaveStyle({
        top: `${DERIVED_CONFIG.LOWER_ACTIVE_TOP}px`,
      });
      expect(secondBead.parentElement).toHaveStyle({
        top: `${DERIVED_CONFIG.LOWER_ACTIVE_TOP + DERIVED_CONFIG.LOWER_BEAD_SPACING}px`,
      });
      expect(thirdBead.parentElement).toHaveStyle({
        top: `${DERIVED_CONFIG.LOWER_ACTIVE_TOP + 2 * DERIVED_CONFIG.LOWER_BEAD_SPACING}px`,
      });

      // Fourth bead should still be in inactive position
      expect(fourthBead.parentElement).toHaveStyle({
        top: `${DERIVED_CONFIG.LOWER_INACTIVE_TOP + 3 * DERIVED_CONFIG.LOWER_BEAD_SPACING}px`,
      });
    });

    test('should move together when deactivating - clicking active bead deactivates all beads below it', async () => {
      render(<SempoaBoardWithProvider />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Get first column lower beads
      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      const firstColumn = columns[0];
      const lowerBeads = firstColumn.querySelectorAll(
        '.lower-section [draggable="true"]',
      );

      // First activate all 4 beads by clicking the 4th bead
      const fourthBead = lowerBeads[3] as HTMLElement;
      await user.click(fourthBead);

      // Verify all 4 beads are active (value should be 4000000)
      await waitFor(() => {
        const inputField = screen.getByTestId('keyboard-input-field');
        expect(inputField).toHaveValue('400000000');
      });

      // Now click on the 2nd bead (index 1) - this should deactivate beads 1, 2, 3
      const secondBead = lowerBeads[1] as HTMLElement;
      await user.click(secondBead);

      // Value should now be 1000000 (only first bead active)
      await waitFor(() => {
        const inputField = screen.getByTestId('keyboard-input-field');
        expect(inputField).toHaveValue('100000000');
      });

      // Verify positions
      const firstBead = lowerBeads[0] as HTMLElement;
      const thirdBead = lowerBeads[2] as HTMLElement;

      // Only first bead should be active
      expect(firstBead.parentElement).toHaveStyle({
        top: `${DERIVED_CONFIG.LOWER_ACTIVE_TOP}px`,
      });

      // Beads 1, 2, 3 should be in inactive positions
      expect(secondBead.parentElement).toHaveStyle({
        top: `${DERIVED_CONFIG.LOWER_INACTIVE_TOP + DERIVED_CONFIG.LOWER_BEAD_SPACING}px`,
      });
      expect(thirdBead.parentElement).toHaveStyle({
        top: `${DERIVED_CONFIG.LOWER_INACTIVE_TOP + 2 * DERIVED_CONFIG.LOWER_BEAD_SPACING}px`,
      });
      expect(fourthBead.parentElement).toHaveStyle({
        top: `${DERIVED_CONFIG.LOWER_INACTIVE_TOP + 3 * DERIVED_CONFIG.LOWER_BEAD_SPACING}px`,
      });
    });
  });

  describe('Upper Beads Behavior', () => {
    test('should toggle independently (current implementation)', async () => {
      render(<SempoaBoardWithProvider />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Get first column upper bead
      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      const firstColumn = columns[0];
      const upperBeads = firstColumn.querySelectorAll(
        '.upper-section [draggable="true"]',
      );
      expect(upperBeads).toHaveLength(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN);

      const upperBead = upperBeads[0] as HTMLElement;

      // Click to activate
      await user.click(upperBead);

      // Should show 5000000 (5 * 10^6)
      await waitFor(() => {
        const inputField = screen.getByTestId('keyboard-input-field');
        expect(inputField).toHaveValue('500000000');
      });

      // Verify upper bead moved to active position
      const expectedActivePosition =
        DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT;
      expect(upperBead.parentElement).toHaveStyle({
        top: `${expectedActivePosition}px`,
      });

      // Click again to deactivate
      await user.click(upperBead);

      // Should be back to 0
      await waitFor(() => {
        const inputField = screen.getByTestId('keyboard-input-field');
        expect(inputField).toHaveValue('0');
      });

      // Should be back to inactive position
      expect(upperBead.parentElement).toHaveStyle({
        top: '0px',
      });
    });
  });

  describe('Mixed Upper and Lower Bead Interaction', () => {
    test('should calculate combined values correctly', async () => {
      render(<SempoaBoardWithProvider />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      const firstColumn = columns[0];
      const upperBeads = firstColumn.querySelectorAll(
        '.upper-section [draggable="true"]',
      );
      const lowerBeads = firstColumn.querySelectorAll(
        '.lower-section [draggable="true"]',
      );

      // Activate upper bead in first column (5000000)
      const upperBead = upperBeads[0] as HTMLElement;
      await user.click(upperBead);

      // Activate 2 lower beads in first column (2000000)
      const secondLowerBead = lowerBeads[1] as HTMLElement;
      await user.click(secondLowerBead);

      // Total should be 7000000
      await waitFor(() => {
        const inputField = screen.getByTestId('keyboard-input-field');
        expect(inputField).toHaveValue('700000000');
      });

      // Deactivate upper bead
      await user.click(upperBead);

      // Should be 2000000 (only lower beads)
      await waitFor(() => {
        const inputField = screen.getByTestId('keyboard-input-field');
        expect(inputField).toHaveValue('200000000');
      });
    });
  });

  describe('Board Structure and Elements', () => {
    test('should render board with correct structure', () => {
      render(<SempoaBoardWithProvider />);

      // Verify sempoa board is visible
      expect(
        screen.getByRole('heading', { name: /sempoa board/i }),
      ).toBeInTheDocument();

      // Verify the sempoa frame exists
      const sempoaBoard = screen.getByTestId('sempoa-board');
      expect(sempoaBoard).toBeInTheDocument();

      // Verify reset button exists
      expect(
        screen.getByRole('button', { name: /reset/i }),
      ).toBeInTheDocument();

      // Verify value display exists
      const inputField = screen.getByTestId('keyboard-input-field');
      expect(inputField).toBeInTheDocument();
    });

    test('should have correct number of columns and beads', () => {
      render(<SempoaBoardWithProvider />);

      // Verify we have the correct number of columns
      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      expect(columns).toHaveLength(SEMPOA_CONFIG.COLUMNS);

      // Verify total number of beads
      const allBeads = document.querySelectorAll('[draggable="true"]');
      const expectedTotalBeads =
        SEMPOA_CONFIG.COLUMNS *
        (SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN +
          SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN);
      expect(allBeads).toHaveLength(expectedTotalBeads);
    });

    test('should reset beads when reset button is clicked', async () => {
      render(<SempoaBoardWithProvider />);

      // Activate some beads first
      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      const firstColumn = columns[0];
      const lowerBeads = firstColumn.querySelectorAll(
        '.lower-section [draggable="true"]',
      );
      const secondBead = lowerBeads[1] as HTMLElement;
      await user.click(secondBead);

      // Verify value is not 0
      await waitFor(() => {
        const inputField = screen.getByTestId('keyboard-input-field');
        expect(inputField).toHaveValue('200000000');
      });

      // Click reset
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Verify value is back to 0
      await waitFor(() => {
        const inputField = screen.getByTestId('keyboard-input-field');
        expect(inputField).toHaveValue('0');
      });
    });
  });

  describe('Column Headers', () => {
    test('should display correct place values', () => {
      render(<SempoaBoardWithProvider />);

      // Verify column headers are present (9 columns: hundred millions to units)
      const expectedValues = [
        '100M',
        '10M',
        '1M',
        '100K',
        '10K',
        '1K',
        '100',
        '10',
        '1',
      ];

      for (let i = 0; i < SEMPOA_CONFIG.COLUMNS; i++) {
        const header = screen.getByTestId(`column-header-${i}`);
        expect(header).toHaveTextContent(expectedValues[i]);
      }
    });
  });
});
