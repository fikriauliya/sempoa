import type React from 'react';

interface SVGIconProps {
  className?: string;
  'aria-label'?: string;
}

export const CheckmarkIcon: React.FC<SVGIconProps> = ({
  className = 'w-5 h-5',
  'aria-label': ariaLabel = 'Correct answer',
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-label={ariaLabel}
  >
    <title>Correct answer checkmark</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

export const CrossIcon: React.FC<SVGIconProps> = ({
  className = 'w-5 h-5',
  'aria-label': ariaLabel = 'Wrong answer',
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-label={ariaLabel}
  >
    <title>Wrong answer cross</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
