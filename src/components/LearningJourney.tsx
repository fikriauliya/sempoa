import { motion, useAnimate } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import type { GameState, LevelProgress, UserProgress } from '../types';
import {
  getButtonStateClassName,
  getLevelButtonClassName,
} from '../utils/classNames';
import {
  COMPLEMENT_LABELS,
  COMPLEMENTS,
  DIGIT_LABELS,
  getComplementSectionLabel,
  OPERATION_ICONS,
  OPERATIONS,
} from '../utils/constants';
import { ProgressionManager } from '../utils/progressionManager';
import { generateQuestion } from '../utils/questionGenerator';
import { CheckmarkIcon, CrossIcon } from './icons/SVGIcons';

interface ProgressCardProps {
  userProgress: UserProgress;
  progressionManager: ProgressionManager;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  userProgress,
  progressionManager,
}) => (
  <div className="bg-blue-50 p-4 rounded-lg">
    <h3 className="font-semibold text-blue-800 mb-2">Progress</h3>
    <div className="text-2xl font-mono text-blue-600">
      {progressionManager.getCompletionPercentage(userProgress)}%
    </div>
    <div className="text-sm text-blue-600">
      Score: {userProgress.totalScore}
    </div>
  </div>
);

interface LevelButtonProps {
  level: LevelProgress;
  userProgress: UserProgress;
  onSelect: (level: LevelProgress) => void;
}

const LevelButton: React.FC<LevelButtonProps> = ({
  level,
  userProgress,
  onSelect,
}) => (
  <button
    type="button"
    key={`${level.operationType}-${level.complementType}-${level.digitLevel}`}
    data-testid={`level-${level.operationType}-${level.complementType}-${level.digitLevel}`}
    className={getLevelButtonClassName(level, userProgress)}
    onClick={() => onSelect(level)}
  >
    <span>{DIGIT_LABELS[level.digitLevel]}</span>
    {level.isCompleted && (
      <span data-testid="checkmark-icon" className="text-green-600">
        ✓
      </span>
    )}
    {!level.isUnlocked && <span className="text-gray-400">🔒</span>}
  </button>
);

interface ComplementSectionProps {
  operation: 'addition' | 'subtraction' | 'mixed';
  complement: 'simple' | 'smallFriend' | 'bigFriend' | 'both';
  complementLevels: LevelProgress[];
  userProgress: UserProgress;
  progressionManager: ProgressionManager;
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;
  onSelectLevel: (level: LevelProgress) => void;
}

const ComplementSection: React.FC<ComplementSectionProps> = ({
  operation,
  complement,
  complementLevels,
  userProgress,
  progressionManager,
  expandedSections,
  onToggleSection,
  onSelectLevel,
}) => {
  const progress = progressionManager.getSectionProgress(
    userProgress,
    operation,
    complement,
  );

  return (
    <div key={complement} className="space-y-1">
      <button
        type="button"
        className="font-medium text-sm text-gray-700 cursor-pointer hover:text-gray-900 bg-transparent border-none p-0 text-left"
        onClick={() => onToggleSection(`${operation}-${complement}`)}
      >
        {getComplementSectionLabel(complement, operation)}
        <span
          className="ml-2 text-xs text-gray-500"
          data-testid={`progress-${operation}-${complement}`}
        >
          {progress.completed}/{progress.total}
        </span>
      </button>

      {expandedSections[`${operation}-${complement}`] && (
        <div className="ml-4 space-y-1">
          {complementLevels.map((level) => (
            <LevelButton
              key={`${level.operationType}-${level.complementType}-${level.digitLevel}`}
              level={level}
              userProgress={userProgress}
              onSelect={onSelectLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface OperationSectionProps {
  operation: 'addition' | 'subtraction' | 'mixed';
  userProgress: UserProgress;
  progressionManager: ProgressionManager;
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;
  onSelectLevel: (level: LevelProgress) => void;
}

const OperationSection: React.FC<OperationSectionProps> = ({
  operation,
  userProgress,
  progressionManager,
  expandedSections,
  onToggleSection,
  onSelectLevel,
}) => {
  const operationLevels = userProgress.allLevels.filter(
    (level) => level.operationType === operation,
  );
  const isOperationUnlocked = operationLevels.some((level) => level.isUnlocked);

  return (
    <div key={operation} className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => onToggleSection(operation)}
        className={`w-full p-3 flex items-center justify-between ${
          isOperationUnlocked
            ? 'bg-gray-50 hover:bg-gray-100'
            : 'bg-gray-200 cursor-not-allowed'
        }`}
        disabled={!isOperationUnlocked}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-3xl"
            data-testid={`icon-${operation}`}
            style={{
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {OPERATION_ICONS[operation]}
          </span>
          <span className="font-medium">
            {operation === 'mixed'
              ? 'Mixed Operations'
              : operation.charAt(0).toUpperCase() + operation.slice(1)}
          </span>
        </div>
        <span className="text-gray-500">
          {expandedSections[operation] ? '▼' : '▶'}
        </span>
      </button>

      {expandedSections[operation] && (
        <div className="p-3 bg-gray-50 space-y-2">
          {COMPLEMENTS.map((complement) => {
            const complementLevels = operationLevels.filter(
              (level) => level.complementType === complement,
            );

            return (
              <ComplementSection
                key={complement}
                operation={operation}
                complement={complement}
                complementLevels={complementLevels}
                userProgress={userProgress}
                progressionManager={progressionManager}
                expandedSections={expandedSections}
                onToggleSection={onToggleSection}
                onSelectLevel={onSelectLevel}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

interface CurrentQuestionProps {
  currentLevel: LevelProgress;
  gameState: GameState;
}

const CurrentQuestion: React.FC<CurrentQuestionProps> = ({
  currentLevel,
  gameState,
}) => (
  <div className="bg-green-50 p-4 rounded-lg" data-testid="current-question">
    <h3 className="font-semibold text-green-800 mb-2">Current Question</h3>
    <div className="text-lg font-mono text-green-700 mb-2">
      {gameState.currentQuestion?.operation === 'addition'
        ? gameState.currentQuestion.operands.join(' + ')
        : gameState.currentQuestion?.operation === 'subtraction'
          ? gameState.currentQuestion.operands.join(' - ')
          : gameState.currentQuestion?.operands.join(' ? ')}{' '}
      = ?
    </div>
    <div className="text-sm text-green-600">
      {COMPLEMENT_LABELS[currentLevel.complementType]} -{' '}
      {DIGIT_LABELS[currentLevel.digitLevel]}
    </div>
    <div className="hidden" data-answer={gameState.currentQuestion?.answer} />
  </div>
);

interface CheckAnswerButtonProps {
  buttonState: 'normal' | 'correct' | 'wrong';
  onCheckAnswer: () => void;
  scope: React.RefObject<HTMLButtonElement>;
}

const CheckAnswerButton: React.FC<CheckAnswerButtonProps> = ({
  buttonState,
  onCheckAnswer,
  scope,
}) => (
  <motion.button
    ref={scope}
    onClick={onCheckAnswer}
    className={getButtonStateClassName(buttonState)}
  >
    {buttonState === 'correct' && <CheckmarkIcon />}
    {buttonState === 'wrong' && <CrossIcon />}
    <span>Check Answer</span>
  </motion.button>
);

const LearningJourney: React.FC = () => {
  const { gameState, setGameState, checkAnswer, setCurrentValue } = useGame();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [buttonState, setButtonState] = useState<
    'normal' | 'correct' | 'wrong'
  >('normal');
  const progressionManager = useMemo(
    () => ProgressionManager.getInstance(),
    [],
  );
  const [scope, animate] = useAnimate();

  const generateNewQuestion = useCallback(
    (level: LevelProgress) => {
      // Reset the sempoa board
      setCurrentValue(0);

      const question = generateQuestion({
        difficulty: level.digitLevel,
        operation: level.operationType,
        useSmallFriend:
          level.complementType === 'smallFriend' ||
          level.complementType === 'both',
        useBigFriend:
          level.complementType === 'bigFriend' ||
          level.complementType === 'both',
      });

      setGameState((prev: GameState) => ({
        ...prev,
        currentQuestion: question,
      }));
    },
    [setCurrentValue, setGameState],
  );

  useEffect(() => {
    const progress = progressionManager.loadProgress();
    setUserProgress(progress);

    // Generate initial question if there's a current level
    const currentLevel = progressionManager.getCurrentLevel(progress);
    if (currentLevel) {
      generateNewQuestion(currentLevel);
    }
  }, [
    generateNewQuestion,
    progressionManager.getCurrentLevel,
    progressionManager.loadProgress,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckAnswer = useCallback(async () => {
    if (!userProgress?.currentLevelId || !gameState.currentQuestion) return;

    const isCorrect = checkAnswer();

    // Show feedback on button
    setButtonState(isCorrect ? 'correct' : 'wrong');

    // Animate button feedback, then reset state and move to next question
    await animate(scope.current, { scale: [1, 1.05, 1] }, { duration: 0.3 });
    setButtonState('normal');

    const updatedProgress = isCorrect
      ? progressionManager.recordCorrectAnswer(userProgress)
      : progressionManager.recordIncorrectAnswer(userProgress);

    setUserProgress(updatedProgress);

    // Generate new question after recording answer
    const currentLevel = progressionManager.getCurrentLevel(updatedProgress);
    if (currentLevel) {
      generateNewQuestion(currentLevel);
    }
  }, [
    userProgress,
    gameState.currentQuestion,
    checkAnswer,
    animate,
    scope,
    generateNewQuestion,
    progressionManager,
  ]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCheckAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleCheckAnswer]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const selectLevel = (level: LevelProgress) => {
    if (!userProgress || !level.isUnlocked) return;

    const updatedProgress = progressionManager.selectLevel(userProgress, level);
    setUserProgress(updatedProgress);
    generateNewQuestion(level);
  };

  if (!userProgress) return null;

  const currentLevel = progressionManager.getCurrentLevel(userProgress);

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-6"
      data-testid="learning-journey-sidebar"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Learning Journey
      </h2>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        <ProgressCard
          userProgress={userProgress}
          progressionManager={progressionManager}
        />

        {OPERATIONS.map((operation) => (
          <OperationSection
            key={operation}
            operation={operation}
            userProgress={userProgress}
            progressionManager={progressionManager}
            expandedSections={expandedSections}
            onToggleSection={toggleSection}
            onSelectLevel={selectLevel}
          />
        ))}

        {currentLevel && gameState.currentQuestion && (
          <CurrentQuestion currentLevel={currentLevel} gameState={gameState} />
        )}

        <CheckAnswerButton
          buttonState={buttonState}
          onCheckAnswer={handleCheckAnswer}
          scope={scope}
        />
      </div>
    </div>
  );
};

export default LearningJourney;
