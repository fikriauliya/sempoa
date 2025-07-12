import type React from 'react';

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
    <div className="text-2xl font-mono text-blue-600 mb-2">
      {completionPercentage}%
    </div>
    <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${completionPercentage}%` }}
        data-testid="progress-bar"
        role="progressbar"
        aria-valuenow={completionPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${completionPercentage}%`}
      />
    </div>
    <div className="text-sm text-blue-600">Score: {totalScore}</div>
  </div>
);

export default ProgressCard;
