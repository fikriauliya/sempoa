import React, { useState, useCallback, useEffect } from "react";
import { BeadPosition, SempoaState } from "../types";
import { useGame } from "../context/GameContext";
import DraggableBead from "./DraggableBead";
import { SEMPOA_CONFIG, DERIVED_CONFIG } from "../config/sempoaConfig";

const { COLUMNS, UPPER_BEADS_PER_COLUMN, LOWER_BEADS_PER_COLUMN } =
  SEMPOA_CONFIG;

const SempoaBoard: React.FC = () => {
  const { currentValue, setCurrentValue } = useGame();

  const [, setSempoaState] = useState<SempoaState>(() => {
    const initialBeads: BeadPosition[] = [];

    for (let col = 0; col < COLUMNS; col++) {
      for (let row = 0; row < UPPER_BEADS_PER_COLUMN; row++) {
        initialBeads.push({
          column: col,
          row: row,
          value: 5 * Math.pow(10, COLUMNS - 1 - col),
          isUpper: true,
        });
      }

      for (let row = 0; row < LOWER_BEADS_PER_COLUMN; row++) {
        initialBeads.push({
          column: col,
          row: row,
          value: Math.pow(10, COLUMNS - 1 - col),
          isUpper: false,
        });
      }
    }

    return {
      beads: initialBeads,
      currentValue: 0,
    };
  });

  const [activeBeads, setActiveBeads] = useState<Set<string>>(new Set());

  // Reset beads when currentValue is set to 0
  useEffect(() => {
    if (currentValue === 0) {
      setActiveBeads(new Set());
    }
  }, [currentValue]);

  const getBeadKey = (bead: BeadPosition): string =>
    `${bead.column}-${bead.isUpper ? "upper" : "lower"}-${bead.row}`;

  const isBeadActive = (bead: BeadPosition): boolean =>
    activeBeads.has(getBeadKey(bead));

  const toggleBead = useCallback(
    (bead: BeadPosition) => {
      const key = getBeadKey(bead);
      const newActiveBeads = new Set(activeBeads);

      const isActive = newActiveBeads.has(key);
      const type = bead.isUpper ? "upper" : "lower";
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

      const newValue = Array.from(newActiveBeads).reduce((sum, beadKey) => {
        const [col, type] = beadKey.split("-");
        const column = parseInt(col);
        const isUpper = type === "upper";
        const beadValue = isUpper
          ? 5 * Math.pow(10, COLUMNS - 1 - column)
          : Math.pow(10, COLUMNS - 1 - column);
        return sum + beadValue;
      }, 0);

      setSempoaState((prev) => ({ ...prev, currentValue: newValue }));
      setCurrentValue(newValue);
    },
    [activeBeads, setCurrentValue]
  );

  const reset = useCallback(() => {
    setActiveBeads(new Set());
    setSempoaState((prev) => ({ ...prev, currentValue: 0 }));
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
            onClick={reset}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="sempoa-frame bg-black p-6 rounded-lg shadow-2xl">
        <div className="bg-amber-50 p-4 rounded relative">
          {/* Column labels - aligned with bead columns */}
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: COLUMNS }, (_, col) => {
              const placeValue = Math.pow(10, COLUMNS - 1 - col);
              let displayValue: string;

              if (placeValue >= 1000000000000) {
                // Trillions
                displayValue = `${placeValue / 1000000000000}T`;
              } else if (placeValue >= 1000000000) {
                // Billions
                displayValue = `${placeValue / 1000000000}B`;
              } else if (placeValue >= 1000000) {
                // Millions
                displayValue = `${placeValue / 1000000}M`;
              } else if (placeValue >= 1000) {
                // Thousands
                displayValue = `${placeValue / 1000}K`;
              } else {
                // Units
                displayValue = placeValue.toString();
              }

              return (
                <div
                  key={col}
                  className="column-header text-xs text-gray-600 font-mono text-center flex items-center justify-center"
                  style={{ width: `${SEMPOA_CONFIG.COLUMN.WIDTH}px` }}
                  data-testid={`column-header-${col}`}
                >
                  {displayValue}
                </div>
              );
            })}
          </div>

          {/* Sempoa board with vertical rods */}
          <div
            className="relative bg-amber-100 rounded border-2 border-amber-800"
            data-testid="sempoa-board"
          >
            {/* Horizontal crossbar spans the entire board */}
            <div
              className="absolute bg-amber-900 rounded-full shadow-md"
              style={{
                height: `${SEMPOA_CONFIG.SEPARATOR.HEIGHT}px`,
                width: "100%",
                left: "0",
                top: `${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION}px`,
                transform: "translateY(-50%)",
                zIndex: SEMPOA_CONFIG.Z_INDEX.SEPARATOR,
              }}
            />

            {/* Column structure - using flex with tight gap for closer bead spacing */}
            <div
              className="flex justify-center gap-2"
              style={{ height: `${DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT}px` }}
            >
              {Array.from({ length: COLUMNS }, (_, col) => (
                <div
                  key={col}
                  className="relative flex flex-col items-center"
                  style={{ width: `${SEMPOA_CONFIG.COLUMN.WIDTH}px` }}
                  data-testid={`column-${col}`}
                >
                  {/* Vertical rod for this column */}
                  <div
                    className="absolute bg-amber-900 rounded-full shadow-sm"
                    style={{
                      height: `${DERIVED_CONFIG.ROD_HEIGHT}px`,
                      width: `${SEMPOA_CONFIG.ROD.WIDTH}px`,
                      left: "50%",
                      top: "0px",
                      transform: "translateX(-50%)",
                      zIndex: SEMPOA_CONFIG.Z_INDEX.ROD,
                    }}
                  />
                  {/* Upper section beads */}
                  <div
                    className="upper-section relative flex flex-col items-center"
                    style={{
                      height: `${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`,
                    }}
                  >
                    {Array.from(
                      { length: UPPER_BEADS_PER_COLUMN },
                      (_, row) => {
                        const bead: BeadPosition = {
                          column: col,
                          row: row,
                          value: 5 * Math.pow(10, COLUMNS - 1 - col),
                          isUpper: true,
                        };
                        const active = isBeadActive(bead);

                        return (
                          <div
                            key={`upper-${row}`}
                            className="absolute"
                            style={{
                              top: active
                                ? `${
                                    DERIVED_CONFIG.SEPARATOR_TOP -
                                    SEMPOA_CONFIG.BEAD.HEIGHT -
                                    (UPPER_BEADS_PER_COLUMN - 1 - row) *
                                      SEMPOA_CONFIG.BEAD.HEIGHT
                                  }px`
                                : `${
                                    SEMPOA_CONFIG.POSITIONING
                                      .UPPER_INACTIVE_TOP +
                                    row * SEMPOA_CONFIG.BEAD.HEIGHT
                                  }px`,
                              left: "50%",
                              transform: "translateX(-50%)",
                              transition: `top ${SEMPOA_CONFIG.ANIMATION.TRANSITION_DURATION} ${SEMPOA_CONFIG.ANIMATION.TRANSITION_EASING}`,
                              zIndex: SEMPOA_CONFIG.Z_INDEX.BEAD,
                            }}
                          >
                            <DraggableBead
                              bead={bead}
                              isActive={active}
                              onClick={() => toggleBead(bead)}
                            />
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* Lower section beads */}
                  <div
                    className="lower-section relative flex flex-col items-center"
                    style={{
                      height: `${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}px`,
                    }}
                  >
                    {Array.from(
                      { length: LOWER_BEADS_PER_COLUMN },
                      (_, row) => {
                        const bead: BeadPosition = {
                          column: col,
                          row: row,
                          value: Math.pow(10, COLUMNS - 1 - col),
                          isUpper: false,
                        };
                        const active = isBeadActive(bead);

                        return (
                          <div
                            key={`lower-${row}`}
                            className="absolute"
                            style={{
                              top: active
                                ? `${
                                    DERIVED_CONFIG.LOWER_ACTIVE_TOP +
                                    row * DERIVED_CONFIG.LOWER_BEAD_SPACING
                                  }px`
                                : `${
                                    DERIVED_CONFIG.LOWER_INACTIVE_TOP +
                                    row * DERIVED_CONFIG.LOWER_BEAD_SPACING
                                  }px`,
                              left: "50%",
                              transform: "translateX(-50%)",
                              transition: `top ${SEMPOA_CONFIG.ANIMATION.TRANSITION_DURATION} ${SEMPOA_CONFIG.ANIMATION.TRANSITION_EASING}`,
                              zIndex: SEMPOA_CONFIG.Z_INDEX.BEAD,
                            }}
                          >
                            <DraggableBead
                              bead={bead}
                              isActive={active}
                              onClick={() => toggleBead(bead)}
                            />
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SempoaBoard;
