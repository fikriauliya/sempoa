import { test, expect } from '@playwright/test'
import { SEMPOA_CONFIG, DERIVED_CONFIG } from '../src/config/sempoaConfig'

test.describe('Abacus Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Reset the board to ensure initial state
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500) // Wait for any animations
  })

  test('lower beads should move together - activating a bead moves all beads above it', async ({ page }) => {
    // Click on the 3rd lower bead (row 2, 0-indexed) in the first column
    const thirdLowerBead = page.locator('.lower-section').first().locator('.absolute').nth(2)
    await thirdLowerBead.click()
    
    // Check that the value display shows 3 (beads 0, 1, 2 are active)
    const valueDisplay = page.getByText(/Value: \d+/)
    await expect(valueDisplay).toContainText('Value: 3000000')
    
    // Verify that beads 0, 1, and 2 are in active positions
    const firstColumn = page.locator('.lower-section').first()
    const firstBead = firstColumn.locator('.absolute').nth(0)
    const secondBead = firstColumn.locator('.absolute').nth(1)
    const thirdBead = firstColumn.locator('.absolute').nth(2)
    const fourthBead = firstColumn.locator('.absolute').nth(3)
    
    // Active beads should be at calculated positions
    await expect(firstBead).toHaveCSS('top', `${DERIVED_CONFIG.LOWER_ACTIVE_TOP}px`) // 5px
    await expect(secondBead).toHaveCSS('top', `${DERIVED_CONFIG.LOWER_ACTIVE_TOP + DERIVED_CONFIG.LOWER_BEAD_SPACING}px`) // 17px
    await expect(thirdBead).toHaveCSS('top', `${DERIVED_CONFIG.LOWER_ACTIVE_TOP + (2 * DERIVED_CONFIG.LOWER_BEAD_SPACING)}px`) // 29px
    
    // Fourth bead should still be in inactive position
    await expect(fourthBead).toHaveCSS('top', `${DERIVED_CONFIG.LOWER_INACTIVE_TOP + (3 * DERIVED_CONFIG.LOWER_BEAD_SPACING)}px`) // 56px
  })

  test('lower beads should move together - deactivating a bead moves all beads below it', async ({ page }) => {
    // First, activate the 4th lower bead (all beads 0,1,2,3)
    const fourthLowerBead = page.locator('.lower-section').first().locator('.absolute').nth(3)
    await fourthLowerBead.click()
    
    // Verify all 4 beads are active (value should be 4000000)
    const valueDisplay = page.getByText(/Value: \d+/)
    await expect(valueDisplay).toContainText('Value: 4000000')
    
    // Now click on the 2nd bead (row 1) - this should deactivate beads 1, 2, 3
    const secondLowerBead = page.locator('.lower-section').first().locator('.absolute').nth(1)
    await secondLowerBead.click()
    
    // Value should now be 1000000 (only first bead active)
    await expect(valueDisplay).toContainText('Value: 1000000')
    
    // Verify positions
    const firstColumn = page.locator('.lower-section').first()
    const firstBead = firstColumn.locator('.absolute').nth(0)
    const secondBead = firstColumn.locator('.absolute').nth(1)
    const thirdBead = firstColumn.locator('.absolute').nth(2)
    const fourthBead = firstColumn.locator('.absolute').nth(3)
    
    // Only first bead should be active
    await expect(firstBead).toHaveCSS('top', `${DERIVED_CONFIG.LOWER_ACTIVE_TOP}px`) // 5px
    
    // Beads 1, 2, 3 should be in inactive positions  
    await expect(secondBead).toHaveCSS('top', `${DERIVED_CONFIG.LOWER_INACTIVE_TOP + DERIVED_CONFIG.LOWER_BEAD_SPACING}px`) // 32px
    await expect(thirdBead).toHaveCSS('top', `${DERIVED_CONFIG.LOWER_INACTIVE_TOP + (2 * DERIVED_CONFIG.LOWER_BEAD_SPACING)}px`) // 44px
    await expect(fourthBead).toHaveCSS('top', `${DERIVED_CONFIG.LOWER_INACTIVE_TOP + (3 * DERIVED_CONFIG.LOWER_BEAD_SPACING)}px`) // 56px
  })

  test('upper beads should toggle independently', async ({ page }) => {
    // Click upper bead in first column
    const upperBead = page.locator('.upper-section').first().locator('.absolute').first()
    await upperBead.click()
    
    // Should show 5000000 (5 * 10^6)
    const valueDisplay = page.getByText(/Value: \d+/)
    await expect(valueDisplay).toContainText('Value: 5000000')
    
    // Verify upper bead moved to active position (touching separator)
    const expectedActivePosition = DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT
    await expect(upperBead).toHaveCSS('top', `${expectedActivePosition}px`)
    
    // Click again to deactivate
    await upperBead.click()
    
    // Should be back to 0
    await expect(valueDisplay).toContainText('Value: 0')
    
    // Should be back to inactive position
    await expect(upperBead).toHaveCSS('top', '0px')
  })

  test('mixed upper and lower bead interaction', async ({ page }) => {
    // Activate upper bead in first column (5000000)
    const upperBead = page.locator('.upper-section').first().locator('.absolute').first()
    await upperBead.click()
    
    // Activate 2 lower beads in first column (2000000)
    const secondLowerBead = page.locator('.lower-section').first().locator('.absolute').nth(1)
    await secondLowerBead.click()
    
    // Total should be 7000000
    const valueDisplay = page.getByText(/Value: \d+/)
    await expect(valueDisplay).toContainText('Value: 7000000')
    
    // Deactivate upper bead
    await upperBead.click()
    
    // Should be 2000000 (only lower beads)
    await expect(valueDisplay).toContainText('Value: 2000000')
  })
})