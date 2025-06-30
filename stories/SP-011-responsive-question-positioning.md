# SP-011: Responsive Question Positioning with 9-Column Sempoa Board Optimization

## Overview
Implement ergonomic question layout by repositioning questions to dedicated areas and optimizing the sempoa board to 9 columns for better user experience across all devices.

## Requirements

### 1. Sempoa Board Optimization
- **Current State:** 13 columns (supports up to trillions: 1,000,000,000,000)
- **Target State:** 9 columns (supports up to hundred millions: 100,000,000)
- **Columns to Display:** Rightmost 9 columns (units to hundred millions)
- **Scope:** Apply to all views (desktop, tablet, mobile)

### 2. Question Layout - Desktop
- **Current:** Questions displayed within Learning Journey sidebar
- **Target:** Dedicated area at top-right of the layout
- **Position:** Above Learning Journey sidebar, to the right of sempoa board
- **Separation:** Completely independent from Learning Journey component

### 3. Question Layout - Mobile
- **Target:** Questions positioned above the sempoa board
- **Priority:** Questions should be easily accessible and readable
- **Layout:** Stack vertically above the board

### 4. Responsive Breakpoints
- **Desktop:** >= 1024px (questions at top-right)
- **Tablet:** 768px - 1023px (questions at top-right, similar to desktop)
- **Mobile:** < 768px (questions above board)

### 5. Component Architecture
- Extract questions from `LearningJourney` component
- Create new dedicated `QuestionDisplay` component
- Move CheckAnswerButton from LearningJourney to QuestionDisplay component
- Update main layout grid to accommodate new positioning
- Maintain all existing question functionality (current question, progress tracking, answer checking)

## Technical Implementation

### Files to Modify
1. `src/components/App.tsx` - Update main layout grid
2. `src/components/SempoaBoard.tsx` - Reduce columns from 13 to 9
3. `src/components/LearningJourney/` - Remove question-related components
4. Create `src/components/QuestionDisplay/` - New dedicated component

### Sempoa Board Changes
- Update `TOTAL_COLUMNS` constant from 13 to 9
- Remove leftmost 4 columns (trillion, hundred billion, ten billion, billion places)
- Update place value calculations and labels
- Maintain all existing bead functionality

### Layout Grid Updates
```
Desktop/Tablet Layout:
┌─────────────────────┬─────────────────┐
│   Sempoa Board      │   Questions     │
│   (9 columns)       │   Display       │
├─────────────────────┼─────────────────┤
│                     │   Learning      │
│                     │   Journey       │
└─────────────────────┴─────────────────┘

Mobile Layout:
┌─────────────────────────────────────────┐
│           Questions Display             │
├─────────────────────────────────────────┤
│           Sempoa Board                  │
│           (9 columns)                   │
├─────────────────────────────────────────┤
│           Learning Journey              │
└─────────────────────────────────────────┘
```

## Testing Strategy

### Automated Tests Required
1. **Unit Tests:**
   - SempoaBoard component with 9 columns
   - QuestionDisplay component functionality
   - Responsive layout rendering

2. **E2E Tests:**
   - Question positioning across breakpoints
   - Sempoa board functionality with reduced columns
   - Mobile/desktop layout verification

### Manual Testing
- Cross-browser responsive behavior
- Touch interactions on mobile/tablet
- Question visibility and accessibility

## Acceptance Criteria
- [x] Sempoa board displays exactly 9 columns on all devices
- [x] Questions appear in dedicated area above Learning Journey
- [x] Questions appear above sempoa board on mobile
- [x] All existing question functionality preserved
- [x] CheckAnswerButton moved to QuestionDisplay component
- [x] Learning Journey component no longer contains questions or CheckAnswerButton
- [x] Responsive breakpoints work correctly
- [x] All existing tests pass
- [x] New tests cover 9-column behavior

## Definition of Done
- [x] Code implemented and reviewed
- [x] Tests written and passing
- [x] Manual testing completed across devices
- [x] Documentation updated
- [x] Task marked complete in TODOS.md