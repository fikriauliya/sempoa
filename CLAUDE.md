# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development
npm run dev              # Start development server (loads port from .env VITE_PORT, defaults to 5173)
npm run build           # TypeScript compilation + Vite production build
npm run lint            # ESLint validation with TypeScript rules
npm run preview         # Preview production build locally

# Testing
npx playwright test                                    # Run all E2E tests (loads port from .env)
npx playwright test <test-file>                       # Run specific test file
npx playwright test --headed                          # Run tests with browser UI
npx playwright test --debug                           # Debug tests interactively
npx playwright test beads-on-rod-positioning.spec.ts # Run bead alignment tests
```

## Environment Configuration

**Port Configuration**: Both development server and tests load the port from `.env` file:

- Create `.env` file with `VITE_PORT=5173` (or your preferred port)
- If `.env` doesn't exist: ask user to run `npm run dev`, note the port it uses, then create `.env` with that port
- Both `npm run dev` and `npx playwright test` will use the same port from `.env`
- The `.env` file is gitignored and won't be committed

## Core Architecture

This is an interactive sempoa (abacus) learning application built with React 18, TypeScript, and Tailwind CSS.

### State Management Architecture

- **Centralized Context**: `src/context/GameContext.tsx` manages all game state including current question, score, mistakes, sempoa value, and feedback
- **State Flow**: GameProvider wraps the entire app → components consume context via `useGame()` hook
- **Key State Functions**: `checkAnswer()`, `setCurrentValue()`, question generation integration

### Component Hierarchy

```
App.tsx
├── GameProvider (context wrapper)
├── SempoaBoard (7-column interactive abacus)
│   └── DraggableBead (individual bead with drag/touch support)
└── GameController (game settings, score, question generation)
```

### Sempoa Board Implementation

- **Structure**: 7 columns representing place values (1,000,000 down to 1)
- **Bead System**: Each column has 1 upper bead (value 5×place) + 4 lower beads (value 1×place)
- **Positioning**: Uses CSS absolute positioning with `left: 50%` and `translateX(-50%)` for rod alignment
- **Interaction**: Click-to-toggle, drag-and-drop, and touch gesture support
- **Layout**: Flex-based column distribution with unified rod-bead alignment system

### Question Generation System

- **Location**: `src/utils/questionGenerator.ts`
- **Types**: Addition, Subtraction, Mixed operations
- **Complexity Levels**: Single/Double/Triple digit numbers
- **Complement Usage**: Small friend, Big friend, or both for advanced difficulty

### Type System

Key types in `src/types/index.ts`:

- `BeadPosition`: Individual bead properties (column, row, value, isUpper)
- `SempoaState`: Board state with bead positions and current value
- `Question`: Math question structure with operands and expected answer
- `GameState`: Game progress tracking (score, mistakes, current question)

## Testing Strategy

**Pre-Test Setup**:

- Ensure the .env file exists. If not, ask user to run `npm run dev` and save the port to the .env file
- Ensure the development server is running (assume user has already started it; if not, ask user to run `npm run dev`)

**Playwright E2E Tests**: Focus on sempoa board functionality and bead positioning

- `tests/beads-on-rod-positioning.spec.ts`: Critical test ensuring beads are properly centered on vertical rods
- Tests verify bounding box alignment, CSS positioning, and visual layout
- Run tests after any changes to sempoa board layout or positioning logic

## Development Notes

### Sempoa Board Layout Critical Points

- **Rod-Bead Alignment**: Beads must be visually centered on vertical rods using unified column structure
- **Responsive Spacing**: Board uses flex `justify-between` for even column distribution
- **Touch Support**: Each bead supports touch events for mobile device compatibility
- **Animation**: Smooth transitions (0.3s ease) for bead movement between positions

### Build System

- **Vite**: Fast development server with HMR
- **TypeScript**: Strict mode enabled with ES2020 target
- **Tailwind CSS**: Utility-first styling with custom sempoa board components
- **ESLint**: TypeScript-specific rules with React hooks validation

When making changes to the sempoa board layout or bead positioning, always run the Playwright tests to ensure proper alignment is maintained.

## Abacus Behavior

The sempoa implements authentic abacus behavior:

### Lower Beads (Unit Values)

- **Activating**: When you click a lower bead, it activates that bead AND all beads above it in the same column
- **Deactivating**: When you click an active lower bead, it deactivates that bead AND all beads below it in the same column
- This mimics the physical behavior where beads are pushed up against the crossbar together

### Upper Beads (5x Values)

- Toggle independently - clicking activates/deactivates only that specific bead
- Represents the "heaven" section of traditional abacus

### Tests

- `tests/abacus-behavior.spec.ts` - Comprehensive tests for the abacus behavior
- Verifies proper bead grouping, value calculations, and visual positioning

## Workflow Guidelines

- Never autocommit changes; wait for explicit request to commit
- Never run `npm run dev`; assume it's already running or ask user to start it if needed
