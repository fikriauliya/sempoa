# SP-007: Learning Journey Progression System

## Overview
Replace the current Game Control section with a structured learning journey progression system featuring a sidebar UI with medium-sized icons, following the leveling structure defined in spec.md.

## Objectives
1. Create a guided learning path that systematically teaches sempoa operations
2. Replace manual difficulty selection with automatic progression
3. Provide visual feedback on learning progress
4. Track and persist user advancement through levels

## User Experience

### Learning Path Structure
Based on spec.md, the progression follows this hierarchy:

1. **Addition**
   - Simple Addition (no complements)
     - Single digit
     - Double digit
     - Triple digit
     - Four digit
     - Five digit
   - Using small friend only
     - Single digit through Five digit
   - Using big friend only
     - Single digit through Five digit
   - Using both friends
     - Single digit through Five digit

2. **Subtraction**
   - Same structure as Addition

3. **Mixed Operations**
   - Same structure as above

Total: 3 operations × 4 complement types × 5 digit levels = 60 levels

### Sidebar Design
- **Location**: Replace current GameController in right column
- **Layout**: Vertical scrollable list with sections
- **Icons**: Medium-sized (40-48px) representing each operation type
- **Visual States**:
  - Locked (grayed out)
  - Available (normal color)
  - In Progress (highlighted border)
  - Completed (checkmark overlay)

### Progression Rules
1. Users start with Addition → Simple → Single digit
2. Complete 10 correct answers to unlock next digit level
3. Complete all digit levels to unlock next complement type
4. Complete all Addition levels to unlock Subtraction
5. Complete Addition and Subtraction to unlock Mixed Operations

## Technical Implementation

### Data Structure
```typescript
interface LevelProgress {
  operationType: 'addition' | 'subtraction' | 'mixed'
  complementType: 'simple' | 'smallFriend' | 'bigFriend' | 'both'
  digitLevel: 'single' | 'double' | 'triple' | 'four' | 'five'
  questionsCompleted: number
  correctAnswers: number
  isUnlocked: boolean
  isCompleted: boolean
}

interface UserProgress {
  currentLevel: LevelProgress
  allLevels: LevelProgress[]
  totalScore: number
}
```

### Components
1. **LearningJourney**: Main container replacing GameController
2. **LevelSection**: Collapsible section for each operation type
3. **LevelItem**: Individual level with icon, title, and progress
4. **ProgressIndicator**: Visual progress bar or badge system

### Local Storage
- Key: `sempoa_user_progress`
- Persist current level and completion status
- Auto-save after each question

## Success Criteria
1. Users can see their current position in the learning journey
2. Completed levels show visual confirmation
3. Locked levels are clearly indicated
4. Progress persists between sessions
5. Smooth transition from current manual system

## Testing Approach
- Unit tests for progression logic
- Integration tests for local storage persistence
- E2E tests for user flow through multiple levels