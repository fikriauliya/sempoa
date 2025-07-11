import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { DERIVED_CONFIG, SEMPOA_CONFIG } from '../config/sempoaConfig';
import { useGame } from '../context/GameContext';
import type { BeadHandlers, BeadPosition } from '../types';
import DraggableBead from './DraggableBead';

const { COLUMNS, UPPER_BEADS_PER_COLUMN, LOWER_BEADS_PER_COLUMN } =
  SEMPOA_CONFIG;

const calculateTotalValue = (activeBeads: Set<string>): number => {
  return Array.from(activeBeads).reduce((sum, beadKey) => {
    const [col, type] = beadKey.split('-');
    const column = parseInt(col);
    const isUpper = type === 'upper';
    const beadValue = isUpper
      ? 5 * 10 ** (COLUMNS - 1 - column)
      : 10 ** (COLUMNS - 1 - column);
    return sum + beadValue;
  }, 0);
};

const formatPlaceValue = (placeValue: number): string => {
  if (placeValue >= 1000000000000) return `${placeValue / 1000000000000}T`;
  if (placeValue >= 1000000000) return `${placeValue / 1000000000}B`;
  if (placeValue >= 1000000) return `${placeValue / 1000000}M`;
  if (placeValue >= 1000) return `${placeValue / 1000}K`;
  return placeValue.toString();
};

interface ColumnHeaderProps {
  columnIndex: number;
  placeValue: number;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  columnIndex,
  placeValue,
}) => (
  <div
    key={`place-value-${placeValue}`}
    className="column-header text-xs text-gray-600 font-mono text-center flex items-center justify-center"
    style={{ width: `${SEMPOA_CONFIG.COLUMN.WIDTH}px` }}
    data-testid={`column-header-${columnIndex}`}
  >
    {formatPlaceValue(placeValue)}
  </div>
);

const calculateBeadPosition = (bead: BeadPosition, active: boolean): number => {
  if (bead.isUpper) {
    return active
      ? DERIVED_CONFIG.SEPARATOR_TOP -
          SEMPOA_CONFIG.BEAD.HEIGHT -
          (UPPER_BEADS_PER_COLUMN - 1 - bead.row) * SEMPOA_CONFIG.BEAD.HEIGHT
      : SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP +
          bead.row * SEMPOA_CONFIG.BEAD.HEIGHT;
  }

  return active
    ? DERIVED_CONFIG.LOWER_ACTIVE_TOP +
        bead.row * DERIVED_CONFIG.LOWER_BEAD_SPACING
    : DERIVED_CONFIG.LOWER_INACTIVE_TOP +
        bead.row * DERIVED_CONFIG.LOWER_BEAD_SPACING;
};

interface BeadRendererProps {
  bead: BeadPosition;
  isActive: boolean;
  onClick: () => void;
}

const BeadRenderer: React.FC<BeadRendererProps> = ({
  bead,
  isActive,
  onClick,
}) => (
  <div
    className="absolute"
    style={{
      top: `${calculateBeadPosition(bead, isActive)}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      transition: `top ${SEMPOA_CONFIG.ANIMATION.TRANSITION_DURATION} ${SEMPOA_CONFIG.ANIMATION.TRANSITION_EASING}`,
      zIndex: SEMPOA_CONFIG.Z_INDEX.BEAD,
    }}
  >
    <DraggableBead bead={bead} isActive={isActive} onClick={onClick} />
  </div>
);

interface BeadSectionProps extends BeadHandlers {
  columnIndex: number;
  isUpper: boolean;
}

const BeadSection: React.FC<BeadSectionProps> = ({
  columnIndex,
  isUpper,
  getBeadKey,
  isBeadActive,
  toggleBead,
}) => {
  const beadCount = isUpper ? UPPER_BEADS_PER_COLUMN : LOWER_BEADS_PER_COLUMN;
  const sectionHeight = isUpper
    ? SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT
    : SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT;

  return (
    <div
      className={`${isUpper ? 'upper' : 'lower'}-section relative flex flex-col items-center`}
      style={{ height: `${sectionHeight}px` }}
    >
      {Array.from({ length: beadCount }, (_, row) => {
        const bead: BeadPosition = {
          column: columnIndex,
          row: row,
          isUpper: isUpper,
        };
        return (
          <BeadRenderer
            key={getBeadKey(bead)}
            bead={bead}
            isActive={isBeadActive(bead)}
            onClick={() => toggleBead(bead)}
          />
        );
      })}
    </div>
  );
};

interface SempoaColumnProps extends BeadHandlers {
  columnIndex: number;
  placeValue: number;
}

const SempoaColumn: React.FC<SempoaColumnProps> = ({
  columnIndex,
  placeValue,
  getBeadKey,
  isBeadActive,
  toggleBead,
}) => (
  <div
    key={`column-place-${placeValue}`}
    className="relative flex flex-col items-center"
    style={{ width: `${SEMPOA_CONFIG.COLUMN.WIDTH}px` }}
    data-testid={`column-${columnIndex}`}
  >
    {/* Vertical rod */}
    <div
      className="absolute bg-amber-900 rounded-full shadow-sm"
      style={{
        height: `${DERIVED_CONFIG.ROD_HEIGHT}px`,
        width: `${SEMPOA_CONFIG.ROD.WIDTH}px`,
        left: '50%',
        top: '0px',
        transform: 'translateX(-50%)',
        zIndex: SEMPOA_CONFIG.Z_INDEX.ROD,
      }}
    />
    {/* Upper beads */}
    <BeadSection
      columnIndex={columnIndex}
      isUpper={true}
      getBeadKey={getBeadKey}
      isBeadActive={isBeadActive}
      toggleBead={toggleBead}
    />
    {/* Lower beads */}
    <BeadSection
      columnIndex={columnIndex}
      isUpper={false}
      getBeadKey={getBeadKey}
      isBeadActive={isBeadActive}
      toggleBead={toggleBead}
    />
  </div>
);

interface SempoaFrameProps extends BeadHandlers {}

const SempoaFrame: React.FC<SempoaFrameProps> = ({
  getBeadKey,
  isBeadActive,
  toggleBead,
}) => (
  <div className="sempoa-frame bg-black p-6 rounded-lg shadow-2xl">
    <div className="bg-amber-50 p-4 rounded relative">
      {/* Column headers */}
      <div className="flex justify-center gap-2 mb-4">
        {Array.from({ length: COLUMNS }, (_, col) => {
          const placeValue = 10 ** (COLUMNS - 1 - col);
          return (
            <ColumnHeader
              key={`place-value-${placeValue}`}
              columnIndex={col}
              placeValue={placeValue}
            />
          );
        })}
      </div>

      {/* Main board */}
      <div
        className="relative bg-amber-100 rounded border-2 border-amber-800"
        data-testid="sempoa-board"
      >
        {/* Horizontal crossbar */}
        <div
          className="absolute bg-amber-900 rounded-full shadow-md"
          style={{
            height: `${SEMPOA_CONFIG.SEPARATOR.HEIGHT}px`,
            width: '100%',
            left: '0',
            top: `${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION}px`,
            transform: 'translateY(-50%)',
            zIndex: SEMPOA_CONFIG.Z_INDEX.SEPARATOR,
          }}
        />

        {/* Columns */}
        <div
          className="flex justify-center gap-2"
          style={{ height: `${DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT}px` }}
        >
          {Array.from({ length: COLUMNS }, (_, col) => {
            const placeValue = 10 ** (COLUMNS - 1 - col);
            return (
              <SempoaColumn
                key={`column-place-${placeValue}`}
                columnIndex={col}
                placeValue={placeValue}
                getBeadKey={getBeadKey}
                isBeadActive={isBeadActive}
                toggleBead={toggleBead}
              />
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

const SempoaBoard: React.FC = () => {
  const { currentValue, setCurrentValue } = useGame();
  const [activeBeads, setActiveBeads] = useState<Set<string>>(new Set());

  // Reset beads when currentValue is set to 0
  useEffect(() => {
    if (currentValue === 0) {
      setActiveBeads(new Set());
    }
  }, [currentValue]);

  const getBeadKey = useCallback(
    (bead: BeadPosition): string =>
      `${bead.column}-${bead.isUpper ? 'upper' : 'lower'}-${bead.row}`,
    [],
  );

  const isBeadActive = (bead: BeadPosition): boolean =>
    activeBeads.has(getBeadKey(bead));

  const toggleBead = useCallback(
    (bead: BeadPosition) => {
      const key = getBeadKey(bead);
      const newActiveBeads = new Set(activeBeads);

      const isActive = newActiveBeads.has(key);
      const type = bead.isUpper ? 'upper' : 'lower';
      const maxBeads = bead.isUpper
        ? UPPER_BEADS_PER_COLUMN
        : LOWER_BEADS_PER_COLUMN;

      // Determine range based on bead type and activation state
      const [start, end] = bead.isUpper
        ? isActive
          ? [0, bead.row + 1]
          : [bead.row, maxBeads] // Upper: active removes above, inactive adds below
        : isActive
          ? [bead.row, maxBeads]
          : [0, bead.row + 1]; // Lower: active removes below, inactive adds above

      // Update beads in the range
      for (let row = start; row < end; row++) {
        const beadKey = `${bead.column}-${type}-${row}`;
        isActive ? newActiveBeads.delete(beadKey) : newActiveBeads.add(beadKey);
      }

      setActiveBeads(newActiveBeads);
      setCurrentValue(calculateTotalValue(newActiveBeads));
    },
    [activeBeads, setCurrentValue, getBeadKey],
  );

  const reset = useCallback(() => {
    setActiveBeads(new Set());
    setCurrentValue(0);
  }, [setCurrentValue]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Sempoa Board</h2>
        <div className="flex gap-4 items-center">
          <div className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
            Value: {currentValue}
          </div>
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <SempoaFrame
        getBeadKey={getBeadKey}
        isBeadActive={isBeadActive}
        toggleBead={toggleBead}
      />
    </div>
  );
};

export default SempoaBoard;
