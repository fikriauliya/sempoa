import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useState } from 'react';
import { usePinchGesture } from '../../hooks/usePinchGesture';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';

// Mock React.TouchEvent structure for testing
const createMockTouchEvent = (touches: any[], changedTouches?: any[]) => ({
  touches,
  changedTouches: changedTouches || touches,
  preventDefault: jest.fn(),
});

describe('SwipeGesture Hook', () => {
  test('should detect vertical swipe up', () => {
    const onSwipeUp = jest.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({
        onSwipeUp,
        minSwipeDistance: 20,
      }),
    );

    // Simulate touch start
    const touchStart = createMockTouchEvent([{ clientX: 100, clientY: 200 }]);
    result.current.onTouchStart(touchStart as any);

    // Simulate touch end with upward movement
    const touchEnd = createMockTouchEvent([], [{ clientX: 100, clientY: 150 }]);
    result.current.onTouchEnd(touchEnd as any);

    expect(onSwipeUp).toHaveBeenCalledTimes(1);
  });

  test('should detect vertical swipe down', () => {
    const onSwipeDown = jest.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({
        onSwipeDown,
        minSwipeDistance: 20,
      }),
    );

    // Simulate touch start
    const touchStart = createMockTouchEvent([{ clientX: 100, clientY: 150 }]);
    result.current.onTouchStart(touchStart as any);

    // Simulate touch end with downward movement
    const touchEnd = createMockTouchEvent([], [{ clientX: 100, clientY: 200 }]);
    result.current.onTouchEnd(touchEnd as any);

    expect(onSwipeDown).toHaveBeenCalledTimes(1);
  });

  test('should not trigger swipe for short distances', () => {
    const onSwipeUp = jest.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({
        onSwipeUp,
        minSwipeDistance: 30,
      }),
    );

    // Simulate touch start
    const touchStart = createMockTouchEvent([{ clientX: 100, clientY: 200 }]);
    result.current.onTouchStart(touchStart as any);

    // Simulate touch end with short upward movement (less than threshold)
    const touchEnd = createMockTouchEvent([], [{ clientX: 100, clientY: 185 }]);
    result.current.onTouchEnd(touchEnd as any);

    expect(onSwipeUp).not.toHaveBeenCalled();
  });

  test('should work with mouse events', () => {
    const onSwipeUp = jest.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({
        onSwipeUp,
        minSwipeDistance: 20,
      }),
    );

    // Simulate mouse down
    const mouseDown = { clientX: 100, clientY: 200, preventDefault: jest.fn() };
    result.current.onMouseDown(mouseDown as any);

    // Simulate mouse up with upward movement
    const mouseUp = { clientX: 100, clientY: 150, preventDefault: jest.fn() };
    result.current.onMouseUp(mouseUp as any);

    expect(onSwipeUp).toHaveBeenCalledTimes(1);
  });
});

describe('PinchGesture Hook', () => {
  test('should detect pinch gesture', () => {
    const onPinch = jest.fn();
    const { result } = renderHook(() =>
      usePinchGesture({
        onPinch,
      }),
    );

    // Simulate touch start with two fingers
    const touchStart = createMockTouchEvent([
      { clientX: 100, clientY: 100 },
      { clientX: 200, clientY: 100 },
    ]);
    result.current.onTouchStart(touchStart as any);

    // Simulate touch move with fingers closer together (pinch in)
    const touchMove = createMockTouchEvent([
      { clientX: 120, clientY: 100 },
      { clientX: 180, clientY: 100 },
    ]);
    result.current.onTouchMove(touchMove as any);

    expect(onPinch).toHaveBeenCalled();
  });

  test('should call onPinchStart when pinch begins', () => {
    const onPinchStart = jest.fn();
    const { result } = renderHook(() =>
      usePinchGesture({
        onPinchStart,
      }),
    );

    // Simulate touch start with two fingers
    const touchStart = createMockTouchEvent([
      { clientX: 100, clientY: 100 },
      { clientX: 200, clientY: 100 },
    ]);
    result.current.onTouchStart(touchStart as any);

    expect(onPinchStart).toHaveBeenCalledTimes(1);
  });

  test('should call onPinchEnd when pinch ends', () => {
    const onPinchEnd = jest.fn();
    const { result } = renderHook(() =>
      usePinchGesture({
        onPinchEnd,
      }),
    );

    // Start pinch
    const touchStart = createMockTouchEvent([
      { clientX: 100, clientY: 100 },
      { clientX: 200, clientY: 100 },
    ]);
    result.current.onTouchStart(touchStart as any);

    // End pinch
    const touchEnd = createMockTouchEvent([]);
    result.current.onTouchEnd(touchEnd as any);

    expect(onPinchEnd).toHaveBeenCalledTimes(1);
  });
});

// Integration test component for testing swipe on beads
const TestBeadComponent = ({
  onSwipeUp,
  onSwipeDown,
}: {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
}) => {
  const [isActive, setIsActive] = useState(false);

  const swipeHandlers = useSwipeGesture({
    onSwipeUp,
    onSwipeDown,
  });

  return (
    <button
      data-testid="test-bead"
      className={isActive ? 'active' : 'inactive'}
      onClick={() => setIsActive(!isActive)}
      {...swipeHandlers}
    >
      Test Bead
    </button>
  );
};

describe('Bead Swipe Integration', () => {
  test('should handle swipe gestures on bead component', () => {
    const onSwipeUp = jest.fn();
    const onSwipeDown = jest.fn();

    render(
      <TestBeadComponent onSwipeUp={onSwipeUp} onSwipeDown={onSwipeDown} />,
    );

    const bead = screen.getByTestId('test-bead');

    // Simulate swipe up
    fireEvent.touchStart(bead, {
      touches: [{ clientX: 100, clientY: 200 }],
    });
    fireEvent.touchEnd(bead, {
      changedTouches: [{ clientX: 100, clientY: 150 }],
    });

    expect(onSwipeUp).toHaveBeenCalledTimes(1);

    // Simulate swipe down
    fireEvent.touchStart(bead, {
      touches: [{ clientX: 100, clientY: 150 }],
    });
    fireEvent.touchEnd(bead, {
      changedTouches: [{ clientX: 100, clientY: 200 }],
    });

    expect(onSwipeDown).toHaveBeenCalledTimes(1);
  });
});
