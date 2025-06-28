# SP-010: Enable Swipe Gestures for Bead Manipulation

## Overview
Implement swipe gesture support for bead manipulation on tablets and mobile devices to enhance touch interaction experience while maintaining existing tap functionality.

## Requirements

### Functional Requirements
1. **Vertical Swipe Detection**
   - Detect vertical swipe gestures on individual beads
   - Minimum swipe distance: 30px
   - Minimum swipe velocity: 100px/s
   - Vertical tolerance: 45° angle from vertical axis

2. **Lower Bead Swipe Behavior**
   - **Swipe Up**: Activate bead and all beads above it (push towards crossbar)
   - **Swipe Down**: Deactivate bead and all beads below it (pull away from crossbar)
   - Maintains existing abacus grouping behavior

3. **Upper Bead Swipe Behavior**
   - **Swipe Up**: Activate upper bead
   - **Swipe Down**: Deactivate upper bead
   - Independent toggle behavior

4. **Compatibility**
   - Swipe gestures work alongside existing tap behavior
   - No breaking changes to current touch/click functionality
   - Fallback to tap if swipe criteria not met

### Technical Requirements
1. **Implementation Location**
   - Enhance existing `DraggableBead` component
   - Extend current touch event handlers
   - No external gesture libraries required

2. **Performance**
   - Gesture detection must not impact animation smoothness
   - Touch event handling remains responsive
   - No interference with existing drag-and-drop functionality

3. **Device Support**
   - iOS Safari (tablets and phones)
   - Android Chrome (tablets and phones)
   - Tablet-optimized browsers

## Success Criteria
- [ ] Vertical swipes activate/deactivate beads as specified
- [ ] Existing tap functionality continues to work
- [ ] Smooth gesture recognition without false positives
- [ ] Maintains authentic abacus behavior patterns
- [ ] No impact on existing Playwright tests

## Implementation Notes
- Leverage existing touch event structure in `DraggableBead.tsx`
- Use touch coordinate tracking for distance/velocity calculations
- Integrate with existing bead state management in `SempoaBoard.tsx`
- Preserve current animation timing and visual feedback