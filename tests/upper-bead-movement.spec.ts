import { test, expect } from '@playwright/test'
import { SEMPOA_CONFIG, DERIVED_CONFIG } from '../src/config/sempoaConfig'

test.describe('Upper Bead Movement', () => {
  test('should move upper beads only one bead height down when activated', async ({ page }) => {
    console.log('=== Testing Upper Bead Movement ===')
    console.log(`Configuration: ${SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN} upper beads per column`)
    
    await page.goto('http://localhost:5173')
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500)
    
    // Test first column upper beads
    const firstColumnUpperBeads = page.locator('.upper-section').first().locator('.absolute')
    const beadCount = await firstColumnUpperBeads.count()
    
    console.log(`First column has ${beadCount} upper bead(s)`)
    expect(beadCount).toBe(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN)
    
    // Check initial (inactive) positions
    console.log('\n=== Initial (Inactive) Positions ===')
    const initialPositions = []
    for (let i = 0; i < beadCount; i++) {
      const bead = firstColumnUpperBeads.nth(i)
      const position = await bead.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('top'))
      )
      initialPositions.push(position)
      
      const expectedPosition = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + (i * SEMPOA_CONFIG.BEAD.HEIGHT)
      console.log(`Bead ${i + 1}: actual=${position}px, expected=${expectedPosition}px`)
      expect(position).toBe(expectedPosition)
    }
    
    // Activate first upper bead and check movement
    console.log('\n=== Activating First Upper Bead ===')
    const firstBead = firstColumnUpperBeads.nth(0)
    await firstBead.click()
    await page.waitForTimeout(500) // Wait for animation
    
    const activePosition = await firstBead.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('top'))
    )
    
    console.log(`First bead active position: ${activePosition}px`)
    console.log(`Initial position was: ${initialPositions[0]}px`)
    console.log(`Movement: ${activePosition - initialPositions[0]}px`)
    console.log(`Expected movement: ${SEMPOA_CONFIG.BEAD.HEIGHT}px (one bead height)`)
    
    // The bead should move exactly one bead height down
    const expectedActivePosition = initialPositions[0] + SEMPOA_CONFIG.BEAD.HEIGHT
    console.log(`Expected active position: ${expectedActivePosition}px`)
    
    expect(activePosition).toBe(expectedActivePosition)
    
    // If there are multiple beads, test the second one too
    if (beadCount > 1) {
      console.log('\n=== Activating Second Upper Bead ===')
      const secondBead = firstColumnUpperBeads.nth(1)
      await secondBead.click()
      await page.waitForTimeout(500)
      
      const secondActivePosition = await secondBead.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('top'))
      )
      
      console.log(`Second bead active position: ${secondActivePosition}px`)
      console.log(`Initial position was: ${initialPositions[1]}px`)
      console.log(`Movement: ${secondActivePosition - initialPositions[1]}px`)
      
      // Second bead should also move exactly one bead height down
      const expectedSecondActivePosition = initialPositions[1] + SEMPOA_CONFIG.BEAD.HEIGHT
      console.log(`Expected active position: ${expectedSecondActivePosition}px`)
      
      expect(secondActivePosition).toBe(expectedSecondActivePosition)
      
      // Check gap between active beads
      const gapBetweenActiveBeads = secondActivePosition - (activePosition + SEMPOA_CONFIG.BEAD.HEIGHT)
      console.log(`Gap between active beads: ${gapBetweenActiveBeads}px`)
      expect(gapBetweenActiveBeads).toBe(0) // Should be touching
    }
    
    console.log('\n✓ All upper beads move correctly when activated')
  })

  test('should demonstrate current problem with UPPER_ACTIVE_TOP calculation', async ({ page }) => {
    console.log('=== Demonstrating Current Problem ===')
    
    await page.goto('http://localhost:5173')
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500)
    
    // Show current calculation
    console.log(`\nCurrent UPPER_ACTIVE_TOP calculation:`)
    console.log(`SEPARATOR.CENTER_POSITION: ${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION}px`)
    console.log(`SEPARATOR.HEIGHT: ${SEMPOA_CONFIG.SEPARATOR.HEIGHT}px`)
    console.log(`BEAD.HEIGHT: ${SEMPOA_CONFIG.BEAD.HEIGHT}px`)
    console.log(`UPPER_ACTIVE_TOP = ${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION} - (${SEMPOA_CONFIG.SEPARATOR.HEIGHT}/2) - ${SEMPOA_CONFIG.BEAD.HEIGHT}`)
    console.log(`UPPER_ACTIVE_TOP = ${DERIVED_CONFIG.UPPER_ACTIVE_TOP}px`)
    
    // Show what this means for multiple beads
    console.log(`\nFor ${SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN} upper beads:`)
    for (let row = 0; row < SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN; row++) {
      const inactiveTop = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + (row * SEMPOA_CONFIG.BEAD.HEIGHT)
      const currentActiveTop = DERIVED_CONFIG.UPPER_ACTIVE_TOP + (row * SEMPOA_CONFIG.BEAD.HEIGHT)
      const movement = currentActiveTop - inactiveTop
      
      console.log(`Bead ${row + 1}:`)
      console.log(`  Inactive: ${inactiveTop}px`)
      console.log(`  Current active: ${currentActiveTop}px`)
      console.log(`  Movement: ${movement}px`)
      console.log(`  Expected movement: ${SEMPOA_CONFIG.BEAD.HEIGHT}px (one bead height)`)
      
      if (movement !== SEMPOA_CONFIG.BEAD.HEIGHT) {
        console.log(`  ❌ Problem: moves ${movement}px instead of ${SEMPOA_CONFIG.BEAD.HEIGHT}px`)
      } else {
        console.log(`  ✓ Correct movement`)
      }
    }
    
    console.log(`\n=== Proposed Solution ===`)
    console.log(`Instead of: UPPER_ACTIVE_TOP + (row × BEAD_HEIGHT)`)
    console.log(`Use: UPPER_INACTIVE_TOP + (row × BEAD_HEIGHT) + BEAD_HEIGHT`)
    console.log(`Or: (row + 1) × BEAD_HEIGHT`)
    
    for (let row = 0; row < SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN; row++) {
      const inactiveTop = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + (row * SEMPOA_CONFIG.BEAD.HEIGHT)
      const proposedActiveTop = (row + 1) * SEMPOA_CONFIG.BEAD.HEIGHT
      const movement = proposedActiveTop - inactiveTop
      
      console.log(`Bead ${row + 1} with proposed formula:`)
      console.log(`  Inactive: ${inactiveTop}px`)
      console.log(`  Proposed active: ${proposedActiveTop}px`)
      console.log(`  Movement: ${movement}px ✓`)
    }
  })
})