import { test, expect } from '@playwright/test'
import { SEMPOA_CONFIG, DERIVED_CONFIG } from '../src/config/sempoaConfig'

test.describe('Upper Bead Separator Intersection', () => {
  test('should have lowest active upper bead touch but not intersect horizontal separator', async ({ page }) => {
    console.log('=== Testing Upper Bead - Separator Intersection ===')
    console.log(`Configuration: ${SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN} upper beads per column`)
    console.log(`Upper section height: ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
    console.log(`Separator position: ${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION}px`)
    console.log(`Separator top: ${DERIVED_CONFIG.SEPARATOR_TOP}px`)
    console.log(`Separator bottom: ${DERIVED_CONFIG.SEPARATOR_BOTTOM}px`)
    
    await page.goto('http://localhost:5173')
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500)
    
    // Test with 2 upper beads - activate the lowest one (second bead)
    const firstColumnUpperBeads = page.locator('.upper-section').first().locator('.absolute')
    const beadCount = await firstColumnUpperBeads.count()
    expect(beadCount).toBe(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN)
    
    console.log(`\n=== Testing Lowest Upper Bead (Bead ${beadCount}) ===`)
    
    // Activate the lowest upper bead (last one in the array)
    const lowestUpperBead = firstColumnUpperBeads.nth(beadCount - 1)
    await lowestUpperBead.click()
    await page.waitForTimeout(500)
    
    // Get the active position of the lowest upper bead
    const lowestBeadBox = await lowestUpperBead.boundingBox()
    expect(lowestBeadBox).toBeTruthy()
    
    if (lowestBeadBox) {
      const beadTop = lowestBeadBox.y
      const beadBottom = lowestBeadBox.y + lowestBeadBox.height
      
      console.log(`\nLowest upper bead (active):`)
      console.log(`  Top: ${beadTop}px`)
      console.log(`  Bottom: ${beadBottom}px`)
      console.log(`  Height: ${lowestBeadBox.height}px`)
      
      // Get separator position relative to the same coordinate system
      const upperSection = page.locator('.upper-section').first()
      const upperSectionBox = await upperSection.boundingBox()
      expect(upperSectionBox).toBeTruthy()
      
      if (upperSectionBox) {
        // Calculate separator position in the same coordinate system as the bead
        const separatorTopAbsolute = upperSectionBox.y + DERIVED_CONFIG.SEPARATOR_TOP
        const separatorBottomAbsolute = upperSectionBox.y + DERIVED_CONFIG.SEPARATOR_BOTTOM
        
        console.log(`\nHorizontal separator:`)
        console.log(`  Top: ${separatorTopAbsolute}px`)
        console.log(`  Bottom: ${separatorBottomAbsolute}px`)
        console.log(`  Height: ${SEMPOA_CONFIG.SEPARATOR.HEIGHT}px`)
        
        // Check for intersection
        const gapBetweenBeadAndSeparator = separatorTopAbsolute - beadBottom
        console.log(`\nGap between bead bottom and separator top: ${gapBetweenBeadAndSeparator}px`)
        
        if (gapBetweenBeadAndSeparator < 0) {
          console.log(`❌ INTERSECTION: Bead overlaps separator by ${-gapBetweenBeadAndSeparator}px`)
        } else if (gapBetweenBeadAndSeparator === 0) {
          console.log(`✓ PERFECT: Bead touches separator (no gap, no intersection)`)
        } else {
          console.log(`⚠️  GAP: ${gapBetweenBeadAndSeparator}px gap between bead and separator`)
        }
        
        // The test should enforce that the bead touches but doesn't intersect the separator
        // This means gapBetweenBeadAndSeparator should be exactly 0
        expect(gapBetweenBeadAndSeparator).toBe(0)
        
        console.log(`\n=== Additional Verification ===`)
        
        // Verify bead bottom position matches separator top
        console.log(`Expected: Bead bottom (${beadBottom}) should equal separator top (${separatorTopAbsolute})`)
        expect(beadBottom).toBeCloseTo(separatorTopAbsolute, 1) // Allow 1px tolerance for browser differences
        
        // Verify no intersection (bead bottom <= separator top)
        expect(beadBottom).toBeLessThanOrEqual(separatorTopAbsolute)
        console.log(`✓ No intersection verified`)
      }
    }
  })

  test('should show current positioning calculation and expected fix', async () => {
    console.log('=== Analyzing Current Positioning vs Expected ===')
    
    const beadHeight = SEMPOA_CONFIG.BEAD.HEIGHT
    const upperBeadsCount = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN
    const separatorTop = DERIVED_CONFIG.SEPARATOR_TOP
    
    console.log(`\nConfiguration:`)
    console.log(`Bead height: ${beadHeight}px`)
    console.log(`Upper beads per column: ${upperBeadsCount}`)
    console.log(`Separator top: ${separatorTop}px`)
    
    // Calculate current positioning for the lowest upper bead
    const lowestBeadRow = upperBeadsCount - 1
    const currentInactiveTop = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + (lowestBeadRow * beadHeight)
    const currentActiveTop = currentInactiveTop + beadHeight // Current formula
    const currentActiveBottom = currentActiveTop + beadHeight
    
    console.log(`\nLowest upper bead (row ${lowestBeadRow}):`);
    console.log(`Current inactive top: ${currentInactiveTop}px`)
    console.log(`Current active top: ${currentActiveTop}px`)
    console.log(`Current active bottom: ${currentActiveBottom}px`)
    
    // Calculate what the positioning should be for perfect separator alignment
    const expectedActiveBottom = separatorTop
    const expectedActiveTop = expectedActiveBottom - beadHeight
    const requiredMovement = expectedActiveTop - currentInactiveTop
    
    console.log(`\nFor perfect separator alignment:`)
    console.log(`Expected active top: ${expectedActiveTop}px`)
    console.log(`Expected active bottom: ${expectedActiveBottom}px (= separator top)`)
    console.log(`Required movement: ${requiredMovement}px`)
    
    // Show the issue
    const currentGap = separatorTop - currentActiveBottom
    console.log(`\nCurrent gap/intersection:`)
    console.log(`Current active bottom: ${currentActiveBottom}px`)
    console.log(`Separator top: ${separatorTop}px`)
    console.log(`Gap: ${currentGap}px`)
    
    if (currentGap < 0) {
      console.log(`❌ Problem: ${-currentGap}px intersection`)
    } else if (currentGap === 0) {
      console.log(`✓ Perfect: No gap, no intersection`)
    } else {
      console.log(`⚠️  Gap: ${currentGap}px space between bead and separator`)
    }
    
    console.log(`\n=== Proposed Solution ===`)
    console.log(`Instead of moving each bead exactly one bead height,`)
    console.log(`the lowest bead should be positioned to touch the separator.`)
    console.log(``)
    console.log(`Current formula: inactive_top + bead_height`)
    console.log(`Proposed formula for lowest bead: separator_top - bead_height`)
    console.log(``)
    console.log(`For ${upperBeadsCount} upper beads:`)
    
    for (let row = 0; row < upperBeadsCount; row++) {
      const inactiveTop = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + (row * beadHeight)
      
      let proposedActiveTop;
      if (row === upperBeadsCount - 1) {
        // Lowest bead: position to touch separator
        proposedActiveTop = separatorTop - beadHeight
      } else {
        // Other beads: maintain spacing above the lowest bead
        const lowestActiveTop = separatorTop - beadHeight
        proposedActiveTop = lowestActiveTop - ((upperBeadsCount - 1 - row) * beadHeight)
      }
      
      const proposedMovement = proposedActiveTop - inactiveTop
      
      console.log(`Bead ${row + 1}: inactive=${inactiveTop}px → active=${proposedActiveTop}px (${proposedMovement}px movement)`)
    }
  })
})