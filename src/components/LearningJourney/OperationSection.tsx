import type React from 'react';
import type { LevelProgress, UserProgress } from '../../types';
import { COMPLEMENTS, OPERATION_ICONS } from '../../utils/constants';
import ComplementSection from './ComplementSection';

interface OperationSectionProps {
  operation: 'addition' | 'subtraction' | 'mixed';
  operationLevels: LevelProgress[];
  userProgress: UserProgress;
  getSectionProgress: (
    operation: 'addition' | 'subtraction' | 'mixed',
    complement: 'none' | 'smallFriend' | 'bigFriend' | 'family' | 'mixed',
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

export default OperationSection;
