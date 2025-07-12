# SP-014: Keyboard Input for Automatic Sempoa Bead Positioning

## Overview
Implement keyboard input functionality that allows users to type numbers and automatically positions sempoa beads to match the typed values.

## Requirements

### Functional Requirements
- **Keyboard Input Field**: Provide a text input field for numeric entry
- **Real-time Bead Positioning**: Automatically position sempoa beads as user types
- **Input Validation**: Validate numeric input and show error messages for invalid values
- **Auto-focus**: Input field should be focused on component mount for immediate typing
- **Bidirectional Sync**: Input field shows current sempoa value, updates when beads are clicked

### Technical Requirements
- **Number Conversion**: Convert typed numbers to appropriate bead positions using traditional abacus logic
- **Bead Logic**: Lower beads activate from top (row 0) for authentic abacus behavior
- **Input Constraints**: 
  - Only allow numeric characters (0-9) and navigation keys
  - Prevent negative numbers
  - Validate maximum value based on sempoa capacity
- **Error Handling**: Show clear error messages for invalid inputs

### UI/UX Requirements
- **Header Integration**: Place input field in sempoa board header next to Reset button
- **Compact Design**: Small, efficient input field suitable for header placement
- **Clear Labeling**: Use "Value:" label for clarity
- **Visual Feedback**: Error states with red styling for invalid inputs

## Implementation Details

### Components
- **KeyboardInput**: Standalone component handling input validation and conversion
- **SempoaBoard**: Integrate keyboard input into header layout

### Utility Functions
- `valueToBeadKeys()`: Convert numeric value to set of active bead positions
- `beadKeysToValue()`: Convert bead positions back to numeric value
- `canRepresentValue()`: Validate if number can be represented on current sempoa

### Validation Rules
1. **Numeric Only**: Block non-numeric character input at keyboard level
2. **Non-negative**: Reject negative numbers with error message
3. **Capacity Check**: Ensure number fits within sempoa's representational capacity
4. **Real-time Feedback**: Show errors immediately on invalid input

## Testing Strategy

### Component Tests
- Input field rendering and attributes
- Input validation for various scenarios
- Auto-focus behavior
- Error message display
- Keyboard event handling

### Integration Tests
- Bead positioning accuracy for different numbers
- Bidirectional synchronization between input and beads
- Reset functionality compatibility

### Utility Tests
- Number to bead conversion accuracy
- Bead to number conversion accuracy
- Edge cases and boundary values

## Acceptance Criteria

### Core Functionality ✅
- [x] User can type numbers and see beads position automatically
- [x] Input field auto-focuses on component mount
- [x] Invalid inputs show appropriate error messages
- [x] Input field syncs with bead clicks/changes

### Validation ✅
- [x] Only numeric input is accepted
- [x] Negative numbers are rejected
- [x] Numbers exceeding sempoa capacity are rejected
- [x] Empty input defaults to zero

### Integration ✅
- [x] Works alongside existing bead click/drag functionality
- [x] Reset button clears both beads and input field
- [x] Input field positioned in header next to Reset button
- [x] Compact design suitable for header placement

### Technical ✅
- [x] Lower beads activate from top (row 0) for authentic abacus behavior
- [x] Comprehensive test coverage (40+ tests)
- [x] No regressions in existing functionality
- [x] Clean, maintainable code structure

## Notes
- Implementation uses traditional abacus logic where lower beads are pushed "up" toward the crossbar
- Input field serves dual purpose as both input mechanism and value display
- Error handling includes paste operations for comprehensive input validation
- Auto-focus improves user experience by enabling immediate typing