# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development
npm run dev              # Start development server (loads port from .env VITE_PORT, defaults to 5173)
npm run build           # TypeScript compilation + Vite production build
npm run lint            # Biome check for linting and formatting issues
npm run lint:fix        # Auto-fix linting and formatting issues with Biome
npm run format          # Format code with Biome
npm run preview         # Preview production build locally

# Testing - Component Tests (React Testing Library + Jest)
npm test                                              # Run all component tests (fast <2s)
npm run test:watch                                    # Run component tests in watch mode
npm run test:coverage                                 # Run component tests with coverage report

# Testing - E2E Tests (Playwright)
npx playwright test                                   # Run all E2E tests (loads port from .env)
npx playwright test --project=chromium               # Run E2E tests on Chromium only
npx playwright test <test-file>                      # Run specific E2E test file
npx playwright test --headed                         # Run E2E tests with browser UI
npx playwright test --debug                          # Debug E2E tests interactively
```

## Environment Configuration

**Port Configuration**: Development server and E2E tests load the port from `.env` file:

- Create `.env` file with `VITE_PORT=5173` (or your preferred port)
- If `.env` doesn't exist: ask user to run `npm run dev`, note the port it uses, then create `.env` with that port
- Both `npm run dev` and `npx playwright test` will use the same port from `.env`
- Component tests (Jest) don't require the dev server - they run in JSDOM
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

- **Structure**: 13 columns representing place values (1,000,000,000,000 down to 1)
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

This project uses a **dual testing approach** for comprehensive coverage:

### Component Tests (React Testing Library + Jest)

**Purpose**: Fast unit testing of component logic and behavior
**Location**: `src/components/__tests__/`
**Runtime**: <2 seconds, no browser required

**Test Files**:
- `SempoaBoard.test.tsx` - Core abacus behavior (bead clicking, value calculations, reset)
- `SempoaBoard.positioning.test.tsx` - CSS positioning, layout verification, mathematical formulas
- `SempoaBoard.upperBeads.test.tsx` - Upper bead positioning, interaction, configuration support

**Key Features**:
- 35 tests covering all SempoaBoard functionality
- 100% statement coverage on SempoaBoard component
- Tests bead interactions, value calculations, and CSS positioning
- Uses test utilities in `src/test-utils/sempoa-test-helpers.ts`
- Runs in JSDOM environment (no dev server needed)

**When to Run**: During development for fast feedback on component logic

### E2E Tests (Playwright)

**Purpose**: Visual layout validation and cross-browser compatibility
**Location**: `tests/`
**Runtime**: ~5 seconds, requires browser and dev server

**Test Files**:
- `configuration.spec.ts` - Mathematical configuration validation and derived calculations
- `ui-layout.spec.ts` - Responsive design, visual alignment, separator positioning

**Key Features**:
- Tests actual browser rendering and visual layout
- Validates responsive design across different viewport sizes
- Captures screenshots for visual regression testing
- Tests mathematical configuration consistency

**Pre-Test Setup**:
- Ensure the .env file exists. If not, ask user to run `npm run dev` and save the port to the .env file
- Ensure the development server is running (assume user has already started it; if not, ask user to run `npm run dev`)

**When to Run**: Before releases or when making visual/layout changes

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
- **Biome**: Fast linter and formatter for TypeScript and React

**Testing Workflow**:
- Run `npm test` after making component logic changes (fast feedback)
- Run `npx playwright test --project=chromium` after layout/visual changes
- Both test suites should pass before committing changes

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

**Component Tests** (React Testing Library):
- `src/components/__tests__/SempoaBoard.test.tsx` - Comprehensive tests for abacus behavior
- `src/components/__tests__/SempoaBoard.positioning.test.tsx` - Bead positioning and CSS verification
- `src/components/__tests__/SempoaBoard.upperBeads.test.tsx` - Upper bead specific behavior

**E2E Tests** (Playwright):
- `tests/configuration.spec.ts` - Mathematical formula validation
- `tests/ui-layout.spec.ts` - Visual layout and responsive design

## Workflow Guidelines

- Never autocommit changes; wait for explicit request to commit
- Never run `npm run dev`; assume it's already running or ask user to start it if needed
