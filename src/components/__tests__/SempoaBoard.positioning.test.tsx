import { render, screen } from '@testing-library/react';
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

describe('SempoaBoard - Bead Positioning', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Initial Bead Positioning', () => {
    test('should position upper beads at inactive positions initially', () => {
      render(<SempoaBoardWithProvider />);

      // Get all columns (not headers)
      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      expect(columns).toHaveLength(SEMPOA_CONFIG.COLUMNS);

      // Check first column upper beads
      const firstColumn = columns[0];
      const upperBeads = firstColumn.querySelectorAll(
        '.upper-section [draggable="true"]',
      );
      expect(upperBeads).toHaveLength(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN);

      // Each upper bead should be at its initial position
      upperBeads.forEach((bead, index) => {
        const beadContainer = bead.parentElement as HTMLElement;
        const expectedPosition =
          SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP +
          index * SEMPOA_CONFIG.BEAD.HEIGHT;
        expect(beadContainer).toHaveStyle({
          top: `${expectedPosition}px`,
        });
      });
    });

    test('should position lower beads at inactive positions initially', () => {
      render(<SempoaBoardWithProvider />);

      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      const firstColumn = columns[0];
      const lowerBeads = firstColumn.querySelectorAll(
        '.lower-section [draggable="true"]',
      );
      expect(lowerBeads).toHaveLength(SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN);

      // Each lower bead should be at its initial position
      lowerBeads.forEach((bead, index) => {
        const beadContainer = bead.parentElement as HTMLElement;
        const expectedPosition =
          DERIVED_CONFIG.LOWER_INACTIVE_TOP +
          index * DERIVED_CONFIG.LOWER_BEAD_SPACING;
        expect(beadContainer).toHaveStyle({
          top: `${expectedPosition}px`,
        });
      });
    });
  });

  describe('Bead Movement and Positioning', () => {
    test('should move upper bead to active position when clicked', async () => {
      render(<SempoaBoardWithProvider />);

      // Reset first
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Get first upper bead
      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      const firstColumn = columns[0];
      const upperBeads = firstColumn.querySelectorAll(
        '.upper-section [draggable="true"]',
      );
      const firstUpperBead = upperBeads[0] as HTMLElement;

      // Click to activate
      await user.click(firstUpperBead);

      // Check active position - using formula from component
      const expectedActivePosition =
        DERIVED_CONFIG.SEPARATOR_TOP -
        SEMPOA_CONFIG.BEAD.HEIGHT -
        (SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN - 1 - 0) *
          SEMPOA_CONFIG.BEAD.HEIGHT;

      expect(firstUpperBead.parentElement).toHaveStyle({
        top: `${expectedActivePosition}px`,
      });
    });

    test('should move lower beads to active positions when clicked', async () => {
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

      // Click second bead to activate first two beads
      const secondBead = lowerBeads[1] as HTMLElement;
      await user.click(secondBead);

      // Check that first two beads are in active positions
      const firstBead = lowerBeads[0] as HTMLElement;

      expect(firstBead.parentElement).toHaveStyle({
        top: `${DERIVED_CONFIG.LOWER_ACTIVE_TOP}px`,
      });

      expect(secondBead.parentElement).toHaveStyle({
        top: `${DERIVED_CONFIG.LOWER_ACTIVE_TOP + DERIVED_CONFIG.LOWER_BEAD_SPACING}px`,
      });

      // Third and fourth beads should remain inactive
      const thirdBead = lowerBeads[2] as HTMLElement;
      const fourthBead = lowerBeads[3] as HTMLElement;

      expect(thirdBead.parentElement).toHaveStyle({
        top: `${DERIVED_CONFIG.LOWER_INACTIVE_TOP + 2 * DERIVED_CONFIG.LOWER_BEAD_SPACING}px`,
      });

      expect(fourthBead.parentElement).toHaveStyle({
        top: `${DERIVED_CONFIG.LOWER_INACTIVE_TOP + 3 * DERIVED_CONFIG.LOWER_BEAD_SPACING}px`,
      });
    });

    test('should have consistent spacing between beads', () => {
      render(<SempoaBoardWithProvider />);

      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      const firstColumn = columns[0];
      const lowerBeads = firstColumn.querySelectorAll(
        '.lower-section [draggable="true"]',
      );

      // Check spacing between adjacent beads in inactive state
      for (let i = 0; i < lowerBeads.length - 1; i++) {
        const currentBead = lowerBeads[i].parentElement as HTMLElement;
        const nextBead = lowerBeads[i + 1].parentElement as HTMLElement;

        const currentTop = parseInt(currentBead.style.top);
        const nextTop = parseInt(nextBead.style.top);
        const spacing = nextTop - currentTop;

        expect(spacing).toBe(DERIVED_CONFIG.LOWER_BEAD_SPACING);
      }
    });
  });

  describe('CSS Transitions and Styling', () => {
    test('should have proper transition styles for bead movement', () => {
      render(<SempoaBoardWithProvider />);

      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      const firstColumn = columns[0];
      const allBeads = firstColumn.querySelectorAll('[draggable="true"]');

      allBeads.forEach((bead) => {
        const beadContainer = bead.parentElement as HTMLElement;
        const computedStyle = window.getComputedStyle(beadContainer);

        // Check for transition property
        expect(computedStyle.transition).toContain('top');
        expect(computedStyle.transition).toContain(
          SEMPOA_CONFIG.ANIMATION.TRANSITION_DURATION,
        );
        expect(computedStyle.transition).toContain(
          SEMPOA_CONFIG.ANIMATION.TRANSITION_EASING,
        );
      });
    });

    test('should have proper centering styles for beads on rods', () => {
      render(<SempoaBoardWithProvider />);

      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      const firstColumn = columns[0];
      const allBeads = firstColumn.querySelectorAll('[draggable="true"]');

      allBeads.forEach((bead) => {
        const beadContainer = bead.parentElement as HTMLElement;

        // Check inline styles set by the component
        expect(beadContainer.style.left).toBe('50%');
        expect(beadContainer.style.transform).toContain('translateX(-50%)');
        expect(beadContainer.classList.contains('absolute')).toBe(true);
      });
    });
  });

  describe('Column Structure and Layout', () => {
    test('should have proper column widths', () => {
      render(<SempoaBoardWithProvider />);

      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      expect(columns).toHaveLength(SEMPOA_CONFIG.COLUMNS);

      columns.forEach((column) => {
        const computedStyle = window.getComputedStyle(column);
        expect(computedStyle.width).toBe(`${SEMPOA_CONFIG.COLUMN.WIDTH}px`);
      });
    });

    test('should have proper section heights', () => {
      render(<SempoaBoardWithProvider />);

      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      const firstColumn = columns[0];

      // Check upper section height
      const upperSection = firstColumn.querySelector(
        '.upper-section',
      ) as HTMLElement;
      expect(upperSection).toHaveStyle({
        height: `${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`,
      });

      // Check lower section height
      const lowerSection = firstColumn.querySelector(
        '.lower-section',
      ) as HTMLElement;
      expect(lowerSection).toHaveStyle({
        height: `${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}px`,
      });
    });

    test('should have main container with correct height', () => {
      render(<SempoaBoardWithProvider />);

      const mainContainer = screen
        .getByTestId('sempoa-board')
        .querySelector('.flex.justify-center.gap-2') as HTMLElement;
      expect(mainContainer).toHaveStyle({
        height: `${DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT}px`,
      });
    });
  });

  describe('Rod and Separator Positioning', () => {
    test('should position vertical rods correctly', () => {
      render(<SempoaBoardWithProvider />);

      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll(
        '[data-testid^="column-"]:not([data-testid*="header"])',
      );
      const firstColumn = columns[0];
      const rod = firstColumn.querySelector(
        '.bg-amber-900.rounded-full.shadow-sm',
      ) as HTMLElement;

      // Check inline styles set by the component
      expect(rod.style.height).toBe(`${DERIVED_CONFIG.ROD_HEIGHT}px`);
      expect(rod.style.width).toBe(`${SEMPOA_CONFIG.ROD.WIDTH}px`);
      expect(rod.style.left).toBe('50%');
      expect(rod.style.top).toBe('0px');
      expect(rod.style.transform).toBe('translateX(-50%)');
      expect(rod.classList.contains('absolute')).toBe(true);
    });

    test('should position horizontal separator correctly', () => {
      render(<SempoaBoardWithProvider />);

      const separator = screen
        .getByTestId('sempoa-board')
        .querySelector('.bg-amber-900.rounded-full.shadow-md') as HTMLElement;

      // Check inline styles set by the component
      expect(separator.style.height).toBe(
        `${SEMPOA_CONFIG.SEPARATOR.HEIGHT}px`,
      );
      expect(separator.style.width).toBe('100%');
      expect(separator.style.left).toBe('0px');
      expect(separator.style.top).toBe(
        `${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION}px`,
      );
      expect(separator.style.transform).toBe('translateY(-50%)');
      expect(separator.classList.contains('absolute')).toBe(true);
    });
  });

  describe('Mathematical Configuration Verification', () => {
    test('should verify derived calculations match expected formulas', () => {
      // Test separator boundaries
      const expectedSeparatorTop =
        SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION -
        SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2;
      expect(DERIVED_CONFIG.SEPARATOR_TOP).toBe(expectedSeparatorTop);

      const expectedSeparatorBottom =
        SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION +
        SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2;
      expect(DERIVED_CONFIG.SEPARATOR_BOTTOM).toBe(expectedSeparatorBottom);

      // Test main container height
      const expectedMainHeight =
        SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT +
        SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT;
      expect(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT).toBe(expectedMainHeight);

      // Test rod height
      expect(DERIVED_CONFIG.ROD_HEIGHT).toBe(expectedMainHeight);
    });

    test('should verify bead spacing prevents intersections', () => {
      // Lower bead spacing should be >= bead height to prevent intersections
      expect(DERIVED_CONFIG.LOWER_BEAD_SPACING).toBeGreaterThanOrEqual(
        SEMPOA_CONFIG.BEAD.HEIGHT,
      );

      // In fact, it should equal bead height for optimal spacing
      expect(DERIVED_CONFIG.LOWER_BEAD_SPACING).toBe(SEMPOA_CONFIG.BEAD.HEIGHT);
    });

    test('should verify all beads fit within their sections', () => {
      // Upper section should accommodate all upper beads
      const requiredUpperSpace =
        SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN * SEMPOA_CONFIG.BEAD.HEIGHT;
      expect(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT).toBeGreaterThanOrEqual(
        requiredUpperSpace,
      );

      // Lower section should accommodate all lower beads
      const requiredLowerSpace =
        SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN * SEMPOA_CONFIG.BEAD.HEIGHT;
      expect(SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT).toBeGreaterThanOrEqual(
        requiredLowerSpace,
      );
    });
  });
});
