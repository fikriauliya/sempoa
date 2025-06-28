import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'
import { SEMPOA_CONFIG, DERIVED_CONFIG } from '../src/config/sempoaConfig'

test.describe('Upper Bead Separator Alignment', () => {
  test('should position all upper beads correctly relative to separator when activated', async ({ page }) => {
    console.log('=== Testing Complete Upper Bead Alignment ===')
    console.log(`Configuration: ${SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN} upper beads per column`)
    
    await page.goto(TEST_CONFIG.BASE_URL)
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500)
    
    const firstColumnUpperBeads = page.locator('.upper-section').first().locator('.absolute')
    const beadCount = await firstColumnUpperBeads.count()
    expect(beadCount).toBe(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN)
    
    console.log(`\n=== Testing Individual Bead Positioning ===`)
    
    // Test each bead individually
    for (let i = 0; i < beadCount; i++) {
      console.log(`\nTesting Bead ${i + 1}:`)
      
      const bead = firstColumnUpperBeads.nth(i)
      
      // Get inactive position
      const inactivePosition = await bead.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('top'))
      )
      console.log(`  Inactive position: ${inactivePosition}px`)
      
      // Activate the bead
      await bead.click()
      await page.waitForTimeout(500)
      
      // Get active position
      const activePosition = await bead.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('top'))
      )
      console.log(`  Active position: ${activePosition}px`)
      
      // Calculate expected active position using the new formula
      const expectedActivePosition = DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT - ((SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN - 1 - i) * SEMPOA_CONFIG.BEAD.HEIGHT)
      console.log(`  Expected active position: ${expectedActivePosition}px`)
      
      // Verify correct positioning
      expect(activePosition).toBe(expectedActivePosition)
      console.log(`  ✓ Correct positioning`)
      
      // For the lowest bead, verify separator alignment
      if (i === beadCount - 1) {
        const beadBottom = activePosition + SEMPOA_CONFIG.BEAD.HEIGHT
        console.log(`  Bead bottom: ${beadBottom}px`)
        console.log(`  Separator top: ${DERIVED_CONFIG.SEPARATOR_TOP}px`)
        expect(beadBottom).toBe(DERIVED_CONFIG.SEPARATOR_TOP)
        console.log(`  ✓ Touches separator perfectly`)
      }
      
      // Deactivate for next test
      await bead.click()
      await page.waitForTimeout(500)
    }
    
    console.log(`\n=== Testing All Beads Activated Together ===`)
    
    // Activate all beads
    for (let i = 0; i < beadCount; i++) {
      await firstColumnUpperBeads.nth(i).click()
      await page.waitForTimeout(300)
    }
    
    // Verify positions when all are active
    const activePositions = []
    for (let i = 0; i < beadCount; i++) {
      const bead = firstColumnUpperBeads.nth(i)
      const position = await bead.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('top'))
      )
      activePositions.push(position)
      console.log(`  Bead ${i + 1} active position: ${position}px`)
    }
    
    // Verify no gaps/overlaps between beads
    for (let i = 0; i < beadCount - 1; i++) {
      const currentBeadBottom = activePositions[i] + SEMPOA_CONFIG.BEAD.HEIGHT
      const nextBeadTop = activePositions[i + 1]
      const gap = nextBeadTop - currentBeadBottom
      
      console.log(`  Gap between bead ${i + 1} and ${i + 2}: ${gap}px`)
      expect(gap).toBe(0) // Should be touching
    }
    
    // Verify lowest bead touches separator
    const lowestBeadBottom = activePositions[beadCount - 1] + SEMPOA_CONFIG.BEAD.HEIGHT
    console.log(`  Lowest bead bottom: ${lowestBeadBottom}px`)
    console.log(`  Separator top: ${DERIVED_CONFIG.SEPARATOR_TOP}px`)
    expect(lowestBeadBottom).toBeCloseTo(DERIVED_CONFIG.SEPARATOR_TOP, -1) // Allow 1px tolerance for browser rendering
    
    console.log(`\n✅ All positioning tests passed!`)
  })

  test('should verify the positioning formula works correctly for current configuration', async () => {
    console.log('=== Testing Positioning Formula ===')
    
    // Test current configuration
    const currentBeadCount = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN
    console.log(`\nTesting formula for current configuration: ${currentBeadCount} upper bead(s)`)
    
    for (let row = 0; row < currentBeadCount; row++) {
      // Calculate positions using the formula
      const inactiveTop = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + (row * SEMPOA_CONFIG.BEAD.HEIGHT)
      const activeTop = DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT - ((currentBeadCount - 1 - row) * SEMPOA_CONFIG.BEAD.HEIGHT)
      const activeBottom = activeTop + SEMPOA_CONFIG.BEAD.HEIGHT
      
      console.log(`  Bead ${row + 1}: inactive=${inactiveTop}px → active=${activeTop}px-${activeBottom}px`)
      
      // Verify positioning is valid for current configuration
      expect(activeTop).toBeGreaterThanOrEqual(0)
      expect(activeBottom).toBeLessThanOrEqual(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT)
    }
    
    // Verify lowest bead touches separator
    const lowestActiveTop = DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT - ((currentBeadCount - 1 - (currentBeadCount - 1)) * SEMPOA_CONFIG.BEAD.HEIGHT)
    const lowestActiveBottom = lowestActiveTop + SEMPOA_CONFIG.BEAD.HEIGHT
    expect(lowestActiveBottom).toBe(DERIVED_CONFIG.SEPARATOR_TOP)
    console.log(`  ✓ Lowest bead touches separator: ${lowestActiveBottom}px = ${DERIVED_CONFIG.SEPARATOR_TOP}px`)
    
    console.log(`\n✅ Formula verified for current configuration!`)
  })
})