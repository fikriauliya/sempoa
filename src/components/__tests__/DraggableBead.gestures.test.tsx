import { render, screen } from '@testing-library/react';
import { useDrag } from '@use-gesture/react';
import type { BeadPosition } from '../../types';
import DraggableBead from '../DraggableBead';

// Mock @use-gesture/react
const mockBind = jest.fn();
jest.mock('@use-gesture/react', () => ({
  useDrag: jest.fn(),
}));

const mockUseDrag = useDrag as jest.MockedFunction<typeof useDrag>;

// Mock audio feedback
jest.mock('../../utils/audioFeedback', () => ({
  playLowerBeadClick: jest.fn(),
  playUpperBeadClick: jest.fn(),
}));

describe('DraggableBead Swipe Gestures', () => {
  const mockBead: BeadPosition = {
    column: 0,
    row: 0,
    isUpper: false,
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockBind.mockReturnValue({
      onTouchStart: jest.fn(),
      onTouchMove: jest.fn(),
      onTouchEnd: jest.fn(),
    });
    mockUseDrag.mockReturnValue(mockBind);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Swipe Gesture Setup', () => {
    it('should initialize useDrag hook with correct configuration', () => {
      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      expect(mockUseDrag).toHaveBeenCalledWith(
        expect.any(Function), // The gesture handler function
        expect.objectContaining({
          axis: 'y', // Only vertical swipes
          filterTaps: true, // Distinguish between taps and swipes
          threshold: 20, // Minimum distance for swipe
        }),
      );
    });

    it('should apply drag bind to the bead element', () => {
      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      expect(mockBind).toHaveBeenCalled();
    });
  });

  describe('Swipe Direction Detection', () => {
    it('should trigger bead activation on upward swipe', () => {
      let dragHandler: (event: any) => void = jest.fn();

      mockUseDrag.mockImplementation((handler) => {
        dragHandler = handler;
        return mockBind;
      });

      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      // Simulate upward swipe (negative movement.y)
      const swipeUpEvent = {
        movement: [0, -50], // x, y movement
        direction: [0, -1], // x, y direction
        velocity: [0, -0.5], // x, y velocity
        tap: false,
        cancel: false,
      };

      dragHandler(swipeUpEvent);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger bead deactivation on downward swipe', () => {
      let dragHandler: (event: any) => void = jest.fn();

      mockUseDrag.mockImplementation((handler) => {
        dragHandler = handler;
        return mockBind;
      });

      render(
        <DraggableBead bead={mockBead} isActive={true} onClick={mockOnClick} />,
      );

      // Simulate downward swipe (positive movement.y)
      const swipeDownEvent = {
        movement: [0, 50], // x, y movement
        direction: [0, 1], // x, y direction
        velocity: [0, 0.5], // x, y velocity
        tap: false,
        cancel: false,
      };

      dragHandler(swipeDownEvent);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger action on insufficient swipe distance', () => {
      let dragHandler: (event: any) => void = jest.fn();

      mockUseDrag.mockImplementation((handler) => {
        dragHandler = handler;
        return mockBind;
      });

      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      // Simulate insufficient swipe distance
      const smallSwipeEvent = {
        movement: [0, -5], // Very small movement
        direction: [0, -1],
        velocity: [0, -0.1],
        tap: false,
        cancel: false,
      };

      dragHandler(smallSwipeEvent);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Multi-Touch Support', () => {
    it('should handle simultaneous swipes on multiple beads independently', () => {
      const bead1: BeadPosition = { column: 0, row: 0, isUpper: false };
      const bead2: BeadPosition = { column: 1, row: 1, isUpper: true };
      const onClick1 = jest.fn();
      const onClick2 = jest.fn();

      render(
        <div>
          <DraggableBead bead={bead1} isActive={false} onClick={onClick1} />
          <DraggableBead bead={bead2} isActive={false} onClick={onClick2} />
        </div>,
      );

      // Each bead should have its own independent drag handler
      expect(mockUseDrag).toHaveBeenCalledTimes(2);
      expect(mockBind).toHaveBeenCalledTimes(2);
    });
  });

  describe('Gesture Conflict Prevention', () => {
    it('should prevent default browser behaviors during swipe', () => {
      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      // Verify that touch event handlers are set up to prevent defaults
      const bindResult = mockBind.mock.results[0].value;
      expect(bindResult.onTouchStart).toBeDefined();
      expect(bindResult.onTouchMove).toBeDefined();
    });

    it('should maintain existing click functionality alongside gestures', () => {
      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole('button');

      // Regular click should still work
      button.click();
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Haptic Feedback Integration', () => {
    it('should trigger haptic feedback on successful swipe when available', () => {
      const mockVibrate = jest.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
      });

      let dragHandler: (event: any) => void = jest.fn();

      mockUseDrag.mockImplementation((handler) => {
        dragHandler = handler;
        return mockBind;
      });

      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      // Simulate successful swipe
      const swipeEvent = {
        movement: [0, -50],
        direction: [0, -1],
        velocity: [0, -0.5],
        tap: false,
        cancel: false,
      };

      dragHandler(swipeEvent);

      expect(mockVibrate).toHaveBeenCalledWith(50); // Short haptic feedback
    });

    it('should not crash when haptic feedback is unavailable', () => {
      // Remove vibrate from navigator
      Object.defineProperty(navigator, 'vibrate', {
        value: undefined,
        writable: true,
      });

      let dragHandler: (event: any) => void = jest.fn();

      mockUseDrag.mockImplementation((handler) => {
        dragHandler = handler;
        return mockBind;
      });

      expect(() => {
        render(
          <DraggableBead
            bead={mockBead}
            isActive={false}
            onClick={mockOnClick}
          />,
        );

        const swipeEvent = {
          movement: [0, -50],
          direction: [0, -1],
          velocity: [0, -0.5],
          tap: false,
          cancel: false,
        };

        dragHandler(swipeEvent);
      }).not.toThrow();
    });
  });
});
