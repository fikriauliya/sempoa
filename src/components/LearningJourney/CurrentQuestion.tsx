import type React from 'react';
import type { GameState, LevelProgress } from '../../types';
import {
  COMPLEMENT_LABELS,
  DIGIT_LABELS,
  getOperationSymbol,
} from '../../utils/constants';

interface CurrentQuestionProps {
  currentLevel: LevelProgress;
  gameState: GameState;
}

const CurrentQuestion: React.FC<CurrentQuestionProps> = ({
  currentLevel,
  gameState,
}) => (
  <div className="bg-green-50 p-4 rounded-lg" data-testid="current-question">
    <h3 className="font-semibold text-green-800 mb-2">Current Question</h3>
    <div className="text-lg font-mono text-green-700 mb-2">
      {gameState.currentQuestion?.operands.join(
        ` ${getOperationSymbol(gameState.currentQuestion.operation)} `,
      )}{' '}
      = ?
    </div>
    <div className="text-sm text-green-600">
      {COMPLEMENT_LABELS[currentLevel.complementType]} -{' '}
      {DIGIT_LABELS[currentLevel.digitLevel]}
    </div>
    <div className="hidden" data-answer={gameState.currentQuestion?.answer} />
  </div>
);

export default CurrentQuestion;
