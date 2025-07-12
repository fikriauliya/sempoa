import { renderHook } from '@testing-library/react';
import { useGame } from '../../context/GameContext';
import type { UserProgress } from '../../types';
import {
  playCorrectAnswerSound,
  playIncorrectAnswerSound,
} from '../../utils/audioFeedback';
import { useAnswerChecking } from '../useAnswerChecking';

// Mock the dependencies
jest.mock('../../context/GameContext');
jest.mock('../../utils/audioFeedback');

const mockUseGame = useGame as jest.MockedFunction<typeof useGame>;
const mockPlayCorrectAnswerSound =
  playCorrectAnswerSound as jest.MockedFunction<typeof playCorrectAnswerSound>;
const mockPlayIncorrectAnswerSound =
  playIncorrectAnswerSound as jest.MockedFunction<
    typeof playIncorrectAnswerSound
  >;

describe('useAnswerChecking', () => {
  const mockProcessAnswer = jest.fn();
  const mockGenerateNewQuestion = jest.fn();
  const mockCheckAnswer = jest.fn();

  const mockUserProgress: UserProgress = {
    currentLevelId: 'test-level-1',
    allLevels: [],
    totalScore: 0,
  };

  const mockGameState = {
    currentQuestion: {
      operands: [5, 3],
      operation: 'addition' as const,
      answer: 8,
    },
    score: 0,
    level: 1,
    mistakes: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGame.mockReturnValue({
      gameState: mockGameState,
      setGameState: jest.fn(),
      currentValue: 0,
      setCurrentValue: jest.fn(),
      feedback: null,
      setFeedback: jest.fn(),
      checkAnswer: mockCheckAnswer,
    });
  });

  it('should play correct answer sound when answer is correct', () => {
    mockCheckAnswer.mockReturnValue(true);

    const { result } = renderHook(() =>
      useAnswerChecking(
        mockUserProgress,
        mockProcessAnswer,
        mockGenerateNewQuestion,
      ),
    );

    result.current.handleCheckAnswer();

    expect(mockCheckAnswer).toHaveBeenCalledTimes(1);
    expect(mockPlayCorrectAnswerSound).toHaveBeenCalledTimes(1);
    expect(mockPlayIncorrectAnswerSound).not.toHaveBeenCalled();
    expect(mockProcessAnswer).toHaveBeenCalledWith(true);
    expect(mockGenerateNewQuestion).toHaveBeenCalledTimes(1);
  });

  it('should play incorrect answer sound when answer is wrong', () => {
    mockCheckAnswer.mockReturnValue(false);

    const { result } = renderHook(() =>
      useAnswerChecking(
        mockUserProgress,
        mockProcessAnswer,
        mockGenerateNewQuestion,
      ),
    );

    result.current.handleCheckAnswer();

    expect(mockCheckAnswer).toHaveBeenCalledTimes(1);
    expect(mockPlayIncorrectAnswerSound).toHaveBeenCalledTimes(1);
    expect(mockPlayCorrectAnswerSound).not.toHaveBeenCalled();
    expect(mockProcessAnswer).toHaveBeenCalledWith(false);
    expect(mockGenerateNewQuestion).toHaveBeenCalledTimes(1);
  });

  it('should return null and not play sounds when no current level', () => {
    const userProgressWithoutLevel: UserProgress = {
      ...mockUserProgress,
      currentLevelId: null,
    };

    const { result } = renderHook(() =>
      useAnswerChecking(
        userProgressWithoutLevel,
        mockProcessAnswer,
        mockGenerateNewQuestion,
      ),
    );

    const isCorrect = result.current.handleCheckAnswer();

    expect(isCorrect).toBeNull();
    expect(mockCheckAnswer).not.toHaveBeenCalled();
    expect(mockPlayCorrectAnswerSound).not.toHaveBeenCalled();
    expect(mockPlayIncorrectAnswerSound).not.toHaveBeenCalled();
    expect(mockProcessAnswer).not.toHaveBeenCalled();
    expect(mockGenerateNewQuestion).not.toHaveBeenCalled();
  });

  it('should return null and not play sounds when no current question', () => {
    mockUseGame.mockReturnValue({
      gameState: {
        ...mockGameState,
        currentQuestion: null,
      },
      setGameState: jest.fn(),
      currentValue: 0,
      setCurrentValue: jest.fn(),
      feedback: null,
      setFeedback: jest.fn(),
      checkAnswer: mockCheckAnswer,
    });

    const { result } = renderHook(() =>
      useAnswerChecking(
        mockUserProgress,
        mockProcessAnswer,
        mockGenerateNewQuestion,
      ),
    );

    const isCorrect = result.current.handleCheckAnswer();

    expect(isCorrect).toBeNull();
    expect(mockCheckAnswer).not.toHaveBeenCalled();
    expect(mockPlayCorrectAnswerSound).not.toHaveBeenCalled();
    expect(mockPlayIncorrectAnswerSound).not.toHaveBeenCalled();
    expect(mockProcessAnswer).not.toHaveBeenCalled();
    expect(mockGenerateNewQuestion).not.toHaveBeenCalled();
  });

  it('should return the correct answer result', () => {
    mockCheckAnswer.mockReturnValue(true);

    const { result } = renderHook(() =>
      useAnswerChecking(
        mockUserProgress,
        mockProcessAnswer,
        mockGenerateNewQuestion,
      ),
    );

    const isCorrect = result.current.handleCheckAnswer();

    expect(isCorrect).toBe(true);

    // Test false case
    mockCheckAnswer.mockReturnValue(false);
    const isIncorrect = result.current.handleCheckAnswer();

    expect(isIncorrect).toBe(false);
  });
});
