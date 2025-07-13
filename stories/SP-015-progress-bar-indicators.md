# SP-015: Progress Bar Indicators

## Problem Statement
Users need visual feedback on their progress through the learning journey at two levels:
1. Overall progress within the current level/stage
2. Session progress showing how many questions they've answered

Currently, the Learning Journey sidebar shows only a percentage number, and the Question Display has no progress indication.

## Solution
Implement visual progress bars in both the Learning Journey sidebar and Question Display component to provide clear, animated progress feedback.

## Requirements

### Functional Requirements
1. **Learning Journey Progress Bar**
   - Display a visual progress bar in the ProgressCard component
   - Show completion percentage for the current level
   - Animate smoothly when progress updates
   - Maintain existing percentage text display

2. **Question Display Progress Bar**
   - Show "Question X of Y" progress for current session
   - Update in real-time as questions are answered
   - Reset when starting a new level or session
   - Position above the question text

3. **Session Tracking**
   - Track questions answered in current session
   - Define session size (default: 10 questions)
   - Reset session on level change

### Non-Functional Requirements
- Smooth animations using Framer Motion
- Consistent visual design with existing UI
- Accessible progress indicators
- No performance degradation

## Technical Design

### Components
1. **ProgressBar Component** (New)
   - Reusable progress bar with customizable styling
   - Props: percentage, label, showText, color theme
   - Framer Motion for smooth animations

2. **GameContext Updates**
   - Add sessionProgress state: `{ current: number, total: number }`
   - Track questions answered in session
   - Reset logic for new sessions

3. **Component Updates**
   - ProgressCard: Integrate visual progress bar
   - QuestionDisplay: Add session progress bar

## Success Criteria
- Progress bars display accurately
- Smooth animations on updates
- All existing tests pass
- New component tests provide coverage
- No visual regressions