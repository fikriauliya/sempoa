# Sempoa Component Stories

This directory contains Storybook stories for all the components in the Sempoa learning application.

## Available Stories

### DraggableBead
- **Location**: `DraggableBead.stories.ts`
- **Component**: Individual wooden beads that can be moved and clicked
- **Stories**:
  - `UpperBeadInactive` - Shows an upper bead (5x value) in rest position
  - `UpperBeadActive` - Shows an upper bead in moved/active position
  - `LowerBeadInactive` - Shows a lower bead (1x value) in rest position
  - `LowerBeadActive` - Shows a lower bead in moved/active position
  - `HighValueBead` - Demonstrates a millions place value bead
  - `UnitValueBead` - Demonstrates a ones place value bead
  - `Interactive` - Fully interactive bead for testing

### GameController
- **Location**: `GameController.stories.tsx`
- **Component**: Game settings and question generation interface
- **Stories**:
  - `Default` - Standard game controller with all settings
  - `WithCustomStyling` - Shows component with custom container styling
  - `NarrowContainer` - Demonstrates responsive behavior in narrow spaces
  - `DarkTheme` - Shows contrast and readability on dark backgrounds

### SempoaBoard
- **Location**: `SempoaBoard.stories.tsx`
- **Component**: Main abacus board with 7 columns of beads
- **Stories**:
  - `Default` - Full sempoa board in initial state
  - `InCompactContainer` - Board in a smaller container
  - `WithGameBackground` - Board with gradient game-like background
  - `ClassicWoodTheme` - Board with traditional wooden aesthetic
  - `MinimalLayout` - Clean, minimal presentation
  - `ScaledDown` - Demonstrates scaling behavior

## Running Storybook

To view and interact with these stories:

```bash
npm run storybook
```

This will start Storybook on http://localhost:6006

## Building Storybook

To build a static version of the Storybook:

```bash
npm run build-storybook
```

## Features

- **Interactive Controls**: All stories include interactive controls for testing different props
- **Action Logging**: Click and interaction events are logged for debugging
- **Responsive Design**: Stories demonstrate component behavior in different container sizes
- **Theme Variations**: Multiple styling approaches to show component flexibility
- **Documentation**: Auto-generated docs with component descriptions and prop types

## Context Providers

Stories for `GameController` and `SempoaBoard` are wrapped with the necessary `GameProvider` context to simulate the full application environment.