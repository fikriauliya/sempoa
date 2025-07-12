import type React from 'react';
import type {
  ComplementType,
  LevelProgress,
  OperationType,
  UserProgress,
} from '../../types';
import { COMPLEMENTS, OPERATION_ICONS } from '../../utils/constants';
import ComplementSection from './ComplementSection';

interface OperationSectionProps {
  operation: OperationType;
  operationLevels: LevelProgress[];
  userProgress: UserProgress;
  getSectionProgress: (
    operation: OperationType,
    complement: ComplementType,
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

  // Calculate overall operation progress
  const completedLevels = operationLevels.filter(
    (level) => level.isCompleted,
  ).length;
  const totalLevels = operationLevels.length;
  const operationProgressPercentage =
    totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

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
        <div className="flex items-center gap-3 flex-1">
          <span
            className="text-3xl w-11 h-11 flex items-center justify-center"
            data-testid={`icon-${operation}`}
          >
            {OPERATION_ICONS[operation]}
          </span>
          <div className="flex-1">
            <div className="font-medium">
              {operation === 'mixed'
                ? 'Mixed Operations'
                : operation.charAt(0).toUpperCase() + operation.slice(1)}
            </div>
            <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${operationProgressPercentage}%` }}
                data-testid={`operation-progress-${operation}`}
                role="progressbar"
                aria-valuenow={operationProgressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${operation} progress: ${operationProgressPercentage}%`}
              />
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {completedLevels}/{totalLevels} levels
            </div>
          </div>
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

export default OperationSection;
