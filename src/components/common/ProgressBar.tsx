import { motion } from 'framer-motion';
import type React from 'react';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  showText?: boolean;
  colorTheme?: 'blue' | 'green';
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  showText = true,
  colorTheme = 'blue',
  height = 8,
}) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const colors = {
    blue: {
      background: 'bg-blue-100',
      fill: 'bg-blue-500',
      text: 'text-blue-600',
    },
    green: {
      background: 'bg-green-100',
      fill: 'bg-green-500',
      text: 'text-green-600',
    },
  };

  const theme = colors[colorTheme];

  return (
    <div className="w-full">
      {(label || showText) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className={`text-sm font-medium ${theme.text}`}>{label}</span>
          )}
          {showText && (
            <span className={`text-sm ${theme.text}`}>
              {Math.round(clampedPercentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${theme.background} rounded-full overflow-hidden`}
        style={{ height: `${height}px` }}
        role="progressbar"
        aria-valuenow={clampedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={`h-full ${theme.fill} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
