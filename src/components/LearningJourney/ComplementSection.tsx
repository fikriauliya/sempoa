import type React from 'react';
import type {
  ComplementType,
  LevelProgress,
  OperationType,
  UserProgress,
} from '../../types';
import { getComplementSectionLabel } from '../../utils/constants';
import LevelButton from './LevelButton';

interface ComplementSectionProps {
  operation: OperationType;
  complement: ComplementType;
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
  // Calculate progress percentage
  const progressPercentage =
    sectionProgress.total > 0
      ? Math.round((sectionProgress.completed / sectionProgress.total) * 100)
      : 0;

  return (
    <div className="space-y-1">
      <button
        type="button"
        className="font-medium text-sm text-gray-700 cursor-pointer hover:text-gray-900 bg-transparent border-none p-0 text-left w-full"
        onClick={() => onToggleSection(`${operation}-${complement}`)}
      >
        <div className="flex items-center justify-between">
          <span>{getComplementSectionLabel(complement, operation)}</span>
          <span
            className="ml-2 text-xs text-gray-500"
            data-testid={`progress-${operation}-${complement}`}
          >
            {sectionProgress.completed}/{sectionProgress.total}
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-1 mt-1">
          <div
            className="bg-green-500 h-1 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
            data-testid={`complement-progress-${operation}-${complement}`}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${getComplementSectionLabel(complement, operation)} progress: ${progressPercentage}%`}
          />
        </div>
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

export default ComplementSection;
