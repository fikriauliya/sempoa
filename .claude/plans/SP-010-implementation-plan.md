# SP-010: Multi-Touch Swipe Gestures Implementation Plan

## Task Description
Enable touch swipe gestures for intuitive bead manipulation - vertical swipes to move beads up/down on tablets and mobile devices with haptic feedback. Also enable multi-finger gestures to move multiple beads simultaneously across different columns.

## Implementation Strategy

### 1. Create Feature Branch
- Switch from main to new feature branch `feature/sp-010-touch-gestures`

### 2. Install Dependencies
- Add `@use-gesture/react` to package.json dependencies

### 3. Multi-Touch Architecture

**Individual Bead Gestures (`DraggableBead.tsx`):**
- Use `useDrag` from @use-gesture/react for swipe detection
- Vertical swipe up: Activate bead (call existing toggleBead)
- Vertical swipe down: Deactivate bead (call existing toggleBead)
- Each bead handles its own touch independently

**Board-Level Multi-Touch Coordination (`SempoaBoard.tsx`):**
- Track multiple simultaneous touch points across all beads
- Allow multiple beads to be swiped simultaneously
- No pinch gesture needed - just multi-touch support
- Users can touch 5+ beads at once and swipe them all

### 4. Gesture Behaviors

**Single Touch Swipe:**
- Works exactly like current touch: tap or swipe individual beads
- Maintains existing bead logic (cascade behavior for lower beads)

**Multi-Touch Swipe:**
- User touches multiple beads across different columns simultaneously
- Each touched bead responds to its own swipe direction independently
- All gestures processed in parallel
- No interference between simultaneous touches

**Example Use Cases:**
- Touch 3 beads in different columns, swipe all up → all activate
- Touch upper bead in col 1 + lower bead in col 5, swipe both → both respond
- Touch any combination of beads across the board for simultaneous control

### 5. Technical Implementation
- Each `DraggableBead` uses independent `useDrag` hook
- Prevent browser default behaviors (zoom, scroll) during multi-touch
- Add haptic feedback for each gesture
- Maintain existing audio feedback per bead interaction

### 6. Enhanced UX
- Increase touch target sizes for better multi-touch experience
- Visual feedback during multi-touch operations
- Smooth animations for all simultaneous bead movements

### 7. Testing Strategy
**Component Tests:**
- Test individual bead swipe detection
- Test multi-touch event handling
- Mock @use-gesture/react for reliable testing

**E2E Tests:**
- Test multi-touch scenarios with Playwright touch simulation
- Verify no interference between simultaneous gestures
- Test prevention of browser zoom during multi-touch

## Implementation Progress
- [x] Plan created and documented
- [ ] Feature branch created
- [ ] Dependencies installed
- [ ] Component tests written (TDD)
- [ ] Swipe gestures implemented
- [ ] Multi-touch coordination added
- [ ] Haptic feedback integrated
- [ ] E2E tests written
- [ ] Task marked complete in TODOS.md

## Technical Notes
- Leverages existing `toggleBead` function for consistency
- Maintains existing audio feedback system
- Preserves current drag-and-drop functionality
- Uses @use-gesture/react for production-ready gesture detection