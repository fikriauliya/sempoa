import { fireEvent, render, screen } from '@testing-library/react';
import { motion } from 'framer-motion';
import type { BeadPosition } from '../../types';
import DraggableBead from '../DraggableBead';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: jest.fn(({ children, onDragEnd, onClick, ...props }) => (
      <button
        {...props}
        onClick={onClick}
        data-testid="motion-button"
        onTouchEnd={(e) => {
          // Simulate drag gesture when testing
          if (onDragEnd && (e.target as HTMLElement).dataset.testDragInfo) {
            const dragInfo = JSON.parse(
              (e.target as HTMLElement).dataset.testDragInfo as string,
            );
            onDragEnd(e, dragInfo);
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

describe('DraggableBead Smooth Drag Movement', () => {
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

  describe('Drag Configuration Setup', () => {
    it('should render motion.button with drag handlers and constraints', () => {
      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      expect(motion.button).toHaveBeenCalledWith(
        expect.objectContaining({
          drag: 'y',
          onDragEnd: expect.any(Function),
          onDragStart: expect.any(Function),
          whileTap: { scale: 0.95 },
          whileDrag: { scale: 1.05, opacity: 0.8 },
          dragConstraints: expect.any(Object),
          transition: { type: 'spring', stiffness: 300, damping: 30 },
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

  describe('Smooth Drag Detection', () => {
    it('should trigger bead state change when dragged past snap threshold', () => {
      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole('button');

      // Simulate drag that crosses the snap threshold (50% of travel distance)
      const dragInfo = {
        point: { x: 0, y: 15 }, // Position that would trigger state change
        offset: { x: 0, y: 10 },
        velocity: { x: 0, y: 0.5 },
      };

      button.dataset.testDragInfo = JSON.stringify(dragInfo);
      fireEvent.touchEnd(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger state change when drag does not cross snap threshold', () => {
      render(
        <DraggableBead
          bead={mockBead}
          isActive={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole('button');

      // Simulate drag that doesn't cross the snap threshold (less than 50% travel)
      const dragInfo = {
        point: { x: 0, y: 5 }, // Position that would not trigger state change
        offset: { x: 0, y: 2 },
        velocity: { x: 0, y: 0.1 },
      };

      button.dataset.testDragInfo = JSON.stringify(dragInfo);
      fireEvent.touchEnd(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should work with both upward and downward drags', () => {
      render(
        <DraggableBead bead={mockBead} isActive={true} onClick={mockOnClick} />,
      );

      const button = screen.getByRole('button');

      // Simulate drag that should trigger state change
      const dragInfo = {
        point: { x: 0, y: 25 }, // Position that would trigger deactivation
        offset: { x: 0, y: 15 },
        velocity: { x: 0, y: 0.5 },
      };

      button.dataset.testDragInfo = JSON.stringify(dragInfo);
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
      const dragInfo1 = {
        point: { x: 0, y: 15 },
        offset: { x: 0, y: 10 },
        velocity: { x: 0, y: 0.5 },
      };
      buttons[0].dataset.testDragInfo = JSON.stringify(dragInfo1);
      fireEvent.touchEnd(buttons[0]);

      expect(onClick1).toHaveBeenCalledTimes(1);
      expect(onClick2).not.toHaveBeenCalled();

      // Test second bead
      const dragInfo2 = {
        point: { x: 0, y: 20 },
        offset: { x: 0, y: 12 },
        velocity: { x: 0, y: 0.5 },
      };
      buttons[1].dataset.testDragInfo = JSON.stringify(dragInfo2);
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
    it('should trigger haptic feedback on successful drag state change when available', () => {
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

      // Simulate successful drag that triggers state change
      const dragInfo = {
        point: { x: 0, y: 15 },
        offset: { x: 0, y: 10 },
        velocity: { x: 0, y: 0.5 },
      };

      button.dataset.testDragInfo = JSON.stringify(dragInfo);
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

        const dragInfo = {
          point: { x: 0, y: 15 },
          offset: { x: 0, y: 10 },
          velocity: { x: 0, y: 0.5 },
        };

        button.dataset.testDragInfo = JSON.stringify(dragInfo);
        fireEvent.touchEnd(button);
      }).not.toThrow();
    });
  });
});
