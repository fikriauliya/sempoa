import '@testing-library/jest-dom';

// Mock @use-gesture/react globally to prevent interference with existing tests
jest.mock('@use-gesture/react', () => ({
  useDrag: jest.fn(() => () => ({})), // Return empty object for gesture bindings
}));
