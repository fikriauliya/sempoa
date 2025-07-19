import { fireEvent, render, screen } from '@testing-library/react';
import { motion } from 'framer-motion';
import type { BeadPosition } from '../../types';
import DraggableBead from '../DraggableBead';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: jest.fn(({ children, onPanEnd, onClick, ...props }) => (
      <button
        {...props}
        onClick={onClick}
        data-testid="motion-button"
        onTouchEnd={(e) => {
          // Simulate pan gesture when testing
          if (onPanEnd && (e.target as HTMLElement).dataset.testPanInfo) {
            const panInfo = JSON.parse(
              (e.target as HTMLElement).dataset.testPanInfo as string,
            );
            onPanEnd(e, panInfo);
          }
        }}
      >
        {children}
      </button>
    )),
  },
}));

// Mock audio feedback
jest.mock('../../utils/audioFeedback', () => ({
  playLowerBeadClick: jest.fn(),
  playUpperBeadClick: jest.fn(),
}));

describe('DraggableBead Framer Motion Gestures', () => {
  const mockBead: BeadPosition = {
    column: 0,
    row: 0,
    isUpper: false,
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Framer Motion Pan Gesture Setup', () => {
    it('should render motion.button with pan gesture handlers', () => {
      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      expect(motion.button).toHaveBeenCalledWith(
        expect.objectContaining({
          onPanEnd: expect.any(Function),
          whileTap: { scale: 0.95 },
          transition: { type: 'spring', stiffness: 400, damping: 17 },
        }),
        {},
      );
    });

    it('should render as a button element', () => {
      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Pan Gesture Detection', () => {
    it('should trigger bead activation on vertical swipe with sufficient distance', () => {
      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole('button');

      // Simulate pan gesture with sufficient vertical distance
      const panInfo = {
        offset: { x: 0, y: -10 }, // 10px vertical movement (above threshold of 2px)
        velocity: { x: 0, y: -0.5 },
      };

      button.dataset.testPanInfo = JSON.stringify(panInfo);
      fireEvent.touchEnd(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger bead activation on vertical swipe with sufficient velocity', () => {
      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole('button');

      // Simulate pan gesture with sufficient velocity but small distance
      const panInfo = {
        offset: { x: 0, y: -1 }, // Small movement (below distance threshold)
        velocity: { x: 0, y: -0.5 }, // High velocity (above velocity threshold)
      };

      button.dataset.testPanInfo = JSON.stringify(panInfo);
      fireEvent.touchEnd(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger action on insufficient swipe distance and velocity', () => {
      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole('button');

      // Simulate pan gesture with insufficient distance and velocity
      const panInfo = {
        offset: { x: 0, y: -1 }, // Below threshold of 2px
        velocity: { x: 0, y: -0.0005 }, // Below threshold of 0.001
      };

      button.dataset.testPanInfo = JSON.stringify(panInfo);
      fireEvent.touchEnd(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should work with downward swipes', () => {
      render(
        <DraggableBead bead={mockBead} isActive={true} onClick={mockOnClick} />,
      );

      const button = screen.getByRole('button');

      // Simulate downward pan gesture
      const panInfo = {
        offset: { x: 0, y: 10 }, // Positive y movement (downward)
        velocity: { x: 0, y: 0.5 },
      };

      button.dataset.testPanInfo = JSON.stringify(panInfo);
      fireEvent.touchEnd(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multi-Touch Support', () => {
    it('should handle multiple beads independently', () => {
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

      // Each bead should render its own motion.button
      expect(motion.button).toHaveBeenCalledTimes(2);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      // Test first bead
      const panInfo1 = {
        offset: { x: 0, y: -5 },
        velocity: { x: 0, y: -0.5 },
      };
      buttons[0].dataset.testPanInfo = JSON.stringify(panInfo1);
      fireEvent.touchEnd(buttons[0]);

      expect(onClick1).toHaveBeenCalledTimes(1);
      expect(onClick2).not.toHaveBeenCalled();

      // Test second bead
      const panInfo2 = {
        offset: { x: 0, y: 5 },
        velocity: { x: 0, y: 0.5 },
      };
      buttons[1].dataset.testPanInfo = JSON.stringify(panInfo2);
      fireEvent.touchEnd(buttons[1]);

      expect(onClick2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Click Functionality', () => {
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
      fireEvent.click(button);
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

      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole('button');

      // Simulate successful swipe
      const panInfo = {
        offset: { x: 0, y: -10 },
        velocity: { x: 0, y: -0.5 },
      };

      button.dataset.testPanInfo = JSON.stringify(panInfo);
      fireEvent.touchEnd(button);

      expect(mockVibrate).toHaveBeenCalledWith(50); // Short haptic feedback
    });

    it('should not crash when haptic feedback is unavailable', () => {
      // Remove vibrate from navigator
      Object.defineProperty(navigator, 'vibrate', {
        value: undefined,
        writable: true,
      });

      expect(() => {
        render(
          <DraggableBead
            bead={mockBead}
            isActive={false}
            onClick={mockOnClick}
          />,
        );

        const button = screen.getByRole('button');

        const panInfo = {
          offset: { x: 0, y: -10 },
          velocity: { x: 0, y: -0.5 },
        };

        button.dataset.testPanInfo = JSON.stringify(panInfo);
        fireEvent.touchEnd(button);
      }).not.toThrow();
    });
  });
});
