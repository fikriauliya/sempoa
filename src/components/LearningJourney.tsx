import { motion } from 'framer-motion';
import type React from 'react';
import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useAnswerChecking } from '../hooks/useAnswerChecking';
import { useExpandedSections } from '../hooks/useExpandedSections';
import { useQuestionGeneration } from '../hooks/useQuestionGeneration';
import { useUserProgress } from '../hooks/useUserProgress';
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
  getOperationSymbol,
  OPERATION_ICONS,
  OPERATIONS,
} from '../utils/constants';
import { CheckmarkIcon, CrossIcon } from './icons/SVGIcons';
import { KEYBOARD_SHORTCUTS } from './LearningJourney/constants';

interface ProgressCardProps {
  completionPercentage: number;
  totalScore: number;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  completionPercentage,
  totalScore,
}) => (
  <div className="bg-blue-50 p-4 rounded-lg">
    <h3 className="font-semibold text-blue-800 mb-2">Progress</h3>
    <div className="text-2xl font-mono text-blue-600">
      {completionPercentage}%
    </div>
    <div className="text-sm text-blue-600">Score: {totalScore}</div>
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
}) => {
  return (
    <button
      type="button"
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
};

interface ComplementSectionProps {
  operation: 'addition' | 'subtraction' | 'mixed';
  complement: 'simple' | 'smallFriend' | 'bigFriend' | 'both';
  complementLevels: LevelProgress[];
  userProgress: UserProgress;
  sectionProgress: { completed: number; total: number };
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;
  onSelectLevel: (level: LevelProgress) => void;
}

const ComplementSection: React.FC<ComplementSectionProps> = ({
  operation,
  complement,
  complementLevels,
  userProgress,
  sectionProgress,
  expandedSections,
  onToggleSection,
  onSelectLevel,
}) => {
  return (
    <div className="space-y-1">
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
          {sectionProgress.completed}/{sectionProgress.total}
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
  operationLevels: LevelProgress[];
  userProgress: UserProgress;
  getSectionProgress: (
    operation: 'addition' | 'subtraction' | 'mixed',
    complement: 'simple' | 'smallFriend' | 'bigFriend' | 'both',
  ) => { completed: number; total: number };
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;
  onSelectLevel: (level: LevelProgress) => void;
}

const OperationSection: React.FC<OperationSectionProps> = ({
  operation,
  operationLevels,
  userProgress,
  getSectionProgress,
  expandedSections,
  onToggleSection,
  onSelectLevel,
}) => {
  const isOperationUnlocked = operationLevels.some((level) => level.isUnlocked);

  return (
    <div className="border rounded-lg overflow-hidden">
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
            className="text-3xl w-11 h-11 flex items-center justify-center"
            data-testid={`icon-${operation}`}
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
                sectionProgress={getSectionProgress(operation, complement)}
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
      {gameState.currentQuestion?.operands.join(
        ` ${getOperationSymbol(gameState.currentQuestion.operation)} `,
      )}{' '}
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
  const { gameState } = useGame();
  const {
    userProgress,
    selectLevel: selectUserLevel,
    currentLevel,
    completionPercentage,
    sectionProgress,
    processAnswer,
  } = useUserProgress();
  const { generateNewQuestion } = useQuestionGeneration(currentLevel);
  const { handleCheckAnswer, buttonState, scope } = useAnswerChecking(
    userProgress,
    processAnswer,
    generateNewQuestion,
  );
  const { toggleSection, expandedSections } = useExpandedSections();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        KEYBOARD_SHORTCUTS.includes(
          event.key as (typeof KEYBOARD_SHORTCUTS)[number],
        )
      ) {
        event.preventDefault();
        handleCheckAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleCheckAnswer]);

  const selectLevel = (level: LevelProgress) => {
    if (!level.isUnlocked) return;

    selectUserLevel(level);
    generateNewQuestion();
  };

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
          completionPercentage={completionPercentage}
          totalScore={userProgress.totalScore}
        />

        {OPERATIONS.map((operation) => {
          const operationLevels = userProgress.allLevels.filter(
            (level) => level.operationType === operation,
          );

          return (
            <OperationSection
              key={operation}
              operation={operation}
              operationLevels={operationLevels}
              userProgress={userProgress}
              getSectionProgress={sectionProgress}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
              onSelectLevel={selectLevel}
            />
          );
        })}

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
