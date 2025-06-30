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
    <div className="text-2xl font-mono text-blue-600">
      {completionPercentage}%
    </div>
    <div className="text-sm text-blue-600">Score: {totalScore}</div>
  </div>
);

export default ProgressCard;
