import { test, expect } from '@playwright/test'

test.describe('Abacus Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5176')
    
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
    
    // Active beads should be at lower positions (5px, 23px, 41px)
    await expect(firstBead).toHaveCSS('top', '5px')
    await expect(secondBead).toHaveCSS('top', '23px')
    await expect(thirdBead).toHaveCSS('top', '41px')
    
    // Fourth bead should still be in inactive position (74px)
    await expect(fourthBead).toHaveCSS('top', '74px')
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
    
    // Only first bead should be active (5px)
    await expect(firstBead).toHaveCSS('top', '5px')
    
    // Beads 1, 2, 3 should be in inactive positions
    await expect(secondBead).toHaveCSS('top', '38px')
    await expect(thirdBead).toHaveCSS('top', '56px')
    await expect(fourthBead).toHaveCSS('top', '74px')
  })

  test('upper beads should toggle independently', async ({ page }) => {
    // Click upper bead in first column
    const upperBead = page.locator('.upper-section').first().locator('.absolute').first()
    await upperBead.click()
    
    // Should show 5000000 (5 * 10^6)
    const valueDisplay = page.getByText(/Value: \d+/)
    await expect(valueDisplay).toContainText('Value: 5000000')
    
    // Verify upper bead moved to active position
    await expect(upperBead).toHaveCSS('top', '40px')
    
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