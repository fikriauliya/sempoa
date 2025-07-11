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

export default ComplementSection;
