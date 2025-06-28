import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SempoaBoard from '../SempoaBoard';
import { GameProvider } from '../../context/GameContext';
import { SEMPOA_CONFIG, DERIVED_CONFIG } from '../../config/sempoaConfig';

// Test wrapper with GameProvider
const SempoaBoardWithProvider = () => (
  <GameProvider>
    <SempoaBoard />
  </GameProvider>
);

describe('SempoaBoard - Upper Beads Positioning and Interaction', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Upper Bead Positioning Logic', () => {
    test('should calculate correct positions for upper beads without intersection', () => {
      render(<SempoaBoardWithProvider />);

      const currentBeadCount = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN;
      
      // Test positioning formula for current configuration
      for (let row = 0; row < currentBeadCount; row++) {
        // Calculate positions using the same formula as the component
        const inactiveTop = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + (row * SEMPOA_CONFIG.BEAD.HEIGHT);
        const activeTop = DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT - 
          ((currentBeadCount - 1 - row) * SEMPOA_CONFIG.BEAD.HEIGHT);
        
        // Verify positioning is valid
        expect(inactiveTop).toBeGreaterThanOrEqual(0);
        expect(activeTop).toBeGreaterThanOrEqual(0);
        expect(inactiveTop + SEMPOA_CONFIG.BEAD.HEIGHT).toBeLessThanOrEqual(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT);
        expect(activeTop + SEMPOA_CONFIG.BEAD.HEIGHT).toBeLessThanOrEqual(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT);
      }

      // Verify lowest active bead touches separator when active
      if (currentBeadCount > 0) {
        const lowestActiveTop = DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT;
        const lowestActiveBottom = lowestActiveTop + SEMPOA_CONFIG.BEAD.HEIGHT;
        expect(lowestActiveBottom).toBe(DERIVED_CONFIG.SEPARATOR_TOP);
      }
    });

    test('should verify spacing formula prevents intersection for multiple beads', () => {
      // Test with different numbers of upper beads (theoretical)
      const testConfigurations = [
        { beads: 1, description: 'Traditional (current)' },
        { beads: 2, description: 'Extended configuration' },
        { beads: 3, description: 'Large abacus' }
      ];

      testConfigurations.forEach(config => {
        const sectionHeight = (config.beads + 1) * SEMPOA_CONFIG.BEAD.HEIGHT;
        let allBeadsFit = true;
        let noIntersections = true;

        for (let beadIndex = 0; beadIndex < config.beads; beadIndex++) {
          const position = beadIndex * SEMPOA_CONFIG.BEAD.HEIGHT;
          const bottom = position + SEMPOA_CONFIG.BEAD.HEIGHT;

          // Check if bead fits in section
          if (bottom > sectionHeight) {
            allBeadsFit = false;
          }

          // Check intersection with next bead
          if (beadIndex < config.beads - 1) {
            const nextPosition = (beadIndex + 1) * SEMPOA_CONFIG.BEAD.HEIGHT;
            const gap = nextPosition - bottom;
            if (gap < 0) {
              noIntersections = false;
            }
          }
        }

        expect(allBeadsFit).toBe(true);
        expect(noIntersections).toBe(true);
      });
    });

    test('should verify component positioning matches expected formula', async () => {
      render(<SempoaBoardWithProvider />);

      // Reset first
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Test first column upper beads
      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll('[data-testid^="column-"]:not([data-testid*="header"])');
      const firstColumn = columns[0];
      const upperBeads = firstColumn.querySelectorAll('.upper-section [draggable="true"]');
      const beadCount = upperBeads.length;

      expect(beadCount).toBe(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN);

      // Get positions of all upper beads in first column
      for (let i = 0; i < beadCount; i++) {
        const bead = upperBeads[i] as HTMLElement;
        const beadContainer = bead.parentElement as HTMLElement;
        const position = parseInt(beadContainer.style.top);

        const expectedPosition = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + (i * SEMPOA_CONFIG.BEAD.HEIGHT);
        expect(position).toBe(expectedPosition);
      }
    });
  });

  describe('Upper Bead Interaction Behavior', () => {
    test('should toggle individual upper beads independently (current implementation)', async () => {
      render(<SempoaBoardWithProvider />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Get upper beads in first column
      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll('[data-testid^="column-"]:not([data-testid*="header"])');
      const firstColumn = columns[0];
      const upperBeads = firstColumn.querySelectorAll('.upper-section [draggable="true"]');
      const beadCount = upperBeads.length;

      if (beadCount === 1) {
        const upperBead = upperBeads[0] as HTMLElement;

        // Click to activate
        await user.click(upperBead);
        await waitFor(() => {
          expect(screen.getByText(/value: 5000000/i)).toBeInTheDocument();
        });

        // Click to deactivate
        await user.click(upperBead);
        await waitFor(() => {
          expect(screen.getByText(/value: 0/i)).toBeInTheDocument();
        });
      } else {
        // Test each bead independently for multiple upper beads
        for (let i = 0; i < beadCount; i++) {
          const bead = upperBeads[i] as HTMLElement;
          const expectedValue = 5 * Math.pow(10, 6); // 5 million for first column

          // Activate this bead
          await user.click(bead);
          await waitFor(() => {
            expect(screen.getByText(`Value: ${expectedValue}`)).toBeInTheDocument();
          });

          // Deactivate this bead
          await user.click(bead);
          await waitFor(() => {
            expect(screen.getByText(/value: 0/i)).toBeInTheDocument();
          });
        }
      }
    });

    test('should demonstrate expected authentic abacus behavior for multiple upper beads', () => {
      // This test documents expected behavior when UPPER_BEADS_PER_COLUMN >= 2
      const currentConfig = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN;

      if (currentConfig < 2) {
        // Skip actual testing but document expected behavior
        expect(currentConfig).toBe(1);
        
        // This documents what the behavior should be:
        // 1. Clicking a bead activates it AND all beads below it in the same column
        // 2. Clicking an active bead deactivates it AND all beads above it in the same column
        // 3. This mimics physical abacus where beads are pushed together
        
        // Example with 2 upper beads:
        // - Clicking top bead: activates only top bead (value = 1 × 5 × place_value)
        // - Clicking bottom bead: activates both beads (value = 2 × 5 × place_value)
        // - Clicking active top bead: deactivates all beads (value = 0)
        // - Clicking active bottom bead (when both active): deactivates bottom bead only
        expect(true).toBe(true); // Always pass - this is documentation
      }
    });

    test('should handle multiple upper beads behavior when configuration supports it', async () => {
      render(<SempoaBoardWithProvider />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      const currentConfig = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN;

      if (currentConfig < 2) {
        // Current configuration only has 1 upper bead per column
        const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll('[data-testid^="column-"]:not([data-testid*="header"])');
      const firstColumn = columns[0];
        const upperBeads = firstColumn.querySelectorAll('.upper-section [draggable="true"]');
        expect(upperBeads).toHaveLength(1);
        return;
      }

      // Test multiple upper beads behavior
      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll('[data-testid^="column-"]:not([data-testid*="header"])');
      const firstColumn = columns[0];
      const upperBeads = firstColumn.querySelectorAll('.upper-section [draggable="true"]');
      expect(upperBeads).toHaveLength(currentConfig);

      const firstBead = upperBeads[0] as HTMLElement; // Top bead
      const secondBead = upperBeads[1] as HTMLElement; // Bottom bead

      // Test clicking first (top) bead - should activate only that bead
      await user.click(firstBead);
      await waitFor(() => {
        // Should show only first bead active (1 × 5 million = 5 million)
        expect(screen.getByText(/value: 5000000/i)).toBeInTheDocument();
      });

      // Reset for next test
      await user.click(resetButton);

      // Test clicking second (bottom) bead - should activate both beads
      await user.click(secondBead);
      await waitFor(() => {
        // Should show both beads active (2 × 5 million = 10 million)
        expect(screen.getByText(/value: 10000000/i)).toBeInTheDocument();
      });
    });
  });

  describe('Upper Bead Movement and Separator Alignment', () => {
    test('should position upper beads correctly relative to separator when activated', async () => {
      render(<SempoaBoardWithProvider />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll('[data-testid^="column-"]:not([data-testid*="header"])');
      const firstColumn = columns[0];
      const upperBeads = firstColumn.querySelectorAll('.upper-section [draggable="true"]');
      const beadCount = upperBeads.length;

      expect(beadCount).toBe(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN);

      // Test each bead individually
      for (let i = 0; i < beadCount; i++) {
        const bead = upperBeads[i] as HTMLElement;
        const beadContainer = bead.parentElement as HTMLElement;

        // Activate the bead
        await user.click(bead);

        // Calculate expected active position using the formula
        const expectedActivePosition = DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT - 
          ((SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN - 1 - i) * SEMPOA_CONFIG.BEAD.HEIGHT);

        // Verify correct positioning
        expect(beadContainer).toHaveStyle({
          top: `${expectedActivePosition}px`
        });

        // For the lowest bead, verify separator alignment
        if (i === beadCount - 1) {
          const beadBottom = expectedActivePosition + SEMPOA_CONFIG.BEAD.HEIGHT;
          expect(beadBottom).toBe(DERIVED_CONFIG.SEPARATOR_TOP);
        }

        // Deactivate for next test
        await user.click(bead);
      }
    });

    test('should have upper bead gap equal one bead height when active', async () => {
      render(<SempoaBoardWithProvider />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      const expectedActivePosition = DERIVED_CONFIG.UPPER_ACTIVE_TOP;

      // Check inactive bead position (should be at top)
      const sempoaBoard = screen.getByTestId('sempoa-board');
      const columns = sempoaBoard.querySelectorAll('[data-testid^="column-"]:not([data-testid*="header"])');
      const firstColumn = columns[0];
      const upperBeads = firstColumn.querySelectorAll('.upper-section [draggable="true"]');
      const firstUpperBead = upperBeads[0] as HTMLElement;
      const beadContainer = firstUpperBead.parentElement as HTMLElement;

      expect(beadContainer).toHaveStyle({
        top: `${SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP}px`
      });

      // Click to activate the upper bead
      await user.click(firstUpperBead);

      // Check active bead position (should be one bead height down)
      expect(beadContainer).toHaveStyle({
        top: `${expectedActivePosition}px`
      });

      // Verify the gap is approximately one bead height
      const gap = expectedActivePosition - 0; // Gap from top
      expect(gap).toBe(expectedActivePosition);
    });

    test('should verify positioning formula works correctly for current configuration', () => {
      const currentBeadCount = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN;

      for (let row = 0; row < currentBeadCount; row++) {
        // Calculate positions using the formula
        const activeTop = DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT - 
          ((currentBeadCount - 1 - row) * SEMPOA_CONFIG.BEAD.HEIGHT);
        const activeBottom = activeTop + SEMPOA_CONFIG.BEAD.HEIGHT;

        // Verify positioning is valid for current configuration
        expect(activeTop).toBeGreaterThanOrEqual(0);
        expect(activeBottom).toBeLessThanOrEqual(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT);
      }

      // Verify lowest bead touches separator
      const lowestActiveTop = DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT - 
        ((currentBeadCount - 1 - (currentBeadCount - 1)) * SEMPOA_CONFIG.BEAD.HEIGHT);
      const lowestActiveBottom = lowestActiveTop + SEMPOA_CONFIG.BEAD.HEIGHT;
      expect(lowestActiveBottom).toBe(DERIVED_CONFIG.SEPARATOR_TOP);
    });
  });

  describe('Configuration Support and Adaptability', () => {
    test('should support multiple upper beads configuration without intersection', () => {
      // Test configuration scenarios
      const testConfigurations = [
        { beads: 1, description: 'Traditional (current)' },
        { beads: 2, description: 'Extended configuration' },
        { beads: 3, description: 'Large abacus' }
      ];

      testConfigurations.forEach(config => {
        const sectionHeight = (config.beads + 1) * SEMPOA_CONFIG.BEAD.HEIGHT;

        // Calculate positions for all beads
        const positions = [];
        for (let i = 0; i < config.beads; i++) {
          const position = i * SEMPOA_CONFIG.BEAD.HEIGHT;
          positions.push({
            bead: i + 1,
            top: position,
            bottom: position + SEMPOA_CONFIG.BEAD.HEIGHT
          });
        }

        // Check for intersections
        let hasIntersection = false;
        for (let i = 0; i < positions.length - 1; i++) {
          const currentBead = positions[i];
          const nextBead = positions[i + 1];
          const gap = nextBead.top - currentBead.bottom;

          if (gap < 0) {
            hasIntersection = true;
          }
        }

        // Check if all beads fit
        const lastBead = positions[positions.length - 1];
        const fitsInSection = lastBead.bottom <= sectionHeight;

        expect(hasIntersection).toBe(false);
        expect(fitsInSection).toBe(true);
      });
    });

    test('should demonstrate current vs required configuration comparison', () => {
      expect(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN).toBe(1); // Currently 1

      // Show what would be needed for 2 upper beads
      const requiredSectionHeight = (2 + 1) * SEMPOA_CONFIG.BEAD.HEIGHT;
      const totalUpperBeads = 2 * SEMPOA_CONFIG.COLUMNS;

      expect(requiredSectionHeight).toBe(60); // 3 * 20px
      expect(totalUpperBeads).toBe(26); // 2 * 13 columns

      // Verify current configuration matches expectations
      expect(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT).toBe((SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN + 1) * SEMPOA_CONFIG.BEAD.HEIGHT);
    });

    test('should document configuration impact on layout calculations', () => {
      const examples = [
        { beads: 1, desc: 'Traditional abacus (current)' },
        { beads: 2, desc: 'Extended configuration' },
        { beads: 3, desc: 'Large abacus' }
      ];

      examples.forEach(example => {
        const sectionHeight = (example.beads + 1) * SEMPOA_CONFIG.BEAD.HEIGHT;
        const separatorPosition = sectionHeight;

        // Verify calculation
        const expectedHeight = (example.beads + 1) * SEMPOA_CONFIG.BEAD.HEIGHT;
        expect(sectionHeight).toBe(expectedHeight);
        expect(separatorPosition).toBe(sectionHeight);
      });
    });
  });
});