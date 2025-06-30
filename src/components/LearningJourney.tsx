import type React from 'react';
import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useAnswerChecking } from '../hooks/useAnswerChecking';
import { useExpandedSections } from '../hooks/useExpandedSections';
import { useQuestionGeneration } from '../hooks/useQuestionGeneration';
import { useUserProgress } from '../hooks/useUserProgress';
import type { LevelProgress } from '../types';
import { OPERATIONS } from '../utils/constants';
import CheckAnswerButton from './LearningJourney/CheckAnswerButton';
import CurrentQuestion from './LearningJourney/CurrentQuestion';
import { KEYBOARD_SHORTCUTS } from './LearningJourney/constants';
import OperationSection from './LearningJourney/OperationSection';
import ProgressCard from './LearningJourney/ProgressCard';

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
