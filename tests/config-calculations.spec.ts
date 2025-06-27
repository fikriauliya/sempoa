import { test, expect } from '@playwright/test'
import { SEMPOA_CONFIG, DERIVED_CONFIG } from '../src/config/sempoaConfig'

test.describe('Configuration Calculations', () => {
  test('DERIVED_CONFIG calculations should match expected mathematical formulas', async () => {
    // Test separator boundaries
    const expectedSeparatorTop = SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION - (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2)
    expect(DERIVED_CONFIG.SEPARATOR_TOP).toBe(expectedSeparatorTop)
    console.log(`✓ SEPARATOR_TOP: ${DERIVED_CONFIG.SEPARATOR_TOP} = ${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION} - (${SEMPOA_CONFIG.SEPARATOR.HEIGHT}/2)`)

    const expectedSeparatorBottom = SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION + (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2)
    expect(DERIVED_CONFIG.SEPARATOR_BOTTOM).toBe(expectedSeparatorBottom)
    console.log(`✓ SEPARATOR_BOTTOM: ${DERIVED_CONFIG.SEPARATOR_BOTTOM} = ${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION} + (${SEMPOA_CONFIG.SEPARATOR.HEIGHT}/2)`)

    // Test upper bead active position
    const expectedUpperActiveTop = SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION - 
      (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2) - 
      SEMPOA_CONFIG.BEAD.HEIGHT
    expect(DERIVED_CONFIG.UPPER_ACTIVE_TOP).toBe(expectedUpperActiveTop)
    console.log(`✓ UPPER_ACTIVE_TOP: ${DERIVED_CONFIG.UPPER_ACTIVE_TOP} = ${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION} - (${SEMPOA_CONFIG.SEPARATOR.HEIGHT}/2) - ${SEMPOA_CONFIG.BEAD.HEIGHT}`)

    // Test lower bead active position
    const expectedLowerActiveTop = SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION + 
      (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2) - 
      SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT
    expect(DERIVED_CONFIG.LOWER_ACTIVE_TOP).toBe(expectedLowerActiveTop)
    console.log(`✓ LOWER_ACTIVE_TOP: ${DERIVED_CONFIG.LOWER_ACTIVE_TOP} = ${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION} + (${SEMPOA_CONFIG.SEPARATOR.HEIGHT}/2) - ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}`)

    // Test lower bead positioning
    const expectedLowerInactiveTop = SEMPOA_CONFIG.BEAD.HEIGHT
    expect(DERIVED_CONFIG.LOWER_INACTIVE_TOP).toBe(expectedLowerInactiveTop)
    console.log(`✓ LOWER_INACTIVE_TOP: ${DERIVED_CONFIG.LOWER_INACTIVE_TOP} = ${SEMPOA_CONFIG.BEAD.HEIGHT}`)

    const expectedLowerBeadSpacing = SEMPOA_CONFIG.BEAD.HEIGHT
    expect(DERIVED_CONFIG.LOWER_BEAD_SPACING).toBe(expectedLowerBeadSpacing)
    console.log(`✓ LOWER_BEAD_SPACING: ${DERIVED_CONFIG.LOWER_BEAD_SPACING} = ${SEMPOA_CONFIG.BEAD.HEIGHT}`)

    // Test main container height
    const expectedMainContainerHeight = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT
    expect(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT).toBe(expectedMainContainerHeight)
    console.log(`✓ MAIN_CONTAINER_HEIGHT: ${DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT} = ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT} + ${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}`)

    // Test rod height
    const expectedRodHeight = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT
    expect(DERIVED_CONFIG.ROD_HEIGHT).toBe(expectedRodHeight)
    console.log(`✓ ROD_HEIGHT: ${DERIVED_CONFIG.ROD_HEIGHT} = ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT} + ${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}`)

    // Test total board dimensions
    const expectedTotalBoardHeight = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT
    expect(DERIVED_CONFIG.TOTAL_BOARD_HEIGHT).toBe(expectedTotalBoardHeight)
    console.log(`✓ TOTAL_BOARD_HEIGHT: ${DERIVED_CONFIG.TOTAL_BOARD_HEIGHT} = ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT} + ${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}`)

    const expectedTotalBoardWidth = SEMPOA_CONFIG.COLUMNS * SEMPOA_CONFIG.COLUMN.WIDTH
    expect(DERIVED_CONFIG.TOTAL_BOARD_WIDTH).toBe(expectedTotalBoardWidth)
    console.log(`✓ TOTAL_BOARD_WIDTH: ${DERIVED_CONFIG.TOTAL_BOARD_WIDTH} = ${SEMPOA_CONFIG.COLUMNS} × ${SEMPOA_CONFIG.COLUMN.WIDTH}`)
  })

  test('separator positioning should create no-gap, no-intersection layout', async () => {
    // Upper bead (when active) bottom should touch separator top
    const upperBeadBottom = DERIVED_CONFIG.UPPER_ACTIVE_TOP + SEMPOA_CONFIG.BEAD.HEIGHT
    expect(upperBeadBottom).toBe(DERIVED_CONFIG.SEPARATOR_TOP)
    console.log(`✓ Upper bead bottom (${upperBeadBottom}) touches separator top (${DERIVED_CONFIG.SEPARATOR_TOP})`)

    // Lower bead (when active) top should touch separator bottom  
    const lowerBeadTop = DERIVED_CONFIG.LOWER_ACTIVE_TOP + SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT
    expect(lowerBeadTop).toBe(DERIVED_CONFIG.SEPARATOR_BOTTOM)
    console.log(`✓ Lower bead top (${lowerBeadTop}) touches separator bottom (${DERIVED_CONFIG.SEPARATOR_BOTTOM})`)

    // Verify no overlap
    expect(upperBeadBottom).toBeLessThanOrEqual(DERIVED_CONFIG.SEPARATOR_TOP)
    expect(lowerBeadTop).toBeGreaterThanOrEqual(DERIVED_CONFIG.SEPARATOR_BOTTOM)
    console.log(`✓ No overlap: upper bead ≤ separator ≤ lower bead`)
  })

  test('rod height should span full board container', async () => {
    // Rod height should equal main container height
    expect(DERIVED_CONFIG.ROD_HEIGHT).toBe(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT)
    
    // Rod height should equal calculated section heights (no extra space)
    const calculatedSectionTotal = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT
    expect(DERIVED_CONFIG.ROD_HEIGHT).toBe(calculatedSectionTotal)
    expect(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT).toBe(calculatedSectionTotal)
    
    console.log(`✓ Rod height (${DERIVED_CONFIG.ROD_HEIGHT}px) exactly matches container height`)
    console.log(`✓ No extra space: container = sections = ${calculatedSectionTotal}px`)
  })

  test('bead spacing should allow proper stacking', async () => {
    // Lower bead spacing should be >= bead height (for no intersection)
    expect(DERIVED_CONFIG.LOWER_BEAD_SPACING).toBeGreaterThanOrEqual(SEMPOA_CONFIG.BEAD.HEIGHT)
    
    // Spacing should equal bead height (no intersection, minimal gap)
    const gap = SEMPOA_CONFIG.BEAD.HEIGHT - DERIVED_CONFIG.LOWER_BEAD_SPACING
    expect(gap).toBe(0) // Should be exactly 0px gap (touching but not overlapping)
    
    console.log(`✓ Bead spacing (${DERIVED_CONFIG.LOWER_BEAD_SPACING}px) with ${gap}px gap (no intersection)`)
    
    // Verify 4 beads can fit within the main container
    const bottomBeadPosition = DERIVED_CONFIG.LOWER_INACTIVE_TOP + (3 * DERIVED_CONFIG.LOWER_BEAD_SPACING) + SEMPOA_CONFIG.BEAD.HEIGHT
    const bottomBeadPositionFromContainerTop = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + bottomBeadPosition
    expect(bottomBeadPositionFromContainerTop).toBeLessThanOrEqual(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT)
    console.log(`✓ 4 beads fit in main container: bottom bead at ${bottomBeadPositionFromContainerTop}px ≤ ${DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT}px`)
    
    // This test may fail if beads don't fit properly - this indicates configuration needs adjustment
    if (bottomBeadPositionFromContainerTop > DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT) {
      console.log(`  ⚠️  Bottom bead extends beyond container - configuration needs adjustment`)
    }
  })

  test('upper section dimensions should accommodate upper bead movement', async () => {
    // Upper bead should fit in upper section when inactive
    const upperInactiveBottom = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + SEMPOA_CONFIG.BEAD.HEIGHT
    expect(upperInactiveBottom).toBeLessThanOrEqual(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT)
    
    // Upper bead should fit in upper section when active
    const upperActiveBottom = DERIVED_CONFIG.UPPER_ACTIVE_TOP + SEMPOA_CONFIG.BEAD.HEIGHT
    expect(upperActiveBottom).toBeLessThanOrEqual(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT)
    
    console.log(`✓ Upper bead fits when inactive: ${upperInactiveBottom}px ≤ ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
    console.log(`✓ Upper bead fits when active: ${upperActiveBottom}px ≤ ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
  })

  test('configuration values should be positive and reasonable', async () => {
    // All base config values should be positive
    expect(SEMPOA_CONFIG.BEAD.WIDTH).toBeGreaterThan(0)
    expect(SEMPOA_CONFIG.BEAD.HEIGHT).toBeGreaterThan(0)
    expect(SEMPOA_CONFIG.BEAD.HOLE_SIZE).toBeGreaterThan(0)
    expect(SEMPOA_CONFIG.COLUMN.WIDTH).toBeGreaterThan(0)
    expect(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT).toBeGreaterThan(0)
    expect(SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT).toBeGreaterThan(0)
    expect(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT).toBeGreaterThan(0)
    expect(SEMPOA_CONFIG.ROD.WIDTH).toBeGreaterThan(0)
    expect(SEMPOA_CONFIG.SEPARATOR.HEIGHT).toBeGreaterThan(0)

    // All derived values should be positive or zero (positions can be 0)
    expect(DERIVED_CONFIG.SEPARATOR_TOP).toBeGreaterThanOrEqual(0)
    expect(DERIVED_CONFIG.SEPARATOR_BOTTOM).toBeGreaterThan(0)
    expect(DERIVED_CONFIG.UPPER_ACTIVE_TOP).toBeGreaterThanOrEqual(0)
    expect(DERIVED_CONFIG.LOWER_ACTIVE_TOP).toBeGreaterThanOrEqual(0)
    expect(DERIVED_CONFIG.LOWER_INACTIVE_TOP).toBeGreaterThan(0)
    expect(DERIVED_CONFIG.LOWER_BEAD_SPACING).toBeGreaterThan(0)
    expect(DERIVED_CONFIG.ROD_HEIGHT).toBeGreaterThan(0)
    expect(DERIVED_CONFIG.TOTAL_BOARD_HEIGHT).toBeGreaterThan(0)
    
    console.log(`✓ All configuration values are positive and reasonable`)
  })

  test('mathematical relationships should be logically consistent', async () => {
    // Separator center should be between separator top and bottom
    expect(SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION).toBeGreaterThan(DERIVED_CONFIG.SEPARATOR_TOP)
    expect(SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION).toBeLessThan(DERIVED_CONFIG.SEPARATOR_BOTTOM)
    
    // Upper active position should be above upper inactive position
    expect(DERIVED_CONFIG.UPPER_ACTIVE_TOP).toBeGreaterThan(SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP)
    
    // Rod should be tall enough to span both sections
    expect(DERIVED_CONFIG.ROD_HEIGHT).toBeGreaterThanOrEqual(DERIVED_CONFIG.TOTAL_BOARD_HEIGHT)
    
    // Column width should be wider than bead width (for centering)
    expect(SEMPOA_CONFIG.COLUMN.WIDTH).toBeGreaterThan(SEMPOA_CONFIG.BEAD.WIDTH)
    
    // Rod should be narrower than column (to fit inside)
    expect(SEMPOA_CONFIG.ROD.WIDTH).toBeLessThan(SEMPOA_CONFIG.COLUMN.WIDTH)
    
    console.log(`✓ All mathematical relationships are logically consistent`)
  })

  test('beads should not intersect each other', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Reset board to ensure clean state
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500)
    
    // Test mathematical intersection in configuration first
    console.log(`Testing bead intersection in configuration...`)
    console.log(`Bead height: ${SEMPOA_CONFIG.BEAD.HEIGHT}px`)
    console.log(`Bead spacing: ${DERIVED_CONFIG.LOWER_BEAD_SPACING}px`)
    
    // For beads not to intersect, spacing should be >= bead height
    const expectedMinSpacing = SEMPOA_CONFIG.BEAD.HEIGHT
    expect(DERIVED_CONFIG.LOWER_BEAD_SPACING).toBeGreaterThanOrEqual(expectedMinSpacing)
    console.log(`✓ Bead spacing (${DERIVED_CONFIG.LOWER_BEAD_SPACING}px) >= bead height (${expectedMinSpacing}px)`)
    
    // Test visual intersection by checking bead positions
    console.log(`\nTesting visual bead intersection...`)
    
    // Get lower beads in first column
    const lowerBeads = page.locator('.lower-section').first().locator('.absolute')
    const beadCount = await lowerBeads.count()
    expect(beadCount).toBe(SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN)
    
    // Check each pair of adjacent beads for intersection
    for (let i = 0; i < beadCount - 1; i++) {
      const currentBead = lowerBeads.nth(i)
      const nextBead = lowerBeads.nth(i + 1)
      
      // Get bounding boxes
      const currentBox = await currentBead.boundingBox()
      const nextBox = await nextBead.boundingBox()
      
      expect(currentBox).toBeTruthy()
      expect(nextBox).toBeTruthy()
      
      if (currentBox && nextBox) {
        const currentBottom = currentBox.y + currentBox.height
        const nextTop = nextBox.y
        
        // Beads should not overlap: current bead bottom should be <= next bead top
        console.log(`Bead ${i} bottom: ${currentBottom}px, Bead ${i+1} top: ${nextTop}px`)
        expect(currentBottom).toBeLessThanOrEqual(nextTop)
        
        // Calculate actual gap
        const gap = nextTop - currentBottom
        console.log(`Gap between bead ${i} and ${i+1}: ${gap}px`)
        expect(gap).toBeGreaterThanOrEqual(0) // No negative gap (overlap)
      }
    }
    
    // Test configuration calculation vs actual visual spacing
    console.log(`\nTesting calculated vs actual spacing...`)
    const firstBead = lowerBeads.nth(0)
    const secondBead = lowerBeads.nth(1)
    
    const firstBox = await firstBead.boundingBox()
    const secondBox = await secondBead.boundingBox()
    
    if (firstBox && secondBox) {
      const actualSpacing = secondBox.y - firstBox.y
      const expectedSpacing = DERIVED_CONFIG.LOWER_BEAD_SPACING
      
      console.log(`Actual visual spacing: ${actualSpacing}px`)
      console.log(`Expected config spacing: ${expectedSpacing}px`)
      expect(actualSpacing).toBe(expectedSpacing)
    }
  })
})