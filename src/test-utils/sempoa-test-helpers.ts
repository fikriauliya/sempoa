import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SEMPOA_CONFIG, DERIVED_CONFIG } from '../config/sempoaConfig';

/**
 * Test utilities for common sempoa testing patterns
 */

export interface BeadTestHelper {
  element: HTMLElement;
  container: HTMLElement;
  columnIndex: number;
  beadIndex: number;
  isUpper: boolean;
}

export interface ColumnTestHelper {
  element: HTMLElement;
  index: number;
  upperBeads: BeadTestHelper[];
  lowerBeads: BeadTestHelper[];
}

/**
 * Get a user event instance for testing
 */
export const getUser = () => userEvent.setup();

/**
 * Reset the sempoa board to initial state
 */
export const resetSempoaBoard = async (user: ReturnType<typeof userEvent.setup>) => {
  const resetButton = screen.getByRole('button', { name: /reset/i });
  await user.click(resetButton);
};

/**
 * Get all columns from the sempoa board
 */
export const getAllColumns = (): ColumnTestHelper[] => {
  const columns = screen.getAllByTestId(/column-/);
  expect(columns).toHaveLength(SEMPOA_CONFIG.COLUMNS);

  return columns.map((column, index) => ({
    element: column,
    index,
    upperBeads: getColumnUpperBeads(column, index),
    lowerBeads: getColumnLowerBeads(column, index)
  }));
};

/**
 * Get a specific column by index
 */
export const getColumn = (index: number): ColumnTestHelper => {
  const columns = getAllColumns();
  return columns[index];
};

/**
 * Get upper beads from a column
 */
export const getColumnUpperBeads = (column: HTMLElement, columnIndex: number): BeadTestHelper[] => {
  const upperBeads = column.querySelectorAll('.upper-section [draggable="true"]');
  expect(upperBeads).toHaveLength(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN);

  return Array.from(upperBeads).map((bead, index) => ({
    element: bead as HTMLElement,
    container: bead.parentElement as HTMLElement,
    columnIndex,
    beadIndex: index,
    isUpper: true
  }));
};

/**
 * Get lower beads from a column
 */
export const getColumnLowerBeads = (column: HTMLElement, columnIndex: number): BeadTestHelper[] => {
  const lowerBeads = column.querySelectorAll('.lower-section [draggable="true"]');
  expect(lowerBeads).toHaveLength(SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN);

  return Array.from(lowerBeads).map((bead, index) => ({
    element: bead as HTMLElement,
    container: bead.parentElement as HTMLElement,
    columnIndex,
    beadIndex: index,
    isUpper: false
  }));
};

/**
 * Click a bead
 */
export const clickBead = async (
  user: ReturnType<typeof userEvent.setup>,
  bead: BeadTestHelper
) => {
  await user.click(bead.element);
};

/**
 * Get the current value displayed on the board
 */
export const getCurrentValue = (): number => {
  const valueDisplay = screen.getByText(/value: \d+/i);
  const match = valueDisplay.textContent?.match(/value: (\d+)/i);
  return match ? parseInt(match[1]) : 0;
};

/**
 * Wait for a specific value to be displayed
 */
export const waitForValue = async (expectedValue: number) => {
  const { waitFor } = await import('@testing-library/react');
  await waitFor(() => {
    expect(screen.getByText(`Value: ${expectedValue}`)).toBeInTheDocument();
  });
};

/**
 * Calculate expected position for upper bead
 */
export const calculateUpperBeadPosition = (beadIndex: number, isActive: boolean): number => {
  if (isActive) {
    return DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT - 
      ((SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN - 1 - beadIndex) * SEMPOA_CONFIG.BEAD.HEIGHT);
  } else {
    return SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + (beadIndex * SEMPOA_CONFIG.BEAD.HEIGHT);
  }
};

/**
 * Calculate expected position for lower bead
 */
export const calculateLowerBeadPosition = (beadIndex: number, isActive: boolean): number => {
  if (isActive) {
    return DERIVED_CONFIG.LOWER_ACTIVE_TOP + (beadIndex * DERIVED_CONFIG.LOWER_BEAD_SPACING);
  } else {
    return DERIVED_CONFIG.LOWER_INACTIVE_TOP + (beadIndex * DERIVED_CONFIG.LOWER_BEAD_SPACING);
  }
};

/**
 * Verify bead position matches expected
 */
export const verifyBeadPosition = (bead: BeadTestHelper, isActive: boolean) => {
  const expectedPosition = bead.isUpper 
    ? calculateUpperBeadPosition(bead.beadIndex, isActive)
    : calculateLowerBeadPosition(bead.beadIndex, isActive);

  expect(bead.container).toHaveStyle({
    top: `${expectedPosition}px`
  });
};

/**
 * Calculate expected value for a bead
 */
export const calculateBeadValue = (columnIndex: number, isUpper: boolean): number => {
  const placeValue = Math.pow(10, SEMPOA_CONFIG.COLUMNS - 1 - columnIndex);
  return isUpper ? 5 * placeValue : placeValue;
};

/**
 * Activate beads in a pattern (useful for testing different combinations)
 */
export const activateBeadPattern = async (
  user: ReturnType<typeof userEvent.setup>,
  pattern: Array<{ columnIndex: number; beadIndex: number; isUpper: boolean }>
) => {
  const columns = getAllColumns();
  
  for (const item of pattern) {
    const column = columns[item.columnIndex];
    const beads = item.isUpper ? column.upperBeads : column.lowerBeads;
    const bead = beads[item.beadIndex];
    await clickBead(user, bead);
  }
};

/**
 * Verify all beads are in inactive state
 */
export const verifyAllBeadsInactive = () => {
  const columns = getAllColumns();
  
  columns.forEach(column => {
    column.upperBeads.forEach(bead => {
      verifyBeadPosition(bead, false);
    });
    
    column.lowerBeads.forEach(bead => {
      verifyBeadPosition(bead, false);
    });
  });
  
  expect(getCurrentValue()).toBe(0);
};

/**
 * Verify CSS transitions are properly set for bead movement
 */
export const verifyBeadTransitions = (bead: BeadTestHelper) => {
  const computedStyle = window.getComputedStyle(bead.container);
  
  expect(computedStyle.transition).toContain('top');
  expect(computedStyle.transition).toContain(SEMPOA_CONFIG.ANIMATION.TRANSITION_DURATION);
  expect(computedStyle.transition).toContain(SEMPOA_CONFIG.ANIMATION.TRANSITION_EASING);
};

/**
 * Verify bead centering styles
 */
export const verifyBeadCentering = (bead: BeadTestHelper) => {
  const computedStyle = window.getComputedStyle(bead.container);
  
  expect(computedStyle.left).toBe('50%');
  expect(computedStyle.transform).toContain('translateX(-50%)');
  expect(computedStyle.position).toBe('absolute');
};

/**
 * Get board structure elements
 */
export const getBoardElements = () => {
  return {
    sempoaBoard: screen.getByTestId('sempoa-board'),
    mainContainer: screen.getByTestId('sempoa-board').querySelector('.flex.justify-center.gap-2') as HTMLElement,
    separator: screen.getByTestId('sempoa-board').querySelector('.bg-amber-900.rounded-full.shadow-md') as HTMLElement,
    resetButton: screen.getByRole('button', { name: /reset/i }),
    valueDisplay: screen.getByText(/value:/i),
    title: screen.getByRole('heading', { name: /sempoa board/i })
  };
};

/**
 * Verify board structure
 */
export const verifyBoardStructure = () => {
  const elements = getBoardElements();
  
  expect(elements.title).toBeInTheDocument();
  expect(elements.sempoaBoard).toBeInTheDocument();
  expect(elements.resetButton).toBeInTheDocument();
  expect(elements.valueDisplay).toBeInTheDocument();
  expect(elements.separator).toBeInTheDocument();
  
  // Verify main container height
  expect(elements.mainContainer).toHaveStyle({
    height: `${DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT}px`
  });
  
  // Verify separator positioning
  expect(elements.separator).toHaveStyle({
    height: `${SEMPOA_CONFIG.SEPARATOR.HEIGHT}px`,
    width: '100%',
    left: '0',
    top: `${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION}px`,
    transform: 'translateY(-50%)',
    position: 'absolute'
  });
};

/**
 * Verify column headers
 */
export const verifyColumnHeaders = () => {
  const expectedValues = ['1T', '100B', '10B', '1B', '100M', '10M', '1M', '100K', '10K', '1K', '100', '10', '1'];
  
  for (let i = 0; i < SEMPOA_CONFIG.COLUMNS; i++) {
    const header = screen.getByTestId(`column-header-${i}`);
    expect(header).toHaveTextContent(expectedValues[i]);
  }
};

/**
 * Test mathematical configuration consistency
 */
export const verifyConfigurationConsistency = () => {
  // Test separator boundaries
  const expectedSeparatorTop = SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION - (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2);
  expect(DERIVED_CONFIG.SEPARATOR_TOP).toBe(expectedSeparatorTop);

  const expectedSeparatorBottom = SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION + (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2);
  expect(DERIVED_CONFIG.SEPARATOR_BOTTOM).toBe(expectedSeparatorBottom);

  // Test main container height
  const expectedMainHeight = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT;
  expect(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT).toBe(expectedMainHeight);

  // Test rod height
  expect(DERIVED_CONFIG.ROD_HEIGHT).toBe(expectedMainHeight);

  // Test bead spacing
  expect(DERIVED_CONFIG.LOWER_BEAD_SPACING).toBe(SEMPOA_CONFIG.BEAD.HEIGHT);
};