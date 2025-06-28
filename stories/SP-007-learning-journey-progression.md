# SP-007: Learning Journey Progression System

## Overview
Replace the current Game Control section with a learning journey progression system that provides structured skill development through hierarchical levels with visual progression indicators.

## Requirements

### Level Structure (Based on spec.md)
```
Operation Types:
├── Addition
├── Subtraction  
└── Mixed Operations

Difficulty Levels (per operation):
├── Single Digit Numbers
├── Double Digit Numbers
└── Triple Digit Numbers

Complement Types (per difficulty):
├── No Complements
├── Small Friend Only
├── Big Friend Only
└── Both Friends
```

### UI Components
- **Sidebar Layout**: Replace GameController with LearningJourney component
- **Medium-sized Icons**: Visual representations for each level category
- **Progress Indicators**: Show completion status and current progress
- **Unlock System**: Levels unlock progressively as previous ones are completed

### Functional Requirements
1. **Progressive Unlocking**: Users must complete easier levels before accessing harder ones
2. **State Persistence**: Track completion status across sessions (localStorage)
3. **Score Integration**: Display current score and mistakes from GameContext
4. **Question Generation**: Integrate with existing questionGenerator utility
5. **Current Question Display**: Show active question with level context

### Technical Implementation
- **Component**: `src/components/LearningJourney.tsx`
- **Types**: Extend existing types for progression tracking
- **Context Integration**: Use existing GameContext for state management
- **Styling**: Tailwind CSS with consistent design system

### Success Criteria
- [ ] All 36 levels are properly structured (3 operations × 3 difficulties × 4 complement types)
- [ ] Visual progression clearly shows user's current position
- [ ] Unlock system prevents skipping ahead inappropriately
- [ ] Seamless integration with existing game mechanics
- [ ] Responsive design works on mobile and desktop