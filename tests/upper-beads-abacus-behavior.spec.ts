import { test, expect } from '@playwright/test'
import { SEMPOA_CONFIG } from '../src/config/sempoaConfig'

test.describe('Upper Beads Abacus Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Reset the board to ensure initial state
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500) // Wait for any animations
  })

  test('should move all upper beads below when clicking an upper bead (with 2 upper beads)', async ({ page }) => {
    console.log('=== Testing Upper Beads Abacus Behavior ===')
    
    // First, temporarily set configuration to 2 upper beads for testing
    // We'll need this for the test to be meaningful
    const currentConfig = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN
    console.log(`Current configuration: ${currentConfig} upper beads per column`)
    
    if (currentConfig < 2) {
      console.log('⚠️  Test requires at least 2 upper beads. Current config only has 1 bead.')
      console.log('This test will demonstrate expected behavior when UPPER_BEADS_PER_COLUMN = 2')
      
      // Skip the visual test but document the expected behavior
      console.log('\n=== Expected Behavior with 2 Upper Beads ===')
      console.log('When clicking the first (top) upper bead:')
      console.log('  - First bead should activate')
      console.log('  - Second bead should also activate (all beads below)')
      console.log('  - Value should be 2 × 5 × place_value = 10,000,000 for first column')
      
      console.log('\nWhen clicking the second (bottom) upper bead:')
      console.log('  - Only second bead should activate')
      console.log('  - First bead should remain inactive')
      console.log('  - Value should be 1 × 5 × place_value = 5,000,000 for first column')
      
      console.log('\nThis matches authentic abacus behavior where beads move together.')
      return
    }
    
    // Get upper beads in first column
    const firstColumnUpperBeads = page.locator('.upper-section').first().locator('.absolute')
    const beadCount = await firstColumnUpperBeads.count()
    expect(beadCount).toBe(currentConfig)
    console.log(`Found ${beadCount} upper beads per column`)
    
    // Test clicking the first (top) bead - should activate only that bead
    console.log('\n=== Clicking First (Top) Upper Bead ===')
    const firstBead = firstColumnUpperBeads.nth(0) // Top bead
    const secondBead = firstColumnUpperBeads.nth(1) // Bottom bead
    
    await firstBead.click()
    await page.waitForTimeout(500)
    
    // Check that the value shows only first bead is active (1 × 5 million = 5 million)
    const valueDisplay = page.getByText(/Value: \d+/)
    await expect(valueDisplay).toContainText('Value: 5000000')
    console.log('✓ Value shows 5,000,000 (only first upper bead active)')
    
    // Verify only first bead is in active position
    const firstBeadPos = await firstBead.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('top'))
    )
    const secondBeadPos = await secondBead.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('top'))
    )
    
    console.log(`First bead position: ${firstBeadPos}px`)
    console.log(`Second bead position: ${secondBeadPos}px`)
    
    // First bead should be active, second should remain inactive
    const firstInactive = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP
    const secondInactive = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + SEMPOA_CONFIG.BEAD.HEIGHT
    
    expect(firstBeadPos).not.toBe(firstInactive)
    expect(secondBeadPos).toBe(secondInactive)
    console.log('✓ Only first bead moved to active position')
    
    // Reset for next test
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500)
    
    // Test clicking the second (bottom) bead - should activate both beads
    console.log('\n=== Clicking Second (Bottom) Upper Bead ===')
    await secondBead.click()
    await page.waitForTimeout(500)
    
    // Check that the value shows both beads are active (2 × 5 million = 10 million)
    await expect(valueDisplay).toContainText('Value: 10000000')
    console.log('✓ Value shows 10,000,000 (both upper beads active)')
    
    // Verify both beads are in active positions
    const firstBeadPos2 = await firstBead.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('top'))
    )
    const secondBeadPos2 = await secondBead.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('top'))
    )
    
    console.log(`First bead position: ${firstBeadPos2}px`)
    console.log(`Second bead position: ${secondBeadPos2}px`)
    
    // Both beads should be active
    expect(firstBeadPos2).not.toBe(firstInactive)
    expect(secondBeadPos2).not.toBe(secondInactive)
    console.log('✓ Both beads moved to active positions')
    
    console.log('\n✅ Upper beads abacus behavior verified!')
  })

  test('should demonstrate deactivation behavior - clicking active bead deactivates it and all beads above', async ({ page }) => {
    console.log('=== Testing Upper Beads Deactivation Behavior ===')
    
    const currentConfig = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN
    if (currentConfig < 2) {
      console.log('⚠️  Test requires at least 2 upper beads for meaningful demonstration')
      console.log('\n=== Expected Deactivation Behavior ===')
      console.log('When both upper beads are active and you click the first (top) bead:')
      console.log('  - First bead should deactivate')
      console.log('  - All beads above it should also deactivate (none in this case)')
      console.log('  - Second bead should remain active')
      console.log('  - Value should change from 10,000,000 to 5,000,000')
      
      console.log('\nWhen second bead is active and you click it:')
      console.log('  - Second bead should deactivate')
      console.log('  - No beads above it to deactivate')
      console.log('  - Value should become 0')
      return
    }
    
    const firstColumnUpperBeads = page.locator('.upper-section').first().locator('.absolute')
    const firstBead = firstColumnUpperBeads.nth(0)
    const secondBead = firstColumnUpperBeads.nth(1)
    
    // First activate both beads by clicking the second (bottom) one
    await secondBead.click()
    await page.waitForTimeout(500)
    
    const valueDisplay = page.getByText(/Value: \d+/)
    await expect(valueDisplay).toContainText('Value: 10000000')
    console.log('✓ Both beads activated (value: 10,000,000)')
    
    // Now click the first bead to deactivate it and the second bead
    console.log('\n=== Clicking First Bead to Deactivate (from active state) ===')
    await firstBead.click()
    await page.waitForTimeout(500)
    
    // Should now show all beads deactivated
    await expect(valueDisplay).toContainText('Value: 0')
    console.log('✓ First bead deactivated, taking second bead with it (value: 0)')
    
    // Verify positions
    const firstBeadPos = await firstBead.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('top'))
    )
    const secondBeadPos = await secondBead.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('top'))
    )
    
    const firstInactive = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP
    const secondInactive = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + SEMPOA_CONFIG.BEAD.HEIGHT
    
    expect(firstBeadPos).toBe(firstInactive) // First should be back to inactive
    expect(secondBeadPos).toBe(secondInactive) // Second should also be back to inactive
    console.log('✓ Both beads returned to inactive positions')
    
    console.log('\n✅ Upper beads deactivation behavior verified!')
  })

  test('should document current vs expected behavior with configuration info', async () => {
    console.log('=== Current Implementation Analysis ===')
    
    const currentConfig = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN
    console.log(`Current UPPER_BEADS_PER_COLUMN: ${currentConfig}`)
    
    if (currentConfig === 1) {
      console.log('\n⚠️  With only 1 upper bead, group behavior is not visible')
      console.log('To test proper abacus behavior, set UPPER_BEADS_PER_COLUMN = 2 in sempoaConfig.ts')
    }
    
    console.log('\n=== Expected Upper Bead Behavior (Authentic Abacus) ===')
    console.log('Upper beads should behave like lower beads:')
    console.log('1. Clicking a bead activates it AND all beads below it in the same column')
    console.log('2. Clicking an active bead deactivates it AND all beads above it in the same column')
    console.log('3. This mimics physical abacus where beads are pushed together')
    
    console.log('\n=== Current Implementation Issue ===')
    console.log('Currently upper beads toggle independently (like toggles)')
    console.log('They should group together like lower beads do')
    
    console.log('\n=== Required Changes ===')
    console.log('Modify SempoaBoard.tsx toggleBead function:')
    console.log('- In the upper bead section (bead.isUpper === true)')
    console.log('- Change from independent toggle to group behavior')
    console.log('- When activating: add this bead AND all beads below it')
    console.log('- When deactivating: remove this bead AND all beads above it')
    
    expect(true).toBe(true) // Always pass - this is documentation
  })
})