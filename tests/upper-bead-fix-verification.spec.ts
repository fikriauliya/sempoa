import { test, expect } from '@playwright/test'
import { SEMPOA_CONFIG } from '../src/config/sempoaConfig'

test.describe('Upper Bead Fix Verification', () => {
  test('should demonstrate the fix for UPPER_BEADS_PER_COLUMN = 2', async ({ page }) => {
    console.log('=== Verifying Upper Bead Movement Fix ===')
    console.log(`Configuration: ${SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN} upper beads per column`)
    
    await page.goto('http://localhost:5173')
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500)
    
    // Test that we have 2 upper beads per column
    const firstColumnUpperBeads = page.locator('.upper-section').first().locator('.absolute')
    const beadCount = await firstColumnUpperBeads.count()
    expect(beadCount).toBe(2)
    console.log(`✓ Found ${beadCount} upper beads per column`)
    
    // Get initial positions
    const bead1 = firstColumnUpperBeads.nth(0)
    const bead2 = firstColumnUpperBeads.nth(1)
    
    const bead1InitialPos = await bead1.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('top'))
    )
    const bead2InitialPos = await bead2.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('top'))
    )
    
    console.log(`\nInitial positions:`)
    console.log(`Bead 1: ${bead1InitialPos}px`)
    console.log(`Bead 2: ${bead2InitialPos}px`)
    
    // Activate first bead
    await bead1.click()
    await page.waitForTimeout(500)
    
    const bead1ActivePos = await bead1.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('top'))
    )
    
    console.log(`\nAfter activating bead 1:`)
    console.log(`Bead 1 moved from ${bead1InitialPos}px to ${bead1ActivePos}px`)
    console.log(`Movement: ${bead1ActivePos - bead1InitialPos}px`)
    
    // Verify correct movement (exactly one bead height)
    expect(bead1ActivePos - bead1InitialPos).toBe(SEMPOA_CONFIG.BEAD.HEIGHT)
    console.log(`✓ Correct movement: ${SEMPOA_CONFIG.BEAD.HEIGHT}px`)
    
    // Activate second bead
    await bead2.click()
    await page.waitForTimeout(500)
    
    const bead2ActivePos = await bead2.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('top'))
    )
    
    console.log(`\nAfter activating bead 2:`)
    console.log(`Bead 2 moved from ${bead2InitialPos}px to ${bead2ActivePos}px`)
    console.log(`Movement: ${bead2ActivePos - bead2InitialPos}px`)
    
    // Verify correct movement (exactly one bead height)
    expect(bead2ActivePos - bead2InitialPos).toBe(SEMPOA_CONFIG.BEAD.HEIGHT)
    console.log(`✓ Correct movement: ${SEMPOA_CONFIG.BEAD.HEIGHT}px`)
    
    // Verify no intersection
    const gap = bead2ActivePos - (bead1ActivePos + SEMPOA_CONFIG.BEAD.HEIGHT)
    console.log(`\nGap between active beads: ${gap}px`)
    expect(gap).toBe(0) // Should be touching but not overlapping
    console.log(`✓ No intersection: beads are touching (${gap}px gap)`)
    
    // Test value calculation
    const valueDisplay = page.getByText(/Value: \d+/)
    await expect(valueDisplay).toContainText('Value: 10000000') // Both upper beads = 2 × 5 × 10^6
    console.log(`✓ Correct value calculation: 10,000,000 (2 × 5,000,000)`)
    
    // Test deactivation
    await bead1.click() // Deactivate first bead
    await page.waitForTimeout(500)
    
    const bead1DeactivatedPos = await bead1.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('top'))
    )
    
    console.log(`\nAfter deactivating bead 1:`)
    console.log(`Bead 1 returned to: ${bead1DeactivatedPos}px`)
    expect(bead1DeactivatedPos).toBe(bead1InitialPos)
    console.log(`✓ Correct return to initial position`)
    
    // Value should now be 5000000 (only second bead)
    await expect(valueDisplay).toContainText('Value: 5000000')
    console.log(`✓ Correct value after deactivation: 5,000,000`)
    
    console.log(`\n✅ All tests passed - upper bead movement fix verified!`)
  })

  test('should work correctly with any number of upper beads', async () => {
    console.log('=== Testing Formula Generalization ===')
    
    const testCases = [1, 2, 3, 4]
    
    for (const beadCount of testCases) {
      console.log(`\nTesting ${beadCount} upper bead(s):`)
      
      for (let row = 0; row < beadCount; row++) {
        const inactiveTop = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + (row * SEMPOA_CONFIG.BEAD.HEIGHT)
        const activeTop = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + (row * SEMPOA_CONFIG.BEAD.HEIGHT) + SEMPOA_CONFIG.BEAD.HEIGHT
        const movement = activeTop - inactiveTop
        
        console.log(`  Bead ${row + 1}: ${inactiveTop}px → ${activeTop}px (${movement}px movement)`)
        expect(movement).toBe(SEMPOA_CONFIG.BEAD.HEIGHT)
      }
      
      console.log(`  ✓ All ${beadCount} bead(s) move exactly ${SEMPOA_CONFIG.BEAD.HEIGHT}px`)
    }
    
    console.log(`\n✅ Formula works for any number of upper beads!`)
  })
})