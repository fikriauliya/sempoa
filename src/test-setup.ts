import '@testing-library/jest-dom';

// Mock framer-motion globally to prevent interference with existing tests
jest.mock('framer-motion', () => ({
  motion: {
    button: 'button', // Simple string mock for most tests
    div: 'div',
  },
  PanInfo: {},
}));
