import type React from 'react';
import { useGame } from '../context/GameContext';
import { useExpandedSections } from '../hooks/useExpandedSections';
import { useQuestionGeneration } from '../hooks/useQuestionGeneration';
import type {
  ComplementType,
  LevelProgress,
  OperationType,
  UserProgress,
} from '../types';
import { OPERATIONS } from '../utils/constants';
import OperationSection from './LearningJourney/OperationSection';
import ProgressCard from './LearningJourney/ProgressCard';

interface LearningJourneyProps {
  userProgress: UserProgress;
  selectLevel: (level: LevelProgress) => UserProgress;
  currentLevel: LevelProgress | null;
  completionPercentage: number;
  sectionProgress: (
    operationType: OperationType,
    complementType: ComplementType,
  ) => { completed: number; total: number };
}

const LearningJourney: React.FC<LearningJourneyProps> = ({
  userProgress,
  selectLevel: selectUserLevel,
  currentLevel,
  completionPercentage,
  sectionProgress,
}) => {
  const { generateNewQuestion } = useQuestionGeneration(currentLevel);
  const { toggleSection, expandedSections } = useExpandedSections();
  const { setGameState } = useGame();

  const selectLevel = (level: LevelProgress) => {
    if (!level.isUnlocked) return;

    selectUserLevel(level);
    // Reset session progress when selecting a new level
    setGameState((prev) => ({
      ...prev,
      sessionProgress: { current: 0, total: prev.sessionProgress.total },
    }));
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
      </div>
    </div>
  );
};

export default LearningJourney;
